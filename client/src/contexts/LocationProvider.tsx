import { ReactNode, useState, useEffect } from 'react';
import { LocationContext } from './LocationContext';
import { getCurrentLocation } from '@/lib/locationService';

interface LocationProviderProps {
  children: ReactNode;
}

export const LocationProvider = ({ children }: LocationProviderProps) => {
  const [location, setLocation] = useState<string | null>(null);
  const [coordinates, setCoordinates] = useState<{
    latitude: number | null;
    longitude: number | null;
  }>({
    latitude: null,
    longitude: null,
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  // Try to get location from local storage on initial load
  useEffect(() => {
    const savedLocation = localStorage.getItem('location');
    const savedLatitude = localStorage.getItem('latitude');
    const savedLongitude = localStorage.getItem('longitude');

    if (savedLocation) {
      setLocation(savedLocation);
    }

    if (savedLatitude && savedLongitude) {
      setCoordinates({
        latitude: parseFloat(savedLatitude),
        longitude: parseFloat(savedLongitude),
      });
    } else {
      // If no coordinates are saved, try to get the user's location
      getUserLocation();
    }
  }, []);

  const getUserLocation = async (): Promise<void> => {
    setLoading(true);
    setError(null);

    try {
      const { coords, address } = await getCurrentLocation();
      
      setCoordinates({
        latitude: coords.latitude,
        longitude: coords.longitude,
      });

      // Save to local storage
      localStorage.setItem('latitude', coords.latitude.toString());
      localStorage.setItem('longitude', coords.longitude.toString());

      // If we don't have a location name yet, we'll use reverse geocoding
      if (!location) {
        const locationName = address || 'Current Location';
        setLocation(locationName);
        localStorage.setItem('location', locationName);
      }
    } catch (error) {
      console.error('Error getting location:', error);
      setError('Unable to get your location. Please enable location services or enter your location manually.');
    } finally {
      setLoading(false);
    }
  };

  const updateLocation = (
    locationName: string,
    newCoordinates?: { latitude: number; longitude: number }
  ): void => {
    setLocation(locationName);
    localStorage.setItem('location', locationName);

    if (newCoordinates) {
      setCoordinates({
        latitude: newCoordinates.latitude,
        longitude: newCoordinates.longitude,
      });
      localStorage.setItem('latitude', newCoordinates.latitude.toString());
      localStorage.setItem('longitude', newCoordinates.longitude.toString());
    }
  };

  const setLocationModalOpen = (open: boolean): void => {
    setIsModalOpen(open);
  };

  return (
    <LocationContext.Provider value={{
      location,
      coordinates,
      loading,
      error,
      setLocationModalOpen,
      updateLocation,
      getUserLocation,
    }}>
      {children}
    </LocationContext.Provider>
  );
};