export type Role = 'ADMIN' | 'SELLER' | 'BUYER';

export interface User {
  id: number;
  username: string;
  email: string;
  role: Role;
  banned: boolean;
}

export type PropertyCategory =
  | 'APARTMENT'
  | 'VILLA'
  | 'HOUSE'
  | 'GARAGE'
  | 'LAND'
  | 'COMMERCIAL';

export type ListingType = 'SALE' | 'RENT';

export interface Property {
  id: number;
  code: string;
  title: string;
  description: string;
  category: PropertyCategory;
  listingType: ListingType;
  price: number;
  oldPrice?: number | null;
  squareMeters: number;
  address: string;
  city: string;
  latitude: number;
  longitude: number;
  photos: string[];
  sellerId: number;
  sellerName?: string;
  createdAt: string;
}

export interface Review {
  id: number;
  propertyId: number;
  buyerId: number;
  buyerName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface Auction {
  id: number;
  propertyId: number;
  startPrice: number;
  currentBid: number;
  endsAt: string;
  active: boolean;
  bidsCount: number;
}

export interface Bid {
  id: number;
  auctionId: number;
  buyerId: number;
  buyerName: string;
  amount: number;
  createdAt: string;
}

export interface ContactRequest {
  propertyId: number;
  fromName: string;
  fromEmail: string;
  fromPhone?: string;
  message: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  role: 'SELLER' | 'BUYER';
}

export interface PropertyFilters {
  q?: string;
  city?: string;
  category?: PropertyCategory;
  listingType?: ListingType;
  minPrice?: number;
  maxPrice?: number;
  minSquareMeters?: number;
  sort?: 'price-asc' | 'price-desc' | 'sqm-desc' | 'newest';
}

export const CATEGORY_LABELS: Record<PropertyCategory, string> = {
  APARTMENT: 'Appartamento',
  VILLA: 'Villa',
  HOUSE: 'Casa',
  GARAGE: 'Box auto',
  LAND: 'Terreno edificabile',
  COMMERCIAL: 'Commerciale',
};

export const LISTING_TYPE_LABELS: Record<ListingType, string> = {
  SALE: 'Vendita',
  RENT: 'Affitto',
};

export const ROLE_LABELS: Record<Role, string> = {
  ADMIN: 'Amministratore',
  SELLER: 'Venditore',
  BUYER: 'Acquirente',
};
