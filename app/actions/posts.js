"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { isPostId, resolvePostTitle } from "@/lib/posts";
import { createClient } from "@/lib/supabase/server";

function revalidatePostPages(id) {
  revalidatePath("/", "layout");
  if (id) {
    revalidatePath(`/posts/${id}`);
    revalidatePath(`/posts/${id}/edit`);
  }
}

async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/");
  }

  return { supabase, user };
}

export async function createPost({ title, content }) {
  const { supabase, user } = await requireUser();
  const blocks = Array.isArray(content) ? content : [];
  const { data, error } = await supabase
    .from("posts")
    .insert({
      user_id: user.id,
      title: resolvePostTitle(title, blocks),
      content: blocks,
    })
    .select("id")
    .single();

  if (error || !data) {
    return { error: "글을 저장하지 못했습니다." };
  }

  revalidatePostPages(data.id);
  redirect(`/posts/${data.id}`);
}

export async function updatePost({ id, title, content }) {
  if (!isPostId(id)) {
    return { error: "글을 찾을 수 없거나 수정할 수 없습니다." };
  }

  const { supabase } = await requireUser();
  const blocks = Array.isArray(content) ? content : [];
  const { data, error } = await supabase
    .from("posts")
    .update({
      title: resolvePostTitle(title, blocks),
      content: blocks,
    })
    .eq("id", id)
    .select("id")
    .maybeSingle();

  if (error) {
    return { error: "글을 수정하지 못했습니다." };
  }

  if (!data) {
    return { error: "글을 찾을 수 없거나 수정할 수 없습니다." };
  }

  revalidatePostPages(id);
  redirect(`/posts/${id}`);
}

export async function deletePost(id) {
  if (!isPostId(id)) {
    return { error: "글을 찾을 수 없거나 삭제할 수 없습니다." };
  }

  const { supabase } = await requireUser();
  const { data, error } = await supabase
    .from("posts")
    .delete()
    .eq("id", id)
    .select("id")
    .maybeSingle();

  if (error) {
    return { error: "글을 삭제하지 못했습니다." };
  }

  if (!data) {
    return { error: "글을 찾을 수 없거나 삭제할 수 없습니다." };
  }

  revalidatePostPages(id);
  redirect("/");
}
