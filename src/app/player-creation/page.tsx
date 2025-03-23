"use client";

import { useState } from "react";
import { supabase } from "../../lib/supabase";
import { useRouter } from "next/navigation";
import { Navigation } from "../../components/Navigation";
import { Footer } from "../../components/Footer";
import { Button } from "../../components/ui/button";
import { Card, CardContent } from "../../components/ui/card";
import { Label } from "../../components/ui/label";
import { Camera, ArrowRight, AlertCircle } from "lucide-react";
import Link from "next/link";

export default function PlayerCreation() {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null;
    setFile(selectedFile);

    if (selectedFile) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewUrl(e.target?.result as string);
      };
      reader.readAsDataURL(selectedFile);
    } else {
      setPreviewUrl(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    // Check authentication
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData.user) {
      setError("You must be logged in to continue");
      setIsLoading(false);
      return;
    }

    if (!file) {
      setError("Please select a profile picture");
      setIsLoading(false);
      return;
    }

    try {
      // Step 1: Upload file to storage
      const filePath = `${userData.user.id}/${file.name}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("profile-pics")
        .upload(filePath, file, { upsert: true });

      if (uploadError) {
        throw new Error(`Upload failed: ${uploadError.message}`);
      }

      // Step 2: Get public URL
      const { publicUrl } = supabase.storage
        .from("profile-pics")
        .getPublicUrl(filePath).data;

      // Step 3: Update users table
      const { error: updateError } = await supabase
        .from("users")
        .update({ profile_pic: publicUrl })
        .eq("id", userData.user.id);

      if (updateError) {
        throw new Error(`Profile update failed: ${updateError.message}`);
      }

      router.push("/");
    } catch (err: any) {
      console.error("Profile creation error:", err.message);
      setError(err.message);
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
              Complete Your Profile
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Add a profile picture to personalize your account
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

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-4">
                  <Label
                    htmlFor="profile-pic"
                    className="text-gray-700 dark:text-gray-200 font-medium"
                  >
                    Profile Picture
                  </Label>

                  {previewUrl ? (
                    <div className="flex flex-col items-center gap-4">
                      <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-indigo-100 dark:border-indigo-900 shadow-md">
                        <img
                          src={previewUrl}
                          alt="Profile preview"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setFile(null);
                          setPreviewUrl(null);
                        }}
                        className="text-sm"
                      >
                        Remove photo
                      </Button>
                    </div>
                  ) : (
                    <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <div className="p-3 bg-indigo-50 dark:bg-indigo-900/30 rounded-full">
                          <Camera className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">
                            Drag and drop your photo here, or
                          </p>
                          <Label
                            htmlFor="profile-pic"
                            className="text-indigo-600 dark:text-indigo-400 font-medium hover:underline cursor-pointer"
                          >
                            browse files
                          </Label>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          JPG, PNG or GIF (max. 5MB)
                        </p>
                      </div>
                      <input
                        id="profile-pic"
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                    </div>
                  )}
                </div>

                <Button
                  type="submit"
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-6 rounded-xl font-medium text-lg shadow-md transition-all duration-200 flex items-center justify-center"
                  disabled={isLoading || !file}
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
                      Saving Profile...
                    </div>
                  ) : (
                    <div className="flex items-center">
                      Continue <ArrowRight className="ml-2 w-5 h-5" />
                    </div>
                  )}
                </Button>

                <div className="text-center pt-2">
                  <p className="text-gray-600 dark:text-gray-300 text-sm">
                    <Link
                      href="/"
                      className="text-indigo-600 dark:text-indigo-400 font-medium hover:underline"
                    >
                      Skip for now
                    </Link>{" "}
                    (you can add a photo later)
                  </p>
                </div>
              </form>
            </CardContent>
          </Card>

          <div className="text-center mt-6 text-sm text-gray-500 dark:text-gray-400">
            Need help?{" "}
            <Link
              href="/support"
              className="text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              Contact support
            </Link>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
