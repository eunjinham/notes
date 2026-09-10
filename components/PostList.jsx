import Link from "next/link";
import { formatPostDate } from "@/lib/posts";
import styles from "./PostList.module.css";

export default function PostList({ posts, filtered = false }) {
  if (!posts?.length) {
    if (filtered) {
      return (
        <section className="empty-state">
          <strong>조건에 맞는 글이 없습니다</strong>
          제목이나 등록 기간을 바꿔 검색해 보세요.
        </section>
      );
    }

    return (
      <section className="empty-state">
        <strong>아직 글이 없습니다</strong>
        글쓰기로 첫 노트를 만들어 보세요.
      </section>
    );
  }

  return (
    <ul className={styles.list}>
      {posts.map((post) => (
        <li key={post.id}>
          <Link href={`/posts/${post.id}`} className={styles.item}>
            <span className={styles.title}>{post.title || "제목 없음"}</span>
            <time className={styles.date} dateTime={post.created_at}>
              {formatPostDate(post.created_at)}
            </time>
          </Link>
        </li>
      ))}
    </ul>
  );
}
