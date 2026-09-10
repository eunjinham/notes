import { redirect } from "next/navigation";
import NewPostButton from "@/components/NewPostButton";
import Pagination from "@/components/Pagination";
import PostList from "@/components/PostList";
import PostSearchForm from "@/components/PostSearchForm";
import Welcome from "@/components/Welcome";
import {
  POSTS_PAGE_SIZE,
  buildListHref,
  escapeIlike,
  hasListFilters,
  parseListFilters,
  parsePage,
  toCreatedAtEnd,
  toCreatedAtStart,
} from "@/lib/posts";
import { createClient } from "@/lib/supabase/server";

export default async function HomePage({ searchParams }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return <Welcome />;
  }

  const params = await searchParams;
  const filters = parseListFilters(params);
  const page = parsePage(params?.page);
  const from = (page - 1) * POSTS_PAGE_SIZE;
  const to = from + POSTS_PAGE_SIZE - 1;

  let query = supabase
    .from("posts")
    .select("id, title, created_at, updated_at", { count: "exact" })
    .order("updated_at", { ascending: false })
    .range(from, to);

  if (filters.title) {
    query = query.ilike("title", `%${escapeIlike(filters.title)}%`);
  }

  if (!filters.invalidRange) {
    if (filters.from) {
      query = query.gte("created_at", toCreatedAtStart(filters.from));
    }

    if (filters.to) {
      query = query.lte("created_at", toCreatedAtEnd(filters.to));
    }
  }

  const { data: posts, count } = await query;

  const total = count ?? 0;
  const totalPages = Math.ceil(total / POSTS_PAGE_SIZE);

  if (totalPages > 0 && page > totalPages) {
    redirect(buildListHref({ page: totalPages, ...filters }));
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
      <PostSearchForm
        key={`${filters.title}-${filters.from}-${filters.to}-${filters.invalidRange}`}
        title={filters.title}
        from={filters.from}
        to={filters.to}
        invalidRange={filters.invalidRange}
      />
      <PostList posts={posts ?? []} filtered={hasListFilters(filters)} />
      {total > 0 ? (
        <Pagination page={page} totalPages={totalPages} filters={filters} />
      ) : null}
    </main>
  );
}
