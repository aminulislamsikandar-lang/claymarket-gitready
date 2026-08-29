export type UserRole = 'guest' | 'buyer' | 'seller';

export interface Address {
  id: string;
  label: string;
  street: string;
  city: string;
  state: string;
  pincode: string;
  isDefault?: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar: string;
  shopId?: string;
  shopName?: string;
  phone?: string;
  addresses: Address[];
  sellerLocation?: {
    state: string;
    district: string;
    marketId: string;
    marketName: string;
  };
}

export interface Market {
  id: string;
  name: string;
  slug: string;
  bannerImage: string;
  location: string;
  description: string;
  featuredCategories: string[];
  bannerText?: string;
  established?: string;
}

export interface Shop {
  id: string;
  name: string;
  marketId: string;
  marketName: string;
  state?: string;
  district?: string;
  categoryId: string;
  categoryName: string;
  avatar: string;
  banner: string;
  rating: number;
  reviewsCount: number;
  verified: boolean;
  followersCount: number;
  about: string;
  phone: string;
  address: string;
  ownerId: string;
  ownerName: string;
  isFollowing?: boolean;
  openingHours?: string;
  iconBg?: string;
  iconType?: string;
  productCategories?: ShopProductCategory[];
}

export interface ShopProductCategory {
  id: string;
  name: string;
}

export interface ProductColor {
  name: string;
  hex: string;
}

export interface ProductImageItem {
  id: string;
  url: string;
  isPrimary?: boolean;
}

export interface Product {
  id: string;
  sellerId?: string;
  shopId: string;
  shopName: string;
  marketId: string;
  marketName: string;
  categoryId?: string;
  categoryName?: string;
  shopCategoryId?: string;
  shopCategoryName?: string;
  state?: string;
  district?: string;
  name: string;
  price?: number;
  originalPrice?: number;
  description?: string;
  images: string[];
  sizes?: string[];
  colors?: ProductColor[];
  inStock?: boolean;
  stockCount?: number;
  isWishlisted?: boolean;
  material?: string;
  rating?: number;
  reviewsCount?: number;
  status?: 'published' | 'hidden';
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  iconType: 'slippers' | 'clothes' | 'electronics' | 'home' | 'grocery' | 'more' | 'handicrafts';
  iconBg: string;
  badgeBg: string;
  badgeTextColor: string;
  description: string;
}

export interface ChatMessage {
  id: string;
  conversationId?: string;
  senderId?: string;
  senderRole?: 'buyer' | 'seller' | 'guest';
  sender: 'buyer' | 'seller'; // Keep for backwards compatibility
  text: string;
  timestamp: string;
  productAttachment?: {
    id: string;
    name: string;
    price?: number;
    image: string;
    shopName: string;
  };
}

export interface Conversation {
  id: string;
  buyerId?: string;
  buyerName?: string;
  buyerAvatar?: string;
  sellerId?: string;
  sellerName?: string;
  shopId: string;
  shopName: string;
  shopAvatar: string;
  marketName: string;
  productId?: string;
  productAttachment?: {
    id: string;
    name: string;
    price?: number;
    image: string;
    shopName: string;
  };
  lastMessage: string;
  timestamp: string;
  unreadCount: number;
  messages: ChatMessage[];
}

export interface CartItem {
  id: string;
  product: Product;
  quantity: number;
  selectedSize?: string;
  selectedColor?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  date: string;
  createdAt?: string;
  shopId: string;
  shopName: string;
  marketName: string;
  items: CartItem[];
  totalAmount: number;
  status: 'pending' | 'confirmed' | 'ready_for_pickup' | 'completed' | 'cancelled';
  deliveryType: 'pickup' | 'delivery';
  address?: string;
}

export interface Review {
  id: string;
  authorName: string;
  authorAvatar: string;
  rating: number;
  date: string;
  comment: string;
  verifiedPurchase: boolean;
}

export type NavigationTab = 'markets' | 'shops' | 'categories' | 'about';

export type AppView = 
  | 'markets' 
  | 'market-detail' 
  | 'shops' 
  | 'shop-detail' 
  | 'categories' 
  | 'category-detail' 
  | 'product-detail' 
  | 'about' 
  | 'messages' 
  | 'wishlist' 
  | 'cart' 
  | 'orders' 
  | 'profile' 
  | 'seller-dashboard' 
  | 'saved-addresses' 
  | 'notifications' 
  | 'settings' 
  | 'help'
  | 'privacy'
  | 'terms'
  | 'faq'
  | 'not-found';
