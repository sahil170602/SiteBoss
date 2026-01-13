import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { AlertTriangle, ArrowRight, HardHat } from 'lucide-react';

const createCustomIcon = (status) => {
  const colorClass = status === 'Delayed' ? 'bg-red-500 shadow-red-500/50' : 
                     status === 'Active' ? 'bg-emerald-500 shadow-emerald-500/50' : 
                     'bg-nexus-accent shadow-amber-500/50';

  return L.divIcon({
    className: 'custom-marker',
    html: `<div class="relative flex items-center justify-center w-6 h-6">
             <span class="animate-ping absolute inline-flex h-full w-full rounded-full ${colorClass} opacity-75"></span>
             <span class="relative inline-flex rounded-full h-4 w-4 ${colorClass} border-2 border-white"></span>
           </div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12], 
    popupAnchor: [0, -10]
  });
};

const LiveMap = () => {
  const [selectedSite, setSelectedSite] = useState(null);

  const sites = [
    { id: 1, name: "Green Valley Villa", lat: 19.9975, lng: 73.7898, status: "Active", progress: 65, workers: 12, issues: 0 },
    { id: 2, name: "Skyline Heights", lat: 20.0110, lng: 73.7602, status: "Delayed", progress: 30, workers: 4, issues: 2 },
    { id: 3, name: "City Center Renovation", lat: 19.9550, lng: 73.8000, status: "Planning", progress: 5, workers: 0, issues: 0 },
  ];

  return (
    <div className="h-full w-full relative bg-nexus-dark overflow-hidden flex flex-col md:rounded-3xl border-t md:border border-slate-700 shadow-2xl">
      
      {/* Map Header Overlay */}
      <div className="absolute top-4 left-4 z-[400] bg-white/90 backdrop-blur-md p-3 md:p-4 rounded-xl shadow-lg border border-white/20 max-w-[200px] md:max-w-none">
        <h2 className="text-nexus-dark font-bold flex items-center gap-2 text-sm md:text-base">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          Live Tracking
        </h2>
        <p className="text-[10px] md:text-xs text-nexus-muted">3 Sites • 16 Workers</p>
      </div>

      <MapContainer 
        center={[19.9975, 73.7898]} 
        zoom={12} 
        style={{ height: "100%", width: "100%", zIndex: 0 }}
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; OpenStreetMap'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />
        {sites.map((site) => (
          <Marker 
            key={site.id} 
            position={[site.lat, site.lng]} 
            icon={createCustomIcon(site.status)}
            eventHandlers={{ click: () => setSelectedSite(site) }}
          />
        ))}
      </MapContainer>

      {/* SITE DETAILS CARD (Bottom Sheet Style) */}
      {selectedSite && (
        <div className="absolute bottom-0 left-0 right-0 md:bottom-6 md:left-auto md:right-6 md:w-80 bg-white rounded-t-3xl md:rounded-2xl shadow-2xl z-[500] p-6 animate-in slide-in-from-bottom-10 duration-300 pb-[calc(1.5rem+env(safe-area-inset-bottom))]">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="font-bold text-lg text-nexus-dark">{selectedSite.name}</h3>
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                selectedSite.status === 'Delayed' ? 'bg-red-100 text-red-600' : 'bg-emerald-100 text-emerald-600'
              }`}>{selectedSite.status}</span>
            </div>
            <button onClick={() => setSelectedSite(null)} className="p-2 bg-slate-100 rounded-full text-slate-500 active:bg-slate-200">✕</button>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="bg-nexus-surface p-3 rounded-xl">
              <div className="flex items-center gap-2 text-nexus-muted text-xs font-bold uppercase mb-1">
                <HardHat className="w-3 h-3" /> Workers
              </div>
              <div className="text-xl font-bold text-nexus-dark">{selectedSite.workers}</div>
            </div>
            <div className="bg-nexus-surface p-3 rounded-xl">
              <div className="flex items-center gap-2 text-nexus-muted text-xs font-bold uppercase mb-1">
                <AlertTriangle className="w-3 h-3" /> Issues
              </div>
              <div className={`text-xl font-bold ${selectedSite.issues > 0 ? 'text-red-500' : 'text-emerald-500'}`}>{selectedSite.issues}</div>
            </div>
          </div>

          <button className="w-full bg-nexus-dark text-white py-4 rounded-xl font-medium text-sm flex items-center justify-center gap-2 active:bg-slate-800 transition-colors">
            <span>View Dashboard</span> <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};

export default LiveMap;