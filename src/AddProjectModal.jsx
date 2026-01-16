import React, { useState } from 'react';
import { supabase } from './supabaseClient';
import { X, MapPin, Wallet, Building2, Check, Navigation, Map } from 'lucide-react';
import LocationPicker from './LocationPicker';

const AddProjectModal = ({ isOpen, onClose, onSave }) => {
  if (!isOpen) return null;

  const [loading, setLoading] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [coords, setCoords] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    location: '',
    budget: '',
    startDate: new Date().toISOString().split('T')[0],
  });

  const reverseGeocode = async (lat, lng) => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
      );
      const data = await res.json();
      return data.display_name || '';
    } catch {
      return '';
    }
  };

  const useCurrentLocation = () => {
    navigator.geolocation.getCurrentPosition(async (pos) => {
      const { latitude, longitude } = pos.coords;
      setCoords({ lat: latitude, lng: longitude });
      const addr = await reverseGeocode(latitude, longitude);
      setFormData((p) => ({ ...p, location: addr }));
      setShowMap(true);
    });
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.location) {
      alert('Project Name & Location required');
      return;
    }

    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();

    const { data, error } = await supabase
      .from('siteboss_projects')
      .insert([{
        owner_id: user.id,
        name: formData.name,
        location: formData.location,
        budget: Number(formData.budget) || 0,
        start_date: formData.startDate,
        status: 'Active',
        progress: 0,
        latitude: coords?.lat,
        longitude: coords?.lng,
      }])
      .select()
      .single();

    if (!error) {
      onSave?.(data);
      onClose();
    } else alert(error.message);

    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/70" onClick={onClose} />

      <div
        className="relative bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl p-6 space-y-5"
        onClick={(e) => e.stopPropagation()}
      >
        {/* HEADER */}
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-bold">New Project</h3>
          <button onClick={onClose}><X /></button>
        </div>

        {/* PROJECT NAME */}
        <div className="relative">
          <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            className="w-full bg-slate-100 pl-12 p-4 rounded-xl font-bold"
            placeholder="Project Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
        </div>

        {/* LOCATION */}
        <div className="relative">
          <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            className="w-full bg-slate-100 pl-12 p-4 rounded-xl font-bold"
            placeholder="Site Location"
            value={formData.location}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
          />
        </div>

        <div className="flex gap-2">
          <button
            onClick={useCurrentLocation}
            className="flex-1 bg-slate-900 text-white py-2 rounded-lg flex items-center justify-center gap-2"
          >
            <Navigation size={16} /> Use Current
          </button>

          <button
            onClick={() => setShowMap((p) => !p)}
            className="flex-1 bg-slate-200 py-2 rounded-lg flex items-center justify-center gap-2"
          >
            <Map size={16} /> {showMap ? 'Hide Map' : 'Pick on Map'}
          </button>
        </div>

        {/* 🔥 ANIMATED MAP (Blinkit style) */}
        <div
          className={`transition-all duration-300 ease-out overflow-hidden ${
            showMap ? 'max-h-[260px] mt-3' : 'max-h-0'
          }`}
        >
          <div
            className="relative h-[240px] w-full rounded-xl overflow-hidden border"
            style={{ touchAction: 'pan-x pan-y' }}
            onTouchStart={(e) => e.stopPropagation()}
            onTouchMove={(e) => e.stopPropagation()}
            onWheel={(e) => e.stopPropagation()}
          >
            <LocationPicker
              onSelect={async ({ lat, lng }) => {
                setCoords({ lat, lng });
                const addr = await reverseGeocode(lat, lng);
                setFormData((p) => ({ ...p, location: addr }));
              }}
            />

            <div className="absolute top-3 left-1/2 -translate-x-1/2 bg-white/90 px-3 py-1 rounded-full text-xs font-bold shadow">
              Drag map or tap to select
            </div>
          </div>
        </div>

        {/* BUDGET & DATE */}
        <div className="grid grid-cols-2 gap-4">
          <div className="relative">
            <Wallet className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="number"
              placeholder="Budget ₹"
              className="w-full bg-slate-100 pl-12 p-4 rounded-xl font-bold"
              value={formData.budget}
              onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
            />
          </div>

          <input
            type="date"
            className="bg-slate-100 p-4 rounded-xl font-bold"
            value={formData.startDate}
            onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
          />
        </div>

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold flex justify-center gap-2"
        >
          <Check /> Launch Project
        </button>
      </div>
    </div>
  );
};

export default AddProjectModal;
