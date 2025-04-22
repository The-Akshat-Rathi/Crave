import { useQuery } from '@tanstack/react-query';
import { Restaurant } from '@/lib/types';
import { useLocation } from './useLocation';

export const useRestaurants = (options?: { limit?: number }) => {
  const { coordinates } = useLocation();
  
  const { data, isLoading, error } = useQuery<Restaurant[]>({
    queryKey: [
      '/api/restaurants', 
      coordinates ? { latitude: coordinates[0], longitude: coordinates[1] } : undefined
    ],
    enabled: true,
  });
  
  const restaurants = options?.limit && data ? data.slice(0, options.limit) : data;
  
  return {
    restaurants,
    isLoading,
    error,
  };
};
