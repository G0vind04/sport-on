"use client";

import { useState, useEffect } from "react";
import { Navigation } from "../../components/Navigation";
import { Footer } from "../../components/Footer";
import { Button } from "../../components/ui/button";
import { Card, CardContent } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Textarea } from "../../components/ui/textarea";
import { AlertCircle, Plus, Search, Filter } from "lucide-react";
import { CourtCard } from "../../components/CourtCard";
import { supabase } from "../../lib/supabase";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../components/ui/dialog";

// Define Court type
type Court = {
  id: number;
  name: string;
  description: string;
  location: string;
  city: string;
  available_times: string[]; // e.g., ["10:00 AM - 12:00 PM"]
  amenities: string[]; // e.g., ["Showers", "Parking"]
  price_per_hour: string; // e.g., "$15"
  color: string;
  rating: number;
  reviews: number;
  contact_number?: string; // New field
  created_by?: string;
};

export default function Courts() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [courts, setCourts] = useState<Court[]>([]);
  const [isSignedIn, setIsSignedIn] = useState(false);

  const [newCourt, setNewCourt] = useState({
    name: "",
    description: "",
    location: "",
    city: "",
    availableTimes: "",
    amenities: "",
    pricePerHour: "",
    color: "#4B5EAA",
    contactNumber: "", // New field
  });

  useEffect(() => {
    const checkAuthAndFetch = async () => {
      const { data: userData, error: userError } =
        await supabase.auth.getUser();
      setIsSignedIn(!!userData.user && !userError);

      const { data, error } = await supabase
        .from("courts")
        .select("*")
        .order("id", { ascending: true });

      if (error) {
        console.error("Error fetching courts:", error.message);
        setError("Failed to load courts");
      } else {
        setCourts(data || []);
      }
    };

    checkAuthAndFetch();

    const subscription = supabase
      .channel("courts-channel")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "courts" },
        (payload) => {
          if (payload.eventType === "INSERT") {
            setCourts((prev) => [...prev, payload.new as Court]);
          } else if (payload.eventType === "UPDATE") {
            setCourts((prev) =>
              prev.map((c) =>
                c.id === payload.new.id ? (payload.new as Court) : c
              )
            );
          } else if (payload.eventType === "DELETE") {
            setCourts((prev) => prev.filter((c) => c.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleCreateCourt = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const { data: userData, error: userError } =
        await supabase.auth.getUser();
      if (userError || !userData.user) {
        throw new Error("You must be logged in to add a court");
      }

      const availableTimesArray = newCourt.availableTimes
        .split(",")
        .map((time) => time.trim());
      const amenitiesArray = newCourt.amenities
        .split(",")
        .map((amenity) => amenity.trim());

      const { error: insertError } = await supabase.from("courts").insert({
        name: newCourt.name,
        description: newCourt.description,
        location: newCourt.location,
        city: newCourt.city,
        available_times: availableTimesArray,
        amenities: amenitiesArray,
        price_per_hour: newCourt.pricePerHour,
        color: newCourt.color,
        rating: 0,
        reviews: 0,
        contact_number: newCourt.contactNumber, // New field
        created_by: userData.user.id,
      });

      if (insertError) {
        throw new Error("Failed to create court: " + insertError.message);
      }

      setIsDialogOpen(false);
      setNewCourt({
        name: "",
        description: "",
        location: "",
        city: "",
        availableTimes: "",
        amenities: "",
        pricePerHour: "",
        color: "#4B5EAA",
        contactNumber: "", // New field
      });
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "An unexpected error occurred";
      console.error("Court creation error:", errorMessage);
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredCourts = courts.filter((court) => {
    const matchesSearch =
      court.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      court.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      court.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      court.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (court.contact_number &&
        court.contact_number.toLowerCase().includes(searchQuery.toLowerCase())); // Include contact_number in search

    return matchesSearch;
  });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      <Navigation />
      <div className="flex-grow container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Courts
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Explore and book badminton courts near you
            </p>
          </div>

          {isSignedIn ? (
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="mt-4 md:mt-0 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center">
                  <Plus className="w-5 h-5 mr-2" />
                  Add Court
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md bg-white dark:bg-gray-800 p-6 rounded-xl">
                <DialogHeader>
                  <DialogTitle className="text-xl font-bold text-gray-900 dark:text-white">
                    Add New Court
                  </DialogTitle>
                </DialogHeader>

                {error && (
                  <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 rounded-lg p-4 flex items-start">
                    <AlertCircle className="w-5 h-5 mr-3 mt-0.5 flex-shrink-0" />
                    <p>{error}</p>
                  </div>
                )}

                <form onSubmit={handleCreateCourt} className="space-y-4">
                  <div className="space-y-2">
                    <Label
                      htmlFor="name"
                      className="text-gray-700 dark:text-gray-200 font-medium"
                    >
                      Court Name
                    </Label>
                    <Input
                      id="name"
                      value={newCourt.name}
                      onChange={(e) =>
                        setNewCourt({ ...newCourt, name: e.target.value })
                      }
                      placeholder="e.g., City Sports Complex"
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
                      value={newCourt.description}
                      onChange={(e) =>
                        setNewCourt({
                          ...newCourt,
                          description: e.target.value,
                        })
                      }
                      placeholder="Brief description of the court"
                      className="bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 rounded-lg min-h-[100px]"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label
                        htmlFor="location"
                        className="text-gray-700 dark:text-gray-200 font-medium"
                      >
                        Location
                      </Label>
                      <Input
                        id="location"
                        value={newCourt.location}
                        onChange={(e) =>
                          setNewCourt({ ...newCourt, location: e.target.value })
                        }
                        placeholder="e.g., 123 Park Ave, Downtown"
                        className="bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 rounded-lg"
                        required
                      />
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
                        value={newCourt.city}
                        onChange={(e) =>
                          setNewCourt({ ...newCourt, city: e.target.value })
                        }
                        placeholder="e.g., New York"
                        className="bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 rounded-lg"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="availableTimes"
                      className="text-gray-700 dark:text-gray-200 font-medium"
                    >
                      Available Times (comma-separated)
                    </Label>
                    <Input
                      id="availableTimes"
                      value={newCourt.availableTimes}
                      onChange={(e) =>
                        setNewCourt({
                          ...newCourt,
                          availableTimes: e.target.value,
                        })
                      }
                      placeholder="e.g., 10:00 AM - 12:00 PM, 2:00 PM - 4:00 PM"
                      className="bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 rounded-lg"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="amenities"
                      className="text-gray-700 dark:text-gray-200 font-medium"
                    >
                      Amenities (comma-separated)
                    </Label>
                    <Input
                      id="amenities"
                      value={newCourt.amenities}
                      onChange={(e) =>
                        setNewCourt({ ...newCourt, amenities: e.target.value })
                      }
                      placeholder="e.g., Showers, Parking, Cafe"
                      className="bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 rounded-lg"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="pricePerHour"
                      className="text-gray-700 dark:text-gray-200 font-medium"
                    >
                      Price Per Hour
                    </Label>
                    <Input
                      id="pricePerHour"
                      value={newCourt.pricePerHour}
                      onChange={(e) =>
                        setNewCourt({
                          ...newCourt,
                          pricePerHour: e.target.value,
                        })
                      }
                      placeholder="e.g., $15"
                      className="bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 rounded-lg"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="contactNumber"
                      className="text-gray-700 dark:text-gray-200 font-medium"
                    >
                      Contact Number
                    </Label>
                    <Input
                      id="contactNumber"
                      value={newCourt.contactNumber}
                      onChange={(e) =>
                        setNewCourt({
                          ...newCourt,
                          contactNumber: e.target.value,
                        })
                      }
                      placeholder="e.g., +1 123-456-7890"
                      className="bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 rounded-lg"
                      required
                    />
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
                        value={newCourt.color}
                        onChange={(e) =>
                          setNewCourt({ ...newCourt, color: e.target.value })
                        }
                        className="w-16 h-10 p-1 bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 rounded-lg"
                      />
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        Select a banner color for your court
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
                          Adding...
                        </div>
                      ) : (
                        "Add Court"
                      )}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          ) : (
            <p className="mt-4 md:mt-0 text-gray-600 dark:text-gray-300">
              Sign in to add and book courts
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
                placeholder="Search courts by name, location, or city..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-lg"
              />
            </div>
          </div>

          {courts.length === 0 && !error ? (
            <Card className="border-0 shadow-md bg-white dark:bg-gray-800 rounded-xl overflow-hidden">
              <CardContent className="p-8 text-center">
                <div className="mb-4 text-gray-400 dark:text-gray-500">
                  <Filter className="w-12 h-12 mx-auto" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  No courts yet
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  Be the first to add a court!
                </p>
                {isSignedIn && (
                  <Button
                    onClick={() => setIsDialogOpen(true)}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white"
                  >
                    Add Court
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : filteredCourts.length === 0 ? (
            <Card className="border-0 shadow-md bg-white dark:bg-gray-800 rounded-xl overflow-hidden">
              <CardContent className="p-8 text-center">
                <div className="mb-4 text-gray-400 dark:text-gray-500">
                  <Filter className="w-12 h-12 mx-auto" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  No courts found
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  We couldn’t find any courts matching your search criteria.
                </p>
                <Button
                  onClick={() => setSearchQuery("")}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white"
                >
                  Clear Search
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCourts.map((court) => (
                <CourtCard key={court.id} court={court} />
              ))}
            </div>
          )}
        </div>

        <div className="text-center mt-10">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Can’t find a court near you?
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Add a court and help others find great places to play.
          </p>
          {isSignedIn ? (
            <Button
              onClick={() => setIsDialogOpen(true)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-medium"
            >
              <Plus className="w-5 h-5 mr-2" />
              Add New Court
            </Button>
          ) : (
            <p className="text-gray-600 dark:text-gray-300">
              Sign in to add and book courts
            </p>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}
