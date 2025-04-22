import { useState, useEffect } from 'react';

interface LocationCoordinates {
  latitude: number | null;
  longitude: number | null;
}

export function useLocation() {
  const [coordinates, setCoordinates] = useState<LocationCoordinates>({
    latitude: null,
    longitude: null,
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const getUserLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      return;
    }

    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCoordinates({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
        setLoading(false);
        setError(null);
      },
      (error) => {
        setError(`Unable to retrieve your location: ${error.message}`);
        // Fall back to default location (New York City)
        setCoordinates({
          latitude: 40.7128,
          longitude: -74.0060,
        });
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
    );
  };

  // Get location when the hook is initialized
  useEffect(() => {
    getUserLocation();
  }, []);

  return { coordinates, error, loading, getUserLocation };
}