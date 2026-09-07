"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function LogoutButton() {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function handleLogout() {
    setPending(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    router.replace("/");
    router.refresh();
    setPending(false);
  }

  return (
    <button
      type="button"
      className="btn"
      onClick={handleLogout}
      disabled={pending}
    >
      {pending ? "로그아웃 중…" : "로그아웃"}
    </button>
  );
}
