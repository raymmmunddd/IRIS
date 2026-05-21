import type { MetadataRoute } from "next"

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "IRIS Barangay East Tapinac",
    short_name: "IRIS",
    description: "Incident Reporting and Information System for Barangay East Tapinac",
    start_url: "/resident",
    scope: "/",
    display: "standalone",
    background_color: "#f8fafc",
    theme_color: "#1E4FA3",
    orientation: "portrait",
    icons: [
      {
        src: "/EastTapinac.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/EastTapinac.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  }
}
