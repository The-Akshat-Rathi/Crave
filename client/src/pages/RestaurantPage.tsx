import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRoute, useLocation } from 'wouter';
import Layout from '@/components/Layout';
import RestaurantDetail from '@/components/RestaurantDetail';
import DishHighlight3D from '@/components/DishHighlight3D';
import { Restaurant, MenuItem, Table } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { ChevronLeft, QrCode, MapPin, Utensils, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';
import { apiRequest } from '@/lib/queryClient';
import { useAuth } from '@/hooks/useAuth';

const RestaurantPage = () => {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [match, params] = useRoute('/restaurants/:id');
  const restaurantId = params?.id ? parseInt(params.id) : 0;
  const { user } = useAuth();
  
  // Check for tableId in URL parameters (from QR code scanning)
  const [tableId, setTableId] = useState<number | null>(null);
  const [tableData, setTableData] = useState<Table | null>(null);
  const [showTableBooking, setShowTableBooking] = useState(false);
  
  const { data: restaurant, isLoading: restaurantLoading, error: restaurantError } = useQuery<Restaurant>({
    queryKey: [`/api/restaurants/${restaurantId}`],
    enabled: !!restaurantId,
  });
  
  const { data: popularDishes, isLoading: dishesLoading, error: dishesError } = useQuery<MenuItem[]>({
    queryKey: [`/api/restaurants/${restaurantId}/popular-dishes`],
    enabled: !!restaurantId,
  });
  
  const [activeTab, setActiveTab] = useState("overview");
  
  // Parse URL parameters for tableId from QR code scanning
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const tableIdParam = searchParams.get('tableId');
    
    if (tableIdParam) {
      const parsedTableId = parseInt(tableIdParam);
      setTableId(parsedTableId);
      
      // Show table booking dialog if we have both a tableId and restaurant
      if (restaurant && user) {
        setShowTableBooking(true);
      }
    }
  }, [restaurant, user]);
  
  // Fetch table data if tableId is available
  useEffect(() => {
    if (tableId) {
      const fetchTableData = async () => {
        try {
          const table = await apiRequest(`/api/tables/${tableId}`);
          setTableData(table);
        } catch (error) {
          console.error('Error fetching table data:', error);
          toast({
            title: 'Error',
            description: 'Failed to load table information.',
            variant: 'destructive',
          });
        }
      };
      
      fetchTableData();
    }
  }, [tableId, toast]);
  
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };
  
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.5 }
    }
  };

  if (!match) {
    return null;
  }
  
  if (restaurantLoading || dishesLoading) {
    return (
      <Layout>
        <div className="container mx-auto py-12 px-4">
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        </div>
      </Layout>
    );
  }
  
  if (restaurantError || !restaurant) {
    return (
      <Layout>
        <div className="container mx-auto py-12 px-4">
          <Card className="max-w-2xl mx-auto">
            <CardContent className="pt-6 flex flex-col items-center">
              <h1 className="text-2xl font-bold text-red-500 mb-4">Restaurant Not Found</h1>
              <p className="text-gray-600 mb-6">Sorry, we couldn't find the restaurant you're looking for.</p>
              <Button onClick={() => navigate('/explore')}>
                <ChevronLeft className="mr-2" size={16} />
                Back to Explore
              </Button>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }
  
  // Convert MenuItem to format needed by DishHighlight3D
  const formattedDishes = popularDishes?.map(dish => ({
    id: dish.id,
    name: dish.name,
    description: dish.description || "A delicious dish from this restaurant",
    price: typeof dish.price === 'string' ? parseFloat(dish.price) : dish.price,
    image: dish.image as string,
    isPopular: true
  })) || [];
  
  return (
    <Layout>
      <motion.div 
        className="container mx-auto py-8 px-4"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <motion.div variants={itemVariants}>
          <RestaurantDetail 
            restaurantId={restaurantId} 
            onClose={() => navigate('/explore')} 
          />
        </motion.div>
        
        {formattedDishes.length > 0 && (
          <motion.div 
            className="mt-12"
            variants={itemVariants}
          >
            <h2 className="text-2xl font-bold mb-6 text-center">
              <span className="text-primary">Popular</span> Dishes
            </h2>
            
            <Tabs defaultValue="tab1" className="w-full">
              <TabsList className="mx-auto mb-6 flex justify-center">
                <TabsTrigger value="tab1">Featured</TabsTrigger>
                <TabsTrigger value="tab2">Most Ordered</TabsTrigger>
                <TabsTrigger value="tab3">Chef's Special</TabsTrigger>
              </TabsList>
              
              <TabsContent value="tab1" className="mt-2">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {formattedDishes.slice(0, 3).map((dish) => (
                    <DishHighlight3D key={dish.id} dish={dish} />
                  ))}
                </div>
              </TabsContent>
              
              <TabsContent value="tab2" className="mt-2">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {formattedDishes.slice(0, 3).reverse().map((dish) => (
                    <DishHighlight3D key={dish.id} dish={dish} />
                  ))}
                </div>
              </TabsContent>
              
              <TabsContent value="tab3" className="mt-2">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {formattedDishes.slice(0, 3).map((dish, index) => (
                    <DishHighlight3D 
                      key={dish.id} 
                      dish={{
                        ...dish,
                        isPopular: index === 0 // Only first item is "special"
                      }} 
                    />
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </motion.div>
        )}
      </motion.div>
      
      {/* Table Booking Dialog */}
      {showTableBooking && tableData && (
        <Dialog open={showTableBooking} onOpenChange={setShowTableBooking}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-center text-xl text-blue-800">
                Table Reservation
              </DialogTitle>
              <DialogDescription className="text-center">
                You're about to reserve a table at {restaurant.name}
              </DialogDescription>
            </DialogHeader>
            
            <div className="flex flex-col items-center justify-center p-4">
              <div className="bg-blue-50 p-6 rounded-lg w-full mb-4">
                <div className="text-center mb-4">
                  <div className="w-16 h-16 rounded-full bg-blue-100 mx-auto flex items-center justify-center mb-3">
                    <Utensils className="h-8 w-8 text-blue-700" />
                  </div>
                  <h3 className="text-lg font-semibold text-blue-900">
                    {`Table ${tableData.tableNumber}`}
                  </h3>
                  <p className="text-blue-700">{restaurant.name}</p>
                </div>
                
                <div className="bg-white p-3 rounded border border-blue-200 mb-4">
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-gray-500">Date</span>
                    <span className="text-sm font-medium">{new Date().toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Time</span>
                    <span className="text-sm font-medium">{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <DialogFooter className="flex flex-col sm:flex-row sm:justify-between">
              <Button variant="outline" onClick={() => setShowTableBooking(false)} className="mb-2 sm:mb-0">
                Cancel
              </Button>
              
              <Button 
                onClick={async () => {
                  try {
                    if (!user) {
                      toast({
                        title: 'Sign in Required',
                        description: 'Please sign in to reserve a table.',
                        variant: 'destructive',
                      });
                      return;
                    }
                    
                    await apiRequest('/api/reservations', {
                      method: 'POST',
                      body: JSON.stringify({
                        userId: user.id,
                        restaurantId: restaurantId,
                        tableId: tableId,
                        date: new Date().toISOString(),
                        status: 'confirmed',
                        partySize: 2, // Default party size
                      }),
                    });
                    
                    toast({
                      title: 'Table Reserved',
                      description: `You've successfully reserved Table ${tableData.tableNumber} at ${restaurant.name}.`,
                    });
                    
                    setShowTableBooking(false);
                  } catch (error) {
                    toast({
                      title: 'Reservation Failed',
                      description: 'Unable to reserve the table. Please try again.',
                      variant: 'destructive',
                    });
                  }
                }}
                className="bg-gradient-to-r from-blue-600 to-blue-800 text-white"
              >
                Confirm Reservation
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </Layout>
  );
};

export default RestaurantPage;
