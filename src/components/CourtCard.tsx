// src/components/CourtCard.tsx
import Link from "next/link";
import Image from "next/image"; // Import Image from Next.js for optimized images
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { MapPin, Clock, Phone } from "lucide-react";

type Court = {
  id: number;
  name: string;
  location: string;
  available_times: string[] | null | undefined;
  amenities: string[] | null | undefined;
  price_per_hour: string;
  color: string;
  rating: number;
  reviews: number;
  contact_number?: string;
  images: string[]; // New field for image URLs
};

export const CourtCard = ({ court }: { court: Court }) => {
  const available_times = court.available_times || [];
  const amenities = court.amenities || [];

  return (
    <Link href={`/courts/${court.id}`} className="block">
      <Card className="overflow-hidden bg-white dark:bg-gray-800 shadow-md hover:shadow-xl transition duration-300 border-0 rounded-xl">
        <div className="relative">
          {court.images && court.images.length > 0 ? (
            <Image
              src={court.images[0]} // Display the first image
              alt={`${court.name} image`}
              width={400} // Adjust based on your design
              height={224} // Matches h-56 (56 * 4 = 224px)
              className="w-full h-56 object-cover" // Ensure it fits the card
              priority={true} // Optional: Load this image with priority
            />
          ) : (
            <div
              className="w-full h-56"
              style={{ backgroundColor: court.color }}
            />
          )}
          <div className="absolute top-4 right-4 bg-white dark:bg-gray-800 rounded-lg py-1 px-3 shadow-md flex items-center">
            <span className="text-yellow-500 mr-1">★</span>
            <span className="font-medium text-gray-800 dark:text-white">
              {court.rating}
            </span>
            <span className="text-gray-500 dark:text-gray-400 text-sm ml-1">
              ({court.reviews})
            </span>
          </div>
        </div>
        <div className="p-6">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            {court.name}
          </h3>
          <div className="flex items-center text-gray-600 dark:text-gray-300 mb-2">
            <MapPin className="w-4 h-4 mr-2 text-gray-500 dark:text-gray-400" />
            {court.location}
          </div>
          {court.contact_number && (
            <div className="flex items-center text-gray-600 dark:text-gray-300 mb-4">
              <Phone className="w-4 h-4 mr-2 text-gray-500 dark:text-gray-400" />
              {court.contact_number}
            </div>
          )}
          <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-2">
            Available Today:
          </h4>
          <div className="flex flex-wrap gap-2 mb-4">
            {available_times.length > 0 ? (
              available_times.map((time, index) => (
                <Badge
                  key={index}
                  variant="outline"
                  className="py-1 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 flex items-center"
                >
                  <Clock className="w-3 h-3 mr-1" />
                  {time}
                </Badge>
              ))
            ) : (
              <Badge
                variant="outline"
                className="py-1 border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400"
              >
                No times available
              </Badge>
            )}
          </div>
          <div className="flex flex-wrap gap-2 mb-5">
            {amenities.length > 0 ? (
              amenities.map((amenity, index) => (
                <Badge
                  key={index}
                  variant="secondary"
                  className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                >
                  {amenity}
                </Badge>
              ))
            ) : (
              <Badge
                variant="secondary"
                className="bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400"
              >
                No amenities listed
              </Badge>
            )}
          </div>
          <div className="flex items-center justify-between mb-5">
            <span className="text-gray-900 dark:text-white font-bold text-lg">
              Rs. {court.price_per_hour}
            </span>
            <span className="text-gray-500 dark:text-gray-400 text-sm">
              per hour
            </span>
          </div>
          <Button
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg py-2"
            onClick={(e) => e.stopPropagation()}
          >
            Book Now
          </Button>
        </div>
      </Card>
    </Link>
  );
};
