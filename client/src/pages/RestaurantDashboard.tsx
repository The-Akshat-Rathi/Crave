import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import Layout from '@/components/Layout';
import { useAuth } from '@/hooks/useAuth';
import { Restaurant, Table, Reservation, Order, ServiceRequest } from '@/lib/types';
import { format } from 'date-fns';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import {
  Building2,
  Users,
  Calendar,
  ClipboardList,
  Bell,
  Music,
  QrCode,
  Plus,
  Loader2,
  FileText,
  BellRing,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import { useLocation } from 'wouter';

// Form schema for table creation
const tableSchema = z.object({
  tableNumber: z.string().min(1, 'Table number is required'),
  capacity: z.string().transform(val => parseInt(val)),
});

// Form schema for restaurant creation/editing
const restaurantSchema = z.object({
  name: z.string().min(1, 'Restaurant name is required'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  cuisine: z.string().min(1, 'Cuisine is required'),
  address: z.string().min(1, 'Address is required'),
  city: z.string().min(1, 'City is required'),
  phone: z.string().min(1, 'Phone number is required'),
  openingTime: z.string().min(1, 'Opening time is required'),
  closingTime: z.string().min(1, 'Closing time is required'),
  priceRange: z.string().min(1, 'Price range is required'),
});

const RestaurantDashboard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [selectedRestaurantId, setSelectedRestaurantId] = useState<number | null>(null);
  const [isAddingTable, setIsAddingTable] = useState(false);
  const [isCreatingRestaurant, setIsCreatingRestaurant] = useState(false);
  
  // Redirect if not logged in or not a restaurant owner
  if (!user) {
    navigate('/');
    return null;
  }
  
  if (user.role !== 'restaurant_owner') {
    navigate('/');
    toast({
      title: 'Access Denied',
      description: 'You must be a restaurant owner to access the dashboard',
      variant: 'destructive',
    });
    return null;
  }
  
  // Fetch user's restaurants
  const { data: restaurants, isLoading: isLoadingRestaurants } = useQuery<Restaurant[]>({
    queryKey: [`/api/users/${user.id}/restaurants`],
  });
  
  // Select first restaurant by default if none selected
  if (restaurants && restaurants.length > 0 && !selectedRestaurantId) {
    setSelectedRestaurantId(restaurants[0].id);
  }
  
  // Fetch tables for selected restaurant
  const { data: tables, isLoading: isLoadingTables } = useQuery<Table[]>({
    queryKey: [`/api/restaurants/${selectedRestaurantId}/tables`],
    enabled: !!selectedRestaurantId,
  });
  
  // Fetch reservations for selected restaurant
  const { data: reservations, isLoading: isLoadingReservations } = useQuery<Reservation[]>({
    queryKey: [`/api/restaurants/${selectedRestaurantId}/reservations`],
    enabled: !!selectedRestaurantId,
  });
  
  // Fetch orders for selected restaurant
  const { data: orders, isLoading: isLoadingOrders } = useQuery<Order[]>({
    queryKey: [`/api/restaurants/${selectedRestaurantId}/orders`],
    enabled: !!selectedRestaurantId,
  });
  
  // Fetch service requests for selected restaurant
  const { data: serviceRequests, isLoading: isLoadingServiceRequests } = useQuery<ServiceRequest[]>({
    queryKey: [`/api/restaurants/${selectedRestaurantId}/service-requests`],
    enabled: !!selectedRestaurantId,
  });
  
  // Create restaurant mutation
  const createRestaurantMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest('POST', '/api/restaurants', {
        ...data,
        ownerId: user.id,
        latitude: 40.7128, // Default to NYC coordinates for demo
        longitude: -74.0060,
        features: ["Dine-in", "Free Wi-Fi"],
        images: ["https://images.unsplash.com/photo-1517248135467-4c7edcad34c4"],
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/users/${user.id}/restaurants`] });
      toast({
        title: 'Restaurant created',
        description: 'Your restaurant has been created successfully',
      });
      setIsCreatingRestaurant(false);
    },
  });
  
  // Create table mutation
  const createTableMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest('POST', '/api/tables', {
        ...data,
        restaurantId: selectedRestaurantId,
        isAvailable: true,
        qrCode: `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=https://crave.app/table/${data.tableNumber}`,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/restaurants/${selectedRestaurantId}/tables`] });
      toast({
        title: 'Table created',
        description: 'New table has been added to your restaurant',
      });
      setIsAddingTable(false);
    },
  });
  
  // Update service request mutation
  const updateServiceRequestMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number, status: string }) => {
      const response = await apiRequest('PATCH', `/api/service-requests/${id}`, { status });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/restaurants/${selectedRestaurantId}/service-requests`] });
      toast({
        title: 'Request updated',
        description: 'Service request status has been updated',
      });
    },
  });
  
  // Form for adding new tables
  const tableForm = useForm<z.infer<typeof tableSchema>>({
    resolver: zodResolver(tableSchema),
    defaultValues: {
      tableNumber: '',
      capacity: '4',
    },
  });
  
  // Form for creating a new restaurant
  const restaurantForm = useForm<z.infer<typeof restaurantSchema>>({
    resolver: zodResolver(restaurantSchema),
    defaultValues: {
      name: '',
      description: '',
      cuisine: '',
      address: '',
      city: '',
      phone: '',
      openingTime: '10:00 AM',
      closingTime: '10:00 PM',
      priceRange: '$$',
    },
  });
  
  const onSubmitTable = (data: z.infer<typeof tableSchema>) => {
    createTableMutation.mutate({
      tableNumber: data.tableNumber,
      capacity: parseInt(data.capacity.toString()),
    });
  };
  
  const onSubmitRestaurant = (data: z.infer<typeof restaurantSchema>) => {
    createRestaurantMutation.mutate(data);
  };
  
  const handleCompleteRequest = (id: number) => {
    updateServiceRequestMutation.mutate({ id, status: 'completed' });
  };
  
  const handleRejectRequest = (id: number) => {
    updateServiceRequestMutation.mutate({ id, status: 'rejected' });
  };
  
  // Mock data for analytics
  const dailyOrdersData = [
    { name: 'Mon', orders: 12 },
    { name: 'Tue', orders: 15 },
    { name: 'Wed', orders: 18 },
    { name: 'Thu', orders: 16 },
    { name: 'Fri', orders: 25 },
    { name: 'Sat', orders: 30 },
    { name: 'Sun', orders: 22 },
  ];
  
  const menuItemPopularity = [
    { name: 'Grilled Salmon', value: 35 },
    { name: 'Seafood Platter', value: 25 },
    { name: 'Asian Salad', value: 15 },
    { name: 'Sushi Rolls', value: 25 },
  ];
  
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];
  
  const renderNoRestaurantState = () => (
    <div className="flex flex-col items-center justify-center py-12">
      <Building2 size={64} className="text-gray-300 mb-4" />
      <h3 className="text-xl font-medium mb-2">No Restaurants Found</h3>
      <p className="text-gray-500 mb-6 text-center max-w-md">
        You haven't created any restaurants yet. Get started by creating your first restaurant.
      </p>
      <Button onClick={() => setIsCreatingRestaurant(true)}>
        <Plus className="mr-2" size={16} />
        Create Restaurant
      </Button>
    </div>
  );
  
  if (isLoadingRestaurants) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }
  
  if (restaurants && restaurants.length === 0 && !isCreatingRestaurant) {
    return (
      <Layout>
        <div className="container py-6">
          {renderNoRestaurantState()}
        </div>
        
        {/* Dialog for creating a restaurant */}
        <Dialog open={isCreatingRestaurant} onOpenChange={setIsCreatingRestaurant}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Create New Restaurant</DialogTitle>
              <DialogDescription>
                Enter the details of your restaurant to get started.
              </DialogDescription>
            </DialogHeader>
            
            <Form {...restaurantForm}>
              <form onSubmit={restaurantForm.handleSubmit(onSubmitRestaurant)} className="space-y-4">
                <FormField
                  control={restaurantForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Restaurant Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter restaurant name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={restaurantForm.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Describe your restaurant" 
                          className="resize-none" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={restaurantForm.control}
                    name="cuisine"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cuisine</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. Italian, Seafood" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={restaurantForm.control}
                    name="priceRange"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Price Range</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. $$ or $$$" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={restaurantForm.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Address</FormLabel>
                      <FormControl>
                        <Input placeholder="Full street address" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={restaurantForm.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>City</FormLabel>
                      <FormControl>
                        <Input placeholder="City" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={restaurantForm.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl>
                        <Input placeholder="Phone number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={restaurantForm.control}
                    name="openingTime"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Opening Time</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. 9:00 AM" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={restaurantForm.control}
                    name="closingTime"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Closing Time</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. 10:00 PM" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <DialogFooter>
                  <Button type="submit" disabled={createRestaurantMutation.isPending}>
                    {createRestaurantMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      'Create Restaurant'
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </Layout>
    );
  }
  
  const selectedRestaurant = restaurants?.find(r => r.id === selectedRestaurantId);
  
  return (
    <Layout>
      <div className="container py-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold">Restaurant Dashboard</h1>
            <p className="text-gray-500">Manage your restaurant, tables, orders and more</p>
          </div>
          
          <div className="flex items-center space-x-4">
            {restaurants && restaurants.length > 0 && (
              <div className="flex items-center">
                <span className="mr-2">Select Restaurant:</span>
                <select
                  className="border rounded-md p-2"
                  value={selectedRestaurantId || ''}
                  onChange={(e) => setSelectedRestaurantId(parseInt(e.target.value))}
                >
                  {restaurants.map((restaurant) => (
                    <option key={restaurant.id} value={restaurant.id}>
                      {restaurant.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
            
            <Button onClick={() => setIsCreatingRestaurant(true)}>
              <Plus className="mr-2" size={16} />
              Add Restaurant
            </Button>
          </div>
        </div>
        
        {selectedRestaurant ? (
          <Tabs defaultValue="overview" className="space-y-4">
            <TabsList className="grid grid-cols-6 w-full">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="tables">Tables</TabsTrigger>
              <TabsTrigger value="reservations">Reservations</TabsTrigger>
              <TabsTrigger value="orders">Orders</TabsTrigger>
              <TabsTrigger value="service-requests">Service Requests</TabsTrigger>
              <TabsTrigger value="music">Music Queue</TabsTrigger>
            </TabsList>
            
            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Total Tables</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {isLoadingTables ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        tables?.length || 0
                      )}
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Active Reservations</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {isLoadingReservations ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        reservations?.filter(r => r.status === 'confirmed').length || 0
                      )}
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Pending Orders</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {isLoadingOrders ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        orders?.filter(o => o.status === 'pending').length || 0
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Daily Orders</CardTitle>
                  </CardHeader>
                  <CardContent className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart
                        data={dailyOrdersData}
                        margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Area type="monotone" dataKey="orders" stroke="#3B82F6" fill="#93C5FD" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Popular Menu Items</CardTitle>
                  </CardHeader>
                  <CardContent className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={menuItemPopularity}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        >
                          {menuItemPopularity.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>
              
              <Card>
                <CardHeader>
                  <CardTitle>Restaurant Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h3 className="font-semibold text-lg">{selectedRestaurant.name}</h3>
                      <p className="text-gray-500 mt-1">{selectedRestaurant.description}</p>
                      <div className="mt-4 space-y-2">
                        <div className="flex items-center">
                          <FileText className="h-4 w-4 mr-2 text-gray-400" />
                          <span className="text-sm">{selectedRestaurant.cuisine}</span>
                        </div>
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                          <span className="text-sm">{selectedRestaurant.address}, {selectedRestaurant.city}</span>
                        </div>
                        <div className="flex items-center">
                          <Phone className="h-4 w-4 mr-2 text-gray-400" />
                          <span className="text-sm">{selectedRestaurant.phone}</span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-gray-500">Opening Hours:</span>
                        <span>{selectedRestaurant.openingTime} - {selectedRestaurant.closingTime}</span>
                      </div>
                      <div className="flex justify-between mb-2">
                        <span className="text-gray-500">Price Range:</span>
                        <span>{selectedRestaurant.priceRange}</span>
                      </div>
                      <div className="mt-4">
                        <h4 className="font-medium mb-2">Features:</h4>
                        <div className="flex flex-wrap gap-2">
                          {Array.isArray(selectedRestaurant.features) && selectedRestaurant.features.map((feature, index) => (
                            <span key={index} className="px-2 py-1 bg-gray-100 rounded-full text-xs">
                              {feature}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button variant="outline">Edit Restaurant</Button>
                </CardFooter>
              </Card>
            </TabsContent>
            
            {/* Tables Tab */}
            <TabsContent value="tables" className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Table Management</h2>
                <Dialog open={isAddingTable} onOpenChange={setIsAddingTable}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="mr-2" size={16} />
                      Add Table
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>Add New Table</DialogTitle>
                      <DialogDescription>
                        Enter the details for the new table. A QR code will be generated automatically.
                      </DialogDescription>
                    </DialogHeader>
                    <Form {...tableForm}>
                      <form onSubmit={tableForm.handleSubmit(onSubmitTable)} className="space-y-4">
                        <FormField
                          control={tableForm.control}
                          name="tableNumber"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Table Number</FormLabel>
                              <FormControl>
                                <Input placeholder="e.g. 12" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={tableForm.control}
                          name="capacity"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Capacity</FormLabel>
                              <FormControl>
                                <Input type="number" min="1" max="20" {...field} />
                              </FormControl>
                              <FormDescription>
                                Maximum number of people that can be seated
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <DialogFooter>
                          <Button type="submit" disabled={createTableMutation.isPending}>
                            {createTableMutation.isPending ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Creating...
                              </>
                            ) : (
                              'Create Table'
                            )}
                          </Button>
                        </DialogFooter>
                      </form>
                    </Form>
                  </DialogContent>
                </Dialog>
              </div>
              
              {isLoadingTables ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : tables && tables.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {tables.map((table) => (
                    <Card key={table.id}>
                      <CardHeader>
                        <CardTitle className="flex justify-between">
                          <span>Table #{table.tableNumber}</span>
                          <span className={`text-sm px-2 py-1 rounded-full ${table.isAvailable ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                            {table.isAvailable ? 'Available' : 'Occupied'}
                          </span>
                        </CardTitle>
                        <CardDescription>
                          Capacity: {table.capacity} people
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="flex justify-center">
                        <img
                          src={table.qrCode}
                          alt={`QR Code for Table ${table.tableNumber}`}
                          className="w-32 h-32"
                        />
                      </CardContent>
                      <CardFooter className="flex justify-between">
                        <Button variant="outline" size="sm">
                          <QrCode className="mr-2" size={14} />
                          Download QR
                        </Button>
                        <Button variant="outline" size="sm">
                          Edit
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 border rounded-lg bg-gray-50">
                  <QrCode className="mx-auto text-gray-300 mb-4" size={64} />
                  <h3 className="text-lg font-medium mb-2">No Tables Added</h3>
                  <p className="text-gray-500 mb-6">
                    You haven't added any tables to this restaurant yet.
                  </p>
                  <Button onClick={() => setIsAddingTable(true)}>
                    <Plus className="mr-2" size={16} />
                    Add First Table
                  </Button>
                </div>
              )}
            </TabsContent>
            
            {/* Reservations Tab */}
            <TabsContent value="reservations" className="space-y-4">
              <h2 className="text-xl font-semibold">Reservations</h2>
              
              {isLoadingReservations ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : reservations && reservations.length > 0 ? (
                <div className="space-y-4">
                  {reservations.map((reservation) => (
                    <Card key={reservation.id}>
                      <CardHeader className="py-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle>Reservation #{reservation.id}</CardTitle>
                            <CardDescription>
                              {format(new Date(reservation.date), 'PPP')} at {reservation.time}
                            </CardDescription>
                          </div>
                          <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                            reservation.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                            reservation.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {reservation.status.charAt(0).toUpperCase() + reservation.status.slice(1)}
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="py-2">
                        <div className="flex justify-between">
                          <div>
                            <p className="font-medium">Customer:</p>
                            <p className="text-gray-600">User #{reservation.userId}</p>
                          </div>
                          <div>
                            <p className="font-medium">Guests:</p>
                            <p className="text-gray-600">{reservation.guests} people</p>
                          </div>
                          {reservation.tableId && (
                            <div>
                              <p className="font-medium">Table:</p>
                              <p className="text-gray-600">#{reservation.tableId}</p>
                            </div>
                          )}
                        </div>
                        {reservation.specialRequests && (
                          <div className="mt-4">
                            <p className="font-medium">Special Requests:</p>
                            <p className="text-gray-600">{reservation.specialRequests}</p>
                          </div>
                        )}
                      </CardContent>
                      <CardFooter className="flex justify-end py-4">
                        <Button variant="outline" className="mr-2">Assign Table</Button>
                        <Button className="mr-2">Confirm</Button>
                        <Button variant="destructive">Cancel</Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 border rounded-lg bg-gray-50">
                  <Calendar className="mx-auto text-gray-300 mb-4" size={64} />
                  <h3 className="text-lg font-medium mb-2">No Reservations</h3>
                  <p className="text-gray-500">
                    You don't have any reservations for this restaurant yet.
                  </p>
                </div>
              )}
            </TabsContent>
            
            {/* Orders Tab */}
            <TabsContent value="orders" className="space-y-4">
              <h2 className="text-xl font-semibold">Orders</h2>
              
              {isLoadingOrders ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : orders && orders.length > 0 ? (
                <div className="space-y-4">
                  {orders.map((order) => (
                    <Card key={order.id}>
                      <CardHeader className="py-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle>Order #{order.id}</CardTitle>
                            <CardDescription>
                              {format(new Date(order.createdAt), 'PPP')}
                            </CardDescription>
                          </div>
                          <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                            order.status === 'completed' ? 'bg-green-100 text-green-800' :
                            order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="py-2">
                        <div className="flex justify-between">
                          <div>
                            <p className="font-medium">Customer:</p>
                            <p className="text-gray-600">User #{order.userId}</p>
                          </div>
                          <div>
                            <p className="font-medium">Total:</p>
                            <p className="text-gray-600">${order.total.toFixed(2)}</p>
                          </div>
                          {order.tableId && (
                            <div>
                              <p className="font-medium">Table:</p>
                              <p className="text-gray-600">#{order.tableId}</p>
                            </div>
                          )}
                        </div>
                      </CardContent>
                      <CardFooter className="flex justify-end py-4">
                        <Button variant="outline" className="mr-2">View Details</Button>
                        <Button className="mr-2">Mark as Completed</Button>
                        <Button variant="destructive">Cancel Order</Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 border rounded-lg bg-gray-50">
                  <ClipboardList className="mx-auto text-gray-300 mb-4" size={64} />
                  <h3 className="text-lg font-medium mb-2">No Orders</h3>
                  <p className="text-gray-500">
                    There are no orders for this restaurant yet.
                  </p>
                </div>
              )}
            </TabsContent>
            
            {/* Service Requests Tab */}
            <TabsContent value="service-requests" className="space-y-4">
              <h2 className="text-xl font-semibold">Service Requests</h2>
              
              {isLoadingServiceRequests ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : serviceRequests && serviceRequests.length > 0 ? (
                <div className="space-y-4">
                  {serviceRequests.map((request) => (
                    <Card key={request.id} className={request.status === 'pending' ? 'border-yellow-300' : ''}>
                      <CardHeader className="py-4">
                        <div className="flex justify-between items-start">
                          <div className="flex items-center">
                            {request.type === 'waiter' ? (
                              <BellRing className="h-5 w-5 mr-2 text-yellow-500" />
                            ) : (
                              <MessageSquare className="h-5 w-5 mr-2 text-blue-500" />
                            )}
                            <CardTitle>
                              {request.type === 'waiter' ? 'Waiter Request' : 'Special Request'}
                            </CardTitle>
                          </div>
                          <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                            request.status === 'completed' ? 'bg-green-100 text-green-800' :
                            request.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                          </div>
                        </div>
                        <CardDescription>
                          {format(new Date(request.createdAt), 'PPP p')}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="py-2">
                        <div className="mb-4">
                          <p className="font-medium">Table:</p>
                          <p className="text-gray-600">#{request.tableId}</p>
                        </div>
                        {request.description && (
                          <div>
                            <p className="font-medium">Request Details:</p>
                            <p className="text-gray-600">{request.description}</p>
                          </div>
                        )}
                      </CardContent>
                      {request.status === 'pending' && (
                        <CardFooter className="flex justify-end py-4">
                          <Button 
                            className="mr-2"
                            onClick={() => handleCompleteRequest(request.id)}
                            disabled={updateServiceRequestMutation.isPending}
                          >
                            <CheckCircle className="mr-2" size={16} />
                            Complete
                          </Button>
                          <Button 
                            variant="outline"
                            onClick={() => handleRejectRequest(request.id)}
                            disabled={updateServiceRequestMutation.isPending}
                          >
                            <XCircle className="mr-2" size={16} />
                            Reject
                          </Button>
                        </CardFooter>
                      )}
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 border rounded-lg bg-gray-50">
                  <Bell className="mx-auto text-gray-300 mb-4" size={64} />
                  <h3 className="text-lg font-medium mb-2">No Service Requests</h3>
                  <p className="text-gray-500">
                    There are no service requests from customers at the moment.
                  </p>
                </div>
              )}
            </TabsContent>
            
            {/* Music Queue Tab */}
            <TabsContent value="music" className="space-y-4">
              <h2 className="text-xl font-semibold">Music Management</h2>
              
              <Card>
                <CardHeader>
                  <CardTitle>Currently Playing</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center">
                    <div className="w-16 h-16 bg-gray-200 rounded-md overflow-hidden flex-shrink-0 mr-4 flex items-center justify-center">
                      <Music className="text-gray-400" size={24} />
                    </div>
                    <div className="flex-grow">
                      <h3 className="font-medium text-lg">Fly Me To The Moon</h3>
                      <p className="text-gray-500">Frank Sinatra</p>
                    </div>
                    <div className="w-24 h-8 flex items-center justify-center">
                      <div className="w-1 h-5 bg-primary rounded-full animate-pulse"></div>
                      <div className="w-1 h-3 bg-primary mx-1 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                      <div className="w-1 h-6 bg-primary rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" className="mr-2">
                    Skip
                  </Button>
                  <Button variant="outline">
                    Pause
                  </Button>
                </CardFooter>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Song Requests</CardTitle>
                  <CardDescription>
                    Songs requested by customers
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-gray-200 rounded overflow-hidden flex-shrink-0 mr-3 flex items-center justify-center">
                          <Music className="text-gray-400" size={16} />
                        </div>
                        <div>
                          <h4 className="font-medium">Summertime</h4>
                          <p className="text-gray-500 text-xs">Ella Fitzgerald</p>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <span className="bg-primary text-white text-xs rounded-full px-2 py-1 mr-3">
                          <ThumbsUp className="mr-1 inline" size={12} /> 8
                        </span>
                        <Button variant="outline" size="sm">
                          Play Next
                        </Button>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-gray-200 rounded overflow-hidden flex-shrink-0 mr-3 flex items-center justify-center">
                          <Music className="text-gray-400" size={16} />
                        </div>
                        <div>
                          <h4 className="font-medium">La Vie En Rose</h4>
                          <p className="text-gray-500 text-xs">Louis Armstrong</p>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <span className="bg-primary text-white text-xs rounded-full px-2 py-1 mr-3">
                          <ThumbsUp className="mr-1 inline" size={12} /> 5
                        </span>
                        <Button variant="outline" size="sm">
                          Play Next
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button variant="outline">
                    View All Requests
                  </Button>
                </CardFooter>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Music Settings</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Default Genre</label>
                      <select className="w-full p-2 border rounded-md">
                        <option>Jazz</option>
                        <option>Classical</option>
                        <option>Pop</option>
                        <option>Lounge</option>
                        <option>Rock</option>
                      </select>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <label className="block text-sm font-medium">Allow Customer Music Requests</label>
                      <input type="checkbox" className="toggle" defaultChecked />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <label className="block text-sm font-medium">Auto-play Most Voted Songs</label>
                      <input type="checkbox" className="toggle" defaultChecked />
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button>
                    Save Settings
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        ) : (
          renderNoRestaurantState()
        )}
      </div>
      
      {/* Dialog for creating a restaurant */}
      <Dialog open={isCreatingRestaurant} onOpenChange={setIsCreatingRestaurant}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Restaurant</DialogTitle>
            <DialogDescription>
              Enter the details of your restaurant to get started.
            </DialogDescription>
          </DialogHeader>
          
          <Form {...restaurantForm}>
            <form onSubmit={restaurantForm.handleSubmit(onSubmitRestaurant)} className="space-y-4">
              <FormField
                control={restaurantForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Restaurant Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter restaurant name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={restaurantForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Describe your restaurant" 
                        className="resize-none" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={restaurantForm.control}
                  name="cuisine"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cuisine</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Italian, Seafood" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={restaurantForm.control}
                  name="priceRange"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Price Range</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. $$ or $$$" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={restaurantForm.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address</FormLabel>
                    <FormControl>
                      <Input placeholder="Full street address" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={restaurantForm.control}
                name="city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>City</FormLabel>
                    <FormControl>
                      <Input placeholder="City" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={restaurantForm.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl>
                      <Input placeholder="Phone number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={restaurantForm.control}
                  name="openingTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Opening Time</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. 9:00 AM" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={restaurantForm.control}
                  name="closingTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Closing Time</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. 10:00 PM" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <DialogFooter>
                <Button type="submit" disabled={createRestaurantMutation.isPending}>
                  {createRestaurantMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    'Create Restaurant'
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

// MapPin and Phone components as they're not imported
const MapPin = ({ className, size }: { className?: string, size?: number }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width={size || 24} 
    height={size || 24} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
    <circle cx="12" cy="10" r="3"/>
  </svg>
);

const Phone = ({ className, size }: { className?: string, size?: number }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width={size || 24} 
    height={size || 24} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
  </svg>
);

const ThumbsUp = ({ className, size }: { className?: string, size?: number }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width={size || 24} 
    height={size || 24} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M7 10v12"/>
    <path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2h0a3.13 3.13 0 0 1 3 3.88Z"/>
  </svg>
);

export default RestaurantDashboard;
