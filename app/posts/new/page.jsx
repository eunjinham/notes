import SaveButton from "@/components/SaveButton";

export default function NewPostPage() {
  return (
    <main className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">글쓰기</h1>
          <p className="page-desc">제목과 본문을 작성하는 화면입니다.</p>
        </div>
        <SaveButton />
      </div>
      <section className="empty-state">
        <strong>에디터 자리</strong>
        BlockNote 에디터는 이후 단계에서 연결합니다.
      </section>
    </main>
  );
}
