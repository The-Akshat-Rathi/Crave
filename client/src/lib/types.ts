// Import and re-export types from schema for consistency
import type {
  User,
  InsertUser,
  Restaurant,
  InsertRestaurant,
  Review,
  InsertReview,
  MenuItem,
  InsertMenuItem,
  Table,
  InsertTable,
  Reservation,
  InsertReservation,
  Order,
  InsertOrder,
  OrderItem,
  InsertOrderItem,
  Music,
  InsertMusic,
  ServiceRequest,
  InsertServiceRequest
} from '@shared/schema';

export type {
  User,
  InsertUser,
  Restaurant,
  InsertRestaurant,
  Review,
  InsertReview,
  MenuItem,
  InsertMenuItem,
  Table,
  InsertTable,
  Reservation,
  InsertReservation,
  Order,
  InsertOrder,
  OrderItem,
  InsertOrderItem,
  Music,
  InsertMusic,
  ServiceRequest,
  InsertServiceRequest
};

// Extended types for frontend use
export interface RestaurantWithDistance extends Restaurant {
  distance?: number;
  discount?: string;
  deliveryTime?: string;
  rating?: number;
  imageUrl?: string;
  isFavorite?: boolean;
  crowdLevel?: CrowdLevel;
}

export interface UserWithToken extends User {
  token?: string;
}

export type CrowdLevel = 'low' | 'moderate' | 'high';

export interface RestaurantTraffic {
  restaurantId: number;
  crowdLevel: CrowdLevel;
  waitTime: number; // in minutes
  timestamp: Date;
}

export interface MusicRequest {
  id: number;
  title: string;
  artist: string;
  upvotes: number;
  isUpvotedByUser: boolean;
}

export interface MusicQueueItem {
  id: number;
  title: string;
  artist: string;
  albumCover?: string;
  duration: number;
  startTime: Date;
}

export interface TableSession {
  tableId: string;
  restaurantId: number;
  startTime: Date;
  guests: number;
  orderItems: {
    menuItemId: number;
    name: string;
    price: number;
    quantity: number;
  }[];
}

export interface WalletInfo {
  address: string;
  balance: {
    eth: number;
    tokens: number;
  };
  transactions: {
    id: string;
    type: 'payment' | 'reward';
    description: string;
    amount: number;
    currency: 'ETH' | 'CRAVE';
    timestamp: Date;
  }[];
}
