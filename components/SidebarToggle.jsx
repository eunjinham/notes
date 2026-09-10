"use client";

import styles from "./SidebarToggle.module.css";

export default function SidebarToggle() {
  function handleClick() {
    window.dispatchEvent(new Event("notes:toggle-sidebar"));
  }

  return (
    <button
      type="button"
      className={styles.toggle}
      aria-label="사이드바 열기"
      onClick={handleClick}
    >
      <span />
      <span />
      <span />
    </button>
  );
}
