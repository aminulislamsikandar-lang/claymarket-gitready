import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { 
  User, Market, Shop, Product, Category, 
  Conversation, ChatMessage, Order, CartItem, AppView, NavigationTab 
} from '../types';
import { 
  MOCK_USERS, MOCK_PRODUCTS, 
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
  type?: 'success' | 'info' | 'warning' | 'error';
}

interface AppContextType {
  // Navigation & Views
  currentView: AppView;
  activeNavTab: NavigationTab;
  navigateTo: (view: AppView, params?: { 
    market?: Market; 
    shop?: Shop; 
    product?: Product; 
    category?: Category;
    searchTerm?: string;
  }) => void;
  goBack: () => void;

  // Selected Entities
  selectedMarket: Market | null;
  selectedShop: Shop | null;
  selectedProduct: Product | null;
  selectedCategory: Category | null;

  // Search
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  performSearch: (query: string) => void;
  filteredMarkets: Market[];
  filteredShops: Shop[];
  filteredProducts: Product[];

  // User & Auth
  currentUser: User;
  loginUser: (email: string, password: string) => Promise<void>;
  registerAccount: (data: { name: string; email: string; password: string; phone?: string }) => Promise<void>;
  registerSeller: (data: { name: string; phone?: string; shop: { name: string; marketId: string; categoryId: string; state: string; district: string; address?: string } }) => Promise<void>;
  logoutUser: () => Promise<void>;
  updateProfilePicture: (file: File) => Promise<void>;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  authModalTab: 'login' | 'register' | 'become-seller';
  setAuthModalTab: (tab: 'login' | 'register' | 'become-seller') => void;

  // Data Collections
  markets: Market[];
  addMarketAdmin: (input: { name: string; location: string; description: string; bannerImage?: string }) => Promise<void>;
  deleteMarketAdmin: (marketId: string) => Promise<void>;
  shops: Shop[];
  products: Product[];
  categories: Category[];

  // Cart
  cart: CartItem[];
  addToCart: (product: Product, quantity?: number, size?: string, color?: string) => boolean;
  removeFromCart: (cartItemId: string) => void;
  updateCartQuantity: (cartItemId: string, delta: number) => void;
  clearCart: () => void;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;

  // Wishlist
  wishlist: string[]; // Product IDs
  toggleWishlist: (productId: string) => void;
  isWishlisted: (productId: string) => boolean;

  // Messaging
  conversations: Conversation[];
  activeConversationId: string | null;
  setActiveConversationId: (id: string | null) => void;
  sendMessage: (conversationId: string, text: string) => void;
  startChatWithShop: (shop: Shop, initialProduct?: Product, initialQuestion?: string) => void;
  isMessagesOpen: boolean;
  setIsMessagesOpen: (open: boolean) => void;

  // Orders
  orders: Order[];
  createOrder: (deliveryType: 'pickup' | 'delivery', address?: string) => Promise<Order | null>;
  updateOrderStatus: (orderId: string, status: Order['status']) => void;

  // Seller Actions
  createProduct: (productData: Partial<Product>) => Promise<boolean>;
  updateProduct: (productId: string, productData: Partial<Product>) => Promise<boolean>;
  deleteProduct: (productId: string) => Promise<void>;
  registerShop: (shopData: Partial<Shop>) => void;

  // Seller: Shop profile management
  updateShopImages: (shopId: string, updates: { avatarFile?: File | null; bannerFile?: File | null; removeAvatar?: boolean; removeBanner?: boolean }) => Promise<boolean>;
  updateShopDetails: (shopId: string, updates: { phone?: string; address?: string; about?: string; openingHours?: string }) => Promise<boolean>;
  addShopCategory: (shopId: string, name: string) => Promise<boolean>;
  updateShopCategory: (shopId: string, categoryId: string, name: string) => Promise<boolean>;
  deleteShopCategory: (shopId: string, categoryId: string) => Promise<boolean>;

  // Notifications / Toasts
  toasts: Toast[];
  showToast: (message: string, type?: 'success' | 'info' | 'warning' | 'error') => void;
  removeToast: (id: string) => void;

  // Followers
  followedShops: string[];
  toggleFollowShop: (shopId: string) => void;
  isFollowingShop: (shopId: string) => boolean;
}


const removeUndefined = (value: any): any => {
  if (Array.isArray(value)) return value.map(removeUndefined);
  if (value && typeof value === 'object' && value.constructor === Object) {
    return Object.fromEntries(
      Object.entries(value)
        .filter(([, entry]) => entry !== undefined)
        .map(([key, entry]) => [key, removeUndefined(entry)]),
    );
  }
  return value;
};

const withTimeout = async <T,>(
  promise: Promise<T>,
  timeoutMs: number,
  message: string,
): Promise<T> => {
  let timeoutId: ReturnType<typeof setTimeout> | undefined;

  try {
    return await Promise.race([
      promise,
      new Promise<T>((_, reject) => {
        timeoutId = setTimeout(() => reject(new Error(message)), timeoutMs);
      }),
    ]);
  } finally {
    if (timeoutId) clearTimeout(timeoutId);
  }
};

const buildFirebaseFallbackUser = (firebaseUser: FirebaseUser): User => {
  let cachedShop: Partial<Shop> | undefined;

  try {
    const savedShops = localStorage.getItem('claymarket_shops_v2');
    if (savedShops) {
      const shops = JSON.parse(savedShops);
      if (Array.isArray(shops)) {
        cachedShop = shops.find((shop) => shop?.ownerId === firebaseUser.uid);
      }
    }
  } catch {
    // Local cache is optional; Firebase remains the source of truth.
  }

  if (cachedShop?.ownerId) {
    return {
      id: firebaseUser.uid,
      name: String(cachedShop.ownerName || firebaseUser.displayName || 'Claymarket User'),
      email: firebaseUser.email || '',
      phone: String(cachedShop.phone || firebaseUser.phoneNumber || ''),
      role: 'seller',
      avatar: String(cachedShop.avatar || firebaseUser.photoURL || ''),
      addresses: [],
      shopId: String(cachedShop.id || ''),
      shopName: String(cachedShop.name || ''),
      sellerLocation: {
        state: String(cachedShop.state || ''),
        district: String(cachedShop.district || ''),
        marketId: String(cachedShop.marketId || ''),
        marketName: String(cachedShop.marketName || ''),
      },
    };
  }

  return {
    id: firebaseUser.uid,
    name: firebaseUser.displayName || 'Claymarket User',
    email: firebaseUser.email || '',
    phone: firebaseUser.phoneNumber || '',
    role: 'buyer',
    avatar: firebaseUser.photoURL || '',
    addresses: [],
  };
};

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
  // Guards the Firebase onAuthStateChanged listener from racing against an
  // in-flight manual auth operation (login/register/become-seller). Without
  // this, the listener can read a not-yet-created Firestore profile during
  // sign-up and write a generic placeholder doc that later overwrites the
  // real profile data (name/phone/role) depending on timing.
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
  // Core marketplace data must be initialized before route synchronization.
  // The route effect depends on these collections.
  const [markets, setMarkets] = useState<Market[]>([]);
  const [categories] = useState<Category[]>(MOCK_CATEGORIES);
  const [shops, setShops] = useState<Shop[]>(() => {
    try {
      const saved = localStorage.getItem('claymarket_shops_v2');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // Fall back to an empty list; real shops load via the effect below.
    }
    return [];
  });
  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem('claymarket_products');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // Fall back to demo products.
    }
    return MOCK_PRODUCTS;
  });

  // Merge real Firebase shops/products into the existing UI collections.
  // The local demo data remains available for public browsing, while real seller data
  // is persisted in Firestore and merged into the same UI.
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
          ? raw.productCategories
              .map((entry: any) => ({ id: String(entry?.id || ''), name: String(entry?.name || '') }))
              .filter((entry: { id: string; name: string }) => entry.id && entry.name)
          : [],
      };
    };

    const mapFirestoreProduct = (raw: any, id: string): Product => {
      const images: string[] = Array.isArray(raw.images)
        ? raw.images
            .map((image: any) => typeof image === 'string' ? image : String(image?.url || ''))
            .filter(Boolean)
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
            getDocs(collection(firebaseDb, 'shops')),
            getDocs(query(collection(firebaseDb, 'products'), where('status', '==', 'published'))),
          ]);

          if (cancelled) return;

          const remoteShops = shopSnap.docs.map(snapshot => mapFirestoreShop(snapshot.data(), snapshot.id));
          const remoteProducts = productSnap.docs.map(snapshot => mapFirestoreProduct(snapshot.data(), snapshot.id));

          setShops(prev => {
            const byId = new Map(prev.map(shop => [shop.id, shop]));
            remoteShops.forEach(shop => byId.set(shop.id, { ...byId.get(shop.id), ...shop }));
            return Array.from(byId.values());
          });

          setProducts(prev => {
            const byId = new Map(prev.map(product => [product.id, product]));
            remoteProducts.forEach(product => byId.set(product.id, { ...byId.get(product.id), ...product }));
            return Array.from(byId.values());
          });
          return;
        }

        // Backward-compatible API fallback for environments that do not have Firebase
        // frontend variables yet.
        const result = await apiRequest<any[]>('/shops');
        if (cancelled || !Array.isArray(result)) return;
        const remote = result.map((raw: any): Shop => mapFirestoreShop({
          ...raw,
          marketId: raw.marketId?._id || raw.marketId,
          categoryIds: Array.isArray(raw.categoryIds) ? raw.categoryIds.map((c: any) => c?._id || c) : [],
          ownerId: raw.ownerId?._id || raw.ownerId,
          ownerName: raw.ownerId?.name || '',
        }, String(raw._id || raw.id)));

        setShops(prev => {
          const byId = new Map(prev.map(shop => [shop.id, shop]));
          remote.forEach(shop => byId.set(shop.id, { ...byId.get(shop.id), ...shop }));
          return Array.from(byId.values());
        });
      } catch {
        // Public demo content remains available if Firebase is unavailable.
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
      if (view === 'shop-detail') setSelectedShop(find(shops, parts[1]) as Shop | null);
      if (view === 'product-detail') setSelectedProduct(find(products, parts[1]) as Product | null);
    };
    syncRoute();
    window.addEventListener('popstate', syncRoute);
    return () => window.removeEventListener('popstate', syncRoute);
  }, [markets, categories, shops, products]);

  // Selected Entities
  const [selectedMarket, setSelectedMarket] = useState<Market | null>(null);
  const [selectedShop, setSelectedShop] = useState<Shop | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);

  // Search State
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Data collections are initialized above so route synchronization can safely depend on them.

  // Save products to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem('claymarket_products', JSON.stringify(products));
    } catch {
      // Ignore quota errors
    }
  }, [products]);

  // Save seller-created shops so shop management survives refresh.
  useEffect(() => {
    try {
      localStorage.setItem('claymarket_shops_v2', JSON.stringify(shops));
    } catch {
      // Ignore quota errors.
    }
  }, [shops]);

  // Authentication is backend-backed. Visitors start as Guest until a valid session is restored.
  const [currentUser, setCurrentUser] = useState<User>(MOCK_USERS.guest);

  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [authModalTab, setAuthModalTab] = useState<'login' | 'register' | 'become-seller'>('login');

  // Drawers & Modals
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [isMessagesOpen, setIsMessagesOpen] = useState<boolean>(false);

  // Cart & Wishlist
  const [cart, setCart] = useState<CartItem[]>(() => {
    try { return JSON.parse(localStorage.getItem('claymarket_cart') || '[]'); } catch { return []; }
  });
  const [wishlist, setWishlist] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem('claymarket_wishlist') || '[\"prod_1\",\"prod_7\"]'); } catch { return ['prod_1', 'prod_7']; }
  });
  const [followedShops, setFollowedShops] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem('claymarket_followed_shops') || '[\"shop_aminul\"]'); } catch { return ['shop_aminul']; }
  });
  useEffect(() => { try { localStorage.setItem('claymarket_cart', JSON.stringify(cart)); } catch {} }, [cart]);
  useEffect(() => { try { localStorage.setItem('claymarket_wishlist', JSON.stringify(wishlist)); } catch {} }, [wishlist]);
  useEffect(() => { try { localStorage.setItem('claymarket_followed_shops', JSON.stringify(followedShops)); } catch {} }, [followedShops]);

  // Messaging & Orders now live on the backend (Firestore via the Express API)
  // instead of a single browser's localStorage, so the same data shows up for
  // a buyer and seller on two different devices. Demo/mock content is shown
  // only while browsing as a guest; it is replaced by real synced data as
  // soon as someone is signed in.
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [orders, setOrders] = useState<Order[]>(INITIAL_ORDERS);

  const fetchConversations = React.useCallback(async () => {
    if (currentUser.role === 'guest') return;
    try {
      const list = await apiRequest<any[]>('/conversations');
      if (!Array.isArray(list)) return;
      const withMessages = await Promise.all(list.map(async (conv) => {
        let rawMessages: any[] = [];
        try {
          rawMessages = await apiRequest<any[]>(`/conversations/${conv._id}/messages`);
        } catch {
          rawMessages = [];
        }
        const lastReadAt = getConversationReads()[String(conv._id)] || 0;
        const unreadCount = rawMessages.filter((m) => {
          const senderId = idOf(m?.senderId);
          const sentAt = m?.createdAt ? new Date(m.createdAt).getTime() : 0;
          return senderId !== currentUser.id && sentAt > lastReadAt;
        }).length;
        const messages = rawMessages.map((m) => mapBackendMessage(m, String(conv._id)));
        return mapBackendConversation(conv, messages, shops, unreadCount);
      }));
      withMessages.sort((a, b) => (a.id === activeConversationId ? -1 : b.id === activeConversationId ? 1 : 0));
      setConversations(withMessages);
    } catch {
      // Keep whatever was last successfully loaded; a transient network blip
      // shouldn't wipe the buyer/seller's conversation list.
    }
  }, [currentUser.role, currentUser.id, shops, activeConversationId]);

  const fetchMarkets = React.useCallback(async () => {
    try {
      const raw = await apiRequest<any[]>('/markets');
      setMarkets(raw.map(mapBackendMarket));
    } catch {
      // Keep whatever was last successfully loaded on a transient failure.
    }
  }, []);

  const addMarketAdmin = React.useCallback(async (input: { name: string; location: string; description: string; bannerImage?: string }) => {
    const slug = input.name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const raw = await apiRequest<any>('/markets', {
      method: 'POST',
      body: JSON.stringify({
        name: input.name.trim(),
        slug,
        location: input.location.trim(),
        description: input.description.trim(),
        bannerImage: input.bannerImage?.trim() || undefined,
        featuredCategories: [],
      }),
    });
    setMarkets(prev => [...prev, mapBackendMarket(raw)]);
  }, []);

  const deleteMarketAdmin = React.useCallback(async (marketId: string) => {
    await apiRequest<any>(`/markets/${marketId}`, { method: 'DELETE' });
    setMarkets(prev => prev.filter(m => m.id !== marketId));
  }, []);

  const fetchOrders = React.useCallback(async () => {
    if (currentUser.role === 'guest') return;
    try {
      const requests = [apiRequest<any[]>('/orders/mine')];
      if (currentUser.role === 'seller') requests.push(apiRequest<any[]>('/orders/seller'));
      const results = await Promise.all(requests.map(p => p.catch(() => [] as any[])));
      const byId = new Map<string, any>();
      results.flat().forEach((raw: any) => { if (raw?._id) byId.set(String(raw._id), raw); });
      const mapped = Array.from(byId.values()).map(raw => mapBackendOrder(raw, shops));
      mapped.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
      setOrders(mapped);
    } catch {
      // Keep the previously loaded orders on a transient failure.
    }
  }, [currentUser.role, shops]);

  // Markets are public data (no auth required), so load them once on mount
  // regardless of sign-in state.
  useEffect(() => {
    void fetchMarkets();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Load real conversations/orders once signed in, and keep polling so a
  // message or status change made from another device shows up here too.
  useEffect(() => {
    if (currentUser.role === 'guest') {
      setConversations([]);
      setOrders(INITIAL_ORDERS);
      return;
    }
    void fetchConversations();
    void fetchOrders();
    const conversationsInterval = window.setInterval(() => { void fetchConversations(); }, 6000);
    const ordersInterval = window.setInterval(() => { void fetchOrders(); }, 10000);
    return () => {
      window.clearInterval(conversationsInterval);
      window.clearInterval(ordersInterval);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser.id, currentUser.role]);

  // Mark the open conversation as read on this device so its unread badge
  // clears; this is a local UI nicety and intentionally does not sync.
  useEffect(() => {
    if (activeConversationId && isMessagesOpen) markConversationRead(activeConversationId);
  }, [activeConversationId, isMessagesOpen]);

  // Toasts
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = (message: string, type: 'success' | 'info' | 'warning' | 'error' = 'success') => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3200);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // View Navigation
  const navigateTo = (view: AppView, params?: { 
    market?: Market; 
    shop?: Shop; 
    product?: Product; 
    category?: Category;
    searchTerm?: string;
  }) => {
    setViewHistory(prev => [...prev, view]);
    setCurrentView(view);

    const slugOrId = (value?: { id: string; slug?: string } | null) => value?.slug || value?.id;
    const nextPath = view === 'markets' ? '/'
      : view === 'shops' ? '/shops'
      : view === 'categories' ? '/categories'
      : view === 'about' ? '/about'
      : view === 'faq' ? '/faq'
      : view === 'privacy' ? '/privacy-policy'
      : view === 'terms' ? '/terms'
      : view === 'market-detail' && params?.market ? `/markets/${slugOrId(params.market)}`
      : view === 'category-detail' && params?.market && params?.category ? `/markets/${slugOrId(params.market)}/${slugOrId(params.category)}`
      : view === 'shop-detail' && params?.shop ? `/shops/${slugOrId(params.shop)}`
      : view === 'product-detail' && params?.product ? `/products/${slugOrId(params.product)}`
      : undefined;
    if (nextPath && window.location.pathname !== nextPath) window.history.pushState({ view }, '', nextPath);

    if (params?.market) setSelectedMarket(params.market);
    if (params?.shop) setSelectedShop(params.shop);
    if (params?.product) setSelectedProduct(params.product);
    if (params?.category) setSelectedCategory(params.category);
    if (params?.searchTerm !== undefined) setSearchQuery(params.searchTerm);

    // Sync header tab highlight
    if (view === 'markets' || view === 'market-detail') {
      setActiveNavTab('markets');
    } else if (view === 'shops' || view === 'shop-detail') {
      setActiveNavTab('shops');
    } else if (view === 'categories' || view === 'category-detail') {
      setActiveNavTab('categories');
    } else if (view === 'about') {
      setActiveNavTab('about');
    }

    // Scroll smoothly to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const goBack = () => {
    if (viewHistory.length > 1) {
      window.history.back();
      return;
    }
    if (window.location.pathname !== '/') {
      window.history.pushState({ view: 'markets' }, '', '/');
      setCurrentView('markets');
      setActiveNavTab('markets');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    setCurrentView('markets');
  };

  // Search logic
  const performSearch = (query: string) => {
    setSearchQuery(query);
  };

  const filteredMarkets = markets.filter(m => 
    !searchQuery || 
    m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredShops = shops.filter(s => {
    const name = String(s.name || '');
    const marketName = String(s.marketName || '');
    const state = String(s.state || '');
    const district = String(s.district || '');
    const address = String(s.address || '');
    const categoryName = String(s.categoryName || '');
    const about = String(s.about || '');
    return !searchQuery ||
      name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      marketName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      state.toLowerCase().includes(searchQuery.toLowerCase()) ||
      district.toLowerCase().includes(searchQuery.toLowerCase()) ||
      address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      categoryName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      about.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const filteredProducts = products.filter(p => {
    const name = String(p.name || '');
    const shopName = String(p.shopName || '');
    const marketName = String(p.marketName || '');
    const state = String(p.state || '');
    const district = String(p.district || '');
    const categoryName = String(p.categoryName || '');
    const description = String(p.description || '');
    return p.status !== 'hidden' && (
      !searchQuery ||
      name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      shopName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      marketName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      state.toLowerCase().includes(searchQuery.toLowerCase()) ||
      district.toLowerCase().includes(searchQuery.toLowerCase()) ||
      categoryName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      description.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  useEffect(() => {
    if (!firebaseConfigured || !firebaseAuthClient) {
      setCurrentUser(MOCK_USERS.guest);
      return;
    }

    let cancelled = false;

    const mapProfileToUser = (data: any, firebaseUser: FirebaseUser): User => ({
      id: firebaseUser.uid,
      name: String(data?.name || firebaseUser.displayName || 'Claymarket User'),
      email: String(data?.email || firebaseUser.email || ''),
      phone: String(data?.phone || firebaseUser.phoneNumber || ''),
      role: data?.role === 'seller' ? 'seller' : 'buyer',
      avatar: String(data?.avatar || firebaseUser.photoURL || ''),
      addresses: Array.isArray(data?.addresses) ? data.addresses : [],
      shopId: data?.shopId ? String(data.shopId) : undefined,
      shopName: data?.shopName ? String(data.shopName) : undefined,
      sellerLocation: data?.sellerLocation
        ? {
            state: String(data.sellerLocation.state || ''),
            district: String(data.sellerLocation.district || ''),
            marketId: String(data.sellerLocation.marketId || ''),
            marketName: String(data.sellerLocation.marketName || ''),
          }
        : undefined,
    });

    const restoreSession = async (firebaseUser: FirebaseUser) => {
      const token = await withTimeout(
        firebaseUser.getIdToken(),
        8000,
        'Firebase session initialization timed out. Please check your connection.',
      );
      setAuthToken(token);

      if (!firebaseDb) {
        if (!cancelled) setCurrentUser(buildFirebaseFallbackUser(firebaseUser));
        return;
      }

      const profileRef = doc(firebaseDb, 'users', firebaseUser.uid);
      const profileSnap = await withTimeout(
        getDoc(profileRef),
        8000,
        'Profile loading timed out. Your Firebase session is still active.',
      );

      if (!profileSnap.exists()) {
        const profile = {
          name: firebaseUser.displayName || 'Claymarket User',
          email: firebaseUser.email || '',
          phone: firebaseUser.phoneNumber || '',
          role: 'buyer' as const,
          avatar: firebaseUser.photoURL || '',
          addresses: [],
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        };

        await withTimeout(
          setDoc(profileRef, profile),
          8000,
          'Profile creation timed out. Your Firebase session is still active.',
        );

        if (!cancelled) setCurrentUser(mapProfileToUser(profile, firebaseUser));
        return;
      }

      if (!cancelled) setCurrentUser(mapProfileToUser(profileSnap.data(), firebaseUser));
    };

    const unsubscribe = onAuthStateChanged(firebaseAuthClient, async (firebaseUser) => {
      if (cancelled) return;

      // A manual login/registration/become-seller flow is already driving
      // Firebase Auth + Firestore writes and will set currentUser itself
      // once it finishes. Reacting here too can race the profile document
      // (e.g. writing a placeholder profile before the real one is saved).
      if (manualAuthInProgressRef.current) return;

      if (!firebaseUser) {
        clearAuthToken();
        setCurrentUser(MOCK_USERS.guest);
        return;
      }

      try {
        await restoreSession(firebaseUser);
      } catch (error) {
        // Never sign a successfully authenticated Firebase user out merely because
        // profile synchronization is temporarily unavailable. Preserve the session
        // and keep the UI usable; the profile can be synchronized on a later refresh.
        if (!cancelled) {
          setAuthToken(await firebaseUser.getIdToken().catch(() => ''));
          setCurrentUser(buildFirebaseFallbackUser(firebaseUser));
        }
        if (import.meta.env.DEV) {
          console.warn('Claymarket profile/session restoration warning:', error);
        }
      }
    });

    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, []);

  const firebaseAuthError = (error: unknown) => {
    const code = String((error as { code?: string })?.code || '');
    const messages: Record<string, string> = {
      'auth/invalid-credential': 'Invalid email or password.',
      'auth/user-not-found': 'No account was found with those credentials.',
      'auth/wrong-password': 'Invalid email or password.',
      'auth/email-already-in-use': 'An account with this email already exists.',
      'auth/weak-password': 'Password is too weak. Please use at least 8 characters.',
      'auth/invalid-email': 'Please enter a valid email address.',
      'auth/too-many-requests': 'Too many attempts. Please wait and try again.',
      'auth/network-request-failed': 'Network error. Please check your internet connection.',
      'auth/operation-not-allowed': 'Email/password sign-in is not enabled in Firebase yet.',
      'auth/api-key-not-valid.-please-pass-a-valid-api-key.': 'Firebase configuration is invalid. Check the web app API key in your environment variables.',
      'auth/invalid-api-key': 'Firebase configuration is invalid. Check the web app API key in your environment variables.',
    };
    return messages[code] || (error instanceof Error ? error.message : 'Authentication failed. Please try again.');
  };

  const profileForUser = async (firebaseUser: FirebaseUser): Promise<User> => {
    if (!firebaseDb) return buildFirebaseFallbackUser(firebaseUser);

    const profileSnap = await withTimeout(
      getDoc(doc(firebaseDb, 'users', firebaseUser.uid)),
      8000,
      'Profile loading timed out. Please try again.',
    );

    if (!profileSnap.exists()) {
      // A Firebase Auth account can legitimately exist before its application
      // profile is created. Repair that state instead of falling back to the
      // legacy backend authentication endpoint.
      const profile = {
        name: firebaseUser.displayName || 'Claymarket User',
        email: firebaseUser.email || '',
        phone: firebaseUser.phoneNumber || '',
        role: 'buyer' as const,
        avatar: firebaseUser.photoURL || '',
        addresses: [],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      await withTimeout(
        setDoc(doc(firebaseDb, 'users', firebaseUser.uid), profile),
        8000,
        'Profile creation timed out. Please try again.',
      );

      return {
        id: firebaseUser.uid,
        name: profile.name,
        email: profile.email,
        phone: profile.phone,
        role: profile.role,
        avatar: profile.avatar,
        addresses: profile.addresses,
      };
    }

    const data = profileSnap.data();
    return {
      id: firebaseUser.uid,
      name: String(data.name || firebaseUser.displayName || 'Claymarket User'),
      email: String(data.email || firebaseUser.email || ''),
      phone: String(data.phone || ''),
      role: data.role === 'seller' ? 'seller' : 'buyer',
      avatar: String(data.avatar || firebaseUser.photoURL || ''),
      addresses: Array.isArray(data.addresses) ? data.addresses : [],
      shopId: data.shopId ? String(data.shopId) : undefined,
      shopName: data.shopName ? String(data.shopName) : undefined,
      sellerLocation: data.sellerLocation
        ? {
            state: String(data.sellerLocation.state || ''),
            district: String(data.sellerLocation.district || ''),
            marketId: String(data.sellerLocation.marketId || ''),
            marketName: String(data.sellerLocation.marketName || ''),
          }
        : undefined,
    };
  };

  const finishFirebaseLogin = async (email: string, password: string, welcomeMessage = true) => {
    if (!firebaseConfigured || !firebaseAuthClient) {
      throw new Error('Firebase is not configured. Add the VITE_FIREBASE_* environment variables.');
    }

    manualAuthInProgressRef.current = true;
    try {
      const credential = await signInWithEmailAndPassword(firebaseAuthClient, email, password);
      const token = await withTimeout(
        credential.user.getIdToken(true),
        8000,
        'Firebase sign-in completed, but the session token could not be refreshed. Please try again.',
      );
      setAuthToken(token);

      let user: User;
      let profileSyncWarning = false;

      try {
        user = await profileForUser(credential.user);
      } catch (error) {
        // Authentication has already succeeded. Never make the user appear
        // permanently logged in/loading because a profile read is unavailable.
        user = buildFirebaseFallbackUser(credential.user);
        profileSyncWarning = true;
        if (import.meta.env.DEV) {
          console.warn('Claymarket profile sync warning after successful sign-in:', error);
        }
      }

      setCurrentUser(user);
      setIsAuthModalOpen(false);

      if (welcomeMessage) {
        showToast(
          profileSyncWarning
            ? `Signed in successfully. Profile sync will retry later.`
            : `Welcome back, ${user.name}!`,
          profileSyncWarning ? 'warning' : 'success',
        );
      }

      return user;
    } finally {
      manualAuthInProgressRef.current = false;
    }
  };

  const loginUser = async (identifier: string, password: string) => {
    try {
      const value = identifier.trim();
      if (!value) throw new Error('Please enter your email address.');
      if (!password) throw new Error('Please enter your password.');

      let email = value;
      if (!value.includes('@')) {
        // Keep existing phone-login UX. The lookup is handled server-side so
        // email addresses are never exposed through a public Firestore query.
        const resolved = await apiRequest<{ email: string }>('/auth/resolve-login', {
          method: 'POST',
          body: JSON.stringify({ identifier: value }),
        });
        email = resolved.email;
      }

      await finishFirebaseLogin(email.toLowerCase(), password);
    } catch (error) {
      throw new Error(firebaseAuthError(error));
    }
  };

  const createFirebaseProfile = async (
    firebaseUser: FirebaseUser,
    data: Record<string, unknown>,
  ) => {
    if (!firebaseDb) throw new Error('Firestore is not configured.');
    await setDoc(doc(firebaseDb, 'users', firebaseUser.uid), {
      ...data,
      email: firebaseUser.email || '',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  };

  const registerAccount = async (data: { name: string; email: string; password: string; phone?: string }) => {
    if (!firebaseConfigured || !firebaseAuthClient || !firebaseDb) {
      throw new Error('Firebase is not configured. Add the VITE_FIREBASE_* environment variables.');
    }

    let credential: Awaited<ReturnType<typeof createUserWithEmailAndPassword>> | null = null;

    manualAuthInProgressRef.current = true;
    try {
      credential = await createUserWithEmailAndPassword(
        firebaseAuthClient,
        data.email.trim().toLowerCase(),
        data.password,
      );

      // Refresh the ID token before the Firestore write so the token's claims
      // (e.g. email) are current when the security rules evaluate the create.
      await credential.user.getIdToken(true);

      await updateProfile(credential.user, { displayName: data.name.trim() });

      await createFirebaseProfile(credential.user, {
        name: data.name.trim(),
        phone: data.phone?.trim() || '',
        role: 'buyer',
        avatar: credential.user.photoURL || '',
        addresses: [],
      });

      const user = await profileForUser(credential.user);
      setCurrentUser(user);
      setIsAuthModalOpen(false);
      showToast(`Welcome to Claymarket, ${data.name.trim()}!`, 'success');
    } catch (error) {
      if (credential?.user) await deleteUser(credential.user).catch(() => {});
      throw new Error(firebaseAuthError(error));
    } finally {
      manualAuthInProgressRef.current = false;
    }
  };

  const registerSeller = async (data: {
    name: string;
    phone?: string;
    shop: {
      name: string;
      marketId: string;
      categoryId: string;
      state: string;
      district: string;
      address?: string;
    };
  }) => {
    if (!firebaseConfigured || !firebaseAuthClient || !firebaseDb) {
      throw new Error('Firebase is not configured. Add the VITE_FIREBASE_* environment variables.');
    }

    const firebaseUser = firebaseAuthClient.currentUser;
    if (!firebaseUser) {
      throw new Error('Please sign in to your Claymarket account before opening a shop.');
    }

    const selectedMarket = markets.find(m => m.id === data.shop.marketId);
    const selectedCategory = categories.find(c => c.id === data.shop.categoryId);
    if (!selectedMarket) throw new Error('Please select a valid market.');
    if (!selectedCategory) throw new Error('Please select a valid category.');

    manualAuthInProgressRef.current = true;
    try {
      const shopId = `shop_${firebaseUser.uid}`;
      const shopName = data.shop.name.trim();

      if (!shopName) throw new Error('Please enter a shop name.');
      if (!data.shop.state.trim()) throw new Error('Please enter your state.');
      if (!data.shop.district.trim()) throw new Error('Please enter your district.');

      if (firebaseUser.displayName !== data.name.trim()) {
        await updateProfile(firebaseUser, { displayName: data.name.trim() });
      }

      const shopDoc = {
        ownerId: firebaseUser.uid,
        ownerName: data.name.trim(),
        name: shopName,
        slug: `${shopName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'local-shop'}-${Date.now()}`,
        marketId: selectedMarket.id,
        marketName: selectedMarket.name,
        state: data.shop.state.trim(),
        district: data.shop.district.trim(),
        categoryIds: [selectedCategory.id],
        categoryId: selectedCategory.id,
        categoryName: selectedCategory.name,
        profileImage: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=500&auto=format&fit=crop&q=80',
        coverImage: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1000&auto=format&fit=crop&q=80',
        description: '',
        phone: data.phone?.trim() || '',
        address: data.shop.address?.trim() || '',
        rating: 0,
        reviewsCount: 0,
        verified: false,
        followersCount: 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      const userDoc = {
        name: data.name.trim(),
        email: firebaseUser.email || '',
        phone: data.phone?.trim() || '',
        role: 'seller',
        avatar: firebaseUser.photoURL || '',
        addresses: Array.isArray(currentUser.addresses) ? currentUser.addresses : [],
        shopId,
        shopName,
        sellerLocation: {
          state: data.shop.state.trim(),
          district: data.shop.district.trim(),
          marketId: selectedMarket.id,
          marketName: selectedMarket.name,
        },
      };

      // Keep the user-role promotion and shop creation atomic. Firestore rules
      // validate that the same signed-in UID owns the newly created shop.
      const batch = writeBatch(firebaseDb);
      batch.set(doc(firebaseDb, 'users', firebaseUser.uid), {
        ...userDoc,
        // This is a promotion of an existing buyer profile, not a brand-new
        // document, so the original createdAt must be preserved (merge only
        // touches the fields listed here).
        updatedAt: serverTimestamp(),
      }, { merge: true });
      batch.set(doc(firebaseDb, 'shops', shopId), shopDoc);
      await withTimeout(
        batch.commit(),
        10000,
        'Shop creation timed out. Please check your Firebase connection and try again.',
      );

      const token = await withTimeout(
        firebaseUser.getIdToken(true),
        8000,
        'Shop created, but the session token could not be refreshed. Please refresh and try again.',
      );
      setAuthToken(token);

      const user = await profileForUser(firebaseUser);
      setCurrentUser(user);

      const newShop: Shop = {
        id: shopId,
        name: shopName,
        marketId: selectedMarket.id,
        marketName: selectedMarket.name,
        state: data.shop.state.trim(),
        district: data.shop.district.trim(),
        categoryId: selectedCategory.id,
        categoryName: selectedCategory.name,
        avatar: shopDoc.profileImage,
        banner: shopDoc.coverImage,
        rating: 0,
        reviewsCount: 0,
        verified: false,
        followersCount: 0,
        about: '',
        phone: data.phone?.trim() || '',
        address: data.shop.address?.trim() || '',
        ownerId: firebaseUser.uid,
        ownerName: data.name.trim(),
      };
      setShops(prev => [newShop, ...prev.filter(shop => shop.id !== shopId)]);

      setIsAuthModalOpen(false);
      showToast(`Congratulations! "${shopName}" is now open on Claymarket!`, 'success');
      navigateTo('seller-dashboard');
    } catch (error) {
      throw new Error(firebaseAuthError(error));
    } finally {
      manualAuthInProgressRef.current = false;
    }
  };

  const updateProfilePicture = async (file: File) => {
    if (!firebaseConfigured || !firebaseAuthClient || !firebaseDb) {
      throw new Error('Firebase is not configured.');
    }

    const firebaseUser = firebaseAuthClient.currentUser;
    if (!firebaseUser) {
      throw new Error('Please sign in before adding a profile picture.');
    }

    const validation = validateImageFile(file);
    if (!validation.valid) {
      throw new Error(validation.error || 'Please choose a valid profile image.');
    }

    try {
      const downloadUrl = await withTimeout(
        uploadToCloudinary(file, `profiles/${firebaseUser.uid}`),
        20000,
        'Profile picture upload timed out. Please check your connection and try again.',
      );

      await withTimeout(
        updateProfile(firebaseUser, { photoURL: downloadUrl }),
        10000,
        'Profile picture uploaded, but your account could not be updated. Please try again.',
      );

      await withTimeout(
        updateDoc(doc(firebaseDb, 'users', firebaseUser.uid), {
          avatar: downloadUrl,
          updatedAt: serverTimestamp(),
        }),
        10000,
        'Profile picture uploaded, but your profile could not be saved. Please try again.',
      );

      setCurrentUser(prev => ({ ...prev, avatar: downloadUrl }));
      showToast('Profile picture updated successfully.', 'success');
    } catch (error) {
      throw new Error(
        error instanceof Error ? error.message : 'Could not update your profile picture. Please try again.',
      );
    }
  };

  const logoutUser = async () => {
    try {
      if (firebaseAuthClient) await signOut(firebaseAuthClient);
    } finally {
      clearAuthToken();
      setCurrentUser(MOCK_USERS.guest);
      showToast('You have been logged out.', 'info');
    }
  };

  // Cart operations
  const addToCart = (product: Product, quantity = 1, size?: string, color?: string): boolean => {
    if (product.price === undefined || product.price === null || !Number.isFinite(product.price)) {
      showToast('This product has no price yet. Please contact the seller.', 'warning');
      return false;
    }
    if (product.inStock === false || product.stockCount === 0) {
      showToast('This product is currently out of stock.', 'warning');
      return false;
    }
    const safeQuantity = Math.max(1, Math.floor(quantity));
    const selectedSize = size || product.sizes?.[0] || 'Standard';
    const selectedColor = color || product.colors?.[0]?.name || 'Default';
    const cartItemId = `${product.id}-${selectedSize}-${selectedColor}`;

    setCart(prev => {
      const existing = prev.find(item => item.id === cartItemId);
      if (existing) {
        return prev.map(item => 
          item.id === cartItemId 
            ? { ...item, quantity: Math.min(item.quantity + safeQuantity, product.stockCount ?? Number.MAX_SAFE_INTEGER) }
            : item
        );
      }
      return [...prev, {
        id: cartItemId,
        product,
        quantity: Math.min(safeQuantity, product.stockCount ?? safeQuantity),
        selectedSize,
        selectedColor,
      }];
    });

    showToast(`Added "${product.name}" to cart!`, 'success');
    return true;
  };

  const removeFromCart = (cartItemId: string) => {
    setCart(prev => prev.filter(item => item.id !== cartItemId));
    showToast('Item removed from cart', 'info');
  };

  const updateCartQuantity = (cartItemId: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id !== cartItemId) return item;
      const max = item.product.stockCount ?? Number.MAX_SAFE_INTEGER;
      const newQty = Math.min(max, Math.max(1, item.quantity + delta));
      return { ...item, quantity: newQty };
    }));
  };

  const clearCart = () => {
    setCart([]);
  };

  // Wishlist operations
  const toggleWishlist = (productId: string) => {
    if (currentUser.role === 'guest') {
      setIsAuthModalOpen(true);
      setAuthModalTab('login');
      showToast('Please sign in to save items to your wishlist', 'info');
      return;
    }

    setWishlist(prev => {
      const exists = prev.includes(productId);
      const updated = exists ? prev.filter(id => id !== productId) : [...prev, productId];
      showToast(exists ? 'Removed from wishlist' : 'Saved to wishlist!', 'success');
      return updated;
    });
  };

  const isWishlisted = (productId: string) => wishlist.includes(productId);

  // Shop Following
  const toggleFollowShop = (shopId: string) => {
    if (currentUser.role === 'guest') {
      setIsAuthModalOpen(true);
      return;
    }
    setFollowedShops(prev => {
      const exists = prev.includes(shopId);
      const updated = exists ? prev.filter(id => id !== shopId) : [...prev, shopId];
      showToast(exists ? 'Unfollowed shop' : 'Following shop! You will receive new product updates.', 'success');
      return updated;
    });
  };

  const isFollowingShop = (shopId: string) => followedShops.includes(shopId);

  // Messaging operations
  const sendMessage = (conversationId: string, text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;

    const isCurrentUserSeller = currentUser.role === 'seller';
    const senderRole: 'buyer' | 'seller' = isCurrentUserSeller ? 'seller' : 'buyer';
    const tempId = `temp_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;

    const optimisticMsg: ChatMessage = {
      id: tempId,
      conversationId,
      senderId: currentUser.id,
      senderRole,
      sender: senderRole,
      text: trimmed,
      timestamp: 'Just now',
    };

    // Show the message immediately on this device, then persist it to the
    // backend so it actually reaches the other party on their device too.
    setConversations(prev => prev.map(conv => conv.id === conversationId ? {
      ...conv,
      lastMessage: trimmed,
      timestamp: 'Just now',
      messages: [...conv.messages, optimisticMsg],
    } : conv));

    // Conversations shown while browsing as a guest are demo data only;
    // there's nothing on the backend to sync for those.
    if (currentUser.role === 'guest') return;

    void (async () => {
      try {
        await apiRequest(`/conversations/${conversationId}/messages`, {
          method: 'POST',
          body: JSON.stringify({ text: trimmed }),
        });
        await fetchConversations();
      } catch {
        showToast('Message failed to send. Check your connection and try again.', 'error');
        setConversations(prev => prev.map(conv => conv.id === conversationId ? {
          ...conv,
          messages: conv.messages.filter(m => m.id !== tempId),
        } : conv));
      }
    })();
  };

  const startChatWithShop = (shop: Shop, initialProduct?: Product, initialQuestion?: string) => {
    if (currentUser.role === 'guest') {
      setIsAuthModalOpen(true);
      setAuthModalTab('login');
      showToast('Please sign in to message sellers directly', 'info');
      return;
    }

    if (shop.ownerId === currentUser.id) {
      showToast('You cannot message your own shop.', 'warning');
      return;
    }

    // Look for an existing conversation with this shop so repeated inquiries
    // land in the same thread instead of creating duplicates.
    const existingConv = conversations.find(c => c.shopId === shop.id);

    const openLocalPlaceholder = (convId: string) => {
      // Shown immediately while the real conversation loads from the backend.
      setConversations(prev => {
        if (prev.some(c => c.id === convId)) return prev;
        const placeholder: Conversation = {
          id: convId,
          buyerId: currentUser.id,
          buyerName: currentUser.name,
          buyerAvatar: currentUser.avatar,
          sellerId: shop.ownerId,
          sellerName: shop.ownerName || shop.name,
          shopId: shop.id,
          shopName: shop.name,
          shopAvatar: shop.avatar,
          marketName: shop.marketName,
          productId: initialProduct?.id,
          productAttachment: initialProduct ? {
            id: initialProduct.id,
            name: initialProduct.name,
            price: initialProduct.price,
            image: initialProduct.images[0],
            shopName: shop.name,
          } : undefined,
          lastMessage: initialQuestion || `Started chat with ${shop.name}`,
          timestamp: 'Just now',
          unreadCount: 0,
          messages: [],
        };
        return [placeholder, ...prev];
      });
      setActiveConversationId(convId);
      setIsMessagesOpen(true);
    };

    if (existingConv) {
      setActiveConversationId(existingConv.id);
      setIsMessagesOpen(true);
      if (initialQuestion) sendMessage(existingConv.id, initialQuestion);
      void fetchConversations();
      return;
    }

    // Show something instantly, then reconcile with the real backend-created
    // conversation (and its id) once the request resolves.
    const tempConvId = `conv_pending_${shop.id}_${Date.now()}`;
    openLocalPlaceholder(tempConvId);

    void (async () => {
      try {
        const created = await apiRequest<any>('/conversations', {
          method: 'POST',
          body: JSON.stringify({
            sellerId: shop.ownerId,
            shopId: shop.id,
            productId: initialProduct?.id,
          }),
        });
        const realId = String(created?._id || '');
        if (!realId) throw new Error('Conversation was not created.');

        setConversations(prev => prev.map(c => c.id === tempConvId ? { ...c, id: realId } : c));
        setActiveConversationId(realId);

        if (initialQuestion) sendMessage(realId, initialQuestion);
        await fetchConversations();
      } catch {
        showToast('Could not start the chat. Please check your connection and try again.', 'error');
        setConversations(prev => prev.filter(c => c.id !== tempConvId));
      }
    })();
  };

  // Order Placement
  const createOrder = async (deliveryType: 'pickup' | 'delivery', address?: string): Promise<Order | null> => {
    if (currentUser.role === 'guest') {
      setIsAuthModalOpen(true);
      setAuthModalTab('login');
      showToast('Please sign in to place an order', 'info');
      return null;
    }
    if (!cart.length) { showToast('Your cart is empty.', 'warning'); return null; }
    if (cart.some(item => item.product.price === undefined || item.product.price === null || !Number.isFinite(item.product.price))) {
      showToast('Every cart item must have a price before checkout.', 'warning');
      return null;
    }

    const groups = new Map<string, CartItem[]>();
    for (const item of cart) {
      const key = item.product.shopId;
      groups.set(key, [...(groups.get(key) || []), item]);
    }

    const resolvedAddress = address || (deliveryType === 'pickup' ? 'Shop Counter Pickup' : currentUser.addresses[0]?.street || 'Local Delivery Address');
    const createdOrders: Order[] = [];

    try {
      for (const items of groups.values()) {
        const payload = {
          items: items.map(item => ({
            productId: item.product.id,
            quantity: item.quantity,
            selectedSize: item.selectedSize,
            selectedColor: item.selectedColor,
          })),
          deliveryType,
          address: resolvedAddress,
        };
        const created = await apiRequest<any>('/orders', { method: 'POST', body: JSON.stringify(payload) });
        createdOrders.push(mapBackendOrder(created, shops));
      }
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Could not place the order. Please try again.', 'error');
      if (createdOrders.length) {
        // Some shop groups were already ordered before the failure. Keep
        // those orders and only clear the cart items that were actually
        // placed, so the items that failed remain in the cart to retry.
        const orderedShopIds = new Set(createdOrders.map(o => o.shopId));
        setCart(prev => prev.filter(item => !orderedShopIds.has(item.product.shopId)));
        setOrders(prev => [...createdOrders, ...prev]);
        void fetchOrders();
      }
      return createdOrders[0] || null;
    }

    setOrders(prev => [...createdOrders, ...prev]);
    clearCart();
    showToast(`${createdOrders.length} order${createdOrders.length > 1 ? 's' : ''} placed successfully!`, 'success');
    void fetchOrders();
    return createdOrders[0] || null;
  };

  const updateOrderStatus = (orderId: string, status: Order['status']) => {
    // Reflect the change immediately, then persist it so the buyer sees the
    // update on their own device without waiting for the next poll.
    setOrders(prev => prev.map(ord => ord.id === orderId ? { ...ord, status } : ord));
    showToast(`Order status updated to ${status}`, 'info');

    void (async () => {
      try {
        await apiRequest(`/orders/${orderId}/status`, { method: 'PATCH', body: JSON.stringify({ status }) });
        await fetchOrders();
      } catch {
        showToast('Could not save the status update. Please check your connection.', 'error');
        void fetchOrders();
      }
    })();
  };

  // Seller Product Management
  const uploadProductImageIfNeeded = async (productId: string, url: string, index: number): Promise<string> => {
    if (!url.startsWith('data:')) return url;

    const response = await fetch(url);
    const blob = await response.blob();
    return uploadToCloudinary(blob, `products/${currentUser.id}/${productId}`);
  };

  const createProduct = async (productData: Partial<Product>): Promise<boolean> => {
    const name = productData.name?.trim();
    if (!name) { showToast('Product name is required.', 'warning'); return false; }
    if (!productData.images?.length) { showToast('Add at least one product photo.', 'warning'); return false; }
    if (currentUser.role !== 'seller' || !currentUser.shopId) {
      showToast('Please sign in as a seller before publishing a product.', 'warning');
      return false;
    }
    if (!firebaseDb) {
      showToast('Firebase is not fully configured. Enable Firestore before publishing products.', 'error');
      return false;
    }

    const productId = `prod_${crypto.randomUUID()}`;
    const marketId = productData.marketId || currentUser.sellerLocation?.marketId || 'mkt_kachumara';
    const market = markets.find(m => m.id === marketId);
    const category = categories.find(c => c.id === productData.categoryId);

    try {
      const uploadedImages = await Promise.all(
        productData.images.map((url, index) => uploadProductImageIfNeeded(productId, String(url), index)),
      );

      const newProd = removeUndefined({
        id: productId,
        sellerId: currentUser.id,
        shopId: currentUser.shopId,
        shopName: currentUser.shopName || 'Local Shop',
        marketId,
        marketName: market?.name || currentUser.sellerLocation?.marketName || 'Local Market',
        state: currentUser.sellerLocation?.state,
        district: currentUser.sellerLocation?.district,
        categoryId: productData.categoryId,
        categoryName: productData.categoryName || category?.name,
        shopCategoryId: productData.shopCategoryId,
        shopCategoryName: productData.shopCategoryName,
        name,
        price: productData.price,
        originalPrice: productData.originalPrice,
        description: productData.description?.trim() || undefined,
        images: uploadedImages,
        sizes: productData.sizes,
        colors: productData.colors,
        inStock: productData.stockCount !== undefined ? productData.stockCount > 0 : undefined,
        stockCount: productData.stockCount,
        material: productData.material?.trim() || undefined,
        rating: 0,
        reviewsCount: 0,
        status: 'published',
      }) as Product;

      await setDoc(doc(firebaseDb, 'products', productId), {
        ...newProd,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      setProducts(prev => [newProd, ...prev.filter(p => p.id !== productId)]);
      showToast(`Product "${newProd.name}" published to your shop!`, 'success');
      return true;
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Unable to publish the product. Check that Firebase Storage is enabled for your project.', 'error');
      return false;
    }
  };

  const updateProduct = async (productId: string, productData: Partial<Product>): Promise<boolean> => {
    const target = products.find(p => p.id === productId);
    if (!target) {
      showToast('Product not found.', 'error');
      return false;
    }
    if (currentUser.role !== 'seller' || (target.shopId !== currentUser.shopId && target.sellerId !== currentUser.id)) {
      showToast('You are not allowed to edit this product.', 'error');
      return false;
    }
    if (!firebaseDb) {
      showToast('Firebase is not fully configured. Enable Firestore before editing products.', 'error');
      return false;
    }

    try {
      const nextImages = productData.images
        ? await Promise.all(productData.images.map((url, index) => uploadProductImageIfNeeded(productId, String(url), index)))
        : undefined;

      const update = removeUndefined({
        ...productData,
        ...(nextImages ? { images: nextImages } : {}),
        updatedAt: serverTimestamp(),
      });

      await updateDoc(doc(firebaseDb, 'products', productId), update as Record<string, unknown>);
      setProducts(prev => prev.map(p => p.id === productId ? { ...p, ...productData, ...(nextImages ? { images: nextImages } : {}) } : p));
      showToast('Product updated successfully!', 'success');
      return true;
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Unable to update the product.', 'error');
      return false;
    }
  };

  const deleteProduct = async (productId: string) => {
    const target = products.find(p => p.id === productId);
    if (!target) {
      showToast('Product not found.', 'error');
      return;
    }
    if (currentUser.role !== 'seller' || (target.shopId !== currentUser.shopId && target.sellerId !== currentUser.id)) {
      showToast('You are not allowed to delete this product.', 'error');
      return;
    }
    if (!firebaseDb) {
      showToast('Firebase is not configured. Product data cannot be deleted safely.', 'error');
      return;
    }

    try {
      await deleteDoc(doc(firebaseDb, 'products', productId));
      setProducts(prev => prev.filter(p => p.id !== productId));
      showToast('Product removed from shop catalog', 'info');
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Unable to remove the product.', 'error');
    }
  };

  // Update shop avatar (profile) and/or banner (cover) photo. Supports uploading a
  // new image and/or removing an existing one back to the default placeholder.
  const updateShopImages = async (
    shopId: string,
    updates: { avatarFile?: File | null; bannerFile?: File | null; removeAvatar?: boolean; removeBanner?: boolean },
  ): Promise<boolean> => {
    const target = shops.find(s => s.id === shopId);
    if (!target) { showToast('Shop not found.', 'error'); return false; }
    if (currentUser.role !== 'seller' || currentUser.shopId !== shopId) {
      showToast('You are not allowed to edit this shop.', 'error');
      return false;
    }
    if (!firebaseDb) {
      showToast('Firebase is not fully configured. Enable Firestore first.', 'error');
      return false;
    }

    const DEFAULT_AVATAR = 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=500&auto=format&fit=crop&q=80';
    const DEFAULT_BANNER = 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1000&auto=format&fit=crop&q=80';

    try {
      const fieldUpdate: Record<string, unknown> = {};
      const shopUpdate: Partial<Shop> = {};

      if (updates.avatarFile) {
        const validation = validateImageFile(updates.avatarFile);
        if (!validation.valid) { showToast(validation.error || 'Invalid image file.', 'error'); return false; }
        const url = await uploadToCloudinary(updates.avatarFile, `shops/${shopId}`);
        fieldUpdate.profileImage = url;
        shopUpdate.avatar = url;
      } else if (updates.removeAvatar) {
        fieldUpdate.profileImage = DEFAULT_AVATAR;
        shopUpdate.avatar = DEFAULT_AVATAR;
      }

      if (updates.bannerFile) {
        const validation = validateImageFile(updates.bannerFile);
        if (!validation.valid) { showToast(validation.error || 'Invalid image file.', 'error'); return false; }
        const url = await uploadToCloudinary(updates.bannerFile, `shops/${shopId}`);
        fieldUpdate.coverImage = url;
        shopUpdate.banner = url;
      } else if (updates.removeBanner) {
        fieldUpdate.coverImage = DEFAULT_BANNER;
        shopUpdate.banner = DEFAULT_BANNER;
      }

      if (Object.keys(fieldUpdate).length === 0) return false;

      fieldUpdate.updatedAt = serverTimestamp();
      await updateDoc(doc(firebaseDb, 'shops', shopId), fieldUpdate);
      setShops(prev => prev.map(s => s.id === shopId ? { ...s, ...shopUpdate } : s));
      showToast('Shop photo updated!', 'success');
      return true;
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Unable to update shop photo.', 'error');
      return false;
    }
  };

  // Update editable shop business details shown on the "About" tab.
  const updateShopDetails = async (
    shopId: string,
    updates: { phone?: string; address?: string; about?: string; openingHours?: string },
  ): Promise<boolean> => {
    const target = shops.find(s => s.id === shopId);
    if (!target) { showToast('Shop not found.', 'error'); return false; }
    if (currentUser.role !== 'seller' || currentUser.shopId !== shopId) {
      showToast('You are not allowed to edit this shop.', 'error');
      return false;
    }
    if (!firebaseDb) {
      showToast('Firebase is not fully configured.', 'error');
      return false;
    }

    try {
      const fieldUpdate = removeUndefined({
        phone: updates.phone?.trim(),
        address: updates.address?.trim(),
        description: updates.about?.trim(),
        openingHours: updates.openingHours?.trim(),
        updatedAt: serverTimestamp(),
      });

      await updateDoc(doc(firebaseDb, 'shops', shopId), fieldUpdate);
      setShops(prev => prev.map(s => s.id === shopId ? {
        ...s,
        phone: updates.phone !== undefined ? updates.phone.trim() : s.phone,
        address: updates.address !== undefined ? updates.address.trim() : s.address,
        about: updates.about !== undefined ? updates.about.trim() : s.about,
        openingHours: updates.openingHours !== undefined ? updates.openingHours.trim() : s.openingHours,
      } : s));
      showToast('Shop details updated!', 'success');
      return true;
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Unable to update shop details.', 'error');
      return false;
    }
  };

  const assertCategoryOwnership = (shopId: string): Shop | null => {
    const target = shops.find(s => s.id === shopId);
    if (!target) { showToast('Shop not found.', 'error'); return null; }
    if (currentUser.role !== 'seller' || currentUser.shopId !== shopId) {
      showToast('You are not allowed to edit this shop.', 'error');
      return null;
    }
    return target;
  };

  // Shop-level product categories (e.g. "Men's Wear", "Women's Wear", "Kids Wear")
  // let a seller organize their own catalog independently of the marketplace-wide
  // browse categories.
  const addShopCategory = async (shopId: string, name: string): Promise<boolean> => {
    const target = assertCategoryOwnership(shopId);
    if (!target) return false;
    if (!firebaseDb) { showToast('Firebase is not fully configured.', 'error'); return false; }
    const trimmed = name.trim();
    if (!trimmed) { showToast('Category name is required.', 'warning'); return false; }

    const existing = target.productCategories || [];
    if (existing.some(c => c.name.toLowerCase() === trimmed.toLowerCase())) {
      showToast('A category with this name already exists.', 'warning');
      return false;
    }

    const newCategory = { id: `shopcat_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`, name: trimmed };
    const nextCategories = [...existing, newCategory];

    try {
      await updateDoc(doc(firebaseDb, 'shops', shopId), {
        productCategories: nextCategories,
        updatedAt: serverTimestamp(),
      });
      setShops(prev => prev.map(s => s.id === shopId ? { ...s, productCategories: nextCategories } : s));
      showToast(`Category "${trimmed}" added.`, 'success');
      return true;
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Unable to add category.', 'error');
      return false;
    }
  };

  const updateShopCategory = async (shopId: string, categoryId: string, name: string): Promise<boolean> => {
    const target = assertCategoryOwnership(shopId);
    if (!target) return false;
    if (!firebaseDb) { showToast('Firebase is not fully configured.', 'error'); return false; }
    const trimmed = name.trim();
    if (!trimmed) { showToast('Category name is required.', 'warning'); return false; }

    const existing = target.productCategories || [];
    const nextCategories = existing.map(c => c.id === categoryId ? { ...c, name: trimmed } : c);

    try {
      const batch = writeBatch(firebaseDb);
      batch.update(doc(firebaseDb, 'shops', shopId), {
        productCategories: nextCategories,
        updatedAt: serverTimestamp(),
      });
      const affectedProducts = products.filter(p => p.shopId === shopId && p.shopCategoryId === categoryId);
      affectedProducts.forEach(p => {
        batch.update(doc(firebaseDb, 'products', p.id), { shopCategoryName: trimmed, updatedAt: serverTimestamp() });
      });
      await batch.commit();

      setShops(prev => prev.map(s => s.id === shopId ? { ...s, productCategories: nextCategories } : s));
      setProducts(prev => prev.map(p => (p.shopId === shopId && p.shopCategoryId === categoryId) ? { ...p, shopCategoryName: trimmed } : p));
      showToast('Category updated.', 'success');
      return true;
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Unable to update category.', 'error');
      return false;
    }
  };

  const deleteShopCategory = async (shopId: string, categoryId: string): Promise<boolean> => {
    const target = assertCategoryOwnership(shopId);
    if (!target) return false;
    if (!firebaseDb) { showToast('Firebase is not fully configured.', 'error'); return false; }

    const existing = target.productCategories || [];
    const nextCategories = existing.filter(c => c.id !== categoryId);

    try {
      const batch = writeBatch(firebaseDb);
      batch.update(doc(firebaseDb, 'shops', shopId), {
        productCategories: nextCategories,
        updatedAt: serverTimestamp(),
      });
      const affectedProducts = products.filter(p => p.shopId === shopId && p.shopCategoryId === categoryId);
      affectedProducts.forEach(p => {
        batch.update(doc(firebaseDb, 'products', p.id), {
          shopCategoryId: deleteField(),
          shopCategoryName: deleteField(),
          updatedAt: serverTimestamp(),
        });
      });
      await batch.commit();

      setShops(prev => prev.map(s => s.id === shopId ? { ...s, productCategories: nextCategories } : s));
      setProducts(prev => prev.map(p => (p.shopId === shopId && p.shopCategoryId === categoryId) ? { ...p, shopCategoryId: undefined, shopCategoryName: undefined } : p));
      showToast('Category removed.', 'info');
      return true;
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Unable to remove category.', 'error');
      return false;
    }
  };

  const registerShop = (shopData: Partial<Shop>) => {
    const newShopId = `shop_${Date.now()}`;
    const newShop: Shop = {
      id: newShopId,
      name: shopData.name || 'My Local Shop',
      marketId: shopData.marketId || 'mkt_kachumara',
      marketName: markets.find(m => m.id === shopData.marketId)?.name || 'Kachumara Market',
      categoryId: shopData.categoryId || 'cat_slippers',
      categoryName: categories.find(c => c.id === shopData.categoryId)?.name || 'Slippers',
      avatar: shopData.avatar || 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=500&auto=format&fit=crop&q=80',
      banner: shopData.banner || 'https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=1000&auto=format&fit=crop&q=80',
      rating: 5.0,
      reviewsCount: 0,
      verified: true,
      followersCount: 1,
      about: shopData.about || 'Welcome to our shop on Claymarket!',
      phone: shopData.phone || '+91 98765 00000',
      address: shopData.address || 'Kachumara Market Stall #15',
      ownerId: currentUser.id,
      ownerName: currentUser.name,
      openingHours: '8:00 AM - 8:00 PM',
      iconBg: '#DDD4FF',
      iconType: 'slippers',
    };

    setShops(prev => [newShop, ...prev]);
    setCurrentUser(prev => ({
      ...prev,
      role: 'seller',
      shopId: newShopId,
      shopName: newShop.name,
    }));

    showToast(`Congratulations! "${newShop.name}" is now live on Claymarket!`, 'success');
    navigateTo('seller-dashboard');
  };

  return (
    <AppContext.Provider
      value={{
        currentView,
        activeNavTab,
        navigateTo,
        goBack,
        selectedMarket,
        selectedShop,
        selectedProduct,
        selectedCategory,
        searchQuery,
        setSearchQuery,
        performSearch,
        filteredMarkets,
        filteredShops,
        filteredProducts,
        currentUser,
        loginUser,
        registerAccount,
        registerSeller,
        logoutUser,
        updateProfilePicture,
        isAuthModalOpen,
        setIsAuthModalOpen,
        authModalTab,
        setAuthModalTab,
        markets,
        addMarketAdmin,
        deleteMarketAdmin,
        shops,
        products,
        categories,
        cart,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        clearCart,
        isCartOpen,
        setIsCartOpen,
        wishlist,
        toggleWishlist,
        isWishlisted,
        conversations,
        activeConversationId,
        setActiveConversationId,
        sendMessage,
        startChatWithShop,
        isMessagesOpen,
        setIsMessagesOpen,
        orders,
        createOrder,
        updateOrderStatus,
        createProduct,
        updateProduct,
        deleteProduct,
        registerShop,
        updateShopImages,
        updateShopDetails,
        addShopCategory,
        updateShopCategory,
        deleteShopCategory,
        toasts,
        showToast,
        removeToast,
        followedShops,
        toggleFollowShop,
        isFollowingShop,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
