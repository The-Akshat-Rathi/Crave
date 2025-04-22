import { createContext, useState, useEffect, ReactNode } from 'react';
import { getCurrentLocation, searchLocations, LocationData } from '../lib/locationService';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MapPin, Search, Loader2 } from 'lucide-react';

interface LocationContextType {
  location: string | null;
  coordinates: [number, number] | null;
  setLocation: (location: string, coordinates: [number, number]) => void;
  userLocation: [number, number] | null;
  isLocating: boolean;
  getGeoLocation: () => Promise<void>;
  locationModalOpen: boolean;
  setLocationModalOpen: (open: boolean) => void;
}

export const LocationContext = createContext<LocationContextType>({
  location: null,
  coordinates: null,
  setLocation: () => {},
  userLocation: null,
  isLocating: false,
  getGeoLocation: async () => {},
  locationModalOpen: false,
  setLocationModalOpen: () => {},
});

interface LocationProviderProps {
  children: ReactNode;
}

export const LocationProvider = ({ children }: LocationProviderProps) => {
  const [location, setLocationName] = useState<string | null>(null);
  const [coordinates, setCoordinates] = useState<[number, number] | null>(null);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [locationModalOpen, setLocationModalOpen] = useState(false);
  const [searchResults, setSearchResults] = useState<LocationData[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  // Load saved location from localStorage on mount
  useEffect(() => {
    const savedLocation = localStorage.getItem('crave_location');
    const savedCoordinates = localStorage.getItem('crave_coordinates');
    
    if (savedLocation) {
      setLocationName(savedLocation);
    }
    
    if (savedCoordinates) {
      setCoordinates(JSON.parse(savedCoordinates));
    }
  }, []);

  const setLocation = (locationName: string, locationCoords: [number, number]) => {
    setLocationName(locationName);
    setCoordinates(locationCoords);
    localStorage.setItem('crave_location', locationName);
    localStorage.setItem('crave_coordinates', JSON.stringify(locationCoords));
    setLocationModalOpen(false);
  };

  const getGeoLocation = async () => {
    setIsLocating(true);
    try {
      const { coords, address } = await getCurrentLocation();
      setUserLocation([coords.latitude, coords.longitude]);
      
      if (address) {
        setLocation(address, [coords.latitude, coords.longitude]);
      }
    } catch (error) {
      console.error("Error getting location:", error);
    } finally {
      setIsLocating(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    try {
      const results = await searchLocations(searchQuery);
      setSearchResults(results);
    } catch (error) {
      console.error("Error searching locations:", error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  // Handle location search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery) {
        handleSearch();
      } else {
        setSearchResults([]);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  return (
    <LocationContext.Provider
      value={{
        location,
        coordinates,
        setLocation,
        userLocation,
        isLocating,
        getGeoLocation,
        locationModalOpen,
        setLocationModalOpen,
      }}
    >
      {children}
      
      {/* Location Selection Modal */}
      <Dialog open={locationModalOpen} onOpenChange={setLocationModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Set Your Location</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <Button 
              variant="outline"
              className="w-full justify-start"
              onClick={getGeoLocation}
              disabled={isLocating}
            >
              {isLocating ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <MapPin className="mr-2 h-4 w-4" />
              )}
              Use current location
            </Button>
            
            <div className="relative">
              <Input
                placeholder="Search for a location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            </div>
            
            {isSearching && (
              <div className="flex justify-center py-2">
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
              </div>
            )}
            
            {searchResults.length > 0 && (
              <div className="max-h-60 overflow-y-auto border rounded-md">
                {searchResults.map((result, index) => (
                  <Button
                    key={index}
                    variant="ghost"
                    className="w-full justify-start text-left"
                    onClick={() => setLocation(result.display_name, [result.lat, result.lon])}
                  >
                    <MapPin className="mr-2 h-4 w-4" />
                    <span className="line-clamp-1">{result.display_name}</span>
                  </Button>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </LocationContext.Provider>
  );
};
