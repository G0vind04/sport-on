"use client";

import { useState, useEffect } from "react";
import { Navigation } from "../../../components/Navigation";
import { Footer } from "../../../components/Footer";
import { Card, CardContent } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { Textarea } from "../../../components/ui/textarea";
import { supabase } from "../../../lib/supabase";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../../components/ui/dialog";
import { AlertCircle } from "lucide-react";

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
  images: string[];
};

// Define Registration type with name
type Registration = {
  id: number;
  user_id: string;
  tournament_id: number;
  registered_at: string;
  users?: { name: string };
};

// Extend type for edit form to include newImageFile
type EditTournament = Partial<Tournament> & { newImageFile?: File | null };

export default function TournamentOverview({
  params,
}: {
  params: Promise<{ id: string }>; // Correct type definition for Next.js
}) {
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editTournament, setEditTournament] = useState<EditTournament>({});
  const [isDeleting, setIsDeleting] = useState(false);
  const [resolvedParams, setResolvedParams] = useState<{ id: string } | null>(
    null
  );
  const router = useRouter();

  // Resolve the params Promise
  useEffect(() => {
    params
      .then((resolved) => {
        setResolvedParams(resolved);
      })
      .catch((err) => {
        console.error("Failed to resolve params:", err);
        setError("Failed to load tournament ID");
        setLoading(false);
      });
  }, [params]);

  // Fetch tournament data once params are resolved
  useEffect(() => {
    if (!resolvedParams) return;

    const fetchTournamentAndRegistrations = async () => {
      setLoading(true);
      const tournamentId = resolvedParams.id;

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
        .select("*")
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
          setEditTournament(tournamentData); // Initialize edit form with current data
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
  }, [resolvedParams]);

  const handleRegister = async () => {
    if (!isSignedIn || !userId) {
      setError("You must be signed in to register.");
      return;
    }

    if (!resolvedParams) {
      setError("Tournament ID not resolved.");
      return;
    }

    if (tournament && tournament.registered_players >= tournament.max_players) {
      setError("This tournament is full.");
      return;
    }

    try {
      const tournamentId = parseInt(resolvedParams.id);
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

  const handleEditTournament = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!resolvedParams) {
      setError("Tournament ID not resolved.");
      setLoading(false);
      return;
    }

    if (!editTournament.name) {
      setError("Tournament name is required.");
      setLoading(false);
      return;
    }
    if (!editTournament.date) {
      setError("Tournament date is required.");
      setLoading(false);
      return;
    }
    if (!editTournament.location) {
      setError("Tournament location is required.");
      setLoading(false);
      return;
    }
    if (!editTournament.max_players || editTournament.max_players <= 0) {
      setError("Max players must be a positive number.");
      setLoading(false);
      return;
    }

    try {
      let imageUrl = editTournament.images?.[0] || tournament!.images[0] || "";
      if (editTournament.newImageFile) {
        const fileExt = editTournament.newImageFile.name.split(".").pop();
        const fileName = `${Date.now()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from("tournament-images")
          .upload(fileName, editTournament.newImageFile);

        if (uploadError) {
          throw new Error("Failed to upload image: " + uploadError.message);
        }

        const { data: urlData } = supabase.storage
          .from("tournament-images")
          .getPublicUrl(fileName);
        imageUrl = urlData.publicUrl;
      }

      const updatedData: Tournament = {
        id: tournament!.id,
        name: editTournament.name || tournament!.name,
        description: editTournament.description || tournament!.description,
        date: editTournament.date || tournament!.date,
        location: editTournament.location || tournament!.location,
        registered_players: tournament!.registered_players,
        max_players: editTournament.max_players || tournament!.max_players,
        color: editTournament.color || tournament!.color,
        category: editTournament.category || tournament!.category,
        created_by: tournament!.created_by,
        city:
          editTournament.city !== undefined
            ? editTournament.city
            : tournament!.city,
        images: imageUrl
          ? [imageUrl]
          : editTournament.images || tournament!.images,
      };

      const { error: updateError } = await supabase
        .from("tournaments")
        .update(updatedData)
        .eq("id", resolvedParams.id);

      if (updateError) {
        throw new Error("Failed to update tournament: " + updateError.message);
      }

      setTournament((prev) => (prev ? { ...prev, ...updatedData } : null));
      setEditTournament(updatedData); // Update editTournament to reflect saved changes
      setIsEditDialogOpen(false);
      setError("");
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "An unexpected error occurred";
      console.error("Edit error:", errorMessage);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTournament = async () => {
    if (!confirm("Are you sure you want to delete this tournament?")) return;

    if (!resolvedParams) {
      setError("Tournament ID not resolved.");
      return;
    }

    setIsDeleting(true);
    setError("");

    try {
      const { error: regDeleteError } = await supabase
        .from("registrations")
        .delete()
        .eq("tournament_id", resolvedParams.id);

      if (regDeleteError) {
        throw new Error(
          "Failed to delete registrations: " + regDeleteError.message
        );
      }

      const { error: deleteError } = await supabase
        .from("tournaments")
        .delete()
        .eq("id", resolvedParams.id);

      if (deleteError) {
        throw new Error("Failed to delete tournament: " + deleteError.message);
      }

      router.push("/tournaments");
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "An unexpected error occurred";
      console.error("Delete error:", errorMessage);
      setError(errorMessage);
    } finally {
      setIsDeleting(false);
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

  const isCreator = isSignedIn && userId === tournament.created_by;

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

            <div className="mt-6 flex space-x-4">
              {isSignedIn && (
                <Button
                  onClick={handleRegister}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white"
                  disabled={
                    tournament.registered_players >= tournament.max_players
                  }
                >
                  Register for Tournament
                </Button>
              )}
              {isCreator && (
                <>
                  <Dialog
                    open={isEditDialogOpen}
                    onOpenChange={setIsEditDialogOpen}
                  >
                    <DialogTrigger asChild>
                      <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                        Edit Tournament
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md bg-white dark:bg-gray-800 p-6 rounded-xl">
                      <DialogHeader>
                        <DialogTitle className="text-xl font-bold text-gray-900 dark:text-white">
                          Edit Tournament
                        </DialogTitle>
                      </DialogHeader>

                      {error && (
                        <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 rounded-lg p-4 flex items-start">
                          <AlertCircle className="w-5 h-5 mr-3 mt-0.5 flex-shrink-0" />
                          <p>{error}</p>
                        </div>
                      )}

                      <form
                        onSubmit={handleEditTournament}
                        className="space-y-4"
                      >
                        <div className="space-y-2">
                          <Label
                            htmlFor="name"
                            className="text-gray-700 dark:text-gray-200"
                          >
                            Name
                          </Label>
                          <Input
                            id="name"
                            value={editTournament.name || ""}
                            onChange={(e) =>
                              setEditTournament({
                                ...editTournament,
                                name: e.target.value,
                              })
                            }
                            className="bg-gray-50 dark:bg-gray-700"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label
                            htmlFor="description"
                            className="text-gray-700 dark:text-gray-200"
                          >
                            Description
                          </Label>
                          <Textarea
                            id="description"
                            value={editTournament.description || ""}
                            onChange={(e) =>
                              setEditTournament({
                                ...editTournament,
                                description: e.target.value,
                              })
                            }
                            className="bg-gray-50 dark:bg-gray-700"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label
                            htmlFor="date"
                            className="text-gray-700 dark:text-gray-200"
                          >
                            Date
                          </Label>
                          <Input
                            id="date"
                            type="date"
                            value={editTournament.date || ""}
                            onChange={(e) =>
                              setEditTournament({
                                ...editTournament,
                                date: e.target.value,
                              })
                            }
                            className="bg-gray-50 dark:bg-gray-700"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label
                            htmlFor="location"
                            className="text-gray-700 dark:text-gray-200"
                          >
                            Location
                          </Label>
                          <Input
                            id="location"
                            value={editTournament.location || ""}
                            onChange={(e) =>
                              setEditTournament({
                                ...editTournament,
                                location: e.target.value,
                              })
                            }
                            className="bg-gray-50 dark:bg-gray-700"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label
                            htmlFor="city"
                            className="text-gray-700 dark:text-gray-200"
                          >
                            City
                          </Label>
                          <Input
                            id="city"
                            value={editTournament.city || ""}
                            onChange={(e) =>
                              setEditTournament({
                                ...editTournament,
                                city: e.target.value,
                              })
                            }
                            className="bg-gray-50 dark:bg-gray-700"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label
                            htmlFor="max_players"
                            className="text-gray-700 dark:text-gray-200"
                          >
                            Max Players
                          </Label>
                          <Input
                            id="max_players"
                            type="number"
                            value={editTournament.max_players || ""}
                            onChange={(e) =>
                              setEditTournament({
                                ...editTournament,
                                max_players: parseInt(e.target.value) || 0,
                              })
                            }
                            className="bg-gray-50 dark:bg-gray-700"
                            min="1"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label
                            htmlFor="color"
                            className="text-gray-700 dark:text-gray-200"
                          >
                            Color
                          </Label>
                          <Input
                            id="color"
                            type="color"
                            value={editTournament.color || ""}
                            onChange={(e) =>
                              setEditTournament({
                                ...editTournament,
                                color: e.target.value,
                              })
                            }
                            className="bg-gray-50 dark:bg-gray-700"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label
                            htmlFor="category"
                            className="text-gray-700 dark:text-gray-200"
                          >
                            Category
                          </Label>
                          <Input
                            id="category"
                            value={editTournament.category || ""}
                            onChange={(e) =>
                              setEditTournament({
                                ...editTournament,
                                category: e.target.value,
                              })
                            }
                            className="bg-gray-50 dark:bg-gray-700"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label
                            htmlFor="image"
                            className="text-gray-700 dark:text-gray-200"
                          >
                            Image
                          </Label>
                          <Input
                            id="image"
                            type="file"
                            accept="image/*"
                            onChange={(e) =>
                              setEditTournament({
                                ...editTournament,
                                newImageFile: e.target.files?.[0] || null,
                              })
                            }
                            className="bg-gray-50 dark:bg-gray-700"
                          />
                          {editTournament.images?.[0] && (
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              Current image:{" "}
                              {editTournament.images[0].substring(0, 30)}...
                            </p>
                          )}
                        </div>
                        <div className="flex justify-end space-x-2">
                          <Button
                            type="button"
                            onClick={() => setIsEditDialogOpen(false)}
                            className="bg-gray-200 hover:bg-gray-300 text-gray-800 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white"
                          >
                            Cancel
                          </Button>
                          <Button
                            type="submit"
                            className="bg-blue-600 hover:bg-blue-700 text-white"
                            disabled={loading}
                          >
                            {loading ? "Saving..." : "Save Changes"}
                          </Button>
                        </div>
                      </form>
                    </DialogContent>
                  </Dialog>
                  <Button
                    onClick={handleDeleteTournament}
                    className="bg-red-600 hover:bg-red-700 text-white"
                    disabled={isDeleting}
                  >
                    {isDeleting ? "Deleting..." : "Delete Tournament"}
                  </Button>
                </>
              )}
            </div>

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
