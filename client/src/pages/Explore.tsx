import { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import MapView from '@/components/MapView';
import RestaurantList from '@/components/RestaurantList';
import { useLocation } from '@/hooks/useLocation';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Search, Filter, MapPin } from 'lucide-react';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import {
  Slider
} from "@/components/ui/slider";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';

const Explore = () => {
  const { user } = useAuth();
  const { location, setLocationModalOpen } = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    radius: 10,
    cuisines: [] as string[],
    priceRange: [] as string[],
    features: [] as string[],
  });
  
  const cuisineOptions = [
    'Italian',
    'Indian',
    'Chinese',
    'Japanese',
    'Mexican',
    'Thai',
    'Mediterranean',
    'American',
    'French',
    'Seafood',
  ];
  
  const priceOptions = [
    { label: '$', value: '$' },
    { label: '$$', value: '$$' },
    { label: '$$$', value: '$$$' },
    { label: '$$$$', value: '$$$$' },
  ];
  
  const featureOptions = [
    { label: 'Outdoor Seating', value: 'outdoor_seating' },
    { label: 'Serves Alcohol', value: 'serves_alcohol' },
    { label: 'Live Music', value: 'live_music' },
    { label: 'Parking', value: 'parking' },
    { label: 'WiFi', value: 'wifi' },
    { label: 'Takes Reservations', value: 'reservations' },
    { label: 'Wheelchair Accessible', value: 'wheelchair_accessible' },
    { label: 'Pure Veg', value: 'pure_veg' },
  ];
  
  const handleCuisineToggle = (cuisine: string) => {
    if (filters.cuisines.includes(cuisine)) {
      setFilters({
        ...filters,
        cuisines: filters.cuisines.filter(c => c !== cuisine),
      });
    } else {
      setFilters({
        ...filters,
        cuisines: [...filters.cuisines, cuisine],
      });
    }
  };
  
  const handlePriceToggle = (price: string) => {
    if (filters.priceRange.includes(price)) {
      setFilters({
        ...filters,
        priceRange: filters.priceRange.filter(p => p !== price),
      });
    } else {
      setFilters({
        ...filters,
        priceRange: [...filters.priceRange, price],
      });
    }
  };
  
  const handleFeatureToggle = (feature: string) => {
    if (filters.features.includes(feature)) {
      setFilters({
        ...filters,
        features: filters.features.filter(f => f !== feature),
      });
    } else {
      setFilters({
        ...filters,
        features: [...filters.features, feature],
      });
    }
  };
  
  const handleRadiusChange = (value: number[]) => {
    setFilters({
      ...filters,
      radius: value[0],
    });
  };
  
  const clearFilters = () => {
    setFilters({
      radius: 10,
      cuisines: [],
      priceRange: [],
      features: [],
    });
  };
  
  return (
    <Layout>
      {/* Search & Filter Header */}
      <div className="sticky top-[65px] lg:top-[73px] z-10 bg-white shadow-sm p-4 border-b">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-4">
          <div className="relative w-full lg:w-1/2">
            <Input
              placeholder="Search for restaurants, cuisines..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Search className="absolute left-3 top-3 text-gray-400" size={16} />
          </div>
          
          <div className="flex items-center w-full lg:w-auto justify-between gap-3">
            <Button 
              variant="outline" 
              className="flex items-center gap-2"
              onClick={() => setLocationModalOpen(true)}
            >
              <MapPin size={16} />
              <span className="hidden sm:inline">{location || 'Set location'}</span>
            </Button>
            
            <Drawer>
              <DrawerTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2">
                  <Filter size={16} />
                  <span>Filters</span>
                </Button>
              </DrawerTrigger>
              <DrawerContent>
                <div className="mx-auto w-full max-w-lg">
                  <DrawerHeader>
                    <DrawerTitle>Filters</DrawerTitle>
                    <DrawerDescription>Adjust search filters to find the perfect restaurant</DrawerDescription>
                  </DrawerHeader>
                  
                  <div className="p-4 space-y-6">
                    {/* Distance Slider */}
                    <div>
                      <Label className="text-base font-medium">Distance</Label>
                      <div className="pt-4">
                        <Slider
                          defaultValue={[filters.radius]}
                          max={50}
                          min={1}
                          step={1}
                          onValueChange={handleRadiusChange}
                        />
                        <div className="flex justify-between mt-2 text-sm text-gray-500">
                          <span>1 km</span>
                          <span>{filters.radius} km</span>
                          <span>50 km</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Price Range */}
                    <div>
                      <Label className="text-base font-medium">Price Range</Label>
                      <div className="flex gap-3 mt-3">
                        {priceOptions.map(option => (
                          <Button
                            key={option.value}
                            type="button"
                            variant={filters.priceRange.includes(option.value) ? "default" : "outline"}
                            className="flex-1"
                            onClick={() => handlePriceToggle(option.value)}
                          >
                            {option.label}
                          </Button>
                        ))}
                      </div>
                    </div>
                    
                    {/* Cuisines */}
                    <div>
                      <Label className="text-base font-medium">Cuisines</Label>
                      <div className="grid grid-cols-2 gap-3 mt-3">
                        {cuisineOptions.map(cuisine => (
                          <div key={cuisine} className="flex items-center space-x-2">
                            <Checkbox 
                              id={`cuisine-${cuisine}`}
                              checked={filters.cuisines.includes(cuisine)}
                              onCheckedChange={() => handleCuisineToggle(cuisine)}
                            />
                            <label 
                              htmlFor={`cuisine-${cuisine}`}
                              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                              {cuisine}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    {/* Features */}
                    <div>
                      <Label className="text-base font-medium">Features</Label>
                      <div className="grid grid-cols-2 gap-3 mt-3">
                        {featureOptions.map(feature => (
                          <div key={feature.value} className="flex items-center space-x-2">
                            <Checkbox 
                              id={`feature-${feature.value}`}
                              checked={filters.features.includes(feature.value)}
                              onCheckedChange={() => handleFeatureToggle(feature.value)}
                            />
                            <label 
                              htmlFor={`feature-${feature.value}`}
                              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                              {feature.label}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <DrawerFooter>
                    <Button>Apply Filters</Button>
                    <Button variant="outline" onClick={clearFilters}>
                      Clear Filters
                    </Button>
                    <DrawerClose asChild>
                      <Button variant="ghost">Cancel</Button>
                    </DrawerClose>
                  </DrawerFooter>
                </div>
              </DrawerContent>
            </Drawer>
          </div>
        </div>
      </div>
      
      {/* Map and Restaurant List */}
      <MapView />
      <RestaurantList />
    </Layout>
  );
};

export default Explore;
