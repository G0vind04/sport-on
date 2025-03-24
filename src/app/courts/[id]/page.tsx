// src/app/courts/[id]/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Image from "next/image"; // Import Image for optimized image rendering
import { supabase } from "../../../lib/supabase";
import { Navigation } from "../../../components/Navigation";
import { Footer } from "../../../components/Footer";
import { Button } from "../../../components/ui/button";
import { Badge } from "../../../components/ui/badge";
import { MapPin, Clock, Phone, Trash2 } from "lucide-react";

// Define Court type (consistent with Courts.tsx and CourtCard.tsx)
type Court = {
  id: number;
  name: string;
  location: string;
  availableTimes: string[];
  amenities: string[];
  pricePerHour: string;
  color: string;
  rating: number;
  reviews: number;
  description?: string;
  city?: string;
  contactNumber?: string;
  created_by?: string;
  images: string[]; // New field for image URLs
};

export default function CourtOverview() {
  const { id } = useParams(); // Get the dynamic id from the URL
  const [court, setCourt] = useState<Court | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentUserId, setCurrentUserId] = useState<string | null>(null); // Track current user ID

  useEffect(() => {
    const fetchCourtAndUser = async () => {
      try {
        // Fetch current user
        const { data: userData, error: userError } =
          await supabase.auth.getUser();
        if (userError) {
          console.error("Error fetching user:", userError.message);
        } else if (userData.user) {
          setCurrentUserId(userData.user.id); // Set current user's ID
        }

        // Fetch court data
        const { data, error } = await supabase
          .from("courts")
          .select("*")
          .eq("id", id)
          .single(); // Fetch a single row by id

        if (error) {
          throw new Error("Failed to fetch court: " + error.message);
        }

        if (!data) {
          throw new Error("Court not found");
        }

        // Transform Supabase data to match Court type
        const courtData: Court = {
          id: data.id,
          name: data.name,
          location: data.location,
          availableTimes: data.available_times || [],
          amenities: data.amenities || [],
          pricePerHour: data.price_per_hour,
          color: data.color,
          rating: data.rating,
          reviews: data.reviews,
          description: data.description,
          city: data.city,
          contactNumber: data.contact_number,
          created_by: data.created_by,
          images: data.images || [], // Include images
        };

        setCourt(courtData);
      } catch (err: unknown) {
        const errorMessage =
          err instanceof Error ? err.message : "An unexpected error occurred";
        console.error(errorMessage);
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchCourtAndUser();
  }, [id]);

  const handleDeleteCourt = async () => {
    if (!court || !currentUserId || court.created_by !== currentUserId) return;

    if (!confirm(`Are you sure you want to delete "${court.name}"?`)) return;

    try {
      const { error } = await supabase
        .from("courts")
        .delete()
        .eq("id", court.id)
        .eq("created_by", currentUserId); // Ensure only the creator can delete

      if (error) {
        throw new Error("Failed to delete court: " + error.message);
      }

      // Redirect to /courts after deletion
      window.location.href = "/courts";
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "An unexpected error occurred";
      console.error(errorMessage);
      setError(errorMessage);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <p className="text-gray-600 dark:text-gray-300">Loading...</p>
      </div>
    );
  }

  if (error || !court) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <p className="text-red-600 dark:text-red-300">
          {error || "Court not found"}
        </p>
      </div>
    );
  }

  const canDelete = currentUserId && court.created_by === currentUserId;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      <Navigation />
      <div className="flex-grow container mx-auto px-4 py-8">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
          {court.images && court.images.length > 0 ? (
            <Image
              src={court.images[0]} // Display the first image
              alt={`${court.name} image`}
              width={1200} // Adjust based on your design (container max-width)
              height={256} // Matches h-64 (64 * 4 = 256px)
              className="w-full h-64 rounded-t-xl object-cover"
              priority={true} // Optional: Load with priority
            />
          ) : (
            <div
              className="w-full h-64 rounded-t-xl"
              style={{ backgroundColor: court.color }}
            />
          )}
          <div className="mt-6">
            <div className="flex justify-between items-center mb-4">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                {court.name}
              </h1>
              {canDelete && (
                <Button
                  variant="destructive"
                  onClick={handleDeleteCourt}
                  className="flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete Court
                </Button>
              )}
            </div>
            <div className="flex items-center text-gray-600 dark:text-gray-300 mb-2">
              <MapPin className="w-5 h-5 mr-2 text-gray-500 dark:text-gray-400" />
              {court.location}, {court.city}
            </div>
            {court.contactNumber && (
              <div className="flex items-center text-gray-600 dark:text-gray-300 mb-4">
                <Phone className="w-5 h-5 mr-2 text-gray-500 dark:text-gray-400" />
                {court.contactNumber}
              </div>
            )}
            <p className="text-gray-700 dark:text-gray-200 mb-6">
              {court.description || "No description available."}
            </p>

            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Available Times
              </h2>
              <div className="flex flex-wrap gap-2">
                {court.availableTimes.length > 0 ? (
                  court.availableTimes.map((time, index) => (
                    <Badge
                      key={index}
                      variant="outline"
                      className="py-1 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 flex items-center"
                    >
                      <Clock className="w-4 h-4 mr-1" />
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
            </div>

            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Amenities
              </h2>
              <div className="flex flex-wrap gap-2">
                {court.amenities.length > 0 ? (
                  court.amenities.map((amenity, index) => (
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
            </div>

            <div className="flex items-center justify-between mb-6">
              <div>
                <span className="text-gray-900 dark:text-white font-bold text-2xl">
                  {court.pricePerHour}
                </span>
                <span className="text-gray-500 dark:text-gray-400 text-sm ml-2">
                  per hour
                </span>
              </div>
              <div className="flex items-center">
                <span className="text-yellow-500 mr-1">★</span>
                <span className="text-gray-800 dark:text-white font-medium">
                  {court.rating}
                </span>
                <span className="text-gray-500 dark:text-gray-400 text-sm ml-1">
                  ({court.reviews} reviews)
                </span>
              </div>
            </div>

            <Button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg py-3">
              Book Now
            </Button>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
