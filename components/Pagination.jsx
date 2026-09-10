import Link from "next/link";
import { getPageHref, getVisiblePages } from "@/lib/posts";
import styles from "./Pagination.module.css";

export default function Pagination({ page, totalPages, filters = {} }) {
  if (totalPages <= 1) {
    return null;
  }

  const pages = getVisiblePages(page, totalPages);
  const prevHref = getPageHref(page - 1, filters);
  const nextHref = getPageHref(page + 1, filters);

  return (
    <nav className={styles.nav} aria-label="글 목록 페이지">
      {page > 1 ? (
        <Link href={prevHref} className={styles.link}>
          이전
        </Link>
      ) : (
        <span className={`${styles.link} ${styles.disabled}`}>이전</span>
      )}

      {pages[0] > 1 ? (
        <>
          <Link href={getPageHref(1, filters)} className={styles.link}>
            1
          </Link>
          {pages[0] > 2 ? <span className={styles.ellipsis}>…</span> : null}
        </>
      ) : null}

      {pages.map((number) =>
        number === page ? (
          <span
            key={number}
            className={`${styles.link} ${styles.current}`}
            aria-current="page"
          >
            {number}
          </span>
        ) : (
          <Link key={number} href={getPageHref(number, filters)} className={styles.link}>
            {number}
          </Link>
        )
      )}

      {pages[pages.length - 1] < totalPages ? (
        <>
          {pages[pages.length - 1] < totalPages - 1 ? (
            <span className={styles.ellipsis}>…</span>
          ) : null}
          <Link href={getPageHref(totalPages, filters)} className={styles.link}>
            {totalPages}
          </Link>
        </>
      ) : null}

      {page < totalPages ? (
        <Link href={nextHref} className={styles.link}>
          다음
        </Link>
      ) : (
        <span className={`${styles.link} ${styles.disabled}`}>다음</span>
      )}
    </nav>
  );
}
