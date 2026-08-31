import { Product, Category, User, Conversation, Order, Review } from '../types';

export const MOCK_USERS: Record<string, User> = {
  guest: {
    id: 'guest',
    name: 'Guest User',
    email: '',
    role: 'guest',
    avatar: '',
    addresses: [],
  },
};

export const MOCK_CATEGORIES: Category[] = [
  {
    id: 'cat_slippers', name: 'Slippers', slug: 'slippers', iconType: 'slippers', iconBg: '#DDD4FF', badgeBg: 'bg-[#DDD4FF]', badgeTextColor: 'text-[#553BB8]', description: 'Comfortable daily footwear, flip-flops, traditional chappals & slides',
  },
  {
    id: 'cat_clothes', name: 'Clothes', slug: 'clothes', iconType: 'clothes', iconBg: '#FFD9C7', badgeBg: 'bg-[#FFD9C7]', badgeTextColor: 'text-[#A03D12]', description: 'Ethnic wear, handloom cotton, daily shirts, gamusas & fabrics',
  },
  {
    id: 'cat_electronics', name: 'Electronics', slug: 'electronics', iconType: 'electronics', iconBg: '#CBE4FF', badgeBg: 'bg-[#CBE4FF]', badgeTextColor: 'text-[#1B5899]', description: 'Mobile accessories, sound systems, chargers, torches & spares',
  },
  {
    id: 'cat_home', name: 'Home & Living', slug: 'home-and-living', iconType: 'home', iconBg: '#FFE9AD', badgeBg: 'bg-[#FFE9AD]', badgeTextColor: 'text-[#8C6207]', description: 'Bamboo crafts, home utensils, handmade rugs & furniture',
  },
  {
    id: 'cat_grocery', name: 'Grocery', slug: 'grocery', iconType: 'grocery', iconBg: '#CBEFD9', badgeBg: 'bg-[#CBEFD9]', badgeTextColor: 'text-[#176F43]', description: 'Fresh local produce, hill spices, Assam tea, rice & grains',
  },
  {
    id: 'cat_more', name: 'More', slug: 'all-categories', iconType: 'more', iconBg: '#F3E8FF', badgeBg: 'bg-[#F3E8FF]', badgeTextColor: 'text-[#6B21A8]', description: 'Stationery, brass crafts, farming tools, bags & local crafts',
  },
];

export const MOCK_PRODUCTS: Product[] = [];
export const MOCK_REVIEWS: Record<string, Review[]> = {};
export const INITIAL_CONVERSATIONS: Conversation[] = [];
export const INITIAL_ORDERS: Order[] = [];
