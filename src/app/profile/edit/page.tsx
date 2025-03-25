"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../../lib/supabase";
import { Navigation } from "../../../components/Navigation";
import { Footer } from "../../../components/Footer";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { User } from "lucide-react";
import Image from "next/image";

type User = {
  id: string;
  email?: string;
  name?: string;
  avatar_url?: string;
};

export default function EditProfile() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [name, setName] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const { data: userData, error: userError } =
          await supabase.auth.getUser();
        if (userError || !userData.user) {
          throw new Error("You must be logged in to edit your profile");
        }

        const userId = userData.user.id;

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
        setName(profileData?.name || "Anonymous");
        setAvatarPreview(profileData?.avatar_url || null);
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

    fetchUserData();
  }, [router]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file)); // Preview the new image
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      if (!user) throw new Error("User not loaded");

      let avatarUrl = user.avatar_url;
      if (avatarFile) {
        const fileExt = avatarFile.name.split(".").pop();
        const fileName = `${user.id}-${Date.now()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from("profile-pics") // Ensure this bucket exists in Supabase Storage
          .upload(fileName, avatarFile, { upsert: true });

        if (uploadError) {
          throw new Error("Failed to upload avatar: " + uploadError.message);
        }

        const { data: urlData } = supabase.storage
          .from("profile-pics")
          .getPublicUrl(fileName);
        avatarUrl = urlData.publicUrl;
      }

      const { error: updateError } = await supabase
        .from("profiles")
        .update({ name, avatar_url: avatarUrl })
        .eq("id", user.id);

      if (updateError) {
        throw new Error("Failed to update profile: " + updateError.message);
      }

      router.push("/profile"); // Redirect back to profile page
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "An unexpected error occurred";
      console.error(errorMessage);
      setError(errorMessage);
    } finally {
      setSaving(false);
    }
  };

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
          Edit Profile
        </h1>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 max-w-lg mx-auto">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Avatar */}
            <div className="flex flex-col items-center">
              <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700 mb-4">
                {avatarPreview ? (
                  <Image
                    src={avatarPreview}
                    alt="Avatar preview"
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
              <Label
                htmlFor="avatar"
                className="text-gray-700 dark:text-gray-200"
              >
                Profile Picture
              </Label>
              <Input
                id="avatar"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="mt-2 bg-gray-50 dark:bg-gray-700"
              />
            </div>

            {/* Name */}
            <div>
              <Label
                htmlFor="name"
                className="text-gray-700 dark:text-gray-200"
              >
                Name
              </Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-2 bg-gray-50 dark:bg-gray-700"
                placeholder="Enter your name"
              />
            </div>

            {/* Email (read-only) */}
            <div>
              <Label
                htmlFor="email"
                className="text-gray-700 dark:text-gray-200"
              >
                Email
              </Label>
              <Input
                id="email"
                value={user.email || ""}
                disabled
                className="mt-2 bg-gray-200 dark:bg-gray-600 cursor-not-allowed"
              />
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Email cannot be changed here.
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <p className="text-red-600 dark:text-red-400 text-center">
                {error}
              </p>
            )}

            {/* Buttons */}
            <div className="flex justify-end space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/profile")}
                disabled={saving}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-indigo-600 hover:bg-indigo-700 text-white"
                disabled={saving}
              >
                {saving ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        </div>
      </div>
      <Footer />
    </div>
  );
}
