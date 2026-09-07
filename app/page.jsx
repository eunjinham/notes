import NewPostButton from "@/components/NewPostButton";
import Welcome from "@/components/Welcome";
import { createClient } from "@/lib/supabase/server";

export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return <Welcome />;
  }

  return (
    <main className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">내 글</h1>
          <p className="page-desc">작성한 노트가 여기에 모입니다.</p>
        </div>
        <NewPostButton withLabel />
      </div>
      <section className="empty-state">
        <strong>아직 글이 없습니다</strong>
        글 목록은 이후 단계에서 연결합니다.
      </section>
    </main>
  );
}
