import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import DeletePostButton from "@/components/DeletePostButton";
import DynamicEditor from "@/components/DynamicEditor";
import EditPostButton from "@/components/EditPostButton";
import { formatPostDate, getEditorInitialContent, isPostId } from "@/lib/posts";
import { createClient } from "@/lib/supabase/server";
import styles from "./page.module.css";

function BackIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M14.5 5.5 8 12l6.5 6.5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M9 12h8"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default async function PostPage({ params }) {
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
    .select("id, title, content, created_at, updated_at")
    .eq("id", id)
    .maybeSingle();

  if (error || !post) {
    notFound();
  }

  return (
    <main className="page">
      <div className="page-header">
        <div className={styles.heading}>
          <div className={styles.actions}>
            <Link href="/" className="btn">
              <BackIcon />
              전체 글
            </Link>
            <div className="btn-row">
              <EditPostButton postId={post.id} />
              <DeletePostButton postId={post.id} />
            </div>
          </div>
          <h1 className="page-title">{post.title || "제목 없음"}</h1>
          <p className="page-desc">{formatPostDate(post.created_at)}</p>
        </div>
      </div>
      <section className={styles.body}>
        <DynamicEditor
          key={post.id}
          editable={false}
          initialContent={getEditorInitialContent(post.content)}
        />
      </section>
    </main>
  );
}
