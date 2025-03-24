// src/components/BookingsList.tsx
"use client";

import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { Badge } from "./ui/badge";
import { Clock, User } from "lucide-react";

type Booking = {
  id: number;
  booking_time: string;
  booking_date: string;
  user_name: string;
};

type BookingsListProps = {
  courtId: number;
};

export function BookingsList({ courtId }: BookingsListProps) {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        // Fetch all bookings for this court, irrespective of date
        const { data: bookingsData, error: bookingsError } = await supabase
          .from("court_bookings")
          .select("id, booking_time, booking_date, user_id")
          .eq("court_id", courtId)
          .order("booking_date", { ascending: true })
          .order("booking_time", { ascending: true });

        if (bookingsError) {
          throw new Error("Failed to fetch bookings: " + bookingsError.message);
        }

        console.log("Fetched bookings:", bookingsData); // Debug: Check raw data

        if (bookingsData && bookingsData.length > 0) {
          // Get unique user IDs
          const userIds = [...new Set(bookingsData.map((b) => b.user_id))];
          console.log("Unique user IDs:", userIds); // Debug: Check user IDs

          // Fetch user names from profiles
          const { data: profilesData, error: profilesError } = await supabase
            .from("profiles")
            .select("id, name")
            .in("id", userIds);

          if (profilesError) {
            throw new Error(
              "Failed to fetch user profiles: " + profilesError.message
            );
          }

          console.log("Fetched profiles:", profilesData); // Debug: Check profiles

          // Create a map of user IDs to names
          const profilesMap = new Map(
            profilesData?.map((p) => [p.id, p.name]) || []
          );

          // Enrich bookings with user names
          const enrichedBookings = bookingsData.map((booking) => ({
            id: booking.id,
            booking_time: booking.booking_time,
            booking_date: booking.booking_date,
            user_name: profilesMap.get(booking.user_id) || "Unknown",
          }));

          console.log("Enriched bookings:", enrichedBookings); // Debug: Check final data

          setBookings(enrichedBookings);
        } else {
          setBookings([]);
        }
      } catch (err: unknown) {
        const errorMessage =
          err instanceof Error ? err.message : "An unexpected error occurred";
        console.error(errorMessage);
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [courtId]);

  if (loading) {
    return (
      <p className="text-gray-600 dark:text-gray-300">Loading bookings...</p>
    );
  }

  if (error) {
    return <p className="text-red-600 dark:text-red-300">{error}</p>;
  }

  return (
    <div className="mt-6">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
        Booking Details
      </h2>
      {bookings.length === 0 ? (
        <p className="text-gray-600 dark:text-gray-300">No bookings yet.</p>
      ) : (
        <ul className="space-y-2">
          {bookings.map((booking) => (
            <li
              key={booking.id}
              className="flex items-center gap-2 text-gray-700 dark:text-gray-300"
            >
              <Badge
                variant="outline"
                className="flex items-center gap-1 border-gray-300 dark:border-gray-600"
              >
                <Clock className="w-4 h-4" />
                {booking.booking_time}
              </Badge>
              <span>
                on {new Date(booking.booking_date).toLocaleDateString()} by
              </span>
              <Badge
                variant="secondary"
                className="flex items-center gap-1 bg-gray-100 dark:bg-gray-700"
              >
                <User className="w-4 h-4" />
                {booking.user_name}
              </Badge>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
