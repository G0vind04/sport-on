"use client";

import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import { Navigation } from "../../components/Navigation";
import { Footer } from "../../components/Footer";
import { Badge } from "../../components/ui/badge";
import { User } from "lucide-react";
import Image from "next/image";
import { Input } from "../../components/ui/input";

type Profile = {
  id: string;
  name: string;
  avatar_url?: string;
  created_at?: string;
};

export default function UsersPage() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [filteredProfiles, setFilteredProfiles] = useState<Profile[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProfiles = async () => {
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("id, name, avatar_url, created_at")
          .order("created_at", { ascending: false });

        if (error)
          throw new Error("Failed to fetch profiles: " + error.message);

        setProfiles(data || []);
        setFilteredProfiles(data || []);
      } catch (err: unknown) {
        setError(
          err instanceof Error ? err.message : "An unexpected error occurred"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchProfiles();
  }, []);

  useEffect(() => {
    setFilteredProfiles(
      profiles.filter((profile) =>
        profile.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    );
  }, [searchQuery, profiles]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-white to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <p className="text-lg text-gray-700 dark:text-gray-300 animate-pulse">
          Loading users...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-red-100 to-white dark:from-gray-900 dark:to-gray-800">
        <p className="text-lg text-red-600 dark:text-red-400">{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 flex flex-col">
      <Navigation />

      <div className="flex-grow container mx-auto px-6 py-10">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white text-center">
          Discover Users
        </h1>

        <div className="max-w-xl mx-auto mt-6">
          <Input
            type="text"
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-200 px-4 py-3 rounded-lg shadow-md focus:ring-2 focus:ring-gray-400 dark:focus:ring-gray-600"
          />
        </div>

        <div className="mt-8 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          {filteredProfiles.length === 0 ? (
            <p className="text-gray-700 dark:text-gray-300 text-center text-lg">
              {searchQuery ? "No matching users found." : "No users available."}
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 mt-6">
              {filteredProfiles.map((profile) => (
                <div
                  key={profile.id}
                  className="group flex flex-col items-center p-5 bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 rounded-xl shadow-md transition transform hover:scale-105 hover:shadow-2xl"
                >
                  <div className="relative w-16 h-16">
                    {profile.avatar_url ? (
                      <Image
                        src={profile.avatar_url}
                        alt={`${profile.name}'s avatar`}
                        width={64}
                        height={64}
                        className="rounded-full object-cover w-full h-full border-2 border-gray-300 dark:border-gray-600"
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                          const nextSibling = e.currentTarget
                            .nextSibling as HTMLElement | null;
                          if (nextSibling) nextSibling.style.display = "flex";
                        }}
                      />
                    ) : null}
                    <span
                      className={`${
                        profile.avatar_url ? "hidden" : "flex"
                      } absolute inset-0 items-center justify-center w-full h-full rounded-full bg-gray-300 dark:bg-gray-700`}
                    >
                      <User className="w-8 h-8 text-gray-500 dark:text-gray-400" />
                    </span>
                  </div>

                  <Badge className="mt-3 px-4 text-black py-2 text-lg bg-gray-200 dark:bg-gray-600 dark:text-gray-300 rounded-full shadow-sm">
                    {profile.name}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}
