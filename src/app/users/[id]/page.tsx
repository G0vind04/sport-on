// src/app/users/[id]/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { supabase } from "../../../lib/supabase";
import { Navigation } from "../../../components/Navigation";
import { Footer } from "../../../components/Footer";
import Image from "next/image";
import { User } from "lucide-react";

type Profile = {
  id: string;
  name: string;
  avatar_url?: string;
  created_at?: string;
};

type CommunityPost = {
  id: number;
  user_id: string;
  content: string;
  image?: string | null; // Added for image support
  created_at: string;
};

export default function UserOverview() {
  const { id } = useParams();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Fetch profile details
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("id, name, avatar_url, created_at")
          .eq("id", id)
          .single();

        if (profileError) {
          throw new Error("Failed to fetch profile: " + profileError.message);
        }

        if (!profileData) {
          throw new Error("User not found");
        }

        setProfile(profileData);

        // Fetch community posts with images
        const { data: postsData, error: postsError } = await supabase
          .from("posts")
          .select("id, user_id, content, image, created_at") // Added 'image'
          .eq("user_id", id)
          .order("created_at", { ascending: false });

        if (postsError) {
          throw new Error("Failed to fetch posts: " + postsError.message);
        }

        setPosts(postsData || []);
      } catch (err: unknown) {
        setError(
          err instanceof Error ? err.message : "An unexpected error occurred"
        );
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchUserData();
  }, [id]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-white to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <p className="text-lg text-gray-700 dark:text-gray-300 animate-pulse">
          Loading user profile...
        </p>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-red-100 to-white dark:from-gray-900 dark:to-gray-800">
        <p className="text-lg text-red-600 dark:text-red-400">
          {error || "User not found"}
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 flex flex-col">
      <Navigation />
      <div className="flex-grow container mx-auto px-6 py-10">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
          {/* Profile Header */}
          <div className="flex flex-col items-center md:flex-row md:items-start gap-6">
            <div className="relative w-24 h-24">
              {profile.avatar_url ? (
                <Image
                  src={profile.avatar_url}
                  alt={`${profile.name}'s avatar`}
                  width={96}
                  height={96}
                  className="rounded-full object-cover w-full h-full border-4 border-gray-300 dark:border-gray-600"
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
                <User className="w-12 h-12 text-gray-500 dark:text-gray-400" />
              </span>
            </div>
            <div className="text-center md:text-left">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                {profile.name}
              </h1>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Joined:{" "}
                {profile.created_at
                  ? new Date(profile.created_at).toLocaleDateString()
                  : "Unknown"}
              </p>
            </div>
          </div>

          {/* Community Posts */}
          <div className="mt-10">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              Community Posts
            </h2>
            {posts.length === 0 ? (
              <p className="text-gray-700 dark:text-gray-300">
                No posts yet from {profile.name}.
              </p>
            ) : (
              <div className="space-y-6">
                {posts.map((post) => (
                  <div
                    key={post.id}
                    className="p-5 bg-gray-50 dark:bg-gray-700 rounded-lg shadow-sm"
                  >
                    <p className="text-gray-800 dark:text-gray-200 whitespace-pre-line">
                      {post.content}
                    </p>
                    {post.image && (
                      <div className="mt-3">
                        <Image
                          src={post.image}
                          alt="Post image"
                          width={384}
                          height={384}
                          className="rounded-lg object-cover max-h-96 w-full"
                        />
                      </div>
                    )}
                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                      Posted on{" "}
                      {new Date(post.created_at).toLocaleString("en-US", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
