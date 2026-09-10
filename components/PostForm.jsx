"use client";

import { useRef, useState, useTransition } from "react";
import { createPost, updatePost } from "@/app/actions/posts";
import DynamicEditor from "@/components/DynamicEditor";
import SaveButton from "@/components/SaveButton";
import { getEditorInitialContent } from "@/lib/posts";
import styles from "./PostForm.module.css";

export default function PostForm({
  postId,
  initialTitle = "",
  initialContent,
}) {
  const editorRef = useRef(null);
  const [title, setTitle] = useState(initialTitle);
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

  function handleSave() {
    const editor = editorRef.current;
    if (!editor) {
      setError("에디터가 아직 준비되지 않았습니다.");
      return;
    }

    setError("");
    const content = editor.document;
    const payload = { title, content };

    startTransition(async () => {
      const result = postId
        ? await updatePost({ id: postId, ...payload })
        : await createPost(payload);

      if (result?.error) {
        setError(result.error);
      }
    });
  }

  return (
    <div className={styles.wrap}>
      <div className={styles.header}>
        <input
          className={styles.title}
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="제목"
          aria-label="제목"
        />
        <SaveButton
          onClick={handleSave}
          disabled={pending}
          pending={pending}
        />
      </div>
      {error ? <p className={styles.error}>{error}</p> : null}
      <div className={styles.editor}>
        <DynamicEditor
          key={postId ?? "new"}
          editorRef={editorRef}
          initialContent={getEditorInitialContent(initialContent)}
        />
      </div>
    </div>
  );
}
