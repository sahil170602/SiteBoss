import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import { useEffect, useState } from 'react';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

function FixMap() {
  const map = useMap();

  useEffect(() => {
    setTimeout(() => {
      map.invalidateSize();
    }, 350);
  }, [map]);

  return null;
}

function Picker({ onSelect }) {
  const [pos, setPos] = useState(null);

  useMapEvents({
    click(e) {
      setPos(e.latlng);
      onSelect(e.latlng);
    },
  });

  return pos ? <Marker position={pos} /> : null;
}

export default function LocationPicker({ onSelect }) {
  return (
    <MapContainer
      center={[21.1458, 79.0882]} // Nagpur
      zoom={16}
      className="h-full w-full"
      scrollWheelZoom={false}
      dragging={true}
      tap={true}
    >
      <FixMap />
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <Picker onSelect={onSelect} />
    </MapContainer>
  );
}
