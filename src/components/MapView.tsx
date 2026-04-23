import React, { useEffect, useState, useMemo, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { renderToString } from 'react-dom/server';
import { User, Navigation, MapPin } from 'lucide-react';
import { Driver } from '../store/demo-store';

const createCustomIcon = (iconNode: React.ReactElement, bgColor: string = 'bg-emerald-500') => {
  const iconHtml = renderToString(
    <div className={`${bgColor} text-white p-2 rounded-full border-2 border-white shadow-lg flex items-center justify-center`} style={{ width: '36px', height: '36px' }}>
      {iconNode}
    </div>
  );

  return new L.DivIcon({
    html: iconHtml,
    className: 'custom-leaflet-icon',
    iconSize: [36, 36],
    iconAnchor: [18, 18],
    popupAnchor: [0, -18],
  });
};

const passengerIcon = createCustomIcon(<User size={18} />, 'bg-blue-600');
const driverIconAvailable = createCustomIcon(<Navigation size={18} fill="currentColor" />, 'bg-emerald-500');
const driverIconBusy = createCustomIcon(<Navigation size={18} fill="currentColor" />, 'bg-orange-500');
const driverIconSuspended = createCustomIcon(<Navigation size={18} fill="currentColor" />, 'bg-red-500');

const pickupIcon = createCustomIcon(<MapPin size={18} />, 'bg-emerald-500');
const dropoffIcon = createCustomIcon(<MapPin size={18} />, 'bg-blue-500');

function MapUpdater({ center }: { center?: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    if (center && center[0] !== 0) {
      map.setView(center, map.getZoom(), { animate: true });
    }
  }, [center, map]);
  return null;
}

function MapClickHandler({ onMapClick }: { onMapClick: (latlng: L.LatLng) => void }) {
  useMapEvents({
    click(e) {
      onMapClick(e.latlng);
    }
  });
  return null;
}

// Custom wrapper to properly handle dragging without triggering too many updates
function DraggableMarker({ position, icon, children, onDragEnd }: any) {
  const [pos, setPos] = useState(position);
  const markerRef = useRef<L.Marker>(null);
  
  useEffect(() => {
    setPos(position);
  }, [position]);

  const eventHandlers = useMemo(
    () => ({
      dragend() {
        const marker = markerRef.current;
        if (marker != null) {
          const newPos = marker.getLatLng();
          setPos([newPos.lat, newPos.lng]);
          if (onDragEnd) onDragEnd([newPos.lat, newPos.lng]);
        }
      },
    }),
    [onDragEnd],
  );

  return (
     <Marker draggable={!!onDragEnd} position={pos} ref={markerRef} icon={icon} eventHandlers={eventHandlers}>
       {children}
     </Marker>
  )
}

interface MapViewProps {
  passengerLocation?: [number, number] | null;
  drivers?: Driver[];
  route?: [number, number][];
  focusCenter?: [number, number] | null; 
  onMapClick?: (coords: [number, number]) => void;
  onDriverMove?: (driverId: string, coords: [number, number]) => void;
  pickupCoords?: [number, number];
  dropoffCoords?: [number, number];
}

export default function MapView({ passengerLocation, drivers = [], route, focusCenter, onMapClick, onDriverMove, pickupCoords, dropoffCoords }: MapViewProps) {
  // Use Stanford as absolute fallback if geo fails and no center is provided
  const center = focusCenter || passengerLocation || [37.4275, -122.1697];

  return (
    <div className="w-full h-full relative z-0">
      <MapContainer 
        center={center} 
        zoom={15} 
        scrollWheelZoom={true} 
        className="w-full h-full rounded-2xl md:rounded-[2.5rem] shadow-inner z-0 border-[8px] border-slate-800"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {focusCenter && <MapUpdater center={focusCenter} />}
        {onMapClick && <MapClickHandler onMapClick={(ll) => onMapClick([ll.lat, ll.lng])} />}

        {passengerLocation && passengerLocation[0] !== 0 && !pickupCoords && (
          <Marker position={passengerLocation} icon={passengerIcon}>
            <Popup><div className="font-bold text-slate-800">You are here</div></Popup>
          </Marker>
        )}

        {pickupCoords && (
           <Marker position={pickupCoords} icon={pickupIcon}>
              <Popup><div className="font-bold text-slate-800">Pickup Location</div></Popup>
           </Marker>
        )}

        {dropoffCoords && (
           <Marker position={dropoffCoords} icon={dropoffIcon}>
              <Popup><div className="font-bold text-slate-800">Dropoff Location</div></Popup>
           </Marker>
        )}

        {drivers.filter(d => d.status !== 'offline').map(driver => {
          let icn = driverIconAvailable;
          if (driver.status === 'busy') icn = driverIconBusy;
          if (driver.status === 'suspended') icn = driverIconSuspended;

          return (
            <DraggableMarker 
               key={driver.id} 
               position={driver.location} 
               icon={icn} 
               onDragEnd={onDriverMove ? (coords: [number, number]) => onDriverMove(driver.id, coords) : undefined}
            >
              <Popup>
                 <div className="flex flex-col">
                    <span className="font-bold text-slate-800">{driver.name}</span>
                    <span className="text-[10px] text-slate-500">{driver.license} • {driver.status.toUpperCase()}</span>
                    {onDriverMove && <span className="text-[9px] text-emerald-600 mt-1 italic">Drag to move</span>}
                 </div>
              </Popup>
            </DraggableMarker>
          );
        })}

        {route && route.length > 0 && (
          <Polyline positions={route} pathOptions={{ color: '#10b981', weight: 5, dashArray: '8, 8' }} />
        )}
      </MapContainer>
    </div>
  );
}
