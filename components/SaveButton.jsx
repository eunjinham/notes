import styles from "./SaveButton.module.css";

function SaveIcon() {
  return (
    <svg
      className={styles.icon}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <rect x="3.8" y="6.2" width="11.2" height="14" rx="1.4" stroke="currentColor" strokeWidth="1.7" />
      <rect x="6.6" y="3.4" width="11.2" height="14" rx="1.4" stroke="currentColor" strokeWidth="1.7" />
      <rect x="8.2" y="5.2" width="2.6" height="2.6" rx="0.35" stroke="currentColor" strokeWidth="1.4" />
      <path
        d="M8.2 10.2h7.2M8.2 12.8h6M8.2 15.4h4.6"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M20.4 3.2v12.6"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
      <rect x="19.2" y="3.2" width="2.4" height="2.8" rx="0.35" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M19.2 16.6 20.4 19.4 21.6 16.6"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <circle cx="3.4" cy="3.6" r="0.7" fill="currentColor" />
      <path
        d="M21.6 2.4v2.2M20.5 3.5h2.2"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
      />
      <path
        d="M3.2 19.2 4.8 17.6M3.2 17.6 4.8 19.2"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default function SaveButton({ disabled = false }) {
  return (
    <button type="button" className={styles.button} disabled={disabled}>
      <SaveIcon />
      저장
    </button>
  );
}
