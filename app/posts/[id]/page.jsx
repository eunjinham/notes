import Link from "next/link";

export default async function PostPage({ params }) {
  const { id } = await params;

  return (
    <main className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">글 조회</h1>
          <p className="page-desc">글 ID: {id}</p>
        </div>
        <div className="btn-row">
          <Link href={`/posts/${id}/edit`} className="btn">
            수정
          </Link>
          <button type="button" className="btn" disabled>
            삭제
          </button>
        </div>
      </div>
      <section className="empty-state">
        <strong>본문 자리</strong>
        글 내용은 이후 단계에서 불러옵니다.
      </section>
    </main>
  );
}
