import Link from "next/link";
import styles from "./SolidButton.module.css";

function EditIcon() {
  return (
    <svg
      className={styles.icon}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M4 20h4.5L19.2 9.3a1.5 1.5 0 0 0 0-2.1l-2.4-2.4a1.5 1.5 0 0 0-2.1 0L4 15.5V20Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path
        d="M13.2 6.3 17.7 10.8"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default function EditPostButton({ postId }) {
  return (
    <Link href={`/posts/${postId}/edit`} className={styles.button}>
      <EditIcon />
      수정
    </Link>
  );
}
