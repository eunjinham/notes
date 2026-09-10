import Link from "next/link";
import LoginButton from "@/components/LoginButton";
import LogoutButton from "@/components/LogoutButton";
import SidebarToggle from "@/components/SidebarToggle";
import { getGithubUsername } from "@/lib/auth/user";
import { createClient } from "@/lib/supabase/server";
import styles from "./Header.module.css";

export default async function Header() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <div className={styles.brand}>
          {user ? <SidebarToggle /> : null}
          <Link href="/" className={styles.logo}>
            Notes
          </Link>
        </div>
        <nav className={styles.nav}>
          {user ? (
            <>
              <span className={styles.userId}>
                {getGithubUsername(user) || user.id.slice(0, 8)}
              </span>
              <LogoutButton />
            </>
          ) : (
            <LoginButton />
          )}
        </nav>
      </div>
    </header>
  );
}
