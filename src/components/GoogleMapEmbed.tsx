// src/components/GoogleMapEmbed.tsx
import { MapPin } from "lucide-react";

type GoogleMapEmbedProps = {
  googleMapsLink?: string;
};

export function GoogleMapEmbed({ googleMapsLink }: GoogleMapEmbedProps) {
  if (!googleMapsLink) {
    return (
      <div className="flex items-center justify-center p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
        <MapPin className="w-6 h-6 text-gray-500 dark:text-gray-400 mr-2" />
        <p className="text-gray-500 dark:text-gray-400">
          No map location provided
        </p>
      </div>
    );
  }

  // Convert standard Google Maps URL to embed URL
  let embedSrc = googleMapsLink;
  if (googleMapsLink.includes("maps.google.com")) {
    // Extract query parameters (e.g., q=lat,lng) and convert to embed format
    const url = new URL(googleMapsLink);
    const query = url.searchParams.get("q");
    if (query) {
      const [lat, lng] = query.split(",");
      if (lat && lng) {
        embedSrc = `https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3000!2d${lng.trim()}!3d${lat.trim()}!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!5e0!3m2!1sen!2sus!4v${Date.now()}!5m2!1sen!2sus`;
      }
    }
  }
  // If the link is already an embed URL, use it directly

  return (
    <div className="relative w-full h-64 rounded-lg overflow-hidden">
      <iframe
        src={embedSrc}
        width="100%"
        height="100%"
        style={{ border: 0 }}
        allowFullScreen
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        className="w-full h-full"
      />
    </div>
  );
}
