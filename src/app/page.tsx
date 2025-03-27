"use client"; 

import { FC } from "react";
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

export interface UserProfile {
  name: string;
  profile_pic?: string;
}


const HomePage: FC = () => {
  const tournaments = [
    {
      id: 1,
      name: "Spring Badminton Open",
      description: "A local open tournament for all skill levels.",
      date: "April 10, 2025",
      location: "City Sports Complex",
      registered_players: 24, // Changed from registeredPlayers
      max_players: 32, // Changed from maxPlayers
      color: "#4B5EAA",
      category: "Open",
      city: "Downtown", // Added missing field
      images: ["https://example.com/tournament-image.jpg"], // Added missing field
    },
    {
      id: 2,
      name: "Summer Smash",
      description: "A highly competitive tournament for advanced players.",
      date: "June 12, 2025",
      location: "North End Court",
      registered_players: 16,
      max_players: 16,
      color: "#6B46C1",
      category: "Advanced",
      city: "Uptown",
      images: ["https://example.com/tournament-image.jpg"],
    },
    {
      id: 3,
      name: "Community Badminton League",
      description: "Join the community league for casual and fun matches.",
      date: "July 15, 2025",
      location: "Downtown Recreation Center",
      registered_players: 18,
      max_players: 40,
      color: "#2F855A",
      category: "Casual",
      city: "Midtown",
      images: ["https://example.com/tournament-image.jpg"],
    },
  ];


  const courts = [
    {
      id: 1,
      name: "City Sports Complex",
      location: "123 Park Ave, Downtown",
      available_times: ["10:00 AM - 12:00 PM", "2:00 PM - 4:00 PM"], // Changed key
      amenities: ["Showers", "Pro Shop", "Parking"],
      price_per_hour: "$15", // Changed key
      color: "#2B6CB0",
      rating: 4.8,
      reviews: 124,
      images: ["https://example.com/court-image.jpg"],
    },
    {
      id: 2,
      name: "North End Court",
      location: "456 Maple St, Uptown",
      available_times: ["8:00 AM - 10:00 AM", "12:00 PM - 2:00 PM"],
      amenities: ["Locker Room", "Cafe", "Equipment Rental"],
      price_per_hour: "$12",
      color: "#9F7AEA",
      rating: 4.5,
      reviews: 86,
      images: ["https://example.com/court-image.jpg"],
    },
  ];


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

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navigation />
      <div className="max-w-screen-xl mx-auto px-4 py-8">
        <HeroSection />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <StatCard icon={Users} value="2,500+" label="Active Players" />
          <StatCard icon={Calendar} value="15+" label="Tournaments Monthly" />
          <StatCard icon={MapPin} value="40+" label="Courts Available" />
        </div>

        <section id="tournaments" className="mb-16">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
              Upcoming Tournaments
            </h2>
            <Button
              variant="ghost"
              className="text-indigo-600 dark:text-indigo-400"
            >
              View All <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {tournaments.map((tournament) => (
              <TournamentCard key={tournament.id} tournament={tournament} />
            ))}
          </div>
        </section>

        <section id="court-locator" className="mb-16">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
              Find and Book a Court
            </h2>
            <Button
              variant="ghost"
              className="text-indigo-600 dark:text-indigo-400"
            >
              View All <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {courts.map((court) => (
              <CourtCard key={court.id} court={court} />
            ))}
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
