import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import RestaurantCard from './RestaurantCard';
import { RestaurantWithDistance } from '@/lib/types';
import { useLocation } from '@/hooks/useLocation';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { ArrowUpDown, MapPin, Star, Flame, Clock, Filter } from 'lucide-react';

interface RestaurantListProps {
  viewType?: 'list' | 'grid';
  maxItems?: number;
  showFilters?: boolean;
}

const RestaurantList = ({ 
  viewType = 'grid', 
  maxItems,
  showFilters = true 
}: RestaurantListProps) => {
  const { coordinates } = useLocation();
  const [sortBy, setSortBy] = useState<'distance' | 'rating' | 'popular'>('distance');
  const [maxDistance, setMaxDistance] = useState<number>(10); // in kilometers
  const [selectedCuisines, setSelectedCuisines] = useState<string[]>([]);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Fetch restaurants
  const { data: restaurants, isLoading, error } = useQuery({
    queryKey: ['/api/restaurants', coordinates.latitude, coordinates.longitude, maxDistance, sortBy],
    enabled: coordinates.latitude !== null && coordinates.longitude !== null,
  });

  // Filter restaurants by selected cuisines
  const filteredRestaurants = (restaurants || []).filter((restaurant: RestaurantWithDistance) => {
    if (selectedCuisines.length === 0) return true;
    // Handle cuisine as a string, not an array
    return selectedCuisines.includes(restaurant.cuisine);
  });

  // Only show max items if specified
  const displayedRestaurants = maxItems 
    ? filteredRestaurants.slice(0, maxItems) 
    : filteredRestaurants;

  const renderSkeleton = () => {
    const count = viewType === 'grid' ? 8 : 4;
    return Array(count).fill(0).map((_, index) => (
      <div key={index} className="flex flex-col gap-2">
        <Skeleton className={`w-full ${viewType === 'grid' ? 'h-40' : 'h-32'} rounded-md`} />
        <Skeleton className="h-5 w-2/3 rounded-md" />
        <Skeleton className="h-4 w-1/2 rounded-md" />
        <div className="flex gap-2">
          <Skeleton className="h-4 w-16 rounded-md" />
          <Skeleton className="h-4 w-16 rounded-md" />
        </div>
      </div>
    ));
  };

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500">Error loading restaurants. Please try again later.</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      {showFilters && (
        <>
          {/* Desktop filters */}
          <div className="hidden md:flex flex-col gap-6 mb-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold">Restaurants near you</h2>
              <div className="flex items-center">
                <Label htmlFor="distance-filter" className="mr-2 text-sm">Max Distance: {maxDistance} km</Label>
                <Slider
                  id="distance-filter" 
                  min={1} 
                  max={20} 
                  step={1} 
                  value={[maxDistance]} 
                  onValueChange={(value) => setMaxDistance(value[0])} 
                  className="w-40"
                />
              </div>
            </div>
            
            <Tabs defaultValue={sortBy} onValueChange={(value) => setSortBy(value as 'distance' | 'rating' | 'popular')}>
              <TabsList className="grid grid-cols-3 w-60">
                <TabsTrigger value="distance" className="flex items-center justify-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5" />
                  <span>Distance</span>
                </TabsTrigger>
                <TabsTrigger value="rating" className="flex items-center justify-center gap-1.5">
                  <Star className="h-3.5 w-3.5" />
                  <span>Rating</span>
                </TabsTrigger>
                <TabsTrigger value="popular" className="flex items-center justify-center gap-1.5">
                  <Flame className="h-3.5 w-3.5" />
                  <span>Popular</span>
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
          
          {/* Mobile filters toggle */}
          <div className="md:hidden flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold">Restaurants near you</h2>
            <Button 
              size="sm" 
              variant="outline" 
              onClick={() => setShowMobileFilters(!showMobileFilters)}
              className="flex items-center gap-1"
            >
              <Filter className="h-4 w-4" />
              <span>Filters</span>
            </Button>
          </div>
          
          {/* Mobile filters */}
          {showMobileFilters && (
            <div className="md:hidden flex flex-col gap-4 p-4 mb-4 bg-gray-50 rounded-lg">
              <div className="flex flex-col gap-2">
                <Label htmlFor="mobile-distance-filter" className="text-sm">Max Distance: {maxDistance} km</Label>
                <Slider
                  id="mobile-distance-filter" 
                  min={1} 
                  max={20} 
                  step={1} 
                  value={[maxDistance]} 
                  onValueChange={(value) => setMaxDistance(value[0])} 
                />
              </div>
              
              <Tabs defaultValue={sortBy} onValueChange={(value) => setSortBy(value as 'distance' | 'rating' | 'popular')}>
                <TabsList className="grid grid-cols-3 w-full">
                  <TabsTrigger value="distance" className="flex items-center justify-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5" />
                    <span>Distance</span>
                  </TabsTrigger>
                  <TabsTrigger value="rating" className="flex items-center justify-center gap-1.5">
                    <Star className="h-3.5 w-3.5" />
                    <span>Rating</span>
                  </TabsTrigger>
                  <TabsTrigger value="popular" className="flex items-center justify-center gap-1.5">
                    <Flame className="h-3.5 w-3.5" />
                    <span>Popular</span>
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          )}
        </>
      )}
      
      {/* Restaurant cards */}
      <div 
        className={`
          grid gap-4 
          ${viewType === 'grid' 
            ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
            : 'grid-cols-1'
          }
        `}
      >
        {isLoading ? (
          renderSkeleton()
        ) : displayedRestaurants.length > 0 ? (
          displayedRestaurants.map((restaurant: RestaurantWithDistance) => (
            <RestaurantCard 
              key={restaurant.id} 
              restaurant={restaurant} 
              variant={viewType === 'list' ? 'compact' : 'default'}
            />
          ))
        ) : (
          <div className="col-span-full text-center py-8">
            <p className="text-gray-500">No restaurants found. Try adjusting your filters.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RestaurantList;