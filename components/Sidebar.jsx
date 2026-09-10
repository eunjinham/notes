"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import styles from "./Sidebar.module.css";

function HomeIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-5.2v-6.2h-3.6V21H5a1 1 0 0 1-1-1v-9.5Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function WriteIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M4 20h4.4L18.8 9.6a1.4 1.4 0 0 0 0-2L16.4 5.2a1.4 1.4 0 0 0-2 0L4 15.6V20Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
      <path
        d="M13.2 6.4 17.6 10.8"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  );
}

function DocsIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M7 3.5h7.2L19 8.3V20a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4.5a1 1 0 0 1 1-1Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
      <path
        d="M14 3.6V8h4.4M8.6 12h6.8M8.6 15.5h6.8"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function formatDate(value) {
  if (!value) {
    return "";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export default function Sidebar({ posts = [], userName, avatarUrl }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    function onToggle() {
      setOpen((current) => !current);
    }

    window.addEventListener("notes:toggle-sidebar", onToggle);
    return () => window.removeEventListener("notes:toggle-sidebar", onToggle);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  const initial = (userName || "U").slice(0, 1).toUpperCase();

  return (
    <>
      {open ? (
        <button
          type="button"
          className={styles.backdrop}
          aria-label="메뉴 닫기"
          onClick={() => setOpen(false)}
        />
      ) : null}
      <aside className={`${styles.sidebar} ${open ? styles.open : ""}`}>
        <div className={styles.top}>
          <p className={styles.brand}>Notes</p>
          <button
            type="button"
            className={styles.close}
            aria-label="닫기"
            onClick={() => setOpen(false)}
          >
            ×
          </button>
        </div>

        <div className={styles.user}>
          {avatarUrl ? (
            <img className={styles.avatar} src={avatarUrl} alt="" />
          ) : (
            <span className={styles.avatarFallback}>{initial}</span>
          )}
          <span className={styles.userName}>{userName}</span>
        </div>

        <nav className={styles.nav} aria-label="노트 메뉴">
          <Link
            href="/"
            className={`${styles.item} ${pathname === "/" ? styles.active : ""}`}
          >
            <HomeIcon />
            홈
          </Link>
          <Link
            href="/posts/new"
            className={`${styles.item} ${pathname === "/posts/new" ? styles.active : ""}`}
          >
            <WriteIcon />
            글 작성
          </Link>
          <Link
            href="/"
            className={`${styles.item} ${pathname.startsWith("/posts/") && pathname !== "/posts/new" ? styles.active : ""}`}
          >
            <DocsIcon />
            모든 글
          </Link>
        </nav>

        <div className={styles.recent}>
          <p className={styles.sectionLabel}>최근 글</p>
          {posts.length === 0 ? (
            <p className={styles.empty}>아직 글이 없습니다</p>
          ) : (
            posts.map((post) => {
              const href = `/posts/${post.id}`;
              const active =
                pathname === href || pathname.startsWith(`${href}/`);

              return (
                <Link
                  key={post.id}
                  href={href}
                  className={`${styles.recentItem} ${active ? styles.active : ""}`}
                >
                  <span className={styles.postTitle}>
                    {post.title?.trim() || "제목 없음"}
                  </span>
                  <span className={styles.postDate}>
                    {formatDate(post.updated_at)}
                  </span>
                </Link>
              );
            })
          )}
        </div>
      </aside>
    </>
  );
}
