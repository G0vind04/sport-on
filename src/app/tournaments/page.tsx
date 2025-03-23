"use client";

import { useState, useEffect } from "react";
import { Navigation } from "../../components/Navigation";
import { Footer } from "../../components/Footer";
import { Button } from "../../components/ui/button";
import { Card, CardContent } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Textarea } from "../../components/ui/textarea";
import { AlertCircle, Plus, Search, Filter, Calendar } from "lucide-react";
import { TournamentCard } from "../../components/TournamentCard";
import { supabase } from "../../lib/supabase";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";

// Define Tournament type
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
  created_by?: string;
  city: string | null;
};

export default function Tournaments() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [isSignedIn, setIsSignedIn] = useState(false);

  const [newTournament, setNewTournament] = useState({
    name: "",
    description: "",
    date: "",
    location: "",
    maxPlayers: 32,
    category: "Singles",
    color: "#4f46e5",
    city: "",
  });

  useEffect(() => {
    const checkAuthAndFetch = async () => {
      const { data: userData, error: userError } =
        await supabase.auth.getUser();
      setIsSignedIn(!!userData.user && !userError);

      const { data, error } = await supabase
        .from("tournaments")
        .select("*")
        .order("id", { ascending: true });

      if (error) {
        console.error("Error fetching tournaments:", error.message);
        setError("Failed to load tournaments");
      } else {
        setTournaments(data || []);
      }
    };

    checkAuthAndFetch();

    const subscription = supabase
      .channel("tournaments-channel")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "tournaments" },
        (payload) => {
          if (payload.eventType === "INSERT") {
            setTournaments((prev) => [...prev, payload.new as Tournament]);
          } else if (payload.eventType === "UPDATE") {
            setTournaments((prev) =>
              prev.map((t) =>
                t.id === payload.new.id ? (payload.new as Tournament) : t
              )
            );
          } else if (payload.eventType === "DELETE") {
            setTournaments((prev) =>
              prev.filter((t) => t.id !== payload.old.id)
            );
          }
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleCreateTournament = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const { data: userData, error: userError } =
        await supabase.auth.getUser();
      if (userError || !userData.user) {
        throw new Error("You must be logged in to create a tournament");
      }

      const { error: insertError } = await supabase.from("tournaments").insert({
        name: newTournament.name,
        description: newTournament.description,
        date: newTournament.date,
        location: newTournament.location,
        max_players: newTournament.maxPlayers,
        registered_players: 0,
        color: newTournament.color,
        category: newTournament.category,
        created_by: userData.user.id,
        city: newTournament.city,
      });

      if (insertError) {
        throw new Error("Failed to create tournament: " + insertError.message);
      }

      setIsDialogOpen(false);
      setNewTournament({
        name: "",
        description: "",
        date: "",
        location: "",
        maxPlayers: 32,
        category: "Singles",
        color: "#4f46e5",
        city: "",
      });
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "An unexpected error occurred";
      console.error("Tournament creation error:", errorMessage);
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredTournaments = tournaments.filter((tournament) => {
    const matchesSearch =
      tournament.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tournament.description
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      tournament.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (tournament.city &&
        tournament.city.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory =
      filterCategory === "all" || tournament.category === filterCategory;

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      <Navigation />
      <div className="flex-grow container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Tournaments
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Find and join badminton tournaments in your area
            </p>
          </div>

          {isSignedIn ? (
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="mt-4 md:mt-0 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center">
                  <Plus className="w-5 h-5 mr-2" />
                  Create Tournament
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md bg-white dark:bg-gray-800 p-6 rounded-xl">
                <DialogHeader>
                  <DialogTitle className="text-xl font-bold text-gray-900 dark:text-white">
                    Create New Tournament
                  </DialogTitle>
                </DialogHeader>

                {error && (
                  <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 rounded-lg p-4 flex items-start">
                    <AlertCircle className="w-5 h-5 mr-3 mt-0.5 flex-shrink-0" />
                    <p>{error}</p>
                  </div>
                )}

                <form onSubmit={handleCreateTournament} className="space-y-4">
                  <div className="space-y-2">
                    <Label
                      htmlFor="name"
                      className="text-gray-700 dark:text-gray-200 font-medium"
                    >
                      Tournament Name
                    </Label>
                    <Input
                      id="name"
                      value={newTournament.name}
                      onChange={(e) =>
                        setNewTournament({
                          ...newTournament,
                          name: e.target.value,
                        })
                      }
                      placeholder="e.g., Spring Championship 2025"
                      className="bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 rounded-lg"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="description"
                      className="text-gray-700 dark:text-gray-200 font-medium"
                    >
                      Description
                    </Label>
                    <Textarea
                      id="description"
                      value={newTournament.description}
                      onChange={(e) =>
                        setNewTournament({
                          ...newTournament,
                          description: e.target.value,
                        })
                      }
                      placeholder="Brief description of the tournament"
                      className="bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 rounded-lg min-h-[100px]"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label
                        htmlFor="date"
                        className="text-gray-700 dark:text-gray-200 font-medium"
                      >
                        Date
                      </Label>
                      <div className="relative">
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                          <Calendar className="w-5 h-5" />
                        </div>
                        <Input
                          id="date"
                          type="text"
                          value={newTournament.date}
                          onChange={(e) =>
                            setNewTournament({
                              ...newTournament,
                              date: e.target.value,
                            })
                          }
                          placeholder="e.g., April 15, 2025"
                          className="pl-10 bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 rounded-lg"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label
                        htmlFor="location"
                        className="text-gray-700 dark:text-gray-200 font-medium"
                      >
                        Location
                      </Label>
                      <Input
                        id="location"
                        value={newTournament.location}
                        onChange={(e) =>
                          setNewTournament({
                            ...newTournament,
                            location: e.target.value,
                          })
                        }
                        placeholder="e.g., City Sports Center"
                        className="bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 rounded-lg"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="city"
                      className="text-gray-700 dark:text-gray-200 font-medium"
                    >
                      City
                    </Label>
                    <Input
                      id="city"
                      value={newTournament.city}
                      onChange={(e) =>
                        setNewTournament({
                          ...newTournament,
                          city: e.target.value,
                        })
                      }
                      placeholder="e.g., New York"
                      className="bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 rounded-lg"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label
                        htmlFor="maxPlayers"
                        className="text-gray-700 dark:text-gray-200 font-medium"
                      >
                        Max Players
                      </Label>
                      <Input
                        id="maxPlayers"
                        type="number"
                        min="2"
                        value={newTournament.maxPlayers}
                        onChange={(e) =>
                          setNewTournament({
                            ...newTournament,
                            maxPlayers: parseInt(e.target.value),
                          })
                        }
                        className="bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 rounded-lg"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label
                        htmlFor="category"
                        className="text-gray-700 dark:text-gray-200 font-medium"
                      >
                        Category
                      </Label>
                      <Select
                        value={newTournament.category}
                        onValueChange={(value) =>
                          setNewTournament({
                            ...newTournament,
                            category: value,
                          })
                        }
                      >
                        <SelectTrigger className="bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 rounded-lg">
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Singles">Singles</SelectItem>
                          <SelectItem value="Doubles">Doubles</SelectItem>
                          <SelectItem value="Mixed">Mixed Doubles</SelectItem>
                          <SelectItem value="Beginner">Beginner</SelectItem>
                          <SelectItem value="Professional">
                            Professional
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="color"
                      className="text-gray-700 dark:text-gray-200 font-medium"
                    >
                      Banner Color
                    </Label>
                    <div className="flex items-center gap-3">
                      <Input
                        id="color"
                        type="color"
                        value={newTournament.color}
                        onChange={(e) =>
                          setNewTournament({
                            ...newTournament,
                            color: e.target.value,
                          })
                        }
                        className="w-16 h-10 p-1 bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 rounded-lg"
                      />
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        Select a banner color for your tournament
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end pt-4">
                    <Button
                      type="button"
                      onClick={() => setIsDialogOpen(false)}
                      className="mr-2 bg-gray-200 hover:bg-gray-300 text-gray-800 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      className="bg-indigo-600 hover:bg-indigo-700 text-white"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <div className="flex items-center">
                          <svg
                            className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            />
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            />
                          </svg>
                          Creating...
                        </div>
                      ) : (
                        "Create Tournament"
                      )}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          ) : (
            <p className="mt-4 md:mt-0 text-gray-600 dark:text-gray-300">
              Sign in to create and join tournaments
            </p>
          )}
        </div>

        <div className="mb-8">
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-grow">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                <Search className="w-5 h-5" />
              </div>
              <Input
                placeholder="Search tournaments by name, location, or city..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-lg"
              />
            </div>

            <div className="flex-shrink-0 w-full sm:w-48">
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-lg">
                  <div className="flex items-center">
                    <Filter className="w-4 h-4 mr-2" />
                    <SelectValue placeholder="Filter" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="Singles">Singles</SelectItem>
                  <SelectItem value="Doubles">Doubles</SelectItem>
                  <SelectItem value="Mixed">Mixed Doubles</SelectItem>
                  <SelectItem value="Beginner">Beginner</SelectItem>
                  <SelectItem value="Professional">Professional</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {tournaments.length === 0 && !error ? (
            <Card className="border-0 shadow-md bg-white dark:bg-gray-800 rounded-xl overflow-hidden">
              <CardContent className="p-8 text-center">
                <div className="mb-4 text-gray-400 dark:text-gray-500">
                  <Filter className="w-12 h-12 mx-auto" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  No tournaments yet
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  Be the first to create a tournament!
                </p>
                {isSignedIn && (
                  <Button
                    onClick={() => setIsDialogOpen(true)}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white"
                  >
                    Create Tournament
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : filteredTournaments.length === 0 ? (
            <Card className="border-0 shadow-md bg-white dark:bg-gray-800 rounded-xl overflow-hidden">
              <CardContent className="p-8 text-center">
                <div className="mb-4 text-gray-400 dark:text-gray-500">
                  <Filter className="w-12 h-12 mx-auto" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  No tournaments found
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  We couldn’t find any tournaments matching your search
                  criteria.
                </p>
                <Button
                  onClick={() => {
                    setSearchQuery("");
                    setFilterCategory("all");
                  }}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white"
                >
                  Clear Filters
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTournaments.map((tournament) => (
                <TournamentCard key={tournament.id} tournament={tournament} />
              ))}
            </div>
          )}
        </div>

        <div className="text-center mt-10">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Can’t find what you’re looking for?
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Create your own tournament and invite players to join.
          </p>
          {isSignedIn ? (
            <Button
              onClick={() => setIsDialogOpen(true)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-medium"
            >
              <Plus className="w-5 h-5 mr-2" />
              Create New Tournament
            </Button>
          ) : (
            <p className="text-gray-600 dark:text-gray-300">
              Sign in to create and join tournaments
            </p>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}
