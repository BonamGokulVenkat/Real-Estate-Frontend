import { useState, useEffect } from 'react';
import Cookies from 'js-cookie';

interface LocationState {
  latitude: number | null;
  longitude: number | null;
  city: string | null;
  error: string | null;
  isLoading: boolean;
}

const LOCATION_COOKIE_KEY = 'luxora_user_location';

export const useLocation = () => {
  const [location, setLocation] = useState<LocationState>({
    latitude: null,
    longitude: null,
    city: null,
    error: null,
    isLoading: true,
  });

  useEffect(() => {
    // Check if location is already in cookies
    const storedLocationStr = Cookies.get(LOCATION_COOKIE_KEY);
    if (storedLocationStr) {
      try {
        const storedLocation = JSON.parse(storedLocationStr);
        setLocation({ ...storedLocation, isLoading: false, error: null });
        return;
      } catch (e) {
        console.error("Failed to parse stored location", e);
      }
    }

    if (!navigator.geolocation) {
      setLocation(prev => ({ ...prev, isLoading: false, error: 'Geolocation is not supported by your browser' }));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        let city = null;
        
        try {
          // Reverse geocoding using free map portal (Nominatim OpenStreetMap)
          const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10&addressdetails=1`, {
            headers: {
              'Accept-Language': 'en-US,en;q=0.9'
            }
          });
          const data = await response.json();
          city = data.address?.city || data.address?.town || data.address?.village || data.address?.county || null;
        } catch (err) {
          console.error("Failed to reverse geocode:", err);
        }

        const newLocation = { latitude, longitude, city, isLoading: false, error: null };
        setLocation(newLocation);
        Cookies.set(LOCATION_COOKIE_KEY, JSON.stringify(newLocation), { expires: 7 }); // Store for 7 days
      },
      (error) => {
        setLocation(prev => ({ 
          ...prev, 
          isLoading: false, 
          error: error.message 
        }));
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 3600000 }
    );
  }, []);

  return location;
};
