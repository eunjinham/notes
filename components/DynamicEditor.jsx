"use client";

import dynamic from "next/dynamic";

const DynamicEditor = dynamic(() => import("@/components/Editor"), {
  ssr: false,
  loading: () => <p className="placeholder-note">에디터를 불러오는 중…</p>,
});

export default DynamicEditor;
