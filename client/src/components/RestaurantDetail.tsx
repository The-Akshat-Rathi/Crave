import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Restaurant, MenuItem, Review } from '@/lib/types';
import TableBooking from './TableBooking';
import DishItem from './DishItem';
import ReviewItem from './ReviewItem';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/useAuth';
import { DialogClose } from '@/components/ui/dialog';
import { Heart, Calendar } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface RestaurantDetailProps {
  restaurantId: number;
  onClose: () => void;
}

const RestaurantDetail = ({ restaurantId, onClose }: RestaurantDetailProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  
  // Fetch restaurant details
  const { data: restaurant, isLoading: isLoadingRestaurant } = useQuery<Restaurant>({
    queryKey: [`/api/restaurants/${restaurantId}`],
  });
  
  // Fetch popular dishes
  const { data: popularDishes, isLoading: isLoadingDishes } = useQuery<MenuItem[]>({
    queryKey: [`/api/restaurants/${restaurantId}/popular-dishes`],
  });
  
  // Fetch reviews
  const { data: reviews, isLoading: isLoadingReviews } = useQuery<Review[]>({
    queryKey: [`/api/restaurants/${restaurantId}/reviews`],
  });
  
  const handleSaveRestaurant = () => {
    setIsFavorite(!isFavorite);
    toast({
      title: isFavorite ? "Removed from favorites" : "Added to favorites",
      description: isFavorite ? 
        "Restaurant has been removed from your favorites" : 
        "Restaurant has been added to your favorites",
      duration: 2000,
    });
  };
  
  const handleBookTable = () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please login to book a table",
        variant: "destructive",
      });
      return;
    }
    
    setBookingModalOpen(true);
  };
  
  if (isLoadingRestaurant) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  if (!restaurant) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-red-500">Restaurant not found</p>
      </div>
    );
  }
  
  return (
    <>
      <div className="bg-white h-full md:h-auto md:max-h-[90vh] w-full md:w-4/5 lg:w-3/5 md:mx-auto md:my-10 md:rounded-xl overflow-auto">
        {/* Close button */}
        <DialogClose className="absolute top-4 right-4 z-10 bg-white rounded-full p-2 shadow-md text-gray-500">
          <i className="fas fa-times"></i>
        </DialogClose>

        {/* Restaurant Header */}
        <div className="relative">
          <img 
            src={Array.isArray(restaurant.images) && restaurant.images.length > 0 ? restaurant.images[0] : "https://images.unsplash.com/photo-1514933651103-005eec06c04b"}
            alt={restaurant.name} 
            className="w-full h-64 md:h-80 object-cover"
          />
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6">
            <div className="flex justify-between items-end">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-white mb-1">{restaurant.name}</h1>
                <p className="text-white text-sm md:text-base">{restaurant.cuisine}</p>
              </div>
              <div className="flex flex-col items-end">
                <div className="flex items-center bg-white px-3 py-1 rounded-full mb-2">
                  <span className="text-green-700 font-semibold mr-1">{restaurant.rating || '4.7'}</span>
                  <i className="fas fa-star text-green-500 text-sm"></i>
                </div>
                <p className="text-white text-sm">{reviews?.length || '0'} reviews</p>
              </div>
            </div>
          </div>
        </div>

        {/* Restaurant Info */}
        <div className="px-6 py-5 border-b">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center space-x-6">
              <div className="flex items-center">
                <i className="fas fa-map-marker-alt text-primary mr-2"></i>
                <span className="text-gray-700">{restaurant.distance?.toFixed(1) || '1.5'} km away</span>
              </div>
              <div className="flex items-center">
                <i className="fas fa-clock text-primary mr-2"></i>
                <span className="text-gray-700">{restaurant.openingTime} - {restaurant.closingTime}</span>
              </div>
              <div className="flex items-center">
                <i className="fas fa-users text-primary mr-2"></i>
                <span className="text-red-500 font-medium">High crowd now</span>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button 
                className={`px-4 py-2 border ${isFavorite ? 'border-red-500 text-red-500' : 'border-primary text-primary'} rounded-full hover:bg-primary hover:text-white hover:border-primary transition-colors`}
                onClick={handleSaveRestaurant}
              >
                <Heart className={`mr-2 inline-block ${isFavorite ? 'fill-red-500' : ''}`} size={16} />
                {isFavorite ? 'Saved' : 'Save'}
              </button>
              <button 
                className="px-4 py-2 bg-primary text-white rounded-full hover:bg-secondary transition-colors"
                onClick={handleBookTable}
              >
                <Calendar className="mr-2 inline-block" size={16} />
                Book Table
              </button>
            </div>
          </div>
        </div>

        {/* Restaurant Tabs */}
        <Tabs defaultValue="overview" className="w-full">
          <div className="px-6 py-3 border-b bg-gray-50">
            <TabsList className="grid grid-cols-6 bg-transparent">
              <TabsTrigger value="overview" className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:shadow-none rounded-none bg-transparent">Overview</TabsTrigger>
              <TabsTrigger value="menu" className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:shadow-none rounded-none bg-transparent">Menu</TabsTrigger>
              <TabsTrigger value="reviews" className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:shadow-none rounded-none bg-transparent">Reviews</TabsTrigger>
              <TabsTrigger value="photos" className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:shadow-none rounded-none bg-transparent">Photos</TabsTrigger>
              <TabsTrigger value="music" className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:shadow-none rounded-none bg-transparent">Music</TabsTrigger>
              <TabsTrigger value="contact" className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:shadow-none rounded-none bg-transparent">Contact</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="overview" className="p-6 mt-0">
            {/* Famous Dishes */}
            <div className="mb-8">
              <h3 className="text-xl font-bold mb-4">Popular Dishes</h3>
              {isLoadingDishes ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {popularDishes?.map((dish) => (
                    <DishItem key={dish.id} dish={dish} />
                  ))}
                </div>
              )}
            </div>

            {/* About */}
            <div className="mb-8">
              <h3 className="text-xl font-bold mb-3">About</h3>
              <p className="text-gray-600">
                {restaurant.description}
              </p>
              <div className="mt-4 grid grid-cols-2 gap-2">
                {(restaurant.features as string[])?.map((feature, index) => (
                  <div key={index} className="flex items-center">
                    <i className="fas fa-check-circle text-primary mr-2"></i>
                    <span className="text-gray-700">{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Reviews */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold">Reviews</h3>
                <button className="text-primary font-medium">View All</button>
              </div>

              {isLoadingReviews ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : reviews && reviews.length > 0 ? (
                reviews.slice(0, 2).map((review) => (
                  <ReviewItem key={review.id} review={review} />
                ))
              ) : (
                <p className="text-gray-500 text-center py-4">No reviews yet</p>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="menu" className="mt-0">
            <div className="p-6">
              <h3 className="text-xl font-bold mb-4">Menu</h3>
              <p className="text-gray-500">Our full menu is available when you scan the QR code at the restaurant</p>
            </div>
          </TabsContent>
          
          <TabsContent value="reviews" className="mt-0">
            <div className="p-6">
              <h3 className="text-xl font-bold mb-4">Reviews</h3>
              {isLoadingReviews ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : reviews && reviews.length > 0 ? (
                reviews.map((review) => (
                  <ReviewItem key={review.id} review={review} />
                ))
              ) : (
                <p className="text-gray-500 text-center py-4">No reviews yet</p>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="photos" className="mt-0">
            <div className="p-6">
              <h3 className="text-xl font-bold mb-4">Photos</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {(restaurant.images as string[])?.map((image, index) => (
                  <div key={index} className="rounded-lg overflow-hidden h-40">
                    <img src={image} alt={`${restaurant.name} ${index + 1}`} className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="music" className="mt-0">
            <div className="p-6">
              <h3 className="text-xl font-bold mb-4">Music</h3>
              <p className="text-gray-500">Music features are available when you are dining in. Scan the QR code at your table to access this feature.</p>
            </div>
          </TabsContent>
          
          <TabsContent value="contact" className="mt-0">
            <div className="p-6">
              <h3 className="text-xl font-bold mb-4">Contact Information</h3>
              <div className="space-y-4">
                <div className="flex items-start">
                  <i className="fas fa-map-marker-alt text-primary mt-1 mr-3"></i>
                  <div>
                    <h4 className="font-medium">Address</h4>
                    <p className="text-gray-600">{restaurant.address}, {restaurant.city}</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <i className="fas fa-phone text-primary mt-1 mr-3"></i>
                  <div>
                    <h4 className="font-medium">Phone</h4>
                    <p className="text-gray-600">{restaurant.phone}</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <i className="fas fa-clock text-primary mt-1 mr-3"></i>
                  <div>
                    <h4 className="font-medium">Hours</h4>
                    <p className="text-gray-600">{restaurant.openingTime} - {restaurant.closingTime}, Daily</p>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
      
      {bookingModalOpen && (
        <TableBooking 
          restaurant={restaurant}
          onClose={() => setBookingModalOpen(false)}
        />
      )}
    </>
  );
};

export default RestaurantDetail;
