import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

function safeNextPath(next) {
  if (!next) {
    return "/";
  }

  try {
    const decoded = decodeURIComponent(next);
    if (decoded.startsWith("/") && !decoded.startsWith("//")) {
      return decoded;
    }
  } catch {
    return "/";
  }

  return "/";
}

export async function GET(request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = safeNextPath(request.cookies.get("auth-next")?.value);

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      const response = NextResponse.redirect(new URL(next, origin));
      response.cookies.set("auth-next", "", { path: "/", maxAge: 0 });
      return response;
    }
  }

  const response = NextResponse.redirect(new URL("/", origin));
  response.cookies.set("auth-next", "", { path: "/", maxAge: 0 });
  return response;
}
