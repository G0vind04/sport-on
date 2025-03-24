"use client";

import { useState, useEffect } from "react";
import { Navigation } from "../../../components/Navigation";
import { Footer } from "../../../components/Footer";
import { Card, CardContent } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { supabase } from "../../../lib/supabase";
import { useRouter } from "next/navigation";
import Image from "next/image";

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
  created_by: string;
  city: string | null;
  creator_name?: string;
  images: string[]; // Added images field
};

// Define Registration type with name
type Registration = {
  id: number;
  user_id: string;
  tournament_id: number;
  registered_at: string;
  users?: { name: string };
};

export default function TournamentOverview({
  params,
}: {
  params: { id: string };
}) {
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchTournamentAndRegistrations = async () => {
      setLoading(true);
      const tournamentId = params.id;

      // Check auth status
      const { data: userData, error: userError } =
        await supabase.auth.getUser();
      const signedIn = !!userData.user && !userError;
      setIsSignedIn(signedIn);
      setUserId(userData.user?.id || null);
      console.log("User data:", userData);

      // Fetch tournament (publicly accessible)
      const { data: tournamentData, error: tournamentError } = await supabase
        .from("tournaments")
        .select("*") // Includes images field
        .eq("id", tournamentId)
        .single();

      if (tournamentError) {
        console.error("Tournament fetch error:", tournamentError);
        setError("Failed to load tournament details");
      } else if (!tournamentData) {
        setError("Tournament not found");
      } else {
        console.log("Tournament data:", tournamentData);

        // Fetch creator's name from profiles table
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("name")
          .eq("id", tournamentData.created_by)
          .single();

        if (profileError) {
          console.error("Profile fetch error:", profileError.message);
          setTournament({
            ...tournamentData,
            creator_name: "Unknown",
          });
        } else {
          setTournament({
            ...tournamentData,
            creator_name: profileData?.name || "Anonymous",
          });
        }
      }

      // Fetch registrations only if signed in
      if (signedIn) {
        const { data: regData, error: regError } = await supabase
          .from("registrations")
          .select("*")
          .eq("tournament_id", tournamentId);

        if (regError) {
          console.error("Registrations fetch error:", regError.message);
          setError("Failed to load registrations");
        } else if (regData && regData.length > 0) {
          console.log("Raw registrations data:", regData);

          // Fetch user names from profiles table
          const userIds = regData.map((reg) => reg.user_id);
          const { data: profilesData, error: profilesError } = await supabase
            .from("profiles")
            .select("id, name")
            .in("id", userIds);

          if (profilesError) {
            console.error("Profiles fetch error:", profilesError.message);
            setError("Failed to load user profiles");
          } else {
            console.log("Profiles data:", profilesData);
            const formattedRegData = regData.map((reg) => ({
              ...reg,
              users: {
                name:
                  profilesData?.find((p) => p.id === reg.user_id)?.name ||
                  "Unknown",
              },
            }));
            console.log("Formatted registrations data:", formattedRegData);
            setRegistrations(formattedRegData);
          }
        } else {
          console.log(
            "No registrations found for tournament ID:",
            tournamentId
          );
          setRegistrations([]);
        }
      }

      setLoading(false);
    };

    fetchTournamentAndRegistrations();
  }, [params.id]);

  const handleRegister = async () => {
    if (!isSignedIn || !userId) {
      setError("You must be signed in to register.");
      return;
    }

    if (tournament && tournament.registered_players >= tournament.max_players) {
      setError("This tournament is full.");
      return;
    }

    try {
      const tournamentId = parseInt(params.id);
      const { data: userData } = await supabase.auth.getUser();
      const userName = userData.user?.user_metadata?.name || "You";

      const { error: insertError } = await supabase
        .from("registrations")
        .insert({ user_id: userId, tournament_id: tournamentId });

      if (insertError) {
        if (insertError.code === "23505") {
          setError("You are already registered for this tournament.");
        } else {
          throw new Error("Failed to register: " + insertError.message);
        }
      } else {
        const { error: updateError } = await supabase
          .from("tournaments")
          .update({ registered_players: tournament!.registered_players + 1 })
          .eq("id", tournamentId);

        if (updateError) {
          throw new Error(
            "Failed to update tournament: " + updateError.message
          );
        }

        setTournament((prev) =>
          prev
            ? { ...prev, registered_players: prev.registered_players + 1 }
            : null
        );
        setRegistrations((prev) => [
          ...prev,
          {
            id: Date.now(),
            user_id: userId,
            tournament_id: tournamentId,
            registered_at: new Date().toISOString(),
            users: { name: userName },
          },
        ]);
        setError("");
      }
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "An unexpected error occurred";
      console.error("Registration error:", errorMessage);
      setError(errorMessage);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
        <Navigation />
        <div className="flex-grow container mx-auto px-4 py-8 text-center">
          <p className="text-gray-600 dark:text-gray-300">Loading...</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (error && !tournament) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
        <Navigation />
        <div className="flex-grow container mx-auto px-4 py-8 text-center">
          <p className="text-red-600 dark:text-red-300">{error}</p>
          <Button
            onClick={() => router.push("/tournaments")}
            className="mt-4 bg-indigo-600 hover:bg-indigo-700 text-white"
          >
            Back to Tournaments
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  if (!tournament) return null;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      <Navigation />
      <div className="flex-grow container mx-auto px-4 py-8">
        <Button
          onClick={() => router.push("/tournaments")}
          className="mb-6 bg-gray-200 hover:bg-gray-300 text-gray-800 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white"
        >
          Back to Tournaments
        </Button>
        <Card className="border-0 shadow-md bg-white dark:bg-gray-800 rounded-xl overflow-hidden">
          <CardContent className="p-8">
            {tournament.images && tournament.images.length > 0 ? (
              <Image
                src={tournament.images[0]}
                alt={`${tournament.name} image`}
                width={1200}
                height={300}
                className="w-full h-64 object-cover mb-6 rounded-t-xl"
              />
            ) : (
              <div
                className="h-64 w-full mb-6 rounded-t-xl"
                style={{ backgroundColor: tournament.color }}
              />
            )}
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              {tournament.name}
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              {tournament.description}
            </p>
            <div className="space-y-2">
              <p className="text-gray-500 dark:text-gray-400">
                <strong>Date:</strong> {tournament.date}
              </p>
              <p className="text-gray-500 dark:text-gray-400">
                <strong>Location:</strong> {tournament.location},{" "}
                {tournament.city || "N/A"}
              </p>
              <p className="text-gray-500 dark:text-gray-400">
                <strong>Category:</strong> {tournament.category}
              </p>
              <p className="text-gray-500 dark:text-gray-400">
                <strong>Players:</strong> {tournament.registered_players}/
                {tournament.max_players}
              </p>
              {tournament.creator_name && (
                <p className="text-gray-500 dark:text-gray-400">
                  <strong>Created by:</strong> {tournament.creator_name}
                </p>
              )}
            </div>

            {error && (
              <p className="text-red-600 dark:text-red-300 mt-4">{error}</p>
            )}

            {isSignedIn && (
              <Button
                onClick={handleRegister}
                className="mt-6 bg-indigo-600 hover:bg-indigo-700 text-white"
                disabled={
                  tournament.registered_players >= tournament.max_players
                }
              >
                Register for Tournament
              </Button>
            )}

            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-8 mb-4">
              Registered Players
            </h2>
            {isSignedIn ? (
              registrations.length === 0 ? (
                <p className="text-gray-600 dark:text-gray-300">
                  No players registered yet.
                </p>
              ) : (
                <ul className="space-y-2">
                  {registrations.map((reg) => (
                    <li
                      key={reg.id}
                      className="text-gray-500 dark:text-gray-400"
                    >
                      {reg.users?.name || "Unknown"} - Registered on{" "}
                      {new Date(reg.registered_at).toLocaleDateString()}
                    </li>
                  ))}
                </ul>
              )
            ) : (
              <p className="text-gray-600 dark:text-gray-300">
                Please sign in to view the list of registered players.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
      <Footer />
    </div>
  );
}
