import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { MenuItem, Table, ServiceRequest } from '@/lib/types';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import MusicSelector from './MusicSelector';
import { X, ShoppingCart, Bell, Music, MessageSquare } from 'lucide-react';

interface TableExperienceProps {
  tableId: string;
  onClose: () => void;
}

const TableExperience = ({ tableId, onClose }: TableExperienceProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('menu');
  const [musicSelectorOpen, setMusicSelectorOpen] = useState(false);
  const [orderItems, setOrderItems] = useState<{item: MenuItem, quantity: number}[]>([]);
  
  // Fetch table information
  const { data: table } = useQuery<Table>({
    queryKey: [`/api/tables/${tableId}`],
  });
  
  // Fetch restaurant information for this table
  const { data: restaurant } = useQuery({
    queryKey: [`/api/restaurants/${table?.restaurantId}`],
    enabled: !!table?.restaurantId,
  });
  
  // Fetch menu items for this restaurant
  const { data: menuItems, isLoading: isLoadingMenu } = useQuery<MenuItem[]>({
    queryKey: [`/api/restaurants/${table?.restaurantId}/menu`],
    enabled: !!table?.restaurantId,
  });
  
  // Group menu items by category
  const menuCategories = menuItems ? 
    Object.entries(
      menuItems.reduce((acc, item) => {
        acc[item.category] = [...(acc[item.category] || []), item];
        return acc;
      }, {} as Record<string, MenuItem[]>)
    ) : [];
  
  // Fetch recommendations
  const { data: popularDishes } = useQuery<MenuItem[]>({
    queryKey: [`/api/restaurants/${table?.restaurantId}/popular-dishes`],
    enabled: !!table?.restaurantId,
  });
  
  // Service request mutation
  const serviceRequestMutation = useMutation({
    mutationFn: async (data: Partial<ServiceRequest>) => {
      const response = await apiRequest('POST', '/api/service-requests', data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Request sent',
        description: 'Your request has been sent to the restaurant staff.',
      });
    },
  });
  
  // Order mutation
  const orderMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest('POST', '/api/orders', data);
      return response.json();
    },
    onSuccess: (data) => {
      // Create order items for each item in the order
      Promise.all(
        orderItems.map(({ item, quantity }) => 
          apiRequest('POST', '/api/order-items', {
            orderId: data.id,
            menuItemId: item.id,
            quantity,
            subtotal: item.price * quantity,
          })
        )
      ).then(() => {
        toast({
          title: 'Order placed',
          description: 'Your order has been sent to the restaurant.',
        });
        setOrderItems([]);
      });
    },
  });
  
  const handleAddToOrder = (item: MenuItem) => {
    const existingItem = orderItems.find(orderItem => orderItem.item.id === item.id);
    
    if (existingItem) {
      setOrderItems(
        orderItems.map(orderItem => 
          orderItem.item.id === item.id 
            ? { ...orderItem, quantity: orderItem.quantity + 1 } 
            : orderItem
        )
      );
    } else {
      setOrderItems([...orderItems, { item, quantity: 1 }]);
    }
    
    toast({
      title: 'Added to order',
      description: `${item.name} has been added to your order.`,
    });
  };
  
  const handleCallWaiter = () => {
    if (!user || !table) return;
    
    serviceRequestMutation.mutate({
      userId: user.id,
      restaurantId: table.restaurantId,
      tableId: table.id,
      type: 'waiter',
      description: 'Customer requested waiter assistance',
      status: 'pending',
    });
  };
  
  const handleSpecialRequest = () => {
    if (!user || !table) return;
    
    const description = prompt('Enter your special request:');
    if (!description) return;
    
    serviceRequestMutation.mutate({
      userId: user.id,
      restaurantId: table.restaurantId,
      tableId: table.id,
      type: 'special',
      description,
      status: 'pending',
    });
  };
  
  const handleViewOrder = () => {
    setActiveTab('bill');
  };
  
  const handlePlaceOrder = () => {
    if (!user || !table || orderItems.length === 0) return;
    
    const total = orderItems.reduce((acc, { item, quantity }) => acc + (item.price * quantity), 0);
    
    orderMutation.mutate({
      userId: user.id,
      restaurantId: table.restaurantId,
      tableId: table.id,
      status: 'pending',
      total,
    });
  };
  
  const handleRemoveItem = (itemId: number) => {
    setOrderItems(orderItems.filter(({ item }) => item.id !== itemId));
  };
  
  return (
    <div className="fixed inset-0 bg-white z-50 flex flex-col">
      {/* Header */}
      <div className="bg-primary text-white p-4 flex justify-between items-center">
        <div>
          <h2 className="font-bold">Table #{table?.tableNumber || tableId}</h2>
          <p className="text-sm text-primary-100">
            {restaurant?.name || 'Loading...'} • {table?.capacity || 2} Guests
          </p>
        </div>
        <Button 
          variant="secondary" 
          size="icon" 
          className="rounded-full" 
          onClick={onClose}
        >
          <X size={18} />
        </Button>
      </div>

      {/* Navigation Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-grow flex flex-col">
        <div className="px-4 pt-2 border-b">
          <TabsList className="w-full justify-start overflow-x-auto">
            <TabsTrigger 
              value="menu" 
              className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary rounded-none bg-transparent shadow-none focus:ring-0"
            >
              Menu
            </TabsTrigger>
            <TabsTrigger 
              value="music" 
              className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary rounded-none bg-transparent shadow-none focus:ring-0"
            >
              Music
            </TabsTrigger>
            <TabsTrigger 
              value="service" 
              className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary rounded-none bg-transparent shadow-none focus:ring-0"
            >
              Service
            </TabsTrigger>
            <TabsTrigger 
              value="bill" 
              className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary rounded-none bg-transparent shadow-none focus:ring-0"
            >
              Bill
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Menu Tab */}
        <TabsContent value="menu" className="flex-grow flex flex-col p-0 m-0">
          <div className="flex-grow overflow-auto p-4">
            {/* Search */}
            <div className="relative mb-4">
              <input 
                type="text" 
                placeholder="Search menu items..." 
                className="w-full p-3 bg-gray-100 rounded-full pl-10 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white"
              />
              <i className="fas fa-search absolute left-4 top-3.5 text-gray-400"></i>
            </div>

            {/* Categories */}
            <div className="flex overflow-x-auto space-x-3 py-2 no-scrollbar mb-4">
              <button className="whitespace-nowrap px-3 py-1.5 rounded-full text-sm bg-primary text-white flex-shrink-0">All</button>
              {menuCategories.map(([category]) => (
                <button 
                  key={category}
                  className="whitespace-nowrap px-3 py-1.5 rounded-full text-sm bg-gray-100 text-gray-700 flex-shrink-0"
                >
                  {category}
                </button>
              ))}
            </div>

            {/* Recommendations */}
            {popularDishes && popularDishes.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-bold mb-3">Chef's Recommendations</h3>
                <div className="grid grid-cols-1 gap-4">
                  {popularDishes.map((dish) => (
                    <div key={dish.id} className="flex bg-white rounded-lg overflow-hidden shadow-sm">
                      <img 
                        src={dish.image} 
                        alt={dish.name} 
                        className="w-24 h-24 object-cover"
                      />
                      <div className="flex-grow p-3 flex flex-col justify-between">
                        <div>
                          <div className="flex justify-between items-start">
                            <h4 className="font-medium text-gray-800">{dish.name}</h4>
                            <div className="bg-green-50 px-1.5 py-0.5 rounded text-xs text-green-700">
                              <i className="fas fa-fire text-accent text-xs"></i> Popular
                            </div>
                          </div>
                          <p className="text-gray-500 text-sm">{dish.description}</p>
                        </div>
                        <div className="flex justify-between items-center mt-2">
                          <span className="font-bold text-gray-800">${dish.price.toFixed(2)}</span>
                          <Button 
                            size="sm" 
                            className="rounded-full" 
                            onClick={() => handleAddToOrder(dish)}
                          >
                            Add
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Menu Items by Category */}
            {isLoadingMenu ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : (
              menuCategories.map(([category, items]) => (
                <div key={category} className="mb-6">
                  <h3 className="text-lg font-bold mb-3">{category}</h3>
                  <div className="grid grid-cols-1 gap-4">
                    {items.map((item) => (
                      <div key={item.id} className="flex bg-white rounded-lg overflow-hidden shadow-sm">
                        <img 
                          src={item.image} 
                          alt={item.name} 
                          className="w-24 h-24 object-cover"
                        />
                        <div className="flex-grow p-3 flex flex-col justify-between">
                          <div>
                            <h4 className="font-medium text-gray-800">{item.name}</h4>
                            <p className="text-gray-500 text-sm">{item.description}</p>
                          </div>
                          <div className="flex justify-between items-center mt-2">
                            <span className="font-bold text-gray-800">${item.price.toFixed(2)}</span>
                            <Button 
                              size="sm" 
                              className="rounded-full" 
                              onClick={() => handleAddToOrder(item)}
                            >
                              Add
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Order Summary Bar */}
          {orderItems.length > 0 && (
            <div className="p-4 border-t bg-white shadow-inner">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-sm text-gray-600">Your order</span>
                  <h3 className="font-bold">
                    {orderItems.reduce((acc, { quantity }) => acc + quantity, 0)} items • $
                    {orderItems.reduce((acc, { item, quantity }) => acc + (item.price * quantity), 0).toFixed(2)}
                  </h3>
                </div>
                <Button onClick={handleViewOrder}>
                  View Order
                </Button>
              </div>
            </div>
          )}
        </TabsContent>

        {/* Music Tab */}
        <TabsContent value="music" className="flex-grow p-4 m-0">
          <div className="text-center py-10">
            <Music size={48} className="mx-auto text-primary mb-4" />
            <h3 className="text-xl font-bold mb-2">Suggest Music</h3>
            <p className="text-gray-600 mb-6">Enhance your dining experience by suggesting songs for the restaurant</p>
            <Button onClick={() => setMusicSelectorOpen(true)}>
              Open Music Selection
            </Button>
          </div>
        </TabsContent>

        {/* Service Tab */}
        <TabsContent value="service" className="flex-grow p-4 m-0">
          <div className="grid grid-cols-1 gap-6 py-6">
            <div className="bg-white rounded-lg p-6 shadow-sm text-center border">
              <Bell size={48} className="mx-auto text-primary mb-4" />
              <h3 className="text-lg font-bold mb-2">Call Waiter</h3>
              <p className="text-gray-600 mb-4">Request assistance from the restaurant staff</p>
              <Button 
                className="w-full"
                onClick={handleCallWaiter}
                disabled={serviceRequestMutation.isPending}
              >
                {serviceRequestMutation.isPending ? 'Sending request...' : 'Call Waiter'}
              </Button>
            </div>
            
            <div className="bg-white rounded-lg p-6 shadow-sm text-center border">
              <MessageSquare size={48} className="mx-auto text-primary mb-4" />
              <h3 className="text-lg font-bold mb-2">Special Request</h3>
              <p className="text-gray-600 mb-4">Send a specific request to the restaurant staff</p>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={handleSpecialRequest}
              >
                Make Special Request
              </Button>
            </div>
          </div>
        </TabsContent>

        {/* Bill Tab */}
        <TabsContent value="bill" className="flex-grow p-4 m-0">
          <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
            <h3 className="text-lg font-bold mb-4">Your Order</h3>
            
            {orderItems.length > 0 ? (
              <div className="space-y-4">
                {orderItems.map(({ item, quantity }) => (
                  <div key={item.id} className="flex items-center justify-between border-b pb-4">
                    <div className="flex items-center">
                      <div className="w-16 h-16 rounded-md overflow-hidden mr-3">
                        <img 
                          src={item.image} 
                          alt={item.name} 
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <h4 className="font-medium">{item.name}</h4>
                        <div className="flex items-center mt-1">
                          <span className="text-sm text-gray-600">Qty: {quantity}</span>
                          <span className="mx-2 text-gray-300">|</span>
                          <span className="text-sm text-primary font-medium">${(item.price * quantity).toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                    <button 
                      className="text-gray-500 hover:text-red-500"
                      onClick={() => handleRemoveItem(item.id)}
                    >
                      <i className="fas fa-times"></i>
                    </button>
                  </div>
                ))}
                
                <div className="border-t pt-4">
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-medium">
                      ${orderItems.reduce((acc, { item, quantity }) => acc + (item.price * quantity), 0).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-600">Service fee</span>
                    <span className="font-medium">$2.00</span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-600">Tax</span>
                    <span className="font-medium">
                      ${(orderItems.reduce((acc, { item, quantity }) => acc + (item.price * quantity), 0) * 0.1).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between font-bold text-lg mt-4">
                    <span>Total</span>
                    <span>
                      ${(
                        orderItems.reduce((acc, { item, quantity }) => acc + (item.price * quantity), 0) * 1.1 + 2
                      ).toFixed(2)}
                    </span>
                  </div>
                </div>
                
                <Button 
                  className="w-full mt-4"
                  onClick={handlePlaceOrder}
                  disabled={orderMutation.isPending}
                >
                  {orderMutation.isPending ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Processing...
                    </div>
                  ) : (
                    <div className="flex items-center justify-center">
                      <ShoppingCart className="mr-2" size={18} />
                      Place Order
                    </div>
                  )}
                </Button>
              </div>
            ) : (
              <div className="text-center py-6">
                <p className="text-gray-500">Your order is empty</p>
                <Button 
                  variant="link" 
                  className="mt-2"
                  onClick={() => setActiveTab('menu')}
                >
                  Browse Menu
                </Button>
              </div>
            )}
          </div>
          
          <div className="text-sm text-gray-500 text-center">
            <p>Payment will be processed by the restaurant.</p>
            <p>You can also request the bill from your waiter.</p>
          </div>
        </TabsContent>
      </Tabs>

      {/* Action Buttons */}
      <div className="px-4 py-3 bg-gray-50 border-t grid grid-cols-3 gap-3">
        <button 
          className="flex flex-col items-center text-gray-700 hover:text-primary"
          onClick={handleCallWaiter}
        >
          <Bell className="mb-1" size={20} />
          <span className="text-xs">Call Waiter</span>
        </button>
        <button 
          className="flex flex-col items-center text-gray-700 hover:text-primary"
          onClick={() => setMusicSelectorOpen(true)}
        >
          <Music className="mb-1" size={20} />
          <span className="text-xs">Request Music</span>
        </button>
        <button 
          className="flex flex-col items-center text-gray-700 hover:text-primary"
          onClick={handleSpecialRequest}
        >
          <MessageSquare className="mb-1" size={20} />
          <span className="text-xs">Special Request</span>
        </button>
      </div>
      
      {musicSelectorOpen && (
        <MusicSelector 
          restaurantId={table?.restaurantId || 0} 
          onClose={() => setMusicSelectorOpen(false)} 
        />
      )}
    </div>
  );
};

export default TableExperience;
