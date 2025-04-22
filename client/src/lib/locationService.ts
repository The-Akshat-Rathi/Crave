export interface LocationData {
  lat: number;
  lon: number;
  display_name: string;
}

/**
 * Gets the current location using the browser's Geolocation API
 * and converts coordinates to address using reverse geocoding
 */
export const getCurrentLocation = async (): Promise<{
  coords: GeolocationCoordinates;
  address: string | null;
}> => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation is not supported by this browser."));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const address = await reverseGeocode(
            position.coords.latitude,
            position.coords.longitude
          );
          resolve({ coords: position.coords, address });
        } catch (error) {
          resolve({ coords: position.coords, address: null });
        }
      },
      (error) => {
        reject(error);
      }
    );
  });
};

/**
 * Convert coordinates to an address using OpenStreetMap Nominatim API
 */
export const reverseGeocode = async (
  latitude: number,
  longitude: number
): Promise<string> => {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`,
      {
        headers: {
          "Accept-Language": "en-US,en;q=0.9",
          "User-Agent": "Crave Restaurant App",
        },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to reverse geocode");
    }

    const data = await response.json();
    
    // Extract city or neighborhood for display
    const city = data.address.city || 
                 data.address.town || 
                 data.address.village || 
                 data.address.suburb ||
                 data.address.county;
                 
    if (city) {
      return `${city}, ${data.address.state || data.address.country}`;
    }
    
    return data.display_name;
  } catch (error) {
    console.error("Error in reverse geocoding:", error);
    throw error;
  }
};

/**
 * Search for locations using OpenStreetMap Nominatim API
 */
export const searchLocations = async (query: string): Promise<LocationData[]> => {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&addressdetails=1`,
      {
        headers: {
          "Accept-Language": "en-US,en;q=0.9",
          "User-Agent": "Crave Restaurant App",
        },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to search locations");
    }

    const data = await response.json();
    return data.map((item: any) => ({
      lat: parseFloat(item.lat),
      lon: parseFloat(item.lon),
      display_name: item.display_name,
    }));
  } catch (error) {
    console.error("Error searching locations:", error);
    throw error;
  }
};

/**
 * Calculate distance between two coordinates in kilometers
 */
export const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) *
      Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c; // Distance in km
  return d;
};

const deg2rad = (deg: number): number => {
  return deg * (Math.PI / 180);
};
