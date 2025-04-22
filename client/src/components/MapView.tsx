import { useState, useEffect } from 'react';
import { useLocation } from '@/hooks/useLocation';
import { useQuery } from '@tanstack/react-query';
import { RestaurantWithDistance } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Compass, MapPin, Plus, Minus } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface MapViewProps {
  compact?: boolean;
  restaurantId?: number;
  coordinates?: { lat: number; lng: number };
}

const MapView = ({ compact = false, restaurantId, coordinates }: MapViewProps) => {
  const { coordinates: userCoordinates, getUserLocation } = useLocation();
  const [zoom, setZoom] = useState(15);
  const [isLoaded, setIsLoaded] = useState(false);

  // Only fetch restaurants when needed
  const shouldFetchRestaurants = !restaurantId && userCoordinates.latitude !== null;
  const { data: restaurants } = useQuery({
    queryKey: ['/api/restaurants', userCoordinates.latitude, userCoordinates.longitude],
    enabled: shouldFetchRestaurants,
  });

  // When coordinates change or restaurant ID is provided, update map
  useEffect(() => {
    const initMap = () => {
      // For now, we'll display a mock map since we don't want to integrate 
      // with a real mapping service yet
      setTimeout(() => setIsLoaded(true), 1000);
    };

    if (userCoordinates.latitude || coordinates) {
      initMap();
    }
  }, [userCoordinates.latitude, userCoordinates.longitude, coordinates, restaurantId]);

  const handleZoomIn = () => {
    if (zoom < 20) setZoom(zoom + 1);
  };

  const handleZoomOut = () => {
    if (zoom > 10) setZoom(zoom - 1);
  };

  const handleRecenter = () => {
    getUserLocation();
  };

  // Loading state
  if (!isLoaded) {
    return (
      <div className={`relative w-full ${compact ? 'h-full' : 'h-[500px]'} bg-gray-100 flex items-center justify-center overflow-hidden`}>
        <Skeleton className="w-full h-full" />
      </div>
    );
  }

  // Render a mock map (to be replaced with a real map implementation)
  return (
    <div className={`relative w-full ${compact ? 'h-full' : 'h-[500px]'} bg-gray-100 overflow-hidden`}>
      {/* Mock map background */}
      <div className="absolute inset-0 bg-gray-200 grid grid-cols-8 grid-rows-8">
        {Array(64).fill(0).map((_, i) => (
          <div 
            key={i} 
            className={`border border-gray-300 ${i % 9 === 0 ? 'bg-gray-300' : ''}`}
          />
        ))}
      </div>
      
      {/* Draw user location */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
        <div className="w-8 h-8 bg-blue-500 rounded-full border-4 border-white shadow-md flex items-center justify-center">
          <div className="w-2 h-2 bg-white rounded-full" />
        </div>
        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-full mt-1 whitespace-nowrap bg-blue-600 text-white text-xs py-1 px-2 rounded">
          You are here
        </div>
      </div>
      
      {/* Mock restaurant pins */}
      {!restaurantId && restaurants && restaurants.map((restaurant: RestaurantWithDistance, index: number) => (
        <div 
          key={restaurant.id || index}
          className="absolute"
          style={{ 
            top: `${40 + (index * 5)}%`, 
            left: `${30 + (index * 7 % 50)}%`,
          }}
        >
          <MapPin className="h-6 w-6 text-primary fill-white" />
        </div>
      ))}
      
      {/* Map controls */}
      <div className="absolute top-4 right-4 flex flex-col gap-2">
        <Button size="icon" variant="secondary" onClick={handleZoomIn} className="bg-white text-gray-700 shadow-md">
          <Plus className="h-4 w-4" />
        </Button>
        <Button size="icon" variant="secondary" onClick={handleZoomOut} className="bg-white text-gray-700 shadow-md">
          <Minus className="h-4 w-4" />
        </Button>
        <Button size="icon" variant="secondary" onClick={handleRecenter} className="bg-white text-gray-700 shadow-md">
          <Compass className="h-4 w-4" />
        </Button>
      </div>
      
      {/* Attribution */}
      <div className="absolute bottom-1 right-1 text-xs text-gray-500 bg-white/80 px-1 rounded">
        Map data © Crave
      </div>
    </div>
  );
};

export default MapView;