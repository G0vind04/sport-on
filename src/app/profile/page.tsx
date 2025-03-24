"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { supabase } from "../../lib/supabase";
import { Navigation } from "../../components/Navigation";
import { Footer } from "../../components/Footer";
import { Button } from "../../components/ui/button";
import { Card, CardContent } from "../../components/ui/card";
import { MapPin, Clock, User } from "lucide-react";

type User = {
  id: string;
  email?: string;
  name?: string;
  avatar_url?: string;
};

type Tournament = {
  id: number;
  name: string;
  date: string;
  location: string;
  created_by: string;
};

type Court = {
  id: number;
  name: string;
  location: string;
  city?: string;
  images: string[];
  color: string;
  created_by: string;
};

export default function Profile() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [createdTournaments, setCreatedTournaments] = useState<Tournament[]>(
    []
  );
  const [registeredTournaments, setRegisteredTournaments] = useState<
    Tournament[]
  >([]);
  const [courts, setCourts] = useState<Court[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const { data: userData, error: userError } =
          await supabase.auth.getUser();
        if (userError || !userData.user) {
          throw new Error("You must be logged in to view this page");
        }

        const userId = userData.user.id;

        // Fetch profile data
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("name, avatar_url")
          .eq("id", userId)
          .single();

        if (profileError) {
          throw new Error("Failed to fetch profile: " + profileError.message);
        }

        setUser({
          id: userId,
          email: userData.user.email,
          name: profileData?.name || "Anonymous",
          avatar_url: profileData?.avatar_url,
        });

        // Fetch created tournaments
        const { data: createdData, error: createdError } = await supabase
          .from("tournaments")
          .select("id, name, date, location, created_by")
          .eq("created_by", userId);

        if (createdError) {
          throw new Error(
            "Failed to fetch created tournaments: " + createdError.message
          );
        }
        setCreatedTournaments(createdData || []);

        // Fetch registered tournaments
        const { data: regData, error: regError } = await supabase
          .from("registrations")
          .select("tournaments(id, name, date, location, created_by)")
          .eq("user_id", userId);

        if (regError) {
          throw new Error(
            "Failed to fetch registered tournaments: " + regError.message
          );
        }
        const registered =
          (regData as { tournaments: Tournament }[])?.map(
            (r) => r.tournaments
          ) || [];
        setRegisteredTournaments(registered);

        // Fetch courts
        const { data: courtData, error: courtError } = await supabase
          .from("courts")
          .select("id, name, location, city, images, color, created_by")
          .eq("created_by", userId);

        if (courtError) {
          throw new Error("Failed to fetch courts: " + courtError.message);
        }
        setCourts(courtData || []);
      } catch (err: unknown) {
        const errorMessage =
          err instanceof Error ? err.message : "An unexpected error occurred";
        console.error(errorMessage);
        setError(errorMessage);
        if (errorMessage.includes("logged in")) {
          router.push("/login");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <p className="text-gray-600 dark:text-gray-300">Loading...</p>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <p className="text-red-600 dark:text-red-300">
          {error || "User not found"}
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      <Navigation />
      <div className="flex-grow container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
          My Profile
        </h1>

        {/* User Details */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 mb-8 flex items-center space-x-6">
          <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700">
            {user.avatar_url ? (
              <Image
                src={user.avatar_url}
                alt="User avatar"
                width={96}
                height={96}
                className="object-cover w-full h-full"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-300 dark:bg-gray-600">
                <User className="w-12 h-12 text-gray-500 dark:text-gray-400" />
              </div>
            )}
          </div>
          <div>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
              {user.name}
            </h2>
            <p className="text-gray-600 dark:text-gray-300">{user.email}</p>
          </div>
          <Button
            className="ml-auto bg-indigo-600 hover:bg-indigo-700 text-white"
            onClick={() => router.push("/profile/edit")}
          >
            Edit Profile
          </Button>
        </div>

        {/* Created Tournaments */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Tournaments I’ve Created
          </h2>
          {createdTournaments.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {createdTournaments.map((tournament) => (
                <Card
                  key={tournament.id}
                  className="bg-white dark:bg-gray-800 shadow-md rounded-xl"
                >
                  <CardContent className="p-6">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                      {tournament.name}
                    </h3>
                    <div className="flex items-center text-gray-600 dark:text-gray-300 mb-2">
                      <Clock className="w-4 h-4 mr-2" />
                      {new Date(tournament.date).toLocaleDateString()}
                    </div>
                    <div className="flex items-center text-gray-600 dark:text-gray-300 mb-4">
                      <MapPin className="w-4 h-4 mr-2" />
                      {tournament.location}
                    </div>
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() =>
                        router.push(`/tournaments/${tournament.id}`)
                      }
                    >
                      View Details
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <p className="text-gray-600 dark:text-gray-300">
              You haven’t created any tournaments yet.
            </p>
          )}
        </div>

        {/* Registered Tournaments */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Tournaments I’ve Registered For
          </h2>
          {registeredTournaments.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {registeredTournaments.map((tournament) => (
                <Card
                  key={tournament.id}
                  className="bg-white dark:bg-gray-800 shadow-md rounded-xl"
                >
                  <CardContent className="p-6">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                      {tournament.name}
                    </h3>
                    <div className="flex items-center text-gray-600 dark:text-gray-300 mb-2">
                      <Clock className="w-4 h-4 mr-2" />
                      {new Date(tournament.date).toLocaleDateString()}
                    </div>
                    <div className="flex items-center text-gray-600 dark:text-gray-300 mb-4">
                      <MapPin className="w-4 h-4 mr-2" />
                      {tournament.location}
                    </div>
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() =>
                        router.push(`/tournaments/${tournament.id}`)
                      }
                    >
                      View Details
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <p className="text-gray-600 dark:text-gray-300">
              You haven’t registered for any tournaments yet.
            </p>
          )}
        </div>

        {/* Added Courts */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Courts I’ve Added
          </h2>
          {courts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courts.map((court) => (
                <Card
                  key={court.id}
                  className="bg-white dark:bg-gray-800 shadow-md rounded-xl overflow-hidden"
                >
                  {court.images.length > 0 ? (
                    <Image
                      src={court.images[0]}
                      alt={`${court.name} image`}
                      width={400}
                      height={224}
                      className="w-full h-56 object-cover"
                    />
                  ) : (
                    <div
                      className="w-full h-56"
                      style={{ backgroundColor: court.color }}
                    />
                  )}
                  <CardContent className="p-6">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                      {court.name}
                    </h3>
                    <div className="flex items-center text-gray-600 dark:text-gray-300 mb-4">
                      <MapPin className="w-4 h-4 mr-2" />
                      {court.location}, {court.city}
                    </div>
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => router.push(`/courts/${court.id}`)}
                    >
                      View Details
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <p className="text-gray-600 dark:text-gray-300">
              You haven’t added any courts yet.
            </p>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}
