// Servicio de geolocalización para obtener ubicación del cliente

interface Coordinates {
  latitude: number;
  longitude: number;
}

interface Address {
  formatted: string;
  street?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
}

class GeolocationService {
  /**
   * Obtiene la ubicación actual del dispositivo
   */
  async getCurrentPosition(): Promise<Coordinates> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocalización no soportada en este navegador'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
        },
        (error) => {
          let errorMessage = 'Error al obtener ubicación';

          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = 'Permiso de ubicación denegado. Por favor, permite el acceso a tu ubicación.';
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = 'Ubicación no disponible. Verifica tu conexión GPS.';
              break;
            case error.TIMEOUT:
              errorMessage = 'Tiempo de espera agotado al obtener ubicación.';
              break;
          }

          reject(new Error(errorMessage));
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      );
    });
  }

  /**
   * Convierte coordenadas GPS a dirección legible usando OpenStreetMap (Nominatim)
   * Es gratuito y no requiere API key
   */
  async reverseGeocode(lat: number, lon: number): Promise<Address> {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=18&addressdetails=1`,
        {
          headers: {
            'User-Agent': 'AguaPiatuaApp/1.0'
          }
        }
      );

      if (!response.ok) {
        throw new Error('Error al obtener dirección');
      }

      const data = await response.json();

      if (!data || data.error) {
        throw new Error('No se pudo obtener la dirección');
      }

      // Extraer componentes de la dirección
      const address = data.address || {};
      const road = address.road || address.street || '';
      const houseNumber = address.house_number || '';
      const neighbourhood = address.neighbourhood || address.suburb || '';
      const city = address.city || address.town || address.village || '';
      const state = address.state || '';
      const country = address.country || '';
      const postalCode = address.postcode || '';

      // Construir dirección formateada en español
      let formatted = '';

      if (road) {
        formatted += road;
        if (houseNumber) formatted += ` ${houseNumber}`;
      }

      if (neighbourhood && neighbourhood !== road) {
        formatted += formatted ? `, ${neighbourhood}` : neighbourhood;
      }

      if (city) {
        formatted += formatted ? `, ${city}` : city;
      }

      if (state && state !== city) {
        formatted += formatted ? `, ${state}` : state;
      }

      // Si no se pudo construir una dirección, usar display_name
      if (!formatted) {
        formatted = data.display_name || 'Dirección no disponible';
      }

      return {
        formatted,
        street: road && houseNumber ? `${road} ${houseNumber}` : road,
        city,
        state,
        country,
        postalCode
      };
    } catch (error: any) {
      console.error('Error en reverseGeocode:', error);
      throw new Error('No se pudo obtener la dirección. Intenta de nuevo.');
    }
  }

  /**
   * Obtiene la ubicación actual y la convierte a dirección
   */
  async getCurrentAddress(): Promise<{ coordinates: Coordinates; address: Address }> {
    try {
      console.log('📍 Obteniendo ubicación actual...');
      const coordinates = await this.getCurrentPosition();

      console.log('🗺️ Convirtiendo coordenadas a dirección...');
      const address = await this.reverseGeocode(coordinates.latitude, coordinates.longitude);

      console.log('✅ Dirección obtenida:', address.formatted);

      return { coordinates, address };
    } catch (error: any) {
      console.error('❌ Error al obtener dirección actual:', error);
      throw error;
    }
  }

  /**
   * Verifica si el navegador soporta geolocalización
   */
  isSupported(): boolean {
    return 'geolocation' in navigator;
  }
}

export default new GeolocationService();
