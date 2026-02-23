import { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { MapPin } from 'lucide-react';
import { MAPBOX_ACCESS_TOKEN } from '@/lib/mapbox';
import type { USTheater } from '@/data/usTheaters';

interface TheaterMapProps {
  theaters: USTheater[];
  selectedTheaterId: string | null;
  onSelectTheater: (id: string) => void;
}

const TheaterMap = ({ theaters, selectedTheaterId, onSelectTheater }: TheaterMapProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || !MAPBOX_ACCESS_TOKEN) return;

    mapboxgl.accessToken = MAPBOX_ACCESS_TOKEN;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/dark-v11',
      center: [-98.5795, 39.8283],
      zoom: 3.5,
    });

    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

    return () => {
      map.current?.remove();
      map.current = null;
    };
  }, []);

  // Update markers when theaters change
  useEffect(() => {
    if (!map.current) return;

    // Clear old markers
    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];

    theaters.forEach(theater => {
      const el = document.createElement('div');
      const isSelected = theater.id === selectedTheaterId;

      el.style.cssText = `
        width: ${isSelected ? '40px' : '32px'};
        height: ${isSelected ? '40px' : '32px'};
        background: ${isSelected ? 'hsl(270, 60%, 60%)' : 'hsl(45, 80%, 55%)'};
        border-radius: 50%;
        border: 3px solid hsl(230, 25%, 6%);
        cursor: pointer;
        transition: all 0.3s ease;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: ${isSelected ? '18px' : '14px'};
        box-shadow: 0 2px 8px rgba(0,0,0,0.4);
        z-index: ${isSelected ? '10' : '1'};
      `;
      el.textContent = '🎬';

      el.addEventListener('mouseenter', () => {
        if (!isSelected) {
          el.style.transform = 'scale(1.2)';
        }
      });
      el.addEventListener('mouseleave', () => {
        if (!isSelected) {
          el.style.transform = 'scale(1)';
        }
      });

      const popup = new mapboxgl.Popup({ offset: 25, closeButton: false, maxWidth: '260px' })
        .setHTML(`
          <div style="font-family: 'Plus Jakarta Sans', sans-serif; padding: 4px;">
            <div style="font-weight: 700; font-size: 14px; color: #1a1a2e;">${theater.name}</div>
            <div style="font-size: 12px; color: #666; margin-top: 2px;">${theater.address}</div>
            <div style="font-size: 12px; color: #666;">${theater.city}, ${theater.state} ${theater.zip}</div>
            <div style="margin-top: 6px; display: flex; gap: 4px; flex-wrap: wrap;">
              ${theater.formats.slice(0, 3).map(f => `<span style="font-size: 10px; padding: 2px 6px; background: #e8d44d22; color: #b8860b; border-radius: 10px; font-weight: 600;">${f}</span>`).join('')}
            </div>
          </div>
        `);

      const marker = new mapboxgl.Marker(el)
        .setLngLat([theater.lng, theater.lat])
        .setPopup(popup)
        .addTo(map.current!);

      el.addEventListener('click', () => {
        onSelectTheater(theater.id);
      });

      markersRef.current.push(marker);
    });
  }, [theaters, selectedTheaterId, onSelectTheater]);

  // Fly to selected theater
  useEffect(() => {
    if (!map.current || !selectedTheaterId) return;
    const theater = theaters.find(t => t.id === selectedTheaterId);
    if (theater) {
      map.current.flyTo({
        center: [theater.lng, theater.lat],
        zoom: 13,
        duration: 1500,
      });
    }
  }, [selectedTheaterId, theaters]);

  // Fit bounds when theaters change significantly
  useEffect(() => {
    if (!map.current || theaters.length === 0) return;

    // Only fit bounds when no theater is selected (initial load or filter change)
    if (selectedTheaterId) return;

    const bounds = new mapboxgl.LngLatBounds();
    theaters.forEach(t => bounds.extend([t.lng, t.lat]));

    map.current.fitBounds(bounds, {
      padding: 60,
      maxZoom: 12,
      duration: 1000,
    });
  }, [theaters, selectedTheaterId]);

  if (!MAPBOX_ACCESS_TOKEN) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center glass text-center p-8">
        <div className="p-4 glass rounded-2xl mb-4">
          <MapPin className="w-12 h-12 text-primary" />
        </div>
        <h3 className="font-display text-lg font-bold text-foreground mb-2">Map Coming Soon</h3>
        <p className="text-sm text-muted-foreground max-w-sm">
          Configure your Mapbox access token to enable the interactive theater map.
          Browse theaters using the directory on the left.
        </p>
      </div>
    );
  }

  return <div ref={mapContainer} className="w-full h-full" />;
};

export default TheaterMap;
