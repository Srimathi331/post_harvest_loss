import React, { useState, useRef, useEffect } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { FaMapMarkedAlt, FaSyncAlt, FaCrosshairs, FaCheckCircle, FaSearch } from 'react-icons/fa';

// Fix default marker icon paths broken by webpack
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

const WorkingLeafletMap = ({ onLocationSelect, initialLat, initialLng }) => {
  const [latitude, setLatitude] = useState(initialLat || '');
  const [longitude, setLongitude] = useState(initialLng || '');
  const [isMapOpen, setIsMapOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [mapCenter, setMapCenter] = useState({ lat: 20.5937, lng: 78.9629 });
  const [mapZoom, setMapZoom] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);
  const streetLayerRef = useRef(null);

  // Common Indian agricultural regions for quick navigation
  const agriculturalZones = [
    { name: 'Punjab Farms', lat: 30.7333, lng: 76.7794, zoom: 12, crop: 'Wheat, Rice' },
    { name: 'Tamil Nadu Farms', lat: 11.1271, lng: 78.6569, zoom: 12, crop: 'Rice, Sugarcane' },
    { name: 'Maharashtra Farms', lat: 19.0760, lng: 77.4126, zoom: 12, crop: 'Cotton, Sugarcane' },
    { name: 'Uttar Pradesh Farms', lat: 26.8467, lng: 80.9462, zoom: 12, crop: 'Wheat, Rice' },
    { name: 'Karnataka Farms', lat: 13.3409, lng: 77.0970, zoom: 12, crop: 'Rice, Millets' },
    { name: 'Gujarat Farms', lat: 22.2587, lng: 71.1924, zoom: 12, crop: 'Cotton, Groundnut' }
  ];

  // Initialize Leaflet map
  const initializeMap = () => {
    if (!mapRef.current || mapInstanceRef.current) return;

    const map = L.map(mapRef.current).setView([mapCenter.lat, mapCenter.lng], mapZoom);

    const streetLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 18
    });

    streetLayer.addTo(map);
    streetLayerRef.current = streetLayer;

    map.on('click', function(e) {
      const { lat, lng } = e.latlng;
      setLatitude(lat.toFixed(6));
      setLongitude(lng.toFixed(6));
      setSelectedLocation({ lat, lng });
      onLocationSelect(lat, lng);

      if (markerRef.current) {
        markerRef.current.setLatLng([lat, lng]);
      } else {
        markerRef.current = L.marker([lat, lng]).addTo(map);
      }
    });

    if (initialLat && initialLng) {
      markerRef.current = L.marker([parseFloat(initialLat), parseFloat(initialLng)]).addTo(map);
    }

    mapInstanceRef.current = map;
  };

  // Update map center and zoom
  const updateMapView = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView([mapCenter.lat, mapCenter.lng], mapZoom);
    }
  };

  const getCurrentLocation = () => {
    setIsLoading(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude: lat, longitude: lng } = position.coords;
          setLatitude(lat.toFixed(6));
          setLongitude(lng.toFixed(6));
          setMapCenter({ lat, lng });
          setMapZoom(15);
          setSelectedLocation({ lat, lng });
          onLocationSelect(lat, lng);
          
          // Update map view
          if (mapInstanceRef.current) {
            mapInstanceRef.current.setView([lat, lng], 15);
          }
          
          // Update marker
          if (markerRef.current) {
            markerRef.current.setLatLng([lat, lng]);
          } else if (mapInstanceRef.current) {
            markerRef.current = L.marker([lat, lng]).addTo(mapInstanceRef.current);
          }
          
          setIsLoading(false);
        },
        (error) => {
          console.error('Error getting location:', error);
          alert('Unable to get your current location. Please try again.');
          setIsLoading(false);
        },
        { timeout: 10000, enableHighAccuracy: true }
      );
    } else {
      alert('Geolocation is not supported by your browser.');
      setIsLoading(false);
    }
  };

  const handleZoneSelect = (zone) => {
    setMapCenter({ lat: zone.lat, lng: zone.lng });
    setMapZoom(zone.zoom);
    setLatitude(zone.lat.toFixed(6));
    setLongitude(zone.lng.toFixed(6));
    setSelectedLocation({ lat: zone.lat, lng: zone.lng });
    onLocationSelect(zone.lat, zone.lng);
    updateMapView();
  };

  const handleManualInput = () => {
    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);
    
    if (!isNaN(lat) && !isNaN(lng)) {
      setMapCenter({ lat, lng });
      setMapZoom(15);
      setSelectedLocation({ lat, lng });
      onLocationSelect(lat, lng);
      updateMapView();
      
      // Update marker
      if (markerRef.current) {
        markerRef.current.setLatLng([lat, lng]);
      } else if (mapInstanceRef.current) {
        markerRef.current = L.marker([lat, lng]).addTo(mapInstanceRef.current);
      }
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    try {
      // Use Nominatim API for geocoding (free and reliable)
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=1`);
      const data = await response.json();
      
      if (data && data.length > 0) {
        const result = data[0];
        const lat = parseFloat(result.lat);
        const lng = parseFloat(result.lon);
        
        setMapCenter({ lat, lng });
        setMapZoom(15);
        setLatitude(lat.toFixed(6));
        setLongitude(lng.toFixed(6));
        setSelectedLocation({ lat, lng });
        onLocationSelect(lat, lng);
        
        // Update map view
        if (mapInstanceRef.current) {
          mapInstanceRef.current.setView([lat, lng], 15);
        }
        
        // Update marker
        if (markerRef.current) {
          markerRef.current.setLatLng([lat, lng]);
        } else if (mapInstanceRef.current) {
          markerRef.current = L.marker([lat, lng]).addTo(mapInstanceRef.current);
        }
      }
    } catch (error) {
      console.error('Search error:', error);
      alert('Location not found. Please try a different search term.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  
  // Initialize map when dialog opens
  useEffect(() => {
    if (isMapOpen && mapRef.current && !mapInstanceRef.current) {
      setTimeout(() => {
        initializeMap();
      }, 100);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMapOpen]);

  // Update map when center or zoom changes
  useEffect(() => {
    if (mapInstanceRef.current) {
      updateMapView();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mapCenter, mapZoom]);

  return (
    <div>
      <div style={{ marginBottom: '1rem' }}>
        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
          Farm Location
        </label>
        
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
          <input
            type="number"
            step="any"
            placeholder='Latitude'
            value={latitude}
            onChange={(e) => setLatitude(e.target.value)}
            style={{
              flex: 1,
              padding: '0.75rem',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontSize: '14px'
            }}
          />
          <input
            type="number"
            step="any"
            placeholder='Longitude'
            value={longitude}
            onChange={(e) => setLongitude(e.target.value)}
            style={{
              flex: 1,
              padding: '0.75rem',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontSize: '14px'
            }}
          />
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={() => setIsMapOpen(true)}
            style={{
              flex: 1,
              minWidth: '120px',
              padding: '0.75rem',
              background: '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500'
            }}
          >
            <FaMapMarkedAlt style={{ marginRight: '8px' }} /> Select on Map
          </button>
          
          <button
            type="button"
            onClick={getCurrentLocation}
            disabled={isLoading}
            style={{
              flex: 1,
              minWidth: '120px',
              padding: '0.75rem',
              background: isLoading ? '#ccc' : '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              fontSize: '14px',
              fontWeight: '500'
            }}
          >
            {isLoading ? <><FaSyncAlt style={{ marginRight: '8px' }} /> Loading...</> : <><FaCrosshairs style={{ marginRight: '8px' }} /> Use Current Location</>}
          </button>
          
          <button
            type="button"
            onClick={handleManualInput}
            style={{
              flex: 1,
              minWidth: '120px',
              padding: '0.75rem',
              background: '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500'
            }}
          >
            <FaCheckCircle style={{ marginRight: '8px' }} /> Confirm Location
          </button>
        </div>
      </div>

      {isMapOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          zIndex: 10000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '8px',
            width: '90%',
            maxWidth: '900px',
            height: '90%',
            maxHeight: '700px',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden'
          }}>
            <div style={{
              padding: '1rem',
              borderBottom: '1px solid #ddd',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <h3 style={{ margin: 0 }}>Select Your Farm Location</h3>
              <button
                onClick={() => setIsMapOpen(false)}
                style={{
                  background: '#dc3545',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  padding: '0.5rem 1rem',
                  cursor: 'pointer'
                }}
              >
                Close
              </button>
            </div>
            
            <div style={{
              flex: 1,
              padding: '1rem',
              overflow: 'auto'
            }}>
              <p style={{ marginBottom: '1rem', color: '#666', textAlign: 'center' }}>
                Click anywhere on the map to select your exact farmland location
              </p>
              
              {/* Agricultural Zone Selection */}
              <div style={{ marginBottom: '1rem' }}>
                <h4 style={{ marginBottom: '0.5rem', color: '#333' }}>Quick Navigation - Major Farming Areas:</h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
                  {agriculturalZones.map((zone) => (
                    <button
                      key={zone.name}
                      onClick={() => handleZoneSelect(zone)}
                      style={{
                        padding: '0.5rem',
                        background: '#f8f9fa',
                        border: '1px solid #ddd',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '12px',
                        textAlign: 'left'
                      }}
                      onMouseOver={(e) => e.target.style.background = '#e9ecef'}
                      onMouseOut={(e) => e.target.style.background = '#f8f9fa'}
                    >
                      <strong>{zone.name}</strong><br/>
                      <small style={{ color: '#666' }}>{zone.crop}</small>
                    </button>
                  ))}
                </div>
              </div>

              {/* Search Bar */}
              <div style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'center', gap: '0.5rem' }}>
                <input
                  type="text"
                  placeholder="Search for village, city, or place..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={handleKeyPress}
                  style={{
                    flex: 1,
                    maxWidth: '400px',
                    padding: '0.75rem',
                    border: '2px solid #007bff',
                    borderRadius: '25px',
                    fontSize: '14px',
                    outline: 'none'
                  }}
                />
                <button
                  onClick={handleSearch}
                  disabled={isSearching || !searchQuery.trim()}
                  style={{
                    padding: '0.75rem 1.5rem',
                    background: isSearching ? '#ccc' : '#007bff',
                    color: 'white',
                    border: 'none',
                    borderRadius: '25px',
                    cursor: isSearching || !searchQuery.trim() ? 'not-allowed' : 'pointer',
                    fontSize: '14px',
                    fontWeight: '500'
                  }}
                >
                  {isSearching ? <><FaSyncAlt style={{ marginRight: '8px' }} /> Searching...</> : <><FaSearch style={{ marginRight: '8px' }} /> Search</>}
                </button>
              </div>

              
              {/* Leaflet Map */}
              <div style={{ marginBottom: '1rem' }}>
                <div
                  ref={mapRef}
                  style={{
                    width: '100%',
                    height: '400px',
                    borderRadius: '4px',
                    border: '2px solid #ddd'
                  }}
                />
              </div>

              {/* Instructions */}
              <div style={{
                padding: '0.75rem',
                background: '#f8f9fa',
                borderRadius: '4px',
                fontSize: '13px',
                color: '#666'
              }}>
                <strong>How to use:</strong><br/>
                • <strong><FaSearch style={{ marginRight: '4px' }} /> Search:</strong> Type village/city name and press Enter or Search<br/>
                • <strong>Auto-Navigate:</strong> Map automatically moves to searched location<br/>
                • <strong><FaMapMarkedAlt style={{ marginRight: '4px' }} /> Street Map:</strong> Shows roads, villages, and place names<br/>
                • Click anywhere on map to select exact farm location<br/>
                • Use mouse wheel to zoom in/out for precise selection<br/>
                • Select agricultural zones for quick navigation<br/>
                • Use GPS for current location if you're at the farm<br/>
                • The red marker shows your selected location
              </div>
            </div>
            
            {selectedLocation && (
              <div style={{
                padding: '1rem',
                borderTop: '1px solid #ddd',
                backgroundColor: '#f8f9fa'
              }}>
                <p style={{ margin: 0 }}>
                  <strong>Selected Location:</strong><br/>
                  Latitude: {selectedLocation.lat.toFixed(6)}<br/>
                  Longitude: {selectedLocation.lng.toFixed(6)}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkingLeafletMap;
