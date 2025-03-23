"use client";

import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { Button } from "./ui/button";
import Image from "next/image";
import Link from "next/link";

export const Navigation = () => {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<{
    name: string;
    profile_pic?: string;
  } | null>(null);

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
      if (event === "SIGNED_IN") fetchUser();
      else if (event === "SIGNED_OUT") {
        setUser(null);
        setProfile(null);
      }
    });
    return () => authListener.subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Logout error:", error.message);
      alert("Failed to log out");
    } else {
      setUser(null);
      setProfile(null);
    }
  };

  return (
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
  );
};
