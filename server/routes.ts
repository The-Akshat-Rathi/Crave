import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, insertRestaurantSchema, insertReviewSchema, insertMenuItemSchema, insertTableSchema, insertReservationSchema, insertOrderSchema, insertOrderItemSchema, insertMusicSchema, insertServiceRequestSchema } from "@shared/schema";
import { z } from "zod";
import { fromZodError } from "zod-validation-error";

import Stripe from 'stripe';

// Initialize Stripe with the secret key
const stripe = process.env.STRIPE_SECRET_KEY 
  ? new Stripe(process.env.STRIPE_SECRET_KEY)
  : null;

export async function registerRoutes(app: Express): Promise<Server> {
  // Helper function to handle ZodErrors
  const handleZodError = (err: unknown, res: Response) => {
    if (err instanceof z.ZodError) {
      const readableError = fromZodError(err);
      return res.status(400).json({ message: readableError.message });
    }
    console.error(err);
    return res.status(500).json({ message: "Internal server error" });
  };

  // Auth routes
  app.post("/api/auth/register", async (req: Request, res: Response) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if username or email already exists
      const existingUserByUsername = await storage.getUserByUsername(userData.username);
      if (existingUserByUsername) {
        return res.status(400).json({ message: "Username already exists" });
      }
      
      const existingUserByEmail = await storage.getUserByEmail(userData.email);
      if (existingUserByEmail) {
        return res.status(400).json({ message: "Email already exists" });
      }
      
      const user = await storage.createUser(userData);
      res.status(201).json(user);
    } catch (err) {
      handleZodError(err, res);
    }
  });

  app.post("/api/auth/login", async (req: Request, res: Response) => {
    try {
      const { username, password } = z.object({
        username: z.string().min(1, "Username is required"),
        password: z.string().min(1, "Password is required")
      }).parse(req.body);
      
      // Try finding user by username or email
      let user = await storage.getUserByUsername(username);
      if (!user) {
        user = await storage.getUserByEmail(username);
      }
      
      if (!user) {
        return res.status(401).json({ message: "User not found" });
      }
      
      if (user.password !== password) {
        return res.status(401).json({ message: "Invalid password" });
      }
      
      res.status(200).json({
        id: user.id,
        username: user.username,
        name: user.name,
        email: user.email,
        role: user.role,
        profileImg: user.profileImg
      });
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      return res.status(500).json({ message: "Login failed" });
    }
  });

  app.post("/api/auth/wallet", async (req: Request, res: Response) => {
    try {
      const { walletAddress } = z.object({
        walletAddress: z.string()
      }).parse(req.body);
      
      let user = await storage.getUserByWalletAddress(walletAddress);
      
      if (!user) {
        // Create new user with wallet address
        user = await storage.createUser({
          username: `wallet_${walletAddress.substring(0, 8)}`,
          password: Math.random().toString(36).substring(2),
          email: `${walletAddress.substring(0, 8)}@wallet.user`,
          name: `Wallet User ${walletAddress.substring(0, 6)}`,
          role: "customer",
          walletAddress,
          profileImg: ""
        });
      }
      
      res.status(200).json({ id: user.id, username: user.username, name: user.name, email: user.email, role: user.role });
    } catch (err) {
      handleZodError(err, res);
    }
  });

  // User routes
  app.get("/api/users/:id", async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.id);
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      const { password, ...userWithoutPassword } = user;
      res.status(200).json(userWithoutPassword);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Restaurant routes
  app.get("/api/restaurants", async (req: Request, res: Response) => {
    try {
      const latitude = req.query.latitude ? parseFloat(req.query.latitude as string) : undefined;
      const longitude = req.query.longitude ? parseFloat(req.query.longitude as string) : undefined;
      const radius = req.query.radius ? parseFloat(req.query.radius as string) : 10; // Default 10km radius
      
      let restaurants;
      
      if (latitude && longitude) {
        restaurants = await storage.getRestaurantsByLocation(latitude, longitude, radius);
      } else {
        restaurants = await storage.getAllRestaurants();
      }
      
      res.status(200).json(restaurants);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/restaurants/:id", async (req: Request, res: Response) => {
    try {
      const restaurantId = parseInt(req.params.id);
      const restaurant = await storage.getRestaurant(restaurantId);
      
      if (!restaurant) {
        return res.status(404).json({ message: "Restaurant not found" });
      }
      
      res.status(200).json(restaurant);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/restaurants", async (req: Request, res: Response) => {
    try {
      const restaurantData = insertRestaurantSchema.parse(req.body);
      const restaurant = await storage.createRestaurant(restaurantData);
      res.status(201).json(restaurant);
    } catch (err) {
      handleZodError(err, res);
    }
  });

  app.get("/api/users/:id/restaurants", async (req: Request, res: Response) => {
    try {
      const ownerId = parseInt(req.params.id);
      const restaurants = await storage.getRestaurantsByOwner(ownerId);
      res.status(200).json(restaurants);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Review routes
  app.get("/api/restaurants/:id/reviews", async (req: Request, res: Response) => {
    try {
      const restaurantId = parseInt(req.params.id);
      const reviews = await storage.getReviewsByRestaurant(restaurantId);
      res.status(200).json(reviews);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/reviews", async (req: Request, res: Response) => {
    try {
      const reviewData = insertReviewSchema.parse(req.body);
      const review = await storage.createReview(reviewData);
      res.status(201).json(review);
    } catch (err) {
      handleZodError(err, res);
    }
  });

  // Menu routes
  app.get("/api/restaurants/:id/menu", async (req: Request, res: Response) => {
    try {
      const restaurantId = parseInt(req.params.id);
      const menuItems = await storage.getMenuItemsByRestaurant(restaurantId);
      res.status(200).json(menuItems);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/restaurants/:id/popular-dishes", async (req: Request, res: Response) => {
    try {
      const restaurantId = parseInt(req.params.id);
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 4;
      const popularDishes = await storage.getPopularMenuItems(restaurantId, limit);
      res.status(200).json(popularDishes);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/menu-items", async (req: Request, res: Response) => {
    try {
      const menuItemData = insertMenuItemSchema.parse(req.body);
      const menuItem = await storage.createMenuItem(menuItemData);
      res.status(201).json(menuItem);
    } catch (err) {
      handleZodError(err, res);
    }
  });

  // Table routes
  app.get("/api/restaurants/:id/tables", async (req: Request, res: Response) => {
    try {
      const restaurantId = parseInt(req.params.id);
      const tables = await storage.getTablesByRestaurant(restaurantId);
      res.status(200).json(tables);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/tables", async (req: Request, res: Response) => {
    try {
      const tableData = insertTableSchema.parse(req.body);
      const table = await storage.createTable(tableData);
      res.status(201).json(table);
    } catch (err) {
      handleZodError(err, res);
    }
  });

  // Reservation routes
  app.get("/api/users/:id/reservations", async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.id);
      const reservations = await storage.getReservationsByUser(userId);
      res.status(200).json(reservations);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/restaurants/:id/reservations", async (req: Request, res: Response) => {
    try {
      const restaurantId = parseInt(req.params.id);
      const reservations = await storage.getReservationsByRestaurant(restaurantId);
      res.status(200).json(reservations);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/reservations", async (req: Request, res: Response) => {
    try {
      const reservationData = insertReservationSchema.parse(req.body);
      const reservation = await storage.createReservation(reservationData);
      res.status(201).json(reservation);
    } catch (err) {
      handleZodError(err, res);
    }
  });

  // Order routes
  app.get("/api/users/:id/orders", async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.id);
      const orders = await storage.getOrdersByUser(userId);
      res.status(200).json(orders);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/restaurants/:id/orders", async (req: Request, res: Response) => {
    try {
      const restaurantId = parseInt(req.params.id);
      const orders = await storage.getOrdersByRestaurant(restaurantId);
      res.status(200).json(orders);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/orders", async (req: Request, res: Response) => {
    try {
      const orderData = insertOrderSchema.parse(req.body);
      const order = await storage.createOrder(orderData);
      res.status(201).json(order);
    } catch (err) {
      handleZodError(err, res);
    }
  });

  app.post("/api/order-items", async (req: Request, res: Response) => {
    try {
      const orderItemData = insertOrderItemSchema.parse(req.body);
      const orderItem = await storage.createOrderItem(orderItemData);
      res.status(201).json(orderItem);
    } catch (err) {
      handleZodError(err, res);
    }
  });

  app.get("/api/orders/:id/items", async (req: Request, res: Response) => {
    try {
      const orderId = parseInt(req.params.id);
      const orderItems = await storage.getOrderItemsByOrder(orderId);
      res.status(200).json(orderItems);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Music routes
  app.get("/api/restaurants/:id/music", async (req: Request, res: Response) => {
    try {
      const restaurantId = parseInt(req.params.id);
      const musicList = await storage.getMusicByRestaurant(restaurantId);
      res.status(200).json(musicList);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/restaurants/:id/currently-playing", async (req: Request, res: Response) => {
    try {
      const restaurantId = parseInt(req.params.id);
      const music = await storage.getCurrentlyPlayingMusic(restaurantId);
      
      if (!music) {
        return res.status(404).json({ message: "No music is currently playing" });
      }
      
      res.status(200).json(music);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/music", async (req: Request, res: Response) => {
    try {
      const musicData = insertMusicSchema.parse(req.body);
      const music = await storage.createMusic(musicData);
      res.status(201).json(music);
    } catch (err) {
      handleZodError(err, res);
    }
  });

  app.post("/api/music/:id/upvote", async (req: Request, res: Response) => {
    try {
      const musicId = parseInt(req.params.id);
      const music = await storage.upvoteMusic(musicId);
      
      if (!music) {
        return res.status(404).json({ message: "Music not found" });
      }
      
      res.status(200).json(music);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Service Request routes
  app.get("/api/restaurants/:id/service-requests", async (req: Request, res: Response) => {
    try {
      const restaurantId = parseInt(req.params.id);
      const serviceRequests = await storage.getServiceRequestsByRestaurant(restaurantId);
      res.status(200).json(serviceRequests);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/service-requests", async (req: Request, res: Response) => {
    try {
      const serviceRequestData = insertServiceRequestSchema.parse(req.body);
      const serviceRequest = await storage.createServiceRequest(serviceRequestData);
      res.status(201).json(serviceRequest);
    } catch (err) {
      handleZodError(err, res);
    }
  });

  app.patch("/api/service-requests/:id", async (req: Request, res: Response) => {
    try {
      const serviceRequestId = parseInt(req.params.id);
      const { status } = z.object({
        status: z.enum(["pending", "completed", "rejected"])
      }).parse(req.body);
      
      const serviceRequest = await storage.updateServiceRequest(serviceRequestId, { status });
      
      if (!serviceRequest) {
        return res.status(404).json({ message: "Service request not found" });
      }
      
      res.status(200).json(serviceRequest);
    } catch (err) {
      handleZodError(err, res);
    }
  });

  // Stripe payment routes
  app.post("/api/create-payment-intent", async (req: Request, res: Response) => {
    try {
      if (!stripe) {
        return res.status(500).json({ 
          message: "Stripe is not configured. Please add STRIPE_SECRET_KEY to your environment variables."
        });
      }

      const { amount } = z.object({
        amount: z.number().positive()
      }).parse(req.body);

      // Create a payment intent with the specified amount
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount), // Amount in cents
        currency: "usd",
        // Add customer data if available
        ...(req.body.customerId && { customer: req.body.customerId }),
        payment_method_types: ["card"],
      });

      // Return the client secret to the client
      res.status(200).json({
        clientSecret: paymentIntent.client_secret
      });
    } catch (err) {
      handleZodError(err, res);
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
