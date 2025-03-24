// src/app/users/page.tsx
"use client";

import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import { Navigation } from "../../components/Navigation";
import { Footer } from "../../components/Footer";
import { Badge } from "../../components/ui/badge";
import { User } from "lucide-react";
import Image from "next/image";

type Profile = {
  id: string;
  name: string;
  avatar_url?: string; // Optional, as some users might not have an avatar
};

export default function UsersPage() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProfiles = async () => {
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("id, name, avatar_url")
          .order("name", { ascending: true });

        if (error) {
          throw new Error("Failed to fetch profiles: " + error.message);
        }

        console.log("Fetched profiles:", data); // Debug: Check raw data

        if (data) {
          setProfiles(data);
        } else {
          setProfiles([]);
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

    fetchProfiles();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <p className="text-gray-600 dark:text-gray-300">Loading users...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <p className="text-red-600 dark:text-red-300">{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      <Navigation />
      <div className="flex-grow container mx-auto px-4 py-8">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
            Discover Users
          </h1>
          {profiles.length === 0 ? (
            <p className="text-gray-600 dark:text-gray-300">
              No users found in the profiles list.
            </p>
          ) : (
            <ul className="space-y-4">
              {profiles.map((profile) => (
                <li
                  key={profile.id}
                  className="flex items-center gap-3 text-gray-700 dark:text-gray-300"
                >
                  <div className="flex-shrink-0 w-10 h-10 relative">
                    {profile.avatar_url ? (
                      <Image
                        src={profile.avatar_url}
                        alt={`${profile.name}'s avatar`}
                        width={40}
                        height={40}
                        className="rounded-full object-cover w-full h-full"
                        onError={(e) => {
                          const target = e.currentTarget;
                          const nextSibling =
                            target.nextSibling as HTMLElement | null;
                          target.style.display = "none";
                          if (nextSibling) {
                            nextSibling.style.display = "flex";
                          }
                        }}
                      />
                    ) : null}
                    <span
                      className={`${
                        profile.avatar_url ? "hidden" : "flex"
                      } absolute inset-0 items-center justify-center w-full h-full rounded-full bg-gray-200 dark:bg-gray-700`}
                    >
                      <User className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                    </span>
                  </div>
                  <Badge
                    variant="secondary"
                    className="flex items-center gap-1 bg-gray-100 dark:bg-gray-700"
                  >
                    {profile.name}
                  </Badge>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}
