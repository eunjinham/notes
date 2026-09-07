import styles from "./Welcome.module.css";

export default function Welcome() {
  return (
    <main className={styles.welcome}>
      <img
        className={styles.image}
        src="/landing-writing.png"
        alt="테이블에 앉아 글을 쓰는 사람"
      />
      <p className={styles.message}>
        글쓰기는 내면을 들여다보고
        <br />
        다가올 미래를 그려볼 좋은 기회입니다
      </p>
    </main>
  );
}
