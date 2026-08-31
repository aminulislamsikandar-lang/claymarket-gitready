import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { 
  User, Market, Shop, Product, Category, 
  Conversation, ChatMessage, Order, CartItem, AppView, NavigationTab 
} from '../types';
import { 
  MOCK_USERS,
  MOCK_CATEGORIES, INITIAL_ORDERS 
} from '../data/mockData';
import { apiRequest, clearAuthToken, setAuthToken } from '../utils/api';
import { firebaseAuthClient, firebaseDb, firebaseConfigured } from '../firebase';
import {
  createUserWithEmailAndPassword,
  deleteUser,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  type User as FirebaseUser,
} from 'firebase/auth';
import {
  collection,
  deleteDoc,
  deleteField,
  doc,
  getDoc,
  getDocs,
  limit,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  writeBatch,
} from 'firebase/firestore';
import { uploadToCloudinary } from '../utils/cloudinary';
import { validateImageFile } from '../utils/imageOptimizer';

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

const MAX_PUBLIC_SHOPS = 100;
const MAX_PUBLIC_PRODUCTS = 200;

// ---------------------------------------------------------------------------
// Messaging & Orders now sync through the backend (Firestore via the Admin
// SDK) instead of localStorage, so a seller opening their phone/laptop sees
// the same conversations and orders a buyer created on a different device.
// These helpers translate the API's shape into the UI's existing Conversation
// / ChatMessage / Order types so components do not need to change.
// ---------------------------------------------------------------------------

const idOf = (value: any): string => (value && typeof value === 'object' ? String(value._id || '') : String(value || ''));
const nameOf = (value: any, fallback = ''): string => (value && typeof value === 'object' ? String(value.name || fallback) : fallback);

const formatTimestamp = (input: any): string => {
  const date = input ? new Date(input) : null;
  if (!date || Number.isNaN(date.getTime())) return 'Just now';
  const diffMs = Date.now() - date.getTime();
  const diffMin = Math.round(diffMs / 60000);
  if (diffMin <= 0) return 'Just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.round(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDay = Math.round(diffHr / 24);
  if (diffDay < 7) return `${diffDay}d ago`;
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
};

const CONVERSATION_READS_KEY = 'claymarket_conversation_reads';

const getConversationReads = (): Record<string, number> => {
  try {
    const raw = JSON.parse(localStorage.getItem(CONVERSATION_READS_KEY) || '{}');
    return raw && typeof raw === 'object' ? raw : {};
  } catch {
    return {};
  }
};

const markConversationRead = (conversationId: string) => {
  try {
    const reads = getConversationReads();
    reads[conversationId] = Date.now();
    localStorage.setItem(CONVERSATION_READS_KEY, JSON.stringify(reads));
  } catch {
    // Best-effort only; unread badges simply won't clear on this device.
  }
};

const mapBackendMarket = (raw: any): Market => ({
  id: idOf(raw),
  name: String(raw?.name || 'Unnamed Market'),
  slug: String(raw?.slug || idOf(raw)),
  bannerImage: String(raw?.bannerImage || 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&auto=format&fit=crop&q=80'),
  location: String(raw?.location || ''),
  description: String(raw?.description || ''),
  featuredCategories: Array.isArray(raw?.featuredCategories) ? raw.featuredCategories.map(String) : [],
  bannerText: raw?.bannerText ? String(raw.bannerText) : undefined,
  established: raw?.established ? String(raw.established) : undefined,
});

const mapBackendMessage = (raw: any, conversationId: string): ChatMessage => {
  const senderRole: 'buyer' | 'seller' = (raw?.senderId?.role === 'seller') ? 'seller' : 'buyer';
  return {
    id: idOf(raw) || `msg_${Math.random().toString(36).slice(2, 9)}`,
    conversationId,
    senderId: idOf(raw?.senderId),
    senderRole,
    sender: senderRole,
    text: String(raw?.text || ''),
    timestamp: formatTimestamp(raw?.createdAt),
  };
};

const mapBackendConversation = (
  raw: any,
  messages: ChatMessage[],
  shopsList: Shop[],
  unreadCount: number,
): Conversation => {
  const shopId = idOf(raw?.shopId);
  const shop = shopsList.find(s => s.id === shopId);
  const buyerId = idOf(raw?.buyerId);
  const sellerId = idOf(raw?.sellerId);
  const productAttachment = raw?.productId && typeof raw.productId === 'object'
    ? {
        id: idOf(raw.productId),
        name: String(raw.productId.name || 'Product'),
        price: Number.isFinite(Number(raw.productId.price)) ? Number(raw.productId.price) : undefined,
        image: Array.isArray(raw.productId.images) ? String(raw.productId.images[0] || '') : '',
        shopName: shop?.name || nameOf(raw?.shopId, 'Shop'),
      }
    : undefined;

  const lastMsg = messages[messages.length - 1];

  return {
    id: idOf(raw),
    buyerId,
    buyerName: nameOf(raw?.buyerId, 'Buyer'),
    buyerAvatar: raw?.buyerId?.avatar || '',
    sellerId,
    sellerName: nameOf(raw?.sellerId, shop?.ownerName || 'Seller'),
    shopId,
    shopName: shop?.name || nameOf(raw?.shopId, 'Shop'),
    shopAvatar: shop?.avatar || '',
    marketName: shop?.marketName || '',
    productId: raw?.productId ? idOf(raw.productId) : undefined,
    productAttachment,
    lastMessage: lastMsg?.text || 'Started a conversation',
    timestamp: lastMsg ? lastMsg.timestamp : formatTimestamp(raw?.updatedAt || raw?.createdAt),
    unreadCount,
    messages,
  };
};

const mapBackendOrder = (raw: any, shopsList: Shop[]): Order => {
  const items = Array.isArray(raw?.items) ? raw.items : [];
  const firstItem = items[0];
  const shopId = idOf(firstItem?.shopId);
  const shop = shopsList.find(s => s.id === shopId);
  const shopName = shop?.name || nameOf(firstItem?.shopId, 'Shop');
  const marketName = shop?.marketName || '';

  return {
    id: idOf(raw),
    orderNumber: String(raw?.orderNumber || ''),
    date: formatTimestamp(raw?.createdAt),
    createdAt: raw?.createdAt ? String(raw.createdAt) : undefined,
    shopId,
    shopName,
    marketName,
    items: items.map((item: any, idx: number) => ({
      id: `${idOf(raw)}_item_${idx}`,
      product: {
        id: idOf(item.productId),
        shopId,
        shopName,
        marketId: shop?.marketId || '',
        marketName,
        name: String(item.name || nameOf(item.productId, 'Product')),
        price: Number.isFinite(Number(item.unitPrice)) ? Number(item.unitPrice) : 0,
        images: [String(item.image || (item.productId?.images?.[0]) || '')],
      },
      quantity: Number(item.quantity || 1),
      selectedSize: item.selectedSize || undefined,
      selectedColor: item.selectedColor || undefined,
    })),
    totalAmount: Number(raw?.totalAmount || 0),
    status: (['pending', 'confirmed', 'ready_for_pickup', 'completed', 'cancelled'].includes(raw?.status) ? raw.status : 'pending'),
    deliveryType: raw?.deliveryType === 'delivery' ? 'delivery' : 'pickup',
    address: raw?.address || undefined,
  };
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const manualAuthInProgressRef = useRef(false);

  // Navigation State
  const pathToView = (path: string): AppView => {
    const cleanPath = path.replace(/\/+$/, '') || '/';
    if (cleanPath === '/shops') return 'shops';
    if (cleanPath === '/categories') return 'categories';
    if (cleanPath === '/about') return 'about';
    if (cleanPath === '/faq') return 'faq';
    if (cleanPath === '/privacy-policy') return 'privacy';
    if (cleanPath === '/terms') return 'terms';
    if (/^\/markets\/[^/]+\/[^/]+$/.test(cleanPath)) return 'category-detail';
    if (/^\/markets\/[^/]+$/.test(cleanPath)) return 'market-detail';
    if (/^\/shops\/[^/]+$/.test(cleanPath)) return 'shop-detail';
    if (/^\/products\/[^/]+$/.test(cleanPath)) return 'product-detail';
    if (cleanPath === '/') return 'markets';
    return 'not-found';
  };

  const [markets, setMarkets] = useState<Market[]>([]);
  const [categories] = useState<Category[]>(MOCK_CATEGORIES);
  const [shops, setShops] = useState<Shop[]>([]);
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    let cancelled = false;

    const mapFirestoreShop = (raw: any, id: string): Shop => {
      const categoryId = Array.isArray(raw.categoryIds) ? String(raw.categoryIds[0] || '') : String(raw.categoryId || '');
      const category = categories.find(c => c.id === categoryId);
      return {
        id,
        name: String(raw.name || 'Local Shop'),
        marketId: String(raw.marketId || ''),
        marketName: String(raw.marketName || markets.find(m => m.id === raw.marketId)?.name || 'Local Market'),
        state: String(raw.state || ''),
        district: String(raw.district || ''),
        categoryId,
        categoryName: String(raw.categoryName || category?.name || 'Local Shop'),
        avatar: String(raw.profileImage || raw.avatar || 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=500&auto=format&fit=crop&q=80'),
        banner: String(raw.coverImage || raw.banner || raw.profileImage || 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1000&auto=format&fit=crop&q=80'),
        rating: Number(raw.rating || 0),
        reviewsCount: Number(raw.reviewsCount || 0),
        verified: Boolean(raw.verified),
        followersCount: Number(raw.followersCount || 0),
        about: String(raw.description || raw.about || ''),
        phone: String(raw.phone || ''),
        address: String(raw.address || ''),
        ownerId: String(raw.ownerId || ''),
        ownerName: String(raw.ownerName || ''),
        openingHours: raw.hours?.open ? `${raw.hours.open} - ${raw.hours.close || ''}` : String(raw.openingHours || ''),
        productCategories: Array.isArray(raw.productCategories)
          ? raw.productCategories.map((entry: any) => ({ id: String(entry?.id || ''), name: String(entry?.name || '') })).filter((entry: { id: string; name: string }) => entry.id && entry.name)
          : [],
      };
    };

    const mapFirestoreProduct = (raw: any, id: string): Product => {
      const images: string[] = Array.isArray(raw.images)
        ? raw.images.map((image: any) => typeof image === 'string' ? image : String(image?.url || '')).filter(Boolean)
        : [];
      const categoryId = raw.categoryId || (Array.isArray(raw.categoryIds) ? raw.categoryIds[0] : undefined);
      const category = categories.find(c => c.id === categoryId);
      return {
        id,
        sellerId: raw.sellerId ? String(raw.sellerId) : undefined,
        shopId: String(raw.shopId || ''),
        shopName: String(raw.shopName || shops.find(s => s.id === raw.shopId)?.name || 'Local Shop'),
        marketId: String(raw.marketId || ''),
        marketName: String(raw.marketName || markets.find(m => m.id === raw.marketId)?.name || 'Local Market'),
        categoryId: categoryId ? String(categoryId) : undefined,
        categoryName: String(raw.categoryName || category?.name || ''),
        shopCategoryId: raw.shopCategoryId ? String(raw.shopCategoryId) : undefined,
        shopCategoryName: raw.shopCategoryName ? String(raw.shopCategoryName) : undefined,
        state: raw.state ? String(raw.state) : undefined,
        district: raw.district ? String(raw.district) : undefined,
        name: String(raw.name || 'Product'),
        price: Number.isFinite(Number(raw.price)) ? Number(raw.price) : undefined,
        originalPrice: Number.isFinite(Number(raw.originalPrice)) ? Number(raw.originalPrice) : undefined,
        description: raw.description ? String(raw.description) : undefined,
        images,
        sizes: Array.isArray(raw.sizes) ? raw.sizes.map(String) : undefined,
        colors: Array.isArray(raw.colors) ? raw.colors : undefined,
        inStock: raw.inStock === undefined ? undefined : Boolean(raw.inStock),
        stockCount: raw.stockCount === undefined ? undefined : Number(raw.stockCount),
        material: raw.material ? String(raw.material) : undefined,
        rating: Number(raw.rating || 0),
        reviewsCount: Number(raw.reviewsCount || 0),
        status: raw.status === 'hidden' ? 'hidden' : 'published',
      };
    };

    const loadRemoteData = async () => {
      try {
        if (firebaseConfigured && firebaseDb) {
          const [shopSnap, productSnap] = await Promise.all([
            getDocs(query(collection(firebaseDb, 'shops'), limit(MAX_PUBLIC_SHOPS))),
            getDocs(query(collection(firebaseDb, 'products'), where('status', '==', 'published'), limit(MAX_PUBLIC_PRODUCTS))),
          ]);
          if (cancelled) return;
          const remoteShops = shopSnap.docs.map(snapshot => mapFirestoreShop(snapshot.data(), snapshot.id));
          const remoteProducts = productSnap.docs.map(snapshot => mapFirestoreProduct(snapshot.data(), snapshot.id));
          setShops(remoteShops);
          setProducts(remoteProducts);
          return;
        }

        const result = await apiRequest<any[]>('/shops');
        if (cancelled || !Array.isArray(result)) return;
        const remote = result.map((raw: any): Shop => mapFirestoreShop({
          ...raw,
          marketId: raw.marketId?._id || raw.marketId,
          categoryIds: Array.isArray(raw.categoryIds) ? raw.categoryIds.map((c: any) => c?._id || c) : [],
          ownerId: raw.ownerId?._id || raw.ownerId,
          ownerName: raw.ownerId?.name || '',
        }, String(raw._id || raw.id)));
        setShops(remote);
      } catch {
        // Leave marketplace collections empty on initial failure; a later fetch can recover.
      }
    };

    void loadRemoteData();
    return () => { cancelled = true; };
  }, [markets, categories]);

  const [currentView, setCurrentView] = useState<AppView>(() => pathToView(window.location.pathname));
  const [activeNavTab, setActiveNavTab] = useState<NavigationTab>('markets');
  const [viewHistory, setViewHistory] = useState<AppView[]>(['markets']);

  useEffect(() => {
    const syncRoute = () => {
      const path = window.location.pathname.replace(/\/+$/, '') || '/';
      const view = pathToView(path);
      setCurrentView(view);
      setActiveNavTab(view === 'shops' || view === 'shop-detail' ? 'shops' : view === 'categories' || view === 'category-detail' ? 'categories' : view === 'about' ? 'about' : 'markets');
      const parts = path.split('/').filter(Boolean);
      const find = <T extends { id: string; slug?: string }>(items: T[], key?: string) => key ? items.find(item => item.id === key || item.slug === key) || null : null;
      if (view === 'market-detail') setSelectedMarket(find(markets, parts[1]) as Market | null);
      if (view === 'category-detail') {
        setSelectedMarket(find(markets, parts[1]) as Market | null);
        setSelectedCategory(find(categories, parts[2]) as Category | null);
      }
    };
    syncRoute();
    window.addEventListener('popstate', syncRoute);
    return () => window.removeEventListener('popstate', syncRoute);
  }, [markets, categories]);
