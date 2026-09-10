"use client";

import { useState, useTransition } from "react";
import { deletePost } from "@/app/actions/posts";
import styles from "./SolidButton.module.css";

function TrashIcon() {
  return (
    <svg
      className={styles.icon}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M5 7h14"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M10 7V5.6A1.6 1.6 0 0 1 11.6 4h.8A1.6 1.6 0 0 1 14 5.6V7"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M7.5 7.5 8.2 19.2A1.6 1.6 0 0 0 9.8 20.7h4.4a1.6 1.6 0 0 0 1.6-1.5L16.5 7.5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path
        d="M10.2 11v6.2M13.8 11v6.2"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default function DeletePostButton({ postId }) {
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

  function handleDelete() {
    const ok = window.confirm("이 글을 삭제할까요?");
    if (!ok) {
      return;
    }

    setError("");
    startTransition(async () => {
      const result = await deletePost(postId);
      if (result?.error) {
        setError(result.error);
      }
    });
  }

  return (
    <span>
      <button
        type="button"
        className={styles.button}
        onClick={handleDelete}
        disabled={pending}
      >
        <TrashIcon />
        {pending ? "삭제 중…" : "삭제"}
      </button>
      {error ? (
        <span className="placeholder-note" role="alert">
          {" "}
          {error}
        </span>
      ) : null}
    </span>
  );
}
