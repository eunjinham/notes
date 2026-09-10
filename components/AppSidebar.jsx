import Sidebar from "@/components/Sidebar";
import { getGithubAvatar, getGithubUsername } from "@/lib/auth/user";
import { createClient } from "@/lib/supabase/server";

export default async function AppSidebar() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data } = await supabase
    .from("posts")
    .select("id, title, updated_at")
    .order("updated_at", { ascending: false })
    .limit(10);

  return (
    <Sidebar
      posts={data ?? []}
      userName={getGithubUsername(user) || "user"}
      avatarUrl={getGithubAvatar(user)}
    />
  );
}
