// src/app/community/page.tsx
"use client";

import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import { Navigation } from "../../components/Navigation";
import { Footer } from "../../components/Footer";
import { Card, CardContent } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Send, AlertCircle, MessageSquare, Calendar, X } from "lucide-react";
import Image from "next/image";

type Post = {
  id: number;
  user_id: string;
  content: string;
  image?: string | null;
  created_at: string;
  user_name?: string;
  user_avatar?: string | null;
};

export default function Community() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [content, setContent] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isLoadingPosts, setIsLoadingPosts] = useState(true);

  useEffect(() => {
    const fetchPostsAndProfiles = async () => {
      setIsLoadingPosts(true);
      try {
        const { data: postsData, error: postsError } = await supabase
          .from("posts")
          .select("id, user_id, content, image, created_at")
          .order("created_at", { ascending: false });

        if (postsError) throw new Error(postsError.message);

        const { data: profilesData, error: profilesError } = await supabase
          .from("profiles")
          .select("id, name, avatar_url");

        if (profilesError) throw new Error(profilesError.message);

        const transformedPosts =
          postsData?.map((post) => {
            const profile = profilesData?.find((p) => p.id === post.user_id);
            return {
              id: post.id,
              user_id: post.user_id,
              content: post.content,
              image: post.image || null,
              created_at: post.created_at,
              user_name: profile?.name || "Anonymous",
              user_avatar: profile?.avatar_url || null,
            };
          }) || [];

        console.log("Fetched initial posts with profiles:", transformedPosts);
        setPosts(transformedPosts);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to load posts";
        console.error(errorMessage);
        setError(errorMessage);
      } finally {
        setIsLoadingPosts(false);
      }
    };

    fetchPostsAndProfiles();

    const subscription = supabase
      .channel("public:posts")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "posts" },
        async (payload) => {
          console.log("Realtime event received:", payload);

          const newPost = payload.new as {
            id: number;
            user_id: string;
            content: string;
            image?: string | null;
            created_at: string;
          };

          const { data: profileData, error: profileError } = await supabase
            .from("profiles")
            .select("id, name, avatar_url")
            .eq("id", newPost.user_id)
            .single();

          if (profileError) {
            console.error("Profile fetch error:", profileError.message);
          }

          const enrichedPost: Post = {
            ...newPost,
            user_name: profileData?.name || "Anonymous",
            user_avatar: profileData?.avatar_url || null,
          };

          console.log("Adding new post to state:", enrichedPost);
          setPosts((currentPosts) => [enrichedPost, ...currentPosts]);
        }
      )
      .subscribe((status) => {
        console.log("Subscription status:", status);
      });

    return () => {
      console.log("Unsubscribing from real-time updates");
      subscription.unsubscribe();
    };
  }, []);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
  };

  const handlePost = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    if (!content.trim() && !imageFile) {
      setError("Post must have content or an image");
      setIsLoading(false);
      return;
    }

    try {
      const { data: userData, error: userError } =
        await supabase.auth.getUser();
      if (userError || !userData.user) {
        throw new Error("You must be logged in to post");
      }

      let imageUrl: string | undefined;
      if (imageFile) {
        const fileExt = imageFile.name.split(".").pop();
        const fileName = `${userData.user.id}-${Date.now()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from("post-images")
          .upload(fileName, imageFile, { upsert: true });

        if (uploadError) {
          throw new Error("Failed to upload image: " + uploadError.message);
        }

        const { data: urlData } = supabase.storage
          .from("post-images")
          .getPublicUrl(fileName);
        imageUrl = urlData.publicUrl;
      }

      const { error: postError } = await supabase
        .from("posts")
        .insert({ user_id: userData.user.id, content, image: imageUrl })
        .select()
        .single();

      if (postError) throw new Error(postError.message);

      setContent("");
      setImageFile(null);
      setImagePreview(null);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "An unexpected error occurred";
      console.error("Post error:", errorMessage);
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      <Navigation />
      <div className="flex-grow container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Badminton Community
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Connect with other players and share your badminton experiences
            </p>
          </div>

          <Card className="border-0 shadow-xl bg-white dark:bg-gray-800 rounded-xl overflow-hidden mb-8">
            <CardContent className="p-6">
              {error && (
                <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 rounded-lg p-4 flex items-start">
                  <AlertCircle className="w-5 h-5 mr-3 mt-0.5 flex-shrink-0" />
                  <p>{error}</p>
                </div>
              )}

              <form onSubmit={handlePost} className="space-y-4">
                <Textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="What's happening in your badminton world?"
                  className="w-full p-4 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                />
                {imagePreview && (
                  <div className="relative w-full max-w-xs">
                    <Image
                      src={imagePreview}
                      alt="Image preview"
                      width={384}
                      height={384}
                      className="rounded-lg object-cover max-h-48 w-full"
                    />
                    <button
                      type="button"
                      onClick={removeImage}
                      className="absolute top-2 right-2 bg-red-600 text-white p-1 rounded-full hover:bg-red-700"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
                <div className="flex justify-between items-center">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="w-auto bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-200"
                    disabled={isLoading}
                  />
                  <Button
                    type="submit"
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-medium shadow-md transition-all duration-200 flex items-center"
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
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          />
                        </svg>
                        Posting...
                      </div>
                    ) : (
                      <div className="flex items-center">
                        Post <Send className="ml-2 w-5 h-5" />
                      </div>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {isLoadingPosts ? (
            <div className="text-center py-12">
              <svg
                className="animate-spin mx-auto h-8 w-8 text-indigo-600"
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
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              <p className="mt-4 text-gray-600 dark:text-gray-300">
                Loading posts...
              </p>
            </div>
          ) : posts.length === 0 ? (
            <Card className="border-0 shadow-lg bg-white dark:bg-gray-800 rounded-xl overflow-hidden">
              <CardContent className="p-8 text-center">
                <MessageSquare className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">
                  No posts yet
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Be the first to share your badminton experience!
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {posts.map((post) => (
                <Card
                  key={post.id}
                  className="border-0 shadow-lg bg-white dark:bg-gray-800 rounded-xl overflow-hidden"
                >
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center flex-shrink-0 overflow-hidden">
                        {post.user_avatar ? (
                          <Image
                            src={post.user_avatar}
                            alt={post.user_name || "User avatar"}
                            width={40}
                            height={40}
                            className="w-full h-full object-cover rounded-full"
                          />
                        ) : (
                          <span className="text-indigo-600 dark:text-indigo-400 font-medium text-lg">
                            {post.user_name?.charAt(0).toUpperCase() || "A"}
                          </span>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <div className="font-medium text-gray-900 dark:text-white">
                            {post.user_name || "Anonymous"}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
                            <Calendar className="w-4 h-4 mr-1" />
                            {formatDate(post.created_at)}
                          </div>
                        </div>
                        <div className="text-gray-700 dark:text-gray-200 whitespace-pre-line">
                          {post.content}
                        </div>
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
                        <div className="mt-4 flex space-x-4">
                          <button className="text-gray-500 dark:text-gray-400 flex items-center hover:text-indigo-600 dark:hover:text-indigo-400">
                            <MessageSquare className="w-4 h-4 mr-1" />
                            <span className="text-sm">Reply</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}
