import { createContext } from 'react';

interface LocationContextType {
  location: string | null;
  coordinates: {
    latitude: number | null;
    longitude: number | null;
  };
  loading: boolean;
  error: string | null;
  setLocationModalOpen: (open: boolean) => void;
  updateLocation: (location: string, coordinates?: { latitude: number; longitude: number }) => void;
  getUserLocation: () => Promise<void>;
}

export const LocationContext = createContext<LocationContextType>({
  location: null,
  coordinates: {
    latitude: null,
    longitude: null,
  },
  loading: false,
  error: null,
  setLocationModalOpen: () => {},
  updateLocation: () => {},
  getUserLocation: async () => {},
});