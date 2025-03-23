"use client";

import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";

// Define the Post type based on the Supabase 'posts' table
type Post = {
  id: number;
  user_id: string;
  content: string;
  image?: string;
  created_at: string;
};

export default function Community() {
  const [posts, setPosts] = useState<Post[]>([]); // Updated from any[] to Post[]
  const [content, setContent] = useState("");

  useEffect(() => {
    const fetchPosts = async () => {
      const { data } = await supabase
        .from("posts")
        .select("*")
        .order("created_at", { ascending: false });
      setPosts(data || []);
    };
    fetchPosts();
  }, []);

  const handlePost = async (e: React.FormEvent) => {
    e.preventDefault();
    const { data: userData, error } = await supabase.auth.getUser();
    if (error || !userData.user) {
      alert("You must be logged in to post");
      return;
    }
    const { error: postError } = await supabase
      .from("posts")
      .insert({ user_id: userData.user.id, content });
    if (postError) {
      alert(postError.message);
    } else {
      // Add the new post to the state with proper typing
      const newPost: Post = {
        id: Date.now(), // Temporary ID until Supabase returns the real one
        user_id: userData.user.id,
        content,
        created_at: new Date().toISOString(),
      };
      setPosts([newPost, ...posts]);
      setContent("");
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl mb-4">Badminton Community</h1>
      <form onSubmit={handlePost}>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="What’s happening in your badminton world?"
          className="w-full p-2 border mb-2"
        />
        <button type="submit" className="bg-blue-500 text-white p-2 rounded">
          Post
        </button>
      </form>
      <ul>
        {posts.map((post) => (
          <li key={post.id} className="border-b py-2">
            {post.content}
          </li>
        ))}
      </ul>
    </div>
  );
}
