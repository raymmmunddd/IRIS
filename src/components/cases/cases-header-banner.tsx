export function CasesHeaderBanner() {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-[#214b91] bg-gradient-to-r from-[#172f5f] via-[#1b417f] to-[#1e4fa3] px-6 py-7 shadow-md">

      {/* Ambient Glow */}
      <div className="absolute -top-12 right-0 h-40 w-40 rounded-full bg-white/10 blur-3xl" />
      <div className="absolute bottom-0 left-1/3 h-24 w-24 rounded-full bg-[#f2b705]/10 blur-2xl" />

      {/* Content */}
      <div className="relative z-10">
        <h1 className="text-2xl font-semibold tracking-tight text-white">
          Case Management
        </h1>

        <p className="mt-1 text-sm text-blue-100/90">
          Manage and track all reported incidents.
        </p>
      </div>
    </div>
  )
}