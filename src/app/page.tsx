"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import Link from "next/link";
import Image from "next/image";
import { UserCard } from "../components/UserCard";
import { Navigation } from "../components/Navigation";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../components/ui/tabs";
import { Calendar } from "../components/ui/calendar";
import { Badge } from "../components/ui/badge";
import {
  User,
  Calendar as CalendarIcon,
  MapPin,
  Trophy,
  Activity,
} from "lucide-react";

// Define UserProfile type (exported for reuse)
export type UserProfile = {
  id: string;
  email: string;
  name: string;
  profile_pic?: string;
  skill_level?: string;
  location?: string;
  created_at: string;
} | null;

// Define event type
type Event = {
  id: string;
  title: string;
  date: string;
  location: string;
  participants: number;
  max_participants: number;
  skill_level: string;
};

// Define court type
type Court = {
  id: string;
  name: string;
  location: string;
  image?: string;
  rating: number;
  price: string;
  indoor: boolean;
};

export default function Home() {
  const [user, setUser] = useState<UserProfile>(null);
  const [nearbyPlayers, setNearbyPlayers] = useState<UserProfile[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([]);
  const [nearbyCourts, setNearbyCourts] = useState<Court[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [date, setDate] = useState<Date | undefined>(new Date());

  useEffect(() => {
    const fetchUserData = async () => {
      setIsLoading(true);
      try {
        const { data } = await supabase.auth.getUser();
        if (data.user) {
          const { data: userData } = await supabase
            .from("users")
            .select("*")
            .eq("id", data.user.id)
            .single();
          setUser(userData);

          if (userData?.location) {
            const { data: nearbyData } = await supabase
              .from("users")
              .select("*")
              .eq("location", userData.location)
              .neq("id", userData.id)
              .limit(6);
            setNearbyPlayers(nearbyData || []);
          }

          const { data: eventsData } = await supabase
            .from("events")
            .select("*")
            .gte("date", new Date().toISOString())
            .order("date", { ascending: true })
            .limit(3);
          setUpcomingEvents(eventsData || []);

          if (userData?.location) {
            const { data: courtsData } = await supabase
              .from("courts")
              .select("*")
              .eq("location", userData.location)
              .limit(4);
            setNearbyCourts(courtsData || []);
          }
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = {
      weekday: "short",
      month: "short",
      day: "numeric",
    };
    return new Date(dateString).toLocaleDateString("en-US", options);
  };

  const getSkillLevelColor = (level: string) => {
    switch (level?.toLowerCase()) {
      case "beginner":
        return "bg-emerald-100 text-emerald-700";
      case "intermediate":
        return "bg-indigo-100 text-indigo-700";
      case "advanced":
        return "bg-violet-100 text-violet-700";
      case "professional":
        return "bg-rose-100 text-rose-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-indigo-600 to-blue-700 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <Image
            src="/images/badminton-court.jpg"
            alt="Badminton Court"
            width={1920}
            height={1080}
            className="w-full h-full object-cover"
          />
        </div>

        <div className="container mx-auto px-6 py-20 relative z-10">
          <Navigation />
          <div className="mt-16 text-center">
            <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight mb-6 leading-tight drop-shadow-lg">
              Badminton Network
            </h1>
            <p className="text-xl md:text-2xl max-w-3xl mx-auto opacity-90 font-light">
              Your hub to connect with players, book courts, and join thrilling
              events.
            </p>
            {!user && (
              <div className="mt-10 flex justify-center gap-4">
                <Button
                  asChild
                  size="lg"
                  className="bg-white text-indigo-700 hover:bg-indigo-50 font-semibold rounded-full px-8 py-3 shadow-md transition-all duration-300"
                >
                  <Link href="/sign-up">Get Started</Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="bg-transparent border-2 border-white text-white hover:bg-white/10 font-semibold rounded-full px-8 py-3 transition-all duration-300"
                >
                  <Link href="/login">Log In</Link>
                </Button>
              </div>
            )}
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-gray-50 to-transparent"></div>
      </section>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-16">
        {user ? (
          <Tabs defaultValue="dashboard" className="space-y-8">
            <TabsList className="flex justify-center gap-2 bg-transparent p-2 rounded-xl shadow-sm border border-gray-200">
              {["dashboard", "events", "players", "courts"].map((tab) => (
                <TabsTrigger
                  key={tab}
                  value={tab}
                  className="px-6 py-2 text-sm font-medium rounded-lg capitalize transition-all duration-200 data-[state=active]:bg-indigo-600 data-[state=active]:text-white data-[state=inactive]:text-gray-600 hover:bg-gray-100"
                >
                  {tab}
                </TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value="dashboard" className="space-y-10">
              <div className="grid lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1">
                  <UserCard user={user} />
                </div>
                <div className="lg:col-span-2 space-y-8">
                  <Card className="p-6 shadow-lg rounded-xl bg-white">
                    <h3 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center">
                      <Activity className="h-6 w-6 text-indigo-500 mr-3" />
                      Your Activity
                    </h3>
                    <div className="space-y-6">
                      <p className="text-gray-600 text-lg">
                        Next Game:{" "}
                        <span className="font-semibold text-indigo-600">
                          Saturday, 10:00 AM
                        </span>
                      </p>
                      <div className="grid grid-cols-3 gap-4">
                        <div className="bg-gray-50 p-4 rounded-lg text-center">
                          <p className="text-xl font-bold text-gray-800">3</p>
                          <p className="text-sm text-gray-500">
                            Recent Matches
                          </p>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-lg text-center">
                          <p className="text-xl font-bold text-gray-800">2</p>
                          <p className="text-sm text-gray-500">
                            Upcoming Events
                          </p>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-lg text-center">
                          <p className="text-xl font-bold text-gray-800">67%</p>
                          <p className="text-sm text-gray-500">Win Rate</p>
                        </div>
                      </div>
                    </div>
                  </Card>
                  <Card className="p-6 shadow-lg rounded-xl bg-white">
                    <h3 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center">
                      <CalendarIcon className="h-6 w-6 text-indigo-500 mr-3" />
                      Your Schedule
                    </h3>
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={setDate}
                      className="mx-auto rounded-lg border shadow-sm"
                    />
                  </Card>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                <Card className="p-6 shadow-lg rounded-xl bg-white">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-2xl font-semibold text-gray-800">
                      Upcoming Events
                    </h3>
                    <Button
                      variant="outline"
                      size="sm"
                      asChild
                      className="rounded-full border-indigo-500 text-indigo-500 hover:bg-indigo-50"
                    >
                      <Link href="/events">View All</Link>
                    </Button>
                  </div>
                  {upcomingEvents.length > 0 ? (
                    upcomingEvents.map((event) => (
                      <div
                        key={event.id}
                        className="border-b border-gray-100 py-4 last:border-b-0 hover:bg-gray-50 rounded-lg px-2 transition-colors duration-200"
                      >
                        <div className="flex justify-between items-start">
                          <div className="space-y-1">
                            <h4 className="text-lg font-medium text-gray-800">
                              {event.title}
                            </h4>
                            <p className="text-sm text-gray-500 flex items-center">
                              <CalendarIcon className="h-4 w-4 mr-2" />
                              {formatDate(event.date)}
                            </p>
                            <p className="text-sm text-gray-500 flex items-center">
                              <MapPin className="h-4 w-4 mr-2" />
                              {event.location}
                            </p>
                          </div>
                          <Badge
                            className={`${getSkillLevelColor(
                              event.skill_level
                            )} font-semibold`}
                          >
                            {event.skill_level}
                          </Badge>
                        </div>
                        <div className="mt-4 flex justify-between items-center">
                          <span className="text-sm text-gray-600">
                            {event.participants}/{event.max_participants}{" "}
                            Players
                          </span>
                          <Button
                            size="sm"
                            className="bg-indigo-600 hover:bg-indigo-700 rounded-full"
                          >
                            Join
                          </Button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 text-center py-4">
                      No upcoming events found.
                    </p>
                  )}
                </Card>

                <Card className="p-6 shadow-lg rounded-xl bg-white">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-2xl font-semibold text-gray-800">
                      Nearby Players
                    </h3>
                    <Button
                      variant="outline"
                      size="sm"
                      asChild
                      className="rounded-full border-indigo-500 text-indigo-500 hover:bg-indigo-50"
                    >
                      <Link href="/players">View All</Link>
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    {nearbyPlayers.length > 0 ? (
                      nearbyPlayers.slice(0, 4).map((player) => (
                        <div
                          key={player.id}
                          className="flex items-center p-3 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                        >
                          <div className="h-12 w-12 rounded-full bg-indigo-100 flex items-center justify-center overflow-hidden mr-3 flex-shrink-0">
                            {player.profile_pic ? (
                              <Image
                                src={player.profile_pic}
                                alt={player.name}
                                width={48}
                                height={48}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <User className="h-6 w-6 text-indigo-500" />
                            )}
                          </div>
                          <div className="overflow-hidden">
                            <p className="text-sm font-medium text-gray-800 truncate">
                              {player.name}
                            </p>
                            <Badge
                              className={`text-xs ${getSkillLevelColor(
                                player.skill_level || ""
                              )}`}
                            >
                              {player.skill_level || "N/A"}
                            </Badge>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-500 col-span-2 text-center py-4">
                        No nearby players found.
                      </p>
                    )}
                  </div>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="events" className="space-y-8">
              <div className="flex justify-between items-center">
                <h2 className="text-3xl font-bold text-gray-800">
                  Upcoming Events
                </h2>
                <Button
                  asChild
                  className="bg-indigo-600 hover:bg-indigo-700 rounded-full"
                >
                  <Link href="/events/create">Create Event</Link>
                </Button>
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {upcomingEvents.length > 0 ? (
                  upcomingEvents.map((event) => (
                    <Card
                      key={event.id}
                      className="overflow-hidden shadow-lg rounded-xl bg-white hover:shadow-xl transition-shadow duration-300"
                    >
                      <div className="bg-indigo-50 p-4 border-b border-indigo-100">
                        <div className="flex justify-between items-center">
                          <h3 className="text-lg font-semibold text-gray-800">
                            {event.title}
                          </h3>
                          <Badge
                            className={getSkillLevelColor(event.skill_level)}
                          >
                            {event.skill_level}
                          </Badge>
                        </div>
                      </div>
                      <div className="p-5 space-y-3">
                        <p className="flex items-center text-gray-600">
                          <CalendarIcon className="h-4 w-4 mr-2 text-indigo-500" />
                          {formatDate(event.date)}
                        </p>
                        <p className="flex items-center text-gray-600">
                          <MapPin className="h-4 w-4 mr-2 text-indigo-500" />
                          {event.location}
                        </p>
                        <p className="flex items-center text-gray-600">
                          <User className="h-4 w-4 mr-2 text-indigo-500" />
                          {event.participants}/{event.max_participants}{" "}
                          Participants
                        </p>
                        <Button className="w-full bg-indigo-600 hover:bg-indigo-700 rounded-full mt-4">
                          Join Event
                        </Button>
                      </div>
                    </Card>
                  ))
                ) : (
                  <div className="col-span-full text-center py-16 bg-white rounded-xl shadow-lg">
                    <h3 className="text-2xl font-medium text-gray-700 mb-3">
                      No Events Scheduled
                    </h3>
                    <p className="text-gray-500 mb-6 max-w-md mx-auto">
                      Start the action—create an event and rally your badminton
                      community!
                    </p>
                    <Button
                      asChild
                      className="bg-indigo-600 hover:bg-indigo-700 rounded-full px-6"
                    >
                      <Link href="/events/create">Create Event</Link>
                    </Button>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="players" className="space-y-8">
              <div>
                <h2 className="text-3xl font-bold text-gray-800">
                  Players Near You
                </h2>
                <p className="text-gray-600 mt-2">
                  Discover and connect with local badminton enthusiasts.
                </p>
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {nearbyPlayers.length > 0 ? (
                  nearbyPlayers.map((player) => (
                    <Card
                      key={player.id}
                      className="p-6 shadow-lg rounded-xl bg-white hover:shadow-xl transition-shadow duration-300 text-center"
                    >
                      <div className="h-24 w-24 rounded-full bg-indigo-100 flex items-center justify-center overflow-hidden mb-4 mx-auto">
                        {player.profile_pic ? (
                          <Image
                            src={player.profile_pic}
                            alt={player.name}
                            width={96}
                            height={96}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <User className="h-12 w-12 text-indigo-500" />
                        )}
                      </div>
                      <h3 className="text-xl font-semibold text-gray-800 mb-2">
                        {player.name}
                      </h3>
                      <Badge
                        className={`${getSkillLevelColor(
                          player.skill_level || ""
                        )} mb-3`}
                      >
                        {player.skill_level || "Not Specified"}
                      </Badge>
                      <p className="text-gray-600 flex items-center justify-center mb-4">
                        <MapPin className="h-4 w-4 mr-2 text-indigo-500" />
                        {player.location || "Location Not Set"}
                      </p>
                      <Button className="w-full bg-indigo-600 hover:bg-indigo-700 rounded-full">
                        Connect
                      </Button>
                    </Card>
                  ))
                ) : (
                  <div className="col-span-full text-center py-16 bg-white rounded-xl shadow-lg">
                    <h3 className="text-2xl font-medium text-gray-700 mb-3">
                      No Players Nearby
                    </h3>
                    <p className="text-gray-500 max-w-md mx-auto">
                      Set your location to find players in your area.
                    </p>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="courts" className="space-y-8">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-3xl font-bold text-gray-800">
                    Badminton Courts
                  </h2>
                  <p className="text-gray-600 mt-2">
                    Explore top courts near you for your next game.
                  </p>
                </div>
                <Button
                  variant="outline"
                  asChild
                  className="rounded-full border-indigo-500 text-indigo-500 hover:bg-indigo-50"
                >
                  <Link href="/courts/suggest">Suggest a Court</Link>
                </Button>
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                {nearbyCourts.length > 0 ? (
                  nearbyCourts.map((court) => (
                    <Card
                      key={court.id}
                      className="overflow-hidden shadow-lg rounded-xl bg-white hover:shadow-xl transition-shadow duration-300"
                    >
                      <div className="relative h-56">
                        <Image
                          src={court.image || "/images/default-court.jpg"}
                          alt={court.name}
                          width={600}
                          height={300}
                          className="w-full h-full object-cover"
                        />
                        <Badge
                          className={`absolute top-4 right-4 font-semibold ${
                            court.indoor
                              ? "bg-indigo-100 text-indigo-700"
                              : "bg-emerald-100 text-emerald-700"
                          }`}
                        >
                          {court.indoor ? "Indoor" : "Outdoor"}
                        </Badge>
                      </div>
                      <div className="p-6">
                        <h3 className="text-xl font-semibold text-gray-800 mb-2">
                          {court.name}
                        </h3>
                        <p className="text-gray-600 mb-3 flex items-center">
                          <MapPin className="h-4 w-4 mr-2 text-indigo-500" />
                          {court.location}
                        </p>
                        <div className="flex justify-between items-center mb-4">
                          <div className="flex items-center">
                            <Trophy className="h-4 w-4 text-yellow-500 mr-2" />
                            <span className="text-gray-700">
                              {court.rating}/5
                            </span>
                          </div>
                          <span className="font-semibold text-indigo-600">
                            {court.price}
                          </span>
                        </div>
                        <div className="flex gap-3">
                          <Button
                            variant="outline"
                            className="flex-1 rounded-full border-indigo-500 text-indigo-500 hover:bg-indigo-50"
                          >
                            Details
                          </Button>
                          <Button className="flex-1 bg-indigo-600 hover:bg-indigo-700 rounded-full">
                            Book
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))
                ) : (
                  <div className="col-span-full text-center py-16 bg-white rounded-xl shadow-lg">
                    <h3 className="text-2xl font-medium text-gray-700 mb-3">
                      No Courts Nearby
                    </h3>
                    <p className="text-gray-500 mb-6 max-w-md mx-auto">
                      Help us grow by suggesting a court in your area.
                    </p>
                    <Button
                      asChild
                      className="bg-indigo-600 hover:bg-indigo-700 rounded-full px-6"
                    >
                      <Link href="/courts/suggest">Suggest a Court</Link>
                    </Button>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        ) : (
          <section className="py-20 text-center">
            <h2 className="text-4xl font-bold text-gray-800 mb-6">
              Join the Badminton Community
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-10 leading-relaxed">
              Connect with players, book courts, and elevate your game—all in
              one place.
            </p>
            <Button
              asChild
              size="lg"
              className="bg-indigo-600 hover:bg-indigo-700 rounded-full px-8 py-3 font-semibold shadow-lg transition-all duration-300"
            >
              <Link href="/sign-up">Get Started</Link>
            </Button>
          </section>
        )}
      </main>

      {/* Features Section */}
      <section className="bg-gradient-to-br from-indigo-50 to-blue-100 py-20">
        <div className="container mx-auto px-6">
          <h2 className="text-4xl font-bold text-gray-800 text-center mb-12">
            Why Choose Badminton Network?
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: <User className="h-8 w-8 text-indigo-600" />,
                title: "Find Players",
                desc: "Match with players of your skill level for practice or fun.",
              },
              {
                icon: <CalendarIcon className="h-8 w-8 text-indigo-600" />,
                title: "Join Events",
                desc: "Participate in local tournaments and social events.",
              },
              {
                icon: <MapPin className="h-8 w-8 text-indigo-600" />,
                title: "Book Courts",
                desc: "Reserve courts with ease, anytime, anywhere.",
              },
            ].map((feature, index) => (
              <Card
                key={index}
                className="p-6 flex flex-col items-center text-center bg-white shadow-lg rounded-xl hover:shadow-xl transition-shadow duration-300"
              >
                <div className="h-16 w-16 rounded-full bg-indigo-100 flex items-center justify-center mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">{feature.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gradient-to-r from-indigo-900 to-blue-900 text-white py-12">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-10">
            <div>
              <h3 className="text-2xl font-bold mb-4 tracking-wide">
                Badminton Network
              </h3>
              <p className="text-gray-200 leading-relaxed">
                Uniting badminton lovers globally.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-3 text-gray-300">
                {["About Us", "Events", "Players", "Courts"].map((link) => (
                  <li key={link}>
                    <Link
                      href={`/${link.toLowerCase().replace(" ", "")}`}
                      className="hover:text-white transition-colors duration-200"
                    >
                      {link}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Contact</h3>
              <ul className="space-y-3 text-gray-300">
                <li>Email: contact@badmintonnetwork.com</li>
                <li>
                  <span className="hover:text-white transition-colors duration-200 cursor-pointer">
                    Follow us on social media
                  </span>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-10 pt-6 border-t border-indigo-800 text-center text-gray-400">
            <p>
              © {new Date().getFullYear()} Badminton Network. All rights
              reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
