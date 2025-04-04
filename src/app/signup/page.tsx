"use client";

import { useState } from "react";
import { supabase } from "../../lib/supabase";
import { useRouter } from "next/navigation";
import { Navigation } from "../../components/Navigation";
import { Footer } from "../../components/Footer";
import { Button } from "../../components/ui/button";
import { Card, CardContent } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Mail, Lock, User, Phone, ArrowRight, AlertCircle } from "lucide-react";
import Link from "next/link";

export default function SignUp() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { name, phone } },
      });

      if (signUpError) {
        throw new Error(signUpError.message);
      }

      if (data.user) {
        const { error: insertError } = await supabase
          .from("users")
          .insert({ id: data.user.id, email, name, phone });

        if (insertError) {
          throw new Error(
            "Failed to create user profile: " + insertError.message
          );
        }

        console.log("User signed up and profile created:", data.user);
        router.push("/player-creation");
      }
    } catch (err: unknown) {
      // Changed 'any' to 'unknown'
      const errorMessage =
        err instanceof Error ? err.message : "An unexpected error occurred";
      console.error("Sign-up error:", errorMessage);
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      <Navigation />

      <div className="flex-grow flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Join SportOn
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Connect with players and find your perfect match
            </p>
          </div>

          <Card className="border-0 shadow-xl bg-white dark:bg-gray-800 rounded-xl overflow-hidden">
            <CardContent className="p-8">
              {error && (
                <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 rounded-lg p-4 flex items-start">
                  <AlertCircle className="w-5 h-5 mr-3 mt-0.5 flex-shrink-0" />
                  <p>{error}</p>
                </div>
              )}

              <form onSubmit={handleSignUp} className="space-y-5">
                <div className="space-y-2">
                  <Label
                    htmlFor="email"
                    className="text-gray-700 dark:text-gray-200 font-medium"
                  >
                    Email
                  </Label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                      <Mail className="w-5 h-5" />
                    </div>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your.email@example.com"
                      className="pl-10 py-6 bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="password"
                    className="text-gray-700 dark:text-gray-200 font-medium"
                  >
                    Password
                  </Label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                      <Lock className="w-5 h-5" />
                    </div>
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Create a secure password"
                      className="pl-10 py-6 bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                      required
                    />
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Must be at least 8 characters
                  </p>
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="name"
                    className="text-gray-700 dark:text-gray-200 font-medium"
                  >
                    Full Name
                  </Label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                      <User className="w-5 h-5" />
                    </div>
                    <Input
                      id="name"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Your full name"
                      className="pl-10 py-6 bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="phone"
                    className="text-gray-700 dark:text-gray-200 font-medium"
                  >
                    Phone Number
                  </Label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                      <Phone className="w-5 h-5" />
                    </div>
                    <Input
                      id="phone"
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+1 (555) 123-4567"
                      className="pl-10 py-6 bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                      pattern="^\+?[1-9]\d{1,14}$"
                      title="Please enter a valid phone number (e.g., +1234567890)"
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-6 rounded-xl font-medium text-lg shadow-md transition-all duration-200 flex items-center justify-center"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center">
                      <svg
                        className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
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
                      Creating Account...
                    </div>
                  ) : (
                    <div className="flex items-center">
                      Create Account <ArrowRight className="ml-2 w-5 h-5" />
                    </div>
                  )}
                </Button>

                <div className="text-center pt-4">
                  <p className="text-gray-600 dark:text-gray-300">
                    Already have an account?{" "}
                    <Link
                      href="/signin"
                      className="text-indigo-600 dark:text-indigo-400 font-medium hover:underline"
                    >
                      Sign in
                    </Link>
                  </p>
                </div>
              </form>
            </CardContent>
          </Card>

          <div className="text-center mt-8 text-sm text-gray-500 dark:text-gray-400">
            By signing up, you agree to our{" "}
            <Link
              href="/terms"
              className="text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link
              href="/privacy"
              className="text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              Privacy Policy
            </Link>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
