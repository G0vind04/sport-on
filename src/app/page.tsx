"use client";

import { FC, useState, useEffect } from "react";
import { Navigation } from "../components/Navigation";
import { HeroSection } from "../components/HeroSection";
import { StatCard } from "../components/StatCard";
import { TournamentCard } from "../components/TournamentCard";
import { CourtCard } from "../components/CourtCard";
import { MatchCard } from "../components/MatchCard";
import { CTASection } from "../components/CTASection";
import { Footer } from "../components/Footer";
import { Button } from "../components/ui/button";
import { Calendar, MapPin, Users, ChevronRight } from "lucide-react";
import { supabase } from "../lib/supabase";
import { Skeleton } from "../components/ui/skeleton";
import Link from "next/link";

export interface UserProfile {
  name: string;
  profile_pic?: string;
}

// Define Tournament type based on your database schema
type Tournament = {
  id: number;
  name: string;
  description: string;
  date: string;
  location: string;
  registered_players: number;
  max_players: number;
  color: string;
  category: string;
  city: string | null;
  images: string[];
};

// Define Court type based on your database schema and CourtCard
type Court = {
  id: number;
  name: string;
  location: string;
  available_times: string[] | null;
  amenities: string[] | null;
  price_per_hour: string;
  color: string;
  rating: number | null; // Matches CourtCard's nullable rating
  reviews: number;
  images: string[];
};

// Hardcoded courts based on provided data
const hardcodedCourts: Court[] = [
  {
    id: 5,
    name: "Banerji Memorial Club",
    location: "G6H7+2F8, Swaraj Round N, Round North, Thrissur, Kerala 680001",
    available_times: ["7:00am-11am", "3pm-9pm"], // Adjusted spacing for consistency
    amenities: ["Wheel chair accessible", "Car Park", "Clean Washroom"],
    price_per_hour: "200", // Converted to string as expected by CourtCard
    color: "#ff0000",
    rating: 0,
    reviews: 0,
    images: [
      "https://lcemayxfkiqvquxxqaje.supabase.co/storage/v1/object/public/court-images/92f648c7-ea5e-4304-a979-6de8d6392925/1742836675129-Screenshot%202025-03-24%20224530.png",
    ],
  },
  {
    id: 6,
    name: "Cosmos Club",
    location: "Near, Potta Rd, NH Bye Pass, Chalakudy, Kerala 680307",
    available_times: ["8:00am-9pm"], // Adjusted spacing
    amenities: ["Parking Space", "Swimming pool", "Clean Washroom"],
    price_per_hour: "100", // Converted to string
    color: "#4B5EAA",
    rating: 0,
    reviews: 0,
    images: [
      "https://lcemayxfkiqvquxxqaje.supabase.co/storage/v1/object/public/court-images/92f648c7-ea5e-4304-a979-6de8d6392925/1742837725859-Screenshot%202025-03-24%20230510.png",
    ],
  },
];

// Hardcoded upcoming matches (unchanged)
const upcomingMatches = [
  {
    id: 1,
    players: ["Alex Wong", "Sarah Kim"],
    against: ["Michael Chen", "Emma Liu"],
    date: "March 25, 2025",
    time: "6:30 PM",
    court: "City Sports Complex - Court 3",
  },
  {
    id: 2,
    players: ["David Park", "Jennifer Lee"],
    against: ["Robert Zhao", "Lisa Wang"],
    date: "March 28, 2025",
    time: "7:00 PM",
    court: "North End Court - Court 1",
  },
];

const HomePage: FC = () => {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [courts] = useState<Court[]>(hardcodedCourts); // Initialize with hardcoded data
  const [tournamentsLoading, setTournamentsLoading] = useState(true);
  const [courtsLoading] = useState(false); // No loading for hardcoded courts
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Fetch tournaments (remains dynamic)
    const fetchTournaments = async () => {
      try {
        setTournamentsLoading(true);
        const { data, error: tournamentError } = await supabase
          .from("tournaments")
          .select(
            "id, name, description, date, location, registered_players, max_players, color, category, city, images"
          )
          .gte("date", new Date().toISOString()) // Only future tournaments
          .order("date", { ascending: true })
          .limit(3);

        if (tournamentError)
          throw new Error(
            "Failed to fetch tournaments: " + tournamentError.message
          );
        setTournaments(data || []);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "An unexpected error occurred";
        console.error(errorMessage);
        setError(errorMessage);
      } finally {
        setTournamentsLoading(false);
      }
    };

    fetchTournaments();
    // No fetch for courts since they’re hardcoded
  }, []);

  // Skeleton loading components
  const TournamentSkeleton = () => (
    <div className="border rounded-lg p-4 shadow-sm">
      <Skeleton className="h-48 w-full rounded-md mb-4" />
      <Skeleton className="h-6 w-3/4 mb-2" />
      <Skeleton className="h-4 w-full mb-2" />
      <Skeleton className="h-4 w-2/3 mb-4" />
      <div className="flex justify-between items-center">
        <Skeleton className="h-10 w-24" />
        <Skeleton className="h-10 w-24" />
      </div>
    </div>
  );

  const CourtSkeleton = () => (
    <div className="border rounded-lg p-4 shadow-sm">
      <Skeleton className="h-52 w-full rounded-md mb-4" />
      <Skeleton className="h-6 w-3/4 mb-2" />
      <Skeleton className="h-4 w-full mb-4" />
      <div className="flex space-x-2 mb-4">
        <Skeleton className="h-6 w-20" />
        <Skeleton className="h-6 w-20" />
        <Skeleton className="h-6 w-20" />
      </div>
      <Skeleton className="h-10 w-full" />
    </div>
  );

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navigation />
        <div className="max-w-screen-xl mx-auto px-4 py-16 flex flex-col items-center justify-center">
          <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md text-center">
            <h2 className="text-2xl font-bold text-red-600 dark:text-red-400 mb-4">
              Something went wrong
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-6">{error}</p>
            <Button onClick={() => window.location.reload()}>Try Again</Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navigation />
      <div className="max-w-screen-xl mx-auto px-4 py-8">
        <HeroSection />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <StatCard icon={Users} value="50+" label="Active Players" />
          <StatCard icon={Calendar} value="15+" label="Tournaments Monthly" />
          <StatCard icon={MapPin} value="40+" label="Courts Available" />
        </div>

        <section id="tournaments" className="mb-16">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
              Upcoming Tournaments
            </h2>
            <Link href="/tournaments">
              <Button
                variant="ghost"
                className="text-indigo-600 dark:text-indigo-400"
              >
                View All <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {tournamentsLoading ? (
              <>
                <TournamentSkeleton />
                <TournamentSkeleton />
                <TournamentSkeleton />
              </>
            ) : tournaments.length > 0 ? (
              tournaments.map((tournament) => (
                <TournamentCard key={tournament.id} tournament={tournament} />
              ))
            ) : (
              <p className="text-gray-600 dark:text-gray-300 col-span-3">
                No upcoming tournaments found.
              </p>
            )}
          </div>
        </section>

        <section id="court-locator" className="mb-16">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
              Find and Book a Court
            </h2>
            <Link href="/courts">
              <Button
                variant="ghost"
                className="text-indigo-600 dark:text-indigo-400"
              >
                View All <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {courtsLoading ? (
              <>
                <CourtSkeleton />
                <CourtSkeleton />
              </>
            ) : courts.length > 0 ? (
              courts.map((court) => <CourtCard key={court.id} court={court} />)
            ) : (
              <p className="text-gray-600 dark:text-gray-300 col-span-2">
                No courts found.
              </p>
            )}
          </div>
        </section>

        <section id="matches" className="mb-16">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
              Your Upcoming Matches
            </h2>
            <Button
              variant="ghost"
              className="text-indigo-600 dark:text-indigo-400"
            >
              View All <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
          <div className="grid grid-cols-1 gap-6">
            {upcomingMatches.map((match) => (
              <MatchCard key={match.id} match={match} />
            ))}
          </div>
        </section>
        <CTASection />
      </div>
      <Footer />
    </div>
  );
};

export default HomePage;
