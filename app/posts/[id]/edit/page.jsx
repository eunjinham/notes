import SaveButton from "@/components/SaveButton";

export default async function EditPostPage({ params }) {
  const { id } = await params;

  return (
    <main className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">글 수정</h1>
          <p className="page-desc">글 ID: {id}</p>
        </div>
        <SaveButton />
      </div>
      <section className="empty-state">
        <strong>에디터 자리</strong>
        기존 글을 불러와 수정하는 기능은 이후 단계에서 연결합니다.
      </section>
    </main>
  );
}
