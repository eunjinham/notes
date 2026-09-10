import { notFound, redirect } from "next/navigation";
import PostForm from "@/components/PostForm";
import { isPostId } from "@/lib/posts";
import { createClient } from "@/lib/supabase/server";

export default async function EditPostPage({ params }) {
  const { id } = await params;
  if (!isPostId(id)) {
    notFound();
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/");
  }

  const { data: post, error } = await supabase
    .from("posts")
    .select("id, title, content")
    .eq("id", id)
    .maybeSingle();

  if (error || !post) {
    notFound();
  }

  return (
    <main className="page">
      <PostForm
        postId={post.id}
        initialTitle={post.title === "제목 없음" ? "" : post.title}
        initialContent={post.content}
      />
    </main>
  );
}
