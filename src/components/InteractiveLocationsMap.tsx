import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { LocationDistrict, LocationState, getAllMappedStates, getAllMappedDistricts } from '../data/locationsData';
import { MapPin, Navigation, Compass, Layers, ExternalLink, ArrowRight, ShieldCheck, CheckCircle, Info } from 'lucide-react';

interface InteractiveLocationsMapProps {
  currentLevel: 'national' | 'state' | 'district';
  selectedState?: LocationState | null;
  selectedDistrict?: LocationDistrict | null;
  onNavigateToLocation: (path: string) => void;
}

export default function InteractiveLocationsMap({
  currentLevel,
  selectedState,
  selectedDistrict,
  onNavigateToLocation
}: InteractiveLocationsMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const [activeLocationHover, setActiveLocationHover] = useState<{
    name: string;
    type: 'state' | 'district';
    metric: string;
    url: string;
  } | null>(null);

  const states = getAllMappedStates();
  const districts = getAllMappedDistricts();

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Clean up any previously initialized map instance
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    // Determine initial center and zoom according to context-aware rules
    let initialLat = 38.5;
    let initialLng = -96.5;
    let initialZoom = 4;

    if (currentLevel === 'district' && selectedDistrict) {
      initialLat = selectedDistrict.lat;
      initialLng = selectedDistrict.lng;
      initialZoom = Math.min(selectedDistrict.defaultZoom || 10, 11);
    } else if (currentLevel === 'state' && selectedState) {
      initialLat = selectedState.lat;
      initialLng = selectedState.lng;
      initialZoom = Math.min(selectedState.defaultZoom || 6, 7);
    }

    // Initialize Leaflet Map with strict district-level zoom clamp (min 3, max 11)
    const map = L.map(mapContainerRef.current, {
      center: [initialLat, initialLng],
      zoom: initialZoom,
      minZoom: 3, // Prevent zooming out to outer space
      maxZoom: 11, // Strict requirement: district level max, no street-level zoom
      zoomControl: false, // We'll position custom accessible zoom controls
      attributionControl: false,
      scrollWheelZoom: false, // Prevents page hijacking on mobile scroll
      maxBounds: [
        [15.0, -135.0], // Southwest bounds (North America)
        [58.0, -58.0]   // Northeast bounds
      ],
      maxBoundsViscosity: 1.0 // Firmly bounce back within bounds
    });

    mapInstanceRef.current = map;

    // Add 100% free, open-source OpenStreetMap tiles (zero API key, zero watermark)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      subdomains: ['a', 'b', 'c'],
      maxZoom: 11,
      minZoom: 3
    }).addTo(map);

    // Re-enable scroll zoom once the user interacts or clicks the map
    map.on('focus', () => {
      map.scrollWheelZoom.enable();
    });

    // Custom branded Pin Icons
    const createPinIcon = (isCurrentActive: boolean, isDistrict: boolean, label: string) => {
      const bgColor = isCurrentActive ? '#bc5f40' : isDistrict ? '#123e35' : '#1e293b';
      const ringColor = isCurrentActive ? 'rgba(188, 95, 64, 0.35)' : 'rgba(18, 62, 53, 0.25)';

      return L.divIcon({
        className: 'custom-map-marker',
        html: `
          <div class="relative group cursor-pointer" role="button" aria-label="${label}">
            <div style="
              background-color: ${bgColor};
              color: #ffffff;
              width: 34px;
              height: 34px;
              border-radius: 9999px;
              display: flex;
              align-items: center;
              justify-content: center;
              box-shadow: 0 4px 12px ${ringColor}, 0 2px 4px rgba(0,0,0,0.15);
              border: 2.5px solid #ffffff;
              transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1);
            " class="transform hover:scale-115">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                ${isDistrict 
                  ? '<path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle>' 
                  : '<path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"></path><path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"></path>'
                }
              </svg>
            </div>
            ${isCurrentActive ? `
              <span class="absolute -top-1 -right-1 flex h-3 w-3">
                <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#bc5f40] opacity-75"></span>
                <span class="relative inline-flex rounded-full h-3 w-3 bg-[#bc5f40]"></span>
              </span>
            ` : ''}
          </div>
        `,
        iconSize: [34, 34],
        iconAnchor: [17, 17],
        popupAnchor: [0, -18]
      });
    };

    // Add District Markers
    districts.forEach((dist) => {
      const isCurrent = currentLevel === 'district' && selectedDistrict?.slug === dist.slug;
      const targetUrl = `/locations/${dist.stateSlug}/${dist.slug}`;

      const marker = L.marker([dist.lat, dist.lng], {
        icon: createPinIcon(isCurrent, true, `${dist.name} District SEO Study`),
        title: `${dist.name}, ${dist.stateCode} Local SEO Study`,
        alt: `${dist.name}, ${dist.stateCode} Local SEO Study Pin`
      }).addTo(map);

      // Popup with accessible content and navigation trigger
      const popupHtml = `
        <div style="font-family: 'Inter', system-ui, sans-serif; min-width: 200px; padding: 4px;" class="text-left">
          <div style="font-size: 9px; font-weight: 800; letter-spacing: 0.08em; text-transform: uppercase; color: #bc5f40; margin-bottom: 2px;">
            ${dist.stateName} • District Study
          </div>
          <h4 style="font-size: 15px; font-weight: 900; color: #151716; margin: 0 0 6px 0; line-height: 1.2;">
            ${dist.name}, ${dist.stateCode}
          </h4>
          <div style="background-color: #f7f6f2; border: 1px solid #e6e4dc; border-radius: 8px; padding: 6px 8px; margin-bottom: 8px; font-size: 11px; font-weight: 600; color: #4e524f;">
            <span style="color: #123e35; font-weight: 800;">${dist.webUtilizationRate}</span> local web research rate
          </div>
          <a href="${targetUrl}" id="popup-link-${dist.slug}" style="
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 6px;
            width: 100%;
            background-color: #123e35;
            color: #ffffff;
            font-size: 11px;
            font-weight: 800;
            padding: 8px 12px;
            border-radius: 8px;
            text-decoration: none;
            text-transform: uppercase;
            letter-spacing: 0.04em;
          ">
            <span>Explore District Study</span>
            <span>&rarr;</span>
          </a>
        </div>
      `;

      marker.bindPopup(popupHtml, {
        className: 'custom-editorial-popup',
        closeButton: true,
        autoPan: true
      });

      marker.on('click', () => {
        setActiveLocationHover({
          name: `${dist.name}, ${dist.stateCode}`,
          type: 'district',
          metric: `${dist.webUtilizationRate} Web Utilization • ${dist.population}`,
          url: targetUrl
        });

        setTimeout(() => {
          const popupBtn = document.getElementById(`popup-link-${dist.slug}`);
          if (popupBtn) {
            popupBtn.onclick = (e) => {
              e.preventDefault();
              onNavigateToLocation(targetUrl);
            };
          }
        }, 50);
      });
    });

    // Add State Center Markers (for states without open district pages, or on national view)
    if (currentLevel === 'national') {
      states.forEach((state) => {
        const isCurrent = false;
        const targetUrl = `/locations/${state.slug}/`;

        const marker = L.marker([state.lat, state.lng], {
          icon: createPinIcon(isCurrent, false, `${state.name} Statewide Market`),
          title: `${state.name} Statewide Local SEO`,
          alt: `${state.name} Statewide Local SEO Pin`
        }).addTo(map);

        const popupHtml = `
          <div style="font-family: 'Inter', system-ui, sans-serif; min-width: 190px; padding: 4px;" class="text-left">
            <div style="font-size: 9px; font-weight: 800; letter-spacing: 0.08em; text-transform: uppercase; color: #123e35; margin-bottom: 2px;">
              Statewide SEO Hub
            </div>
            <h4 style="font-size: 15px; font-weight: 900; color: #151716; margin: 0 0 6px 0;">
              ${state.name}
            </h4>
            <div style="background-color: #f7f6f2; border: 1px solid #e6e4dc; border-radius: 8px; padding: 6px 8px; margin-bottom: 8px; font-size: 11px; font-weight: 600; color: #4e524f;">
              <span style="color: #bc5f40; font-weight: 800;">${state.totalBusinesses}</span> registered enterprises
            </div>
            <a href="${targetUrl}" id="popup-link-${state.slug}" style="
              display: flex;
              align-items: center;
              justify-content: center;
              gap: 6px;
              width: 100%;
              background-color: #bc5f40;
              color: #ffffff;
              font-size: 11px;
              font-weight: 800;
              padding: 8px 12px;
              border-radius: 8px;
              text-decoration: none;
              text-transform: uppercase;
              letter-spacing: 0.04em;
            ">
              <span>View State Blueprint</span>
              <span>&rarr;</span>
            </a>
          </div>
        `;

        marker.bindPopup(popupHtml, {
          className: 'custom-editorial-popup',
          closeButton: true
        });

        marker.on('click', () => {
          setTimeout(() => {
            const popupBtn = document.getElementById(`popup-link-${state.slug}`);
            if (popupBtn) {
              popupBtn.onclick = (e) => {
                e.preventDefault();
                onNavigateToLocation(targetUrl);
              };
            }
          }, 50);
        });
      });
    }

    // Cleanup on unmount
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [currentLevel, selectedState?.slug, selectedDistrict?.slug]);

  // Handlers for accessible external zoom buttons
  const handleZoomIn = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.zoomIn();
    }
  };

  const handleZoomOut = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.zoomOut();
    }
  };

  const handleResetView = () => {
    if (mapInstanceRef.current) {
      if (currentLevel === 'district' && selectedDistrict) {
        mapInstanceRef.current.setView([selectedDistrict.lat, selectedDistrict.lng], Math.min(selectedDistrict.defaultZoom || 10, 11));
      } else if (currentLevel === 'state' && selectedState) {
        mapInstanceRef.current.setView([selectedState.lat, selectedState.lng], Math.min(selectedState.defaultZoom || 6, 7));
      } else {
        mapInstanceRef.current.setView([38.5, -96.5], 4);
      }
    }
  };

  return (
    <section 
      aria-label="Interactive United States Map showing research-backed local market hubs"
      className="w-full relative bg-white border border-[#dfded4] rounded-3xl overflow-hidden shadow-xs"
    >
      {/* Map Header Status Bar */}
      <div className="flex flex-wrap items-center justify-between px-5 py-3.5 bg-[#fcfbf9] border-b border-[#dfded4] text-xs">
        <div className="flex items-center gap-2.5">
          <span className="flex h-2.5 w-2.5 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#123e35] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#123e35]"></span>
          </span>
          <span className="font-mono font-bold uppercase tracking-wider text-[11px] text-[#151716]">
            {currentLevel === 'district' && selectedDistrict 
              ? `District Focus: ${selectedDistrict.name}, ${selectedDistrict.stateCode}`
              : currentLevel === 'state' && selectedState
              ? `Statewide Network: ${selectedState.name}`
              : 'Contiguous United States Market Directory'
            }
          </span>
          <span className="hidden sm:inline-block px-2 py-0.5 rounded text-[10px] font-mono bg-[#dfded4]/50 text-[#4e524f]">
            Zoom Clamped: District-Level (Max 11)
          </span>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 text-[11px] font-semibold text-[#4e524f] mt-2 sm:mt-0">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#123e35]" aria-hidden="true" />
            <span>Active District Studies ({districts.length})</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#bc5f40]" aria-hidden="true" />
            <span>State Hubs ({states.length})</span>
          </div>
        </div>
      </div>

      {/* Actual Map Canvas */}
      <div className="relative w-full h-[380px] sm:h-[480px] lg:h-[540px] bg-[#eef0eb]">
        <div 
          ref={mapContainerRef} 
          className="w-full h-full z-10"
          tabIndex={0}
          role="application"
          aria-label="Map Canvas. Use plus and minus controls or keyboard to navigate between mapped pins."
        />

        {/* Floating Custom Zoom Controls (Full ADA Compliance) */}
        <div className="absolute top-4 right-4 z-20 flex flex-col gap-1.5 shadow-md bg-white/95 backdrop-blur-xs p-1 rounded-xl border border-[#dfded4]">
          <button
            type="button"
            onClick={handleZoomIn}
            aria-label="Zoom in to district level"
            title="Zoom In"
            className="w-9 h-9 flex items-center justify-center rounded-lg text-[#151716] hover:bg-[#f7f6f2] active:bg-[#dfded4] font-bold text-lg cursor-pointer focus-visible:outline-2 focus-visible:outline-[#123e35]"
          >
            +
          </button>
          <div className="h-[1px] bg-[#dfded4] mx-1" aria-hidden="true" />
          <button
            type="button"
            onClick={handleZoomOut}
            aria-label="Zoom out"
            title="Zoom Out"
            className="w-9 h-9 flex items-center justify-center rounded-lg text-[#151716] hover:bg-[#f7f6f2] active:bg-[#dfded4] font-bold text-lg cursor-pointer focus-visible:outline-2 focus-visible:outline-[#123e35]"
          >
            &minus;
          </button>
          <div className="h-[1px] bg-[#dfded4] mx-1" aria-hidden="true" />
          <button
            type="button"
            onClick={handleResetView}
            aria-label="Reset map viewport"
            title="Reset View"
            className="w-9 h-9 flex items-center justify-center rounded-lg text-[#123e35] hover:bg-[#f7f6f2] active:bg-[#dfded4] cursor-pointer focus-visible:outline-2 focus-visible:outline-[#123e35]"
          >
            <Compass className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>

        {/* Mobile Interaction Hint Badge */}
        <div className="absolute bottom-4 left-4 z-20 pointer-events-none hidden sm:flex items-center gap-2 bg-white/90 backdrop-blur-xs px-3 py-1.5 rounded-lg border border-[#dfded4] text-[10px] font-mono text-[#4e524f]">
          <Info className="w-3.5 h-3.5 text-[#123e35]" aria-hidden="true" />
          <span>Click any pin to inspect local web adoption metrics & open the research study</span>
        </div>
      </div>

      {/* Screen Reader & Keyboard Accessible Location Alternative List (ADA WCAG 2.1 AA) */}
      <div className="px-5 py-4 bg-[#fcfbf9] border-t border-[#dfded4]">
        <details className="group">
          <summary className="cursor-pointer text-xs font-bold text-[#123e35] flex items-center gap-2 select-none hover:underline focus-visible:outline-2 focus-visible:outline-[#123e35]">
            <span>Accessible Location Directory List (For Screen Readers & Keyboard Users)</span>
          </summary>
          <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 pt-2 text-xs">
            {districts.map(dist => (
              <a
                key={dist.slug}
                href={`/locations/${dist.stateSlug}/${dist.slug}`}
                onClick={(e) => {
                  e.preventDefault();
                  onNavigateToLocation(`/locations/${dist.stateSlug}/${dist.slug}`);
                }}
                className="p-2.5 rounded-xl bg-white border border-[#dfded4] hover:border-[#123e35] transition-colors flex items-center justify-between group/link focus-visible:ring-2 focus-visible:ring-[#123e35]"
              >
                <div>
                  <span className="block font-bold text-[#151716] group-hover/link:text-[#123e35]">
                    {dist.name}, {dist.stateCode}
                  </span>
                  <span className="block text-[10px] text-[#4e524f] font-mono">
                    {dist.webUtilizationRate} Web Research
                  </span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-[#bc5f40] opacity-0 group-hover/link:opacity-100 transition-opacity" aria-hidden="true" />
              </a>
            ))}
          </div>
        </details>
      </div>
    </section>
  );
}
