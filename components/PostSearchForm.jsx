"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import styles from "./PostSearchForm.module.css";

const DATE_RANGE_ERROR = "종료일은 시작일보다 빠를 수 없습니다.";

function SearchIcon() {
  return (
    <svg
      className={styles.icon}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <circle cx="10.5" cy="10.5" r="5.5" stroke="currentColor" strokeWidth="2" />
      <path
        d="M15 15.5 20 20.5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function ResetIcon() {
  return (
    <svg
      className={styles.icon}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M4.8 12a7.2 7.2 0 1 1 2.1 5.1"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M4.2 7.2v5.2h5.2"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function PostSearchForm({
  title = "",
  from = "",
  to = "",
  invalidRange = false,
}) {
  const router = useRouter();
  const formRef = useRef(null);
  const toRef = useRef(null);
  const [error, setError] = useState(invalidRange ? DATE_RANGE_ERROR : "");

  function focusEndDate() {
    const input = toRef.current;
    if (!input) {
      return;
    }

    input.setCustomValidity(DATE_RANGE_ERROR);
    input.reportValidity();
    input.focus();
  }

  useEffect(() => {
    if (!invalidRange) {
      return;
    }

    setError(DATE_RANGE_ERROR);
    const timer = window.setTimeout(() => {
      focusEndDate();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [invalidRange]);

  function clearRangeError() {
    setError("");
    toRef.current?.setCustomValidity("");
  }

  function handleReset() {
    const form = formRef.current;
    if (form) {
      form.title.value = "";
      form.from.value = "";
      form.to.value = "";
    }

    clearRangeError();
    router.push("/");
  }

  function handleSubmit(event) {
    const form = event.currentTarget;
    const start = form.from.value;
    const end = form.to.value;

    if (start && end && start > end) {
      event.preventDefault();
      setError(DATE_RANGE_ERROR);
      focusEndDate();
    }
  }

  return (
    <div className={styles.wrap}>
      <form
        ref={formRef}
        className={styles.form}
        action="/"
        method="get"
        onSubmit={handleSubmit}
        noValidate
      >
        <label className={styles.field}>
          <span className={styles.label}>제목</span>
          <input
            className={styles.input}
            type="text"
            name="title"
            defaultValue={title}
            placeholder="제목 검색"
            maxLength={100}
          />
        </label>
        <label className={`${styles.field} ${styles.period}`}>
          <span className={styles.label}>등록일</span>
          <input
            className={styles.date}
            type="date"
            name="from"
            defaultValue={from}
            aria-label="등록 시작일"
            onChange={clearRangeError}
          />
          <span className={styles.tilde}>~</span>
          <input
            ref={toRef}
            className={`${styles.date} ${error ? styles.invalid : ""}`}
            type="date"
            name="to"
            defaultValue={to}
            aria-label="등록 종료일"
            aria-invalid={error ? "true" : "false"}
            aria-describedby={error ? "date-range-error" : undefined}
            onChange={clearRangeError}
          />
        </label>
        <div className={styles.actions}>
          <button type="submit" className={styles.iconButton} aria-label="조회" title="조회">
            <SearchIcon />
          </button>
          <button
            type="button"
            className={styles.iconButton}
            aria-label="초기화"
            title="초기화"
            onClick={handleReset}
          >
            <ResetIcon />
          </button>
        </div>
      </form>
      {error ? (
        <p id="date-range-error" className={styles.error} role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
