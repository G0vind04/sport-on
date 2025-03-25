// src/app/community/[postId]/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { supabase } from "../../../lib/supabase";
import { Navigation } from "../../../components/Navigation";
import { Footer } from "../../../components/Footer";
import { Card, CardContent } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, AlertCircle, Calendar } from "lucide-react";
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

type Reply = {
  id: number;
  post_id: number;
  user_id: string;
  content: string;
  created_at: string;
  user_name?: string;
  user_avatar?: string | null;
};

export default function PostOverview() {
  const params = useParams(); // Get raw params object
  const postId = params?.postId; // Extract postId safely
  const [post, setPost] = useState<Post | null>(null);
  const [replies, setReplies] = useState<Reply[]>([]);
  const [replyContent, setReplyContent] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isReplying, setIsReplying] = useState(false);
  const [error, setError] = useState("");

  console.log("postId from useParams:", postId); // Debug log

  useEffect(() => {
    const fetchPostAndReplies = async () => {
      // Validate postId
      const numericPostId = typeof postId === "string" ? Number(postId) : NaN;
      if (!postId || isNaN(numericPostId)) {
        setError("Invalid post ID");
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        // Fetch Post
        const { data: postData, error: postError } = await supabase
          .from("posts")
          .select("id, user_id, content, image, created_at")
          .eq("id", numericPostId)
          .single();

        if (postError) throw new Error(postError.message);

        // Fetch Profile for Post
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("id, name, avatar_url")
          .eq("id", postData.user_id)
          .single();

        if (profileError) throw new Error(profileError.message);

        setPost({
          ...postData,
          user_name: profileData?.name || "Anonymous",
          user_avatar: profileData?.avatar_url || null,
        });

        // Fetch Replies (empty table should return empty array)
        const { data: repliesData, error: repliesError } = await supabase
          .from("replies")
          .select("id, post_id, user_id, content, created_at")
          .eq("post_id", numericPostId)
          .order("created_at", { ascending: true });

        if (repliesError) throw new Error(repliesError.message);

        // Fetch Profiles for Replies (skip if no replies)
        const userIds = repliesData?.map((reply) => reply.user_id) || [];
        let enrichedReplies: Reply[] = [];
        if (userIds.length > 0) {
          const { data: profilesData, error: profilesError } = await supabase
            .from("profiles")
            .select("id, name, avatar_url")
            .in("id", userIds);

          if (profilesError) throw new Error(profilesError.message);

          enrichedReplies =
            repliesData?.map((reply) => {
              const profile = profilesData?.find((p) => p.id === reply.user_id);
              return {
                ...reply,
                user_name: profile?.name || "Anonymous",
                user_avatar: profile?.avatar_url || null,
              };
            }) || [];
        }

        setReplies(enrichedReplies);

        // Real-time subscription for replies
        const subscription = supabase
          .channel(`public:replies:post_id=${numericPostId}`)
          .on(
            "postgres_changes",
            {
              event: "INSERT",
              schema: "public",
              table: "replies",
              filter: `post_id=eq.${numericPostId}`,
            },
            async (payload) => {
              const newReply = payload.new as {
                id: number;
                post_id: number;
                user_id: string;
                content: string;
                created_at: string;
              };

              const { data: profileData, error: profileError } = await supabase
                .from("profiles")
                .select("id, name, avatar_url")
                .eq("id", newReply.user_id)
                .single();

              if (profileError) {
                console.error("Profile fetch error:", profileError.message);
              }

              const enrichedReply: Reply = {
                ...newReply,
                user_name: profileData?.name || "Anonymous",
                user_avatar: profileData?.avatar_url || null,
              };

              setReplies((currentReplies) => [
                ...currentReplies,
                enrichedReply,
              ]);
            }
          )
          .subscribe();

        return () => {
          subscription.unsubscribe();
        };
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to load post";
        console.error(errorMessage);
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPostAndReplies();
  }, [postId]);

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsReplying(true);
    setError("");

    if (!replyContent.trim()) {
      setError("Reply cannot be empty");
      setIsReplying(false);
      return;
    }

    const numericPostId = typeof postId === "string" ? Number(postId) : NaN;
    if (!postId || isNaN(numericPostId)) {
      setError("Invalid post ID");
      setIsReplying(false);
      return;
    }

    try {
      const { data: userData, error: userError } =
        await supabase.auth.getUser();
      if (userError || !userData.user) {
        throw new Error("You must be logged in to reply");
      }

      const { error: replyError } = await supabase
        .from("replies")
        .insert({
          post_id: numericPostId,
          user_id: userData.user.id,
          content: replyContent,
        })
        .select()
        .single();

      if (replyError) throw new Error(replyError.message);

      setReplyContent("");
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "An unexpected error occurred";
      console.error("Reply error:", errorMessage);
      setError(errorMessage);
    } finally {
      setIsReplying(false);
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <svg
          className="animate-spin h-8 w-8 text-indigo-600"
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
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <p className="text-red-600 dark:text-red-300">
          {error || "Post not found"}
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      <Navigation />
      <div className="flex-grow container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <Card className="border-0 shadow-xl bg-white dark:bg-gray-800 rounded-xl overflow-hidden mb-8">
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
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Reply Form */}
          <Card className="border-0 shadow-xl bg-white dark:bg-gray-800 rounded-xl overflow-hidden mb-8">
            <CardContent className="p-6">
              {error && (
                <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 rounded-lg p-4 flex items-start">
                  <AlertCircle className="w-5 h-5 mr-3 mt-0.5 flex-shrink-0" />
                  <p>{error}</p>
                </div>
              )}
              <form onSubmit={handleReply} className="space-y-4">
                <Textarea
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  placeholder="Write a reply..."
                  className="w-full p-4 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                />
                <Button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-medium shadow-md transition-all duration-200 flex items-center"
                  disabled={isReplying}
                >
                  {isReplying ? (
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
                      Replying...
                    </div>
                  ) : (
                    <div className="flex items-center">
                      Reply <Send className="ml-2 w-5 h-5" />
                    </div>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Replies List */}
          <div className="space-y-6">
            {replies.length === 0 ? (
              <p className="text-center text-gray-600 dark:text-gray-300">
                No replies yet. Be the first to reply!
              </p>
            ) : (
              replies.map((reply) => (
                <Card
                  key={reply.id}
                  className="border-0 shadow-lg bg-white dark:bg-gray-800 rounded-xl overflow-hidden"
                >
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center flex-shrink-0 overflow-hidden">
                        {reply.user_avatar ? (
                          <Image
                            src={reply.user_avatar}
                            alt={reply.user_name || "User avatar"}
                            width={40}
                            height={40}
                            className="w-full h-full object-cover rounded-full"
                          />
                        ) : (
                          <span className="text-indigo-600 dark:text-indigo-400 font-medium text-lg">
                            {reply.user_name?.charAt(0).toUpperCase() || "A"}
                          </span>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <div className="font-medium text-gray-900 dark:text-white">
                            {reply.user_name || "Anonymous"}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
                            <Calendar className="w-4 h-4 mr-1" />
                            {formatDate(reply.created_at)}
                          </div>
                        </div>
                        <div className="text-gray-700 dark:text-gray-200 whitespace-pre-line">
                          {reply.content}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
