import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import { MapPin, Navigation, ExternalLink, Building2 } from 'lucide-react';

const LiveMap = () => {
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    setLoading(true);
    // Fetch all active projects from real database
    const { data } = await supabase
      .from('nexus_projects')
      .select('*')
      .eq('status', 'Active')
      .order('created_at', { ascending: false });
    
    if (data && data.length > 0) {
      setProjects(data);
      setSelectedProject(data[0]); // Select the first one by default
    }
    setLoading(false);
  };

  // Helper to generate Google Maps Embed URL based on address text
  const getMapUrl = (location) => {
    if (!location) return "";
    // Using the public embed endpoint (works for testing without API key usually, or generic search)
    const encodedLoc = encodeURIComponent(location);
    return `https://maps.google.com/maps?q=${encodedLoc}&t=&z=15&ie=UTF8&iwloc=&output=embed`;
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-3xl overflow-hidden shadow-card border border-slate-200">
      
      {/* --- TOP: THE MAP --- */}
      <div className="flex-1 relative bg-slate-100 min-h-[50%]">
        {loading ? (
           <div className="absolute inset-0 flex items-center justify-center text-slate-400">Loading Map...</div>
        ) : selectedProject ? (
          <iframe 
            title="Live Site Map"
            width="100%" 
            height="100%" 
            frameBorder="0" 
            scrolling="no" 
            marginHeight="0" 
            marginWidth="0" 
            src={getMapUrl(selectedProject.location)}
            className="w-full h-full object-cover"
          ></iframe>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400">
            <MapPin className="w-12 h-12 mb-2 opacity-20" />
            <p>No Active Sites Found</p>
          </div>
        )}

        {/* Floating Label on Map */}
        {selectedProject && (
            <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md p-3 rounded-xl shadow-lg border border-white/50 max-w-[200px]">
                <p className="text-[10px] font-bold text-nexus-muted uppercase">Currently Viewing</p>
                <p className="font-bold text-nexus-dark truncate">{selectedProject.name}</p>
                <div className="flex items-center gap-1 text-xs text-nexus-accent font-bold mt-1">
                    <MapPin className="w-3 h-3" /> {selectedProject.location}
                </div>
            </div>
        )}
      </div>

      {/* --- BOTTOM: ADDRESS LIST --- */}
      <div className="h-[40%] bg-white flex flex-col">
        <div className="p-4 border-b border-slate-100 bg-slate-50">
            <h3 className="font-bold text-nexus-dark flex items-center gap-2">
                <Navigation className="w-4 h-4 text-nexus-accent" /> Live Site Locations
            </h3>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {projects.map((proj) => (
                <div 
                    key={proj.id} 
                    onClick={() => setSelectedProject(proj)}
                    className={`p-4 rounded-xl border cursor-pointer transition-all flex justify-between items-center group ${
                        selectedProject?.id === proj.id 
                        ? 'bg-nexus-dark text-white border-nexus-dark shadow-lg' 
                        : 'bg-white border-slate-100 hover:border-nexus-accent hover:shadow-md'
                    }`}
                >
                    <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${selectedProject?.id === proj.id ? 'bg-white/10' : 'bg-slate-100 group-hover:bg-nexus-accent/20'}`}>
                            <Building2 className={`w-5 h-5 ${selectedProject?.id === proj.id ? 'text-nexus-accent' : 'text-slate-500 group-hover:text-nexus-dark'}`} />
                        </div>
                        <div>
                            <h4 className="font-bold text-sm">{proj.name}</h4>
                            <p className={`text-xs ${selectedProject?.id === proj.id ? 'text-slate-300' : 'text-nexus-muted'}`}>{proj.location}</p>
                        </div>
                    </div>
                    
                    {/* Open in Real Google Maps App Button */}
                    <a 
                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(proj.location)}`} 
                        target="_blank" 
                        rel="noreferrer"
                        onClick={(e) => e.stopPropagation()} // Prevent card click
                        className={`p-2 rounded-full ${selectedProject?.id === proj.id ? 'text-white hover:bg-white/20' : 'text-slate-300 hover:text-nexus-dark hover:bg-slate-100'}`}
                    >
                        <ExternalLink className="w-4 h-4" />
                    </a>
                </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default LiveMap;