import Link from "next/link";

export default function NotFound() {
  return (
    <main className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">글을 찾을 수 없습니다</h1>
          <p className="page-desc">
            없거나 볼 수 없는 글입니다. 목록에서 다시 확인해 주세요.
          </p>
        </div>
        <Link href="/" className="btn">
          전체 글
        </Link>
      </div>
    </main>
  );
}
