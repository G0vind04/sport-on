"use client";

import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { Button } from "./ui/button";
import Image from "next/image";
import Link from "next/link";
import { User } from "@supabase/supabase-js";

// Define the shape of the profile data
interface UserProfile {
  name: string;
  profile_pic?: string;
}

export const Navigation = () => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false); // New state for logout loading

  useEffect(() => {
    const fetchUser = async () => {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (error || !user) {
        setUser(null);
        setProfile(null);
        return;
      }

      setUser(user);

      const { data: profileData, error: profileError } = await supabase
        .from("users")
        .select("name, profile_pic")
        .eq("id", user.id)
        .single();

      if (profileError) {
        console.error("Error fetching profile:", profileError.message);
        setProfile(null);
      } else {
        setProfile(profileData);
      }
    };

    fetchUser();

    const { data: authListener } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_IN") {
        fetchUser();
      } else if (event === "SIGNED_OUT") {
        setUser(null);
        setProfile(null);
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    setIsLoggingOut(true); // Show the loading popup
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error("Logout error:", error.message);
        alert("Failed to log out");
      } else {
        setUser(null);
        setProfile(null);
        // Simulate a delay for the loading effect (optional)
        await new Promise((resolve) => setTimeout(resolve, 1000));
        window.location.reload(); // Refresh the entire page
      }
    } catch (err) {
      console.error("Unexpected logout error:", err);
      alert("An unexpected error occurred during logout");
    } finally {
      setIsLoggingOut(false); // Hide the popup (though page reload will reset this)
    }
  };

  return (
    <>
      <nav className="bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-10">
        <div className="max-w-screen-xl mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">BN</span>
            </div>
            <span className="font-bold text-xl text-gray-900 dark:text-white">
              SportOn
            </span>
          </div>
          <div className="hidden md:flex space-x-8">
            {["Home", "Tournaments", "Courts", "My Matches"].map((item) => (
              <a
                key={item}
                href={`#${item.toLowerCase().replace(" ", "-")}`}
                className="text-gray-700 dark:text-gray-200 hover:text-indigo-600 dark:hover:text-indigo-400 font-medium"
              >
                {item}
              </a>
            ))}
          </div>
          <div className="flex items-center space-x-4">
            {user && profile ? (
              <>
                <Link href="/profile" className="flex items-center space-x-2">
                  <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/50 overflow-hidden flex items-center justify-center">
                    {profile.profile_pic ? (
                      <Image
                        src={profile.profile_pic}
                        alt={profile.name}
                        width={40}
                        height={40}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-indigo-600 dark:text-indigo-400 font-medium">
                        {profile.name.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <span className="text-gray-900 dark:text-white font-medium hidden md:block">
                    {profile.name}
                  </span>
                </Link>
                <Button
                  variant="outline"
                  className="border-indigo-600 text-indigo-600 hover:bg-indigo-50 dark:border-indigo-400 dark:text-indigo-400 dark:hover:bg-gray-700"
                  onClick={handleLogout}
                  disabled={isLoggingOut} // Disable button during logout
                >
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Link href="/signin">
                  <Button
                    variant="outline"
                    className="hidden md:block border-indigo-600 text-indigo-600 hover:bg-indigo-50 dark:border-indigo-400 dark:text-indigo-400 dark:hover:bg-gray-700"
                  >
                    Sign In
                  </Button>
                </Link>
                <Link href="/signup">
                  <Button className="bg-indigo-600 hover:bg-indigo-700 text-white">
                    Join Now
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Loading Popup */}
      {isLoggingOut && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-xl flex items-center space-x-3">
            <svg
              className="animate-spin h-6 w-6 text-indigo-600 dark:text-indigo-400"
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
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            <span className="text-gray-900 dark:text-white font-medium">
              Logging out...
            </span>
          </div>
        </div>
      )}
    </>
  );
};
