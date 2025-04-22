import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { queryClient, apiRequest } from '@/lib/queryClient';
import Layout from '@/components/Layout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Reservation, Order } from '@/lib/types';
import { format } from 'date-fns';
import { Wallet, LogOut, User, Clock, CalendarRange } from 'lucide-react';

const ProfilePage = () => {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('profile');
  
  // Redirect to home if not logged in
  if (!user) {
    window.location.href = '/';
    return null;
  }
  
  // Fetch user reservations
  const { data: reservations, isLoading: isLoadingReservations } = useQuery<Reservation[]>({
    queryKey: [`/api/users/${user.id}/reservations`],
    enabled: !!user?.id,
  });
  
  // Fetch user orders
  const { data: orders, isLoading: isLoadingOrders } = useQuery<Order[]>({
    queryKey: [`/api/users/${user.id}/orders`],
    enabled: !!user?.id,
  });
  
  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (data: Partial<typeof user>) => {
      const response = await apiRequest('PATCH', `/api/users/${user.id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/users/${user.id}`] });
      toast({
        title: 'Profile updated',
        description: 'Your profile has been updated successfully.',
      });
    },
  });
  
  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const name = form.name.value;
    const email = form.email.value;
    
    if (name && email) {
      updateProfileMutation.mutate({ name, email });
    }
  };
  
  const handleDisconnectWallet = () => {
    toast({
      title: 'Wallet disconnected',
      description: 'Your wallet has been disconnected.',
    });
  };
  
  return (
    <Layout>
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">My Profile</h1>
            <Button variant="outline" onClick={logout}>
              <LogOut className="mr-2" size={16} />
              Logout
            </Button>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="flex items-center p-6 bg-gradient-to-r from-primary to-blue-600 text-white">
              <Avatar className="w-16 h-16 border-2 border-white">
                <AvatarImage src={user.profileImg} alt={user.name} />
                <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="ml-4">
                <h2 className="text-xl font-bold">{user.name}</h2>
                <p className="opacity-90">{user.email}</p>
                <p className="text-sm opacity-75 mt-1 capitalize">{user.role.replace('_', ' ')}</p>
              </div>
            </div>
            
            <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
              <div className="border-b">
                <TabsList className="w-full justify-start rounded-none bg-transparent border-b">
                  <TabsTrigger 
                    value="profile" 
                    className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none bg-transparent"
                  >
                    <User className="mr-2" size={16} />
                    Profile
                  </TabsTrigger>
                  <TabsTrigger 
                    value="reservations" 
                    className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none bg-transparent"
                  >
                    <CalendarRange className="mr-2" size={16} />
                    Reservations
                  </TabsTrigger>
                  <TabsTrigger 
                    value="orders" 
                    className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none bg-transparent"
                  >
                    <Clock className="mr-2" size={16} />
                    Order History
                  </TabsTrigger>
                  <TabsTrigger 
                    value="wallet" 
                    className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none bg-transparent"
                  >
                    <Wallet className="mr-2" size={16} />
                    Wallet
                  </TabsTrigger>
                </TabsList>
              </div>
              
              <TabsContent value="profile" className="p-6">
                <form onSubmit={handleUpdateProfile}>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="name" className="text-right">
                        Name
                      </Label>
                      <Input
                        id="name"
                        name="name"
                        defaultValue={user.name}
                        className="col-span-3"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="email" className="text-right">
                        Email
                      </Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        defaultValue={user.email}
                        className="col-span-3"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="username" className="text-right">
                        Username
                      </Label>
                      <Input
                        id="username"
                        name="username"
                        defaultValue={user.username}
                        className="col-span-3"
                        disabled
                      />
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <Button type="submit" disabled={updateProfileMutation.isPending}>
                      {updateProfileMutation.isPending ? 'Saving...' : 'Save Changes'}
                    </Button>
                  </div>
                </form>
              </TabsContent>
              
              <TabsContent value="reservations" className="p-6">
                <h3 className="text-lg font-medium mb-4">Your Reservations</h3>
                
                {isLoadingReservations ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
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
                              <p className="font-medium">Restaurant:</p>
                              <p className="text-gray-600">Restaurant #{reservation.restaurantId}</p>
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
                          <Button variant="outline" className="mr-2">Modify</Button>
                          <Button variant="destructive">Cancel</Button>
                        </CardFooter>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 border rounded-lg bg-gray-50">
                    <CalendarRange className="mx-auto text-gray-400 mb-2" size={40} />
                    <p className="text-gray-500">You don't have any reservations yet</p>
                    <Button variant="link" className="mt-2">Explore Restaurants</Button>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="orders" className="p-6">
                <h3 className="text-lg font-medium mb-4">Your Order History</h3>
                
                {isLoadingOrders ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
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
                              <p className="font-medium">Restaurant:</p>
                              <p className="text-gray-600">Restaurant #{order.restaurantId}</p>
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
                          <Button variant="outline">View Details</Button>
                        </CardFooter>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 border rounded-lg bg-gray-50">
                    <Clock className="mx-auto text-gray-400 mb-2" size={40} />
                    <p className="text-gray-500">You don't have any orders yet</p>
                    <Button variant="link" className="mt-2">Explore Restaurants</Button>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="wallet" className="p-6">
                <h3 className="text-lg font-medium mb-4">Web3 Wallet</h3>
                
                {user.walletAddress ? (
                  <div>
                    <Card>
                      <CardHeader>
                        <CardTitle>Connected Wallet</CardTitle>
                        <CardDescription>Your wallet is connected to your Crave account</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="bg-gray-100 p-3 rounded-lg font-mono text-sm break-all">
                          {user.walletAddress}
                        </div>
                        <div className="mt-4 grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm text-gray-500">ETH Balance</p>
                            <p className="font-medium">1.245 ETH</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">CRAVE Tokens</p>
                            <p className="font-medium">250 CRAVE</p>
                          </div>
                        </div>
                      </CardContent>
                      <CardFooter>
                        <Button variant="outline" className="w-full" onClick={handleDisconnectWallet}>
                          Disconnect Wallet
                        </Button>
                      </CardFooter>
                    </Card>
                    
                    <div className="mt-6">
                      <h4 className="font-medium mb-3">Transaction History</h4>
                      <Card>
                        <CardContent className="p-0">
                          <div className="divide-y">
                            <div className="p-4 flex justify-between items-center">
                              <div>
                                <p className="font-medium">Payment to Seaside Grill</p>
                                <p className="text-sm text-gray-500">June 12, 2023</p>
                              </div>
                              <p className="font-medium text-red-500">-0.025 ETH</p>
                            </div>
                            <div className="p-4 flex justify-between items-center">
                              <div>
                                <p className="font-medium">Loyalty Reward</p>
                                <p className="text-sm text-gray-500">June 10, 2023</p>
                              </div>
                              <p className="font-medium text-green-500">+25 CRAVE</p>
                            </div>
                            <div className="p-4 flex justify-between items-center">
                              <div>
                                <p className="font-medium">Payment to Café Latte</p>
                                <p className="text-sm text-gray-500">June 5, 2023</p>
                              </div>
                              <p className="font-medium text-red-500">-0.015 ETH</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 border rounded-lg bg-gray-50">
                    <Wallet className="mx-auto text-gray-400 mb-2" size={40} />
                    <p className="text-gray-500 mb-4">Connect your wallet to enable Web3 features</p>
                    <Button>
                      <i className="fab fa-ethereum mr-2"></i> Connect MetaMask
                    </Button>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ProfilePage;
