"use client"

import { MapPin } from "lucide-react"

// A simple visual representation of a map with puroks
// Since we don't have a real map library, we'll create a stylized conceptual map
const puroks = [
  { id: 1, name: "Purok 1", cases: 24, x: 20, y: 30, color: "bg-orange-300" },
  { id: 2, name: "Purok 2", cases: 45, x: 50, y: 20, color: "bg-orange-500" },
  { id: 3, name: "Purok 3", cases: 68, x: 80, y: 40, color: "bg-orange-600" },
  { id: 4, name: "Purok 4", cases: 32, x: 30, y: 70, color: "bg-orange-400" },
  { id: 5, name: "Purok 5", cases: 56, x: 70, y: 75, color: "bg-orange-500" },
  { id: 6, name: "Purok 6", cases: 12, x: 50, y: 50, color: "bg-orange-200" },
]

export function PurokMap() {
  return (
    <div className="flex h-full flex-col rounded-xl border border-border bg-card p-6 shadow-sm">
      <h3 className="mb-2 text-lg font-semibold leading-none tracking-tight">Case Distribution Map</h3>
      <p className="text-sm text-muted-foreground mb-4">Barangay East Tapinac - Cases per Purok</p>
      
      <div className="relative w-full h-[300px] bg-slate-50 rounded-lg border border-dashed border-slate-200 overflow-hidden">
        {/* Abstract Map Background */}
        <div className="absolute inset-0 opacity-10">
            <svg width="100%" height="100%">
                <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                    <path d="M 40 0 L 0 0 0 40" fill="none" stroke="black" strokeWidth="0.5"/>
                </pattern>
                <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>
        </div>

        {/* Purok Bubbles */}
        {puroks.map((purok) => (
          <div
            key={purok.id}
            className={`absolute flex flex-col items-center justify-center rounded-full shadow-lg transition-transform hover:scale-110 cursor-pointer ${purok.color} text-white`}
            style={{
              left: `${purok.x}%`,
              top: `${purok.y}%`,
              width: `${Math.max(40, purok.cases * 1.5)}px`,
              height: `${Math.max(40, purok.cases * 1.5)}px`,
              transform: 'translate(-50%, -50%)',
              opacity: 0.9
            }}
            title={`${purok.name}: ${purok.cases} cases`}
          >
            <span className="text-xs font-bold">{purok.cases}</span>
          </div>
        ))}
        
        {/* Legend/Labels positioned near bubbles */}
        {puroks.map((purok) => (
            <div 
                key={`label-${purok.id}`}
                className="absolute text-xs font-semibold text-slate-700 bg-white/80 px-1.5 py-0.5 rounded shadow-sm backdrop-blur-sm pointer-events-none"
                style={{
                    left: `${purok.x}%`,
                    top: `${purok.y}%`,
                    transform: 'translate(-50%, 25px)', // Offset below bubble
                }}
            >
                {purok.name}
            </div>
        ))}

        <div className="absolute bottom-2 right-2 flex items-center gap-1 bg-white/90 p-1.5 rounded text-xs text-muted-foreground shadow-sm">
            <MapPin className="h-3 w-3" />
            <span>Map View</span>
        </div>
      </div>
    </div>
  )
}
