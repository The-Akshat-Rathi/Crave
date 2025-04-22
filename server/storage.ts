import { 
  users, User, InsertUser, 
  restaurants, Restaurant, InsertRestaurant,
  reviews, Review, InsertReview,
  menuItems, MenuItem, InsertMenuItem,
  tables, Table, InsertTable,
  reservations, Reservation, InsertReservation,
  orders, Order, InsertOrder,
  orderItems, OrderItem, InsertOrderItem,
  music, Music, InsertMusic,
  serviceRequests, ServiceRequest, InsertServiceRequest 
} from "@shared/schema";

export interface IStorage {
  // User Operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByWalletAddress(walletAddress: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<InsertUser>): Promise<User | undefined>;
  
  // Restaurant Operations
  getRestaurant(id: number): Promise<Restaurant | undefined>;
  getRestaurantsByOwner(ownerId: number): Promise<Restaurant[]>;
  getRestaurantsByLocation(latitude: number, longitude: number, radius: number): Promise<Restaurant[]>;
  getAllRestaurants(): Promise<Restaurant[]>;
  createRestaurant(restaurant: InsertRestaurant): Promise<Restaurant>;
  updateRestaurant(id: number, restaurant: Partial<InsertRestaurant>): Promise<Restaurant | undefined>;
  
  // Review Operations
  getReview(id: number): Promise<Review | undefined>;
  getReviewsByRestaurant(restaurantId: number): Promise<Review[]>;
  getReviewsByUser(userId: number): Promise<Review[]>;
  createReview(review: InsertReview): Promise<Review>;
  
  // MenuItem Operations
  getMenuItem(id: number): Promise<MenuItem | undefined>;
  getMenuItemsByRestaurant(restaurantId: number): Promise<MenuItem[]>;
  getPopularMenuItems(restaurantId: number, limit: number): Promise<MenuItem[]>;
  createMenuItem(menuItem: InsertMenuItem): Promise<MenuItem>;
  updateMenuItem(id: number, menuItem: Partial<InsertMenuItem>): Promise<MenuItem | undefined>;
  
  // Table Operations
  getTable(id: number): Promise<Table | undefined>;
  getTablesByRestaurant(restaurantId: number): Promise<Table[]>;
  createTable(table: InsertTable): Promise<Table>;
  updateTable(id: number, table: Partial<InsertTable>): Promise<Table | undefined>;
  
  // Reservation Operations
  getReservation(id: number): Promise<Reservation | undefined>;
  getReservationsByUser(userId: number): Promise<Reservation[]>;
  getReservationsByRestaurant(restaurantId: number): Promise<Reservation[]>;
  createReservation(reservation: InsertReservation): Promise<Reservation>;
  updateReservation(id: number, reservation: Partial<InsertReservation>): Promise<Reservation | undefined>;
  
  // Order Operations
  getOrder(id: number): Promise<Order | undefined>;
  getOrdersByUser(userId: number): Promise<Order[]>;
  getOrdersByRestaurant(restaurantId: number): Promise<Order[]>;
  createOrder(order: InsertOrder): Promise<Order>;
  updateOrder(id: number, order: Partial<InsertOrder>): Promise<Order | undefined>;
  
  // OrderItem Operations
  getOrderItem(id: number): Promise<OrderItem | undefined>;
  getOrderItemsByOrder(orderId: number): Promise<OrderItem[]>;
  createOrderItem(orderItem: InsertOrderItem): Promise<OrderItem>;
  
  // Music Operations
  getMusic(id: number): Promise<Music | undefined>;
  getMusicByRestaurant(restaurantId: number): Promise<Music[]>;
  getCurrentlyPlayingMusic(restaurantId: number): Promise<Music | undefined>;
  createMusic(music: InsertMusic): Promise<Music>;
  updateMusic(id: number, music: Partial<InsertMusic>): Promise<Music | undefined>;
  upvoteMusic(id: number): Promise<Music | undefined>;
  
  // ServiceRequest Operations
  getServiceRequest(id: number): Promise<ServiceRequest | undefined>;
  getServiceRequestsByRestaurant(restaurantId: number): Promise<ServiceRequest[]>;
  createServiceRequest(serviceRequest: InsertServiceRequest): Promise<ServiceRequest>;
  updateServiceRequest(id: number, serviceRequest: Partial<InsertServiceRequest>): Promise<ServiceRequest | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private restaurants: Map<number, Restaurant>;
  private reviews: Map<number, Review>;
  private menuItems: Map<number, MenuItem>;
  private tables: Map<number, Table>;
  private reservations: Map<number, Reservation>;
  private orders: Map<number, Order>;
  private orderItems: Map<number, OrderItem>;
  private music: Map<number, Music>;
  private serviceRequests: Map<number, ServiceRequest>;
  
  private currentUserId: number;
  private currentRestaurantId: number;
  private currentReviewId: number;
  private currentMenuItemId: number;
  private currentTableId: number;
  private currentReservationId: number;
  private currentOrderId: number;
  private currentOrderItemId: number;
  private currentMusicId: number;
  private currentServiceRequestId: number;
  
  constructor() {
    this.users = new Map();
    this.restaurants = new Map();
    this.reviews = new Map();
    this.menuItems = new Map();
    this.tables = new Map();
    this.reservations = new Map();
    this.orders = new Map();
    this.orderItems = new Map();
    this.music = new Map();
    this.serviceRequests = new Map();
    
    this.currentUserId = 1;
    this.currentRestaurantId = 1;
    this.currentReviewId = 1;
    this.currentMenuItemId = 1;
    this.currentTableId = 1;
    this.currentReservationId = 1;
    this.currentOrderId = 1;
    this.currentOrderItemId = 1;
    this.currentMusicId = 1;
    this.currentServiceRequestId = 1;
    
    // Seed with sample data
    this.seedSampleData();
  }
  
  // User Operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }
  
  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username.toLowerCase() === username.toLowerCase(),
    );
  }
  
  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email.toLowerCase() === email.toLowerCase(),
    );
  }
  
  async getUserByWalletAddress(walletAddress: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.walletAddress === walletAddress,
    );
  }
  
  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const createdAt = new Date();
    const user: User = { ...insertUser, id, createdAt };
    this.users.set(id, user);
    return user;
  }
  
  async updateUser(id: number, userData: Partial<InsertUser>): Promise<User | undefined> {
    const user = await this.getUser(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...userData };
    this.users.set(id, updatedUser);
    return updatedUser;
  }
  
  // Restaurant Operations
  async getRestaurant(id: number): Promise<Restaurant | undefined> {
    return this.restaurants.get(id);
  }
  
  async getRestaurantsByOwner(ownerId: number): Promise<Restaurant[]> {
    return Array.from(this.restaurants.values()).filter(
      (restaurant) => restaurant.ownerId === ownerId,
    );
  }
  
  async getRestaurantsByLocation(latitude: number, longitude: number, radius: number): Promise<Restaurant[]> {
    // In a real implementation, this would use geospatial queries
    // For the in-memory implementation, we'll just return all restaurants sorted by a simple distance calculation
    return Array.from(this.restaurants.values())
      .map(restaurant => {
        const distance = this.calculateDistance(
          latitude, 
          longitude, 
          restaurant.latitude, 
          restaurant.longitude
        );
        return { ...restaurant, distance };
      })
      .filter(r => r.distance <= radius)
      .sort((a, b) => a.distance - b.distance);
  }
  
  async getAllRestaurants(): Promise<Restaurant[]> {
    return Array.from(this.restaurants.values());
  }
  
  async createRestaurant(insertRestaurant: InsertRestaurant): Promise<Restaurant> {
    const id = this.currentRestaurantId++;
    const createdAt = new Date();
    const restaurant: Restaurant = { ...insertRestaurant, id, createdAt };
    this.restaurants.set(id, restaurant);
    return restaurant;
  }
  
  async updateRestaurant(id: number, restaurantData: Partial<InsertRestaurant>): Promise<Restaurant | undefined> {
    const restaurant = await this.getRestaurant(id);
    if (!restaurant) return undefined;
    
    const updatedRestaurant = { ...restaurant, ...restaurantData };
    this.restaurants.set(id, updatedRestaurant);
    return updatedRestaurant;
  }
  
  // Review Operations
  async getReview(id: number): Promise<Review | undefined> {
    return this.reviews.get(id);
  }
  
  async getReviewsByRestaurant(restaurantId: number): Promise<Review[]> {
    return Array.from(this.reviews.values()).filter(
      (review) => review.restaurantId === restaurantId,
    );
  }
  
  async getReviewsByUser(userId: number): Promise<Review[]> {
    return Array.from(this.reviews.values()).filter(
      (review) => review.userId === userId,
    );
  }
  
  async createReview(insertReview: InsertReview): Promise<Review> {
    const id = this.currentReviewId++;
    const date = new Date();
    const review: Review = { ...insertReview, id, date };
    this.reviews.set(id, review);
    return review;
  }
  
  // MenuItem Operations
  async getMenuItem(id: number): Promise<MenuItem | undefined> {
    return this.menuItems.get(id);
  }
  
  async getMenuItemsByRestaurant(restaurantId: number): Promise<MenuItem[]> {
    return Array.from(this.menuItems.values()).filter(
      (menuItem) => menuItem.restaurantId === restaurantId,
    );
  }
  
  async getPopularMenuItems(restaurantId: number, limit: number): Promise<MenuItem[]> {
    return Array.from(this.menuItems.values())
      .filter(menuItem => menuItem.restaurantId === restaurantId)
      .sort((a, b) => b.popularity - a.popularity)
      .slice(0, limit);
  }
  
  async createMenuItem(insertMenuItem: InsertMenuItem): Promise<MenuItem> {
    const id = this.currentMenuItemId++;
    const menuItem: MenuItem = { ...insertMenuItem, id };
    this.menuItems.set(id, menuItem);
    return menuItem;
  }
  
  async updateMenuItem(id: number, menuItemData: Partial<InsertMenuItem>): Promise<MenuItem | undefined> {
    const menuItem = await this.getMenuItem(id);
    if (!menuItem) return undefined;
    
    const updatedMenuItem = { ...menuItem, ...menuItemData };
    this.menuItems.set(id, updatedMenuItem);
    return updatedMenuItem;
  }
  
  // Table Operations
  async getTable(id: number): Promise<Table | undefined> {
    return this.tables.get(id);
  }
  
  async getTablesByRestaurant(restaurantId: number): Promise<Table[]> {
    return Array.from(this.tables.values()).filter(
      (table) => table.restaurantId === restaurantId,
    );
  }
  
  async createTable(insertTable: InsertTable): Promise<Table> {
    const id = this.currentTableId++;
    const table: Table = { ...insertTable, id };
    this.tables.set(id, table);
    return table;
  }
  
  async updateTable(id: number, tableData: Partial<InsertTable>): Promise<Table | undefined> {
    const table = await this.getTable(id);
    if (!table) return undefined;
    
    const updatedTable = { ...table, ...tableData };
    this.tables.set(id, updatedTable);
    return updatedTable;
  }
  
  // Reservation Operations
  async getReservation(id: number): Promise<Reservation | undefined> {
    return this.reservations.get(id);
  }
  
  async getReservationsByUser(userId: number): Promise<Reservation[]> {
    return Array.from(this.reservations.values()).filter(
      (reservation) => reservation.userId === userId,
    );
  }
  
  async getReservationsByRestaurant(restaurantId: number): Promise<Reservation[]> {
    return Array.from(this.reservations.values()).filter(
      (reservation) => reservation.restaurantId === restaurantId,
    );
  }
  
  async createReservation(insertReservation: InsertReservation): Promise<Reservation> {
    const id = this.currentReservationId++;
    const createdAt = new Date();
    const reservation: Reservation = { ...insertReservation, id, createdAt };
    this.reservations.set(id, reservation);
    return reservation;
  }
  
  async updateReservation(id: number, reservationData: Partial<InsertReservation>): Promise<Reservation | undefined> {
    const reservation = await this.getReservation(id);
    if (!reservation) return undefined;
    
    const updatedReservation = { ...reservation, ...reservationData };
    this.reservations.set(id, updatedReservation);
    return updatedReservation;
  }
  
  // Order Operations
  async getOrder(id: number): Promise<Order | undefined> {
    return this.orders.get(id);
  }
  
  async getOrdersByUser(userId: number): Promise<Order[]> {
    return Array.from(this.orders.values()).filter(
      (order) => order.userId === userId,
    );
  }
  
  async getOrdersByRestaurant(restaurantId: number): Promise<Order[]> {
    return Array.from(this.orders.values()).filter(
      (order) => order.restaurantId === restaurantId,
    );
  }
  
  async createOrder(insertOrder: InsertOrder): Promise<Order> {
    const id = this.currentOrderId++;
    const createdAt = new Date();
    const order: Order = { ...insertOrder, id, createdAt };
    this.orders.set(id, order);
    return order;
  }
  
  async updateOrder(id: number, orderData: Partial<InsertOrder>): Promise<Order | undefined> {
    const order = await this.getOrder(id);
    if (!order) return undefined;
    
    const updatedOrder = { ...order, ...orderData };
    this.orders.set(id, updatedOrder);
    return updatedOrder;
  }
  
  // OrderItem Operations
  async getOrderItem(id: number): Promise<OrderItem | undefined> {
    return this.orderItems.get(id);
  }
  
  async getOrderItemsByOrder(orderId: number): Promise<OrderItem[]> {
    return Array.from(this.orderItems.values()).filter(
      (orderItem) => orderItem.orderId === orderId,
    );
  }
  
  async createOrderItem(insertOrderItem: InsertOrderItem): Promise<OrderItem> {
    const id = this.currentOrderItemId++;
    const orderItem: OrderItem = { ...insertOrderItem, id };
    this.orderItems.set(id, orderItem);
    return orderItem;
  }
  
  // Music Operations
  async getMusic(id: number): Promise<Music | undefined> {
    return this.music.get(id);
  }
  
  async getMusicByRestaurant(restaurantId: number): Promise<Music[]> {
    return Array.from(this.music.values()).filter(
      (music) => music.restaurantId === restaurantId,
    ).sort((a, b) => b.upvotes - a.upvotes);
  }
  
  async getCurrentlyPlayingMusic(restaurantId: number): Promise<Music | undefined> {
    return Array.from(this.music.values()).find(
      (music) => music.restaurantId === restaurantId && music.isPlaying,
    );
  }
  
  async createMusic(insertMusic: InsertMusic): Promise<Music> {
    const id = this.currentMusicId++;
    const createdAt = new Date();
    const music: Music = { ...insertMusic, id, createdAt };
    this.music.set(id, music);
    return music;
  }
  
  async updateMusic(id: number, musicData: Partial<InsertMusic>): Promise<Music | undefined> {
    const music = await this.getMusic(id);
    if (!music) return undefined;
    
    const updatedMusic = { ...music, ...musicData };
    this.music.set(id, updatedMusic);
    return updatedMusic;
  }
  
  async upvoteMusic(id: number): Promise<Music | undefined> {
    const music = await this.getMusic(id);
    if (!music) return undefined;
    
    const updatedMusic = { ...music, upvotes: music.upvotes + 1 };
    this.music.set(id, updatedMusic);
    return updatedMusic;
  }
  
  // ServiceRequest Operations
  async getServiceRequest(id: number): Promise<ServiceRequest | undefined> {
    return this.serviceRequests.get(id);
  }
  
  async getServiceRequestsByRestaurant(restaurantId: number): Promise<ServiceRequest[]> {
    return Array.from(this.serviceRequests.values()).filter(
      (serviceRequest) => serviceRequest.restaurantId === restaurantId,
    );
  }
  
  async createServiceRequest(insertServiceRequest: InsertServiceRequest): Promise<ServiceRequest> {
    const id = this.currentServiceRequestId++;
    const createdAt = new Date();
    const serviceRequest: ServiceRequest = { ...insertServiceRequest, id, createdAt };
    this.serviceRequests.set(id, serviceRequest);
    return serviceRequest;
  }
  
  async updateServiceRequest(id: number, serviceRequestData: Partial<InsertServiceRequest>): Promise<ServiceRequest | undefined> {
    const serviceRequest = await this.getServiceRequest(id);
    if (!serviceRequest) return undefined;
    
    const updatedServiceRequest = { ...serviceRequest, ...serviceRequestData };
    this.serviceRequests.set(id, updatedServiceRequest);
    return updatedServiceRequest;
  }
  
  // Helper methods
  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Radius of the earth in km
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2); 
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    const d = R * c; // Distance in km
    return d;
  }
  
  private deg2rad(deg: number): number {
    return deg * (Math.PI/180);
  }
  
  private seedSampleData() {
    // Create sample users
    this.createUser({
      username: "johndoe",
      password: "password123",
      email: "john@example.com",
      name: "John Doe",
      role: "customer",
      walletAddress: "",
      profileImg: "https://i.pravatar.cc/150?img=1"
    });
    
    this.createUser({
      username: "janesmith",
      password: "password123",
      email: "jane@example.com",
      name: "Jane Smith",
      role: "restaurant_owner",
      walletAddress: "",
      profileImg: "https://i.pravatar.cc/150?img=5"
    });
    
    // Create sample restaurants
    this.createRestaurant({
      name: "The Brasserie",
      ownerId: 2,
      description: "A cozy restaurant serving Italian and Continental cuisine.",
      cuisine: "Italian, Continental, Beverages",
      address: "123 Main St",
      city: "New York",
      latitude: 40.7128,
      longitude: -74.0060,
      phone: "123-456-7890",
      openingTime: "10:00 AM",
      closingTime: "11:00 PM",
      priceRange: "$$",
      features: ["Dine-in", "Serves Alcohol", "Free Wi-Fi", "Outdoor seating"],
      images: [
        "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4",
        "https://images.unsplash.com/photo-1544148103-0773bf10d330",
        "https://images.unsplash.com/photo-1574936145840-28808d77a0b6",
        "https://images.unsplash.com/photo-1559339352-11d035aa65de"
      ],
    });
    
    this.createRestaurant({
      name: "Café Latte",
      ownerId: 2,
      description: "Trendy cafe offering coffee, desserts and light meals.",
      cuisine: "Cafe, Desserts, Coffee",
      address: "456 Oak St",
      city: "New York",
      latitude: 40.7200,
      longitude: -74.0100,
      phone: "123-456-7891",
      openingTime: "08:00 AM",
      closingTime: "09:00 PM",
      priceRange: "$",
      features: ["Dine-in", "Pure Veg", "Free Wi-Fi"],
      images: [
        "https://images.unsplash.com/photo-1554118811-1e0d58224f24",
        "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085",
        "https://images.unsplash.com/photo-1509042239860-f550ce710b93",
        "https://images.unsplash.com/photo-1497935586351-b67a49e012bf"
      ],
    });
    
    this.createRestaurant({
      name: "Seaside Grill",
      ownerId: 2,
      description: "Seafood restaurant with panoramic ocean views.",
      cuisine: "Seafood, Grill, Asian",
      address: "789 Shore Dr",
      city: "New York",
      latitude: 40.7300,
      longitude: -74.0200,
      phone: "123-456-7892",
      openingTime: "11:00 AM",
      closingTime: "11:00 PM",
      priceRange: "$$$",
      features: ["Dine-in", "Serves Alcohol", "Outdoor seating", "Live music"],
      images: [
        "https://images.unsplash.com/photo-1514933651103-005eec06c04b",
        "https://images.unsplash.com/photo-1523371683773-affcb5eb1c31",
        "https://images.unsplash.com/photo-1504674900247-0877df9cc836",
        "https://images.unsplash.com/photo-1560611588-163f295eb145"
      ],
    });
    
    // Create sample menu items
    this.createMenuItem({
      restaurantId: 3,
      name: "Grilled Salmon",
      description: "Fresh Atlantic salmon with lemon butter sauce and seasonal vegetables",
      price: 24.99,
      category: "Main Course",
      image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836",
      popularity: 95,
      isAvailable: true
    });
    
    this.createMenuItem({
      restaurantId: 3,
      name: "Seafood Platter",
      description: "Selection of fresh seafood including prawns, calamari, fish and mussels",
      price: 42.99,
      category: "Main Course",
      image: "https://images.unsplash.com/photo-1559847844-5315695dadae",
      popularity: 92,
      isAvailable: true
    });
    
    this.createMenuItem({
      restaurantId: 3,
      name: "Asian Salad",
      description: "Fresh greens with Asian dressing and seared tuna",
      price: 18.99,
      category: "Starters",
      image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c",
      popularity: 89,
      isAvailable: true
    });
    
    this.createMenuItem({
      restaurantId: 3,
      name: "Sushi Rolls",
      description: "Assortment of fresh sushi rolls with wasabi and soy sauce",
      price: 22.99,
      category: "Starters",
      image: "https://images.unsplash.com/photo-1563379926898-05f4575a45d8",
      popularity: 86,
      isAvailable: true
    });
    
    // Create sample reviews
    this.createReview({
      restaurantId: 3,
      userId: 1,
      rating: 4.8,
      comment: "The seafood platter was absolutely incredible! Every bite was fresh and delicious. Service was attentive and the ocean view made the experience even better. Will definitely return!"
    });
    
    this.createReview({
      restaurantId: 3,
      userId: 1,
      rating: 4.5,
      comment: "Truly a gem! The grilled salmon was cooked to perfection and the staff was very accommodating. The music selection was on point too. Only suggestion would be to expand the dessert options."
    });
    
    // Create sample tables
    this.createTable({
      restaurantId: 3,
      tableNumber: "12",
      capacity: 4,
      isAvailable: true,
      qrCode: "https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=https://crave.app/table/12"
    });
    
    this.createTable({
      restaurantId: 3,
      tableNumber: "13",
      capacity: 2,
      isAvailable: true,
      qrCode: "https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=https://crave.app/table/13"
    });
    
    // Create sample music
    this.createMusic({
      restaurantId: 3,
      title: "Fly Me To The Moon",
      artist: "Frank Sinatra",
      requestedBy: 1,
      upvotes: 10,
      isPlaying: true
    });
    
    this.createMusic({
      restaurantId: 3,
      title: "Summertime",
      artist: "Ella Fitzgerald",
      requestedBy: 1,
      upvotes: 8,
      isPlaying: false
    });
    
    this.createMusic({
      restaurantId: 3,
      title: "La Vie En Rose",
      artist: "Louis Armstrong",
      requestedBy: 1,
      upvotes: 5,
      isPlaying: false
    });
  }
}

export const storage = new MemStorage();
