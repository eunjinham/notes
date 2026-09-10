# Notion 스타일 글 작성 사이트 — 구현 계획

Notion처럼 블록 단위로 글을 작성·조회·수정·삭제할 수 있는 웹 앱을 만든다.  
언어는 **JavaScript**만 사용하고, 에디터는 **BlockNote**, 백엔드/인증은 **Supabase**를 사용한다.

## 개발 순서 & 체크리스트

1. **골격** — Next.js(JS) 생성, 레이아웃/빈 페이지
   - [x] 앱 생성 및 패키지 설치 (`@supabase/*`, `@blocknote/*`)
   - [x] 레이아웃, 헤더, 라우트 뼈대
   - [x] 로그인 후 사이드바 (홈, 글쓰기, 글 목록)
2. **DB** — `posts` 테이블 + RLS
   - [x] 테이블, `updated_at` 트리거, RLS 정책
3. **인증** — GitHub OAuth + 쿠키 세션 (Zustand 없음)
   - [x] GitHub OAuth 앱 + Supabase Provider (Dashboard에서 직접 설정)
   - [x] `.env.local` (프로젝트 URL + anon/publishable key)
   - [x] `@supabase/ssr` 클라이언트 3종 (브라우저 / 서버 / proxy 헬퍼)
   - [x] GitHub 소셜 로그인 + `/auth/callback`에서 세션 교환
   - [x] 로그인/로그아웃 버튼 컴포넌트
   - [x] 보호된 라우트: `proxy.js`의 `getUser()` + 서버 리다이렉트
4. **에디터** — BlockNote (클라이언트 전용)
   - [x] `Editor` + `dynamic(..., { ssr: false })`
   - [x] `/posts/new`에서 타이핑 확인
   - [x] 포멧팅 툴바기능 추가
5. **CRUD** — 작성·목록·조회·수정·삭제
   - [x] 작성 저장 → 상세 이동
   - [x] 홈 목록 / 읽기 전용 조회
   - [x] 수정·삭제 (작성자만)
   - [x] 제목이 없을 경우 첫번째 블록을 제목으로 자동 치환
6. **점검** — 권한·예외
   - [x] 비로그인 작성 차단, 타인 글 접근 거부
   - [x] 없는 id, 저장 실패 처리
   - [x] 잘못된 id, 수정·삭제 0건, 세션 만료, 커스텀 404

---

## 1. 목표와 범위

### 해야 할 기능

| 기능 | 설명 |
| --- | --- |
| GitHub 소셜 로그인 | Supabase Auth + GitHub OAuth. 로그아웃 포함 |
| 글 작성 | 로그인 후 BlockNote로 새 글 작성·저장 |
| 글 조회 | 내 글 목록 + 개별 글 읽기 |
| 글 수정/삭제 | 작성자만 수정·삭제 가능 |

### 이번 범위에서 하지 않는 것

- 실시간 공동 편집 (Yjs / Liveblocks)
- 이미지 업로드·파일 첨부
- 공개 공유 링크, 댓글, 태그, 검색
- 이메일/비밀번호 로그인, Google 로그인
- Zustand(또는 기타 클라이언트 store)로 인증 상태 관리. 강의에서 쓰는 패턴이나 이 프로젝트에는 쓰지 않는다 (6.3 참고)

> 기본 모델은 **개인 노트**다. 글은 작성자 본인만 보고 수정할 수 있다.

---

## 2. 기술 스택

| 구분 | 선택 | 이유 |
| --- | --- | --- |
| 프레임워크 | Next.js (App Router, JS) | 페이지·서버 액션·미들웨어를 한 프로젝트에서 처리 |
| 언어 | JavaScript (`.js` / `.jsx`) | TypeScript 미사용 |
| DB | Supabase Postgres | 글 본문을 `jsonb`로 저장하기 적합 |
| 인증 | Supabase Auth + `@supabase/ssr` | GitHub OAuth. 세션은 **쿠키**가 단일 소스 |
| 인증 전역 스토어 | 사용하지 않음 (Zustand 제외) | 서버·미들웨어가 세션을 읽어야 해서 클라이언트 store와 맞지 않음 |
| 에디터 | BlockNote (`@blocknote/core`, `@blocknote/react`, `@blocknote/mantine`) | Notion과 비슷한 블록 에디터 |
| 스타일 | CSS Module 또는 전역 CSS | 학습용으로 가볍게 유지 |

권장 생성 명령:

```bash
npx create-next-app@latest . --js --app --eslint --no-tailwind --no-src-dir --import-alias "@/*"
```

이후 패키지:

```bash
npm install @supabase/supabase-js @supabase/ssr
npm install @blocknote/core @blocknote/react @blocknote/mantine
```

---

## 3. 화면과 라우트

```
/                    홈 + 내 글 목록 (비로그인 시 로그인 유도)
/login               GitHub 로그인 버튼
/auth/callback       OAuth code → 세션 교환 (Route Handler)
/posts/new           새 글 작성 (로그인 필수)
/posts/[id]          글 조회 (작성자만)
/posts/[id]/edit     글 수정 (작성자만)
```

### 페이지별 동작

**로그인 (`/login`)**
- `signInWithOAuth({ provider: "github" })` 호출
- `redirectTo`는 `{origin}/auth/callback`
- 이미 로그인된 사용자는 `/`로 보냄

**홈 (`/`)**
- 로그인 전: GitHub 로그인 안내
- 로그인 후: 내 글 목록 (제목, 수정일), "새 글" 버튼, 로그아웃

**작성 (`/posts/new`)**
- 제목 입력 + BlockNote 에디터
- 저장 시 `posts` 테이블에 insert 후 `/posts/[id]`로 이동

**조회 (`/posts/[id]`)**
- 제목·본문을 읽기 전용 BlockNote로 표시 (`editable={false}`)
- 작성자면 수정/삭제 버튼 노출
- 삭제 후 홈으로 이동

**수정 (`/posts/[id]/edit`)**
- DB의 `content`를 `initialContent`로 로드
- 저장 시 update 후 조회 페이지로 이동

작성/수정/삭제는 로그인 + 본인 글일 때만 허용한다. 미들웨어와 RLS를 둘 다 건다.

---

## 4. 디렉터리 구조

```
.
├── PLAN.md
├── app/
│   ├── layout.jsx
│   ├── page.jsx                 # 홈 / 글 목록
│   ├── globals.css
│   ├── login/
│   │   └── page.jsx
│   ├── auth/
│   │   └── callback/
│   │       └── route.js         # OAuth 콜백
│   └── posts/
│       ├── new/
│       │   └── page.jsx
│       └── [id]/
│           ├── page.jsx         # 조회
│           └── edit/
│               └── page.jsx
├── components/
│   ├── Editor.jsx               # "use client" BlockNote
│   ├── DynamicEditor.jsx        # next/dynamic, ssr: false
│   ├── PostForm.jsx             # 제목 + 에디터 + 저장
│   ├── PostList.jsx
│   ├── Header.jsx
│   ├── Sidebar.jsx              # 로그인 후 좌측 메뉴
│   ├── LoginButton.jsx          # GitHub 로그인 (클라이언트)
│   └── LogoutButton.jsx         # 로그아웃 (클라이언트)
├── lib/
│   └── supabase/
│       ├── client.js            # 브라우저 클라이언트
│       ├── server.js            # 서버 컴포넌트 / Route Handler
│       └── middleware.js        # proxy에서 쓰는 세션 갱신 헬퍼
├── proxy.js                     # Next.js 16 요청 진입점 (구 middleware.js)
├── supabase/
│   └── schema.sql               # 테이블 + RLS
└── .env.local
```

BlockNote는 서버에서 렌더하면 깨지므로 `components/`에 두고 `"use client"` + `dynamic(..., { ssr: false })`로 감싼다.

---

## 5. 데이터베이스

### 5.1 `posts` 테이블
supabase/schema.sql 참조

### 5.2 `updated_at` 자동 갱신

```sql
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger posts_set_updated_at
before update on public.posts
for each row
execute function public.set_updated_at();
```

### 5.3 RLS (필수)

```sql
alter table public.posts enable row level security;

create policy "본인 글만 조회"
  on public.posts for select
  using (auth.uid() = user_id);

create policy "본인만 작성"
  on public.posts for insert
  with check (auth.uid() = user_id);

create policy "본인 글만 수정"
  on public.posts for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "본인 글만 삭제"
  on public.posts for delete
  using (auth.uid() = user_id);
```

anon/authenticated 키만 쓰고, 서버에서 service role 키는 쓰지 않는다.  
권한은 RLS가 최종 방어선이다.

---

## 6. 인증 흐름

```
사용자 → /login → GitHub 동의
      → Supabase /auth/v1/callback
      → 앱 /auth/callback?code=...
      → exchangeCodeForSession(code)
      → 쿠키에 세션 저장
      → /
```

### 6.1 GitHub OAuth 앱

1. GitHub → Settings → Developer settings → OAuth Apps → New
2. Homepage URL: `http://localhost:3000`
3. Authorization callback URL:  
   `https://<프로젝트-ref>.supabase.co/auth/v1/callback`
4. Client ID / Secret을 Supabase Dashboard → Authentication → Providers → GitHub에 입력
5. Supabase Redirect URLs에 추가:
   - `http://localhost:3000/auth/callback`
   - 배포 후 프로덕션 URL도 추가

### 6.2 앱 쪽 구현

강의의 “Auth 클라이언트 하나 + Zustand + 클라이언트 가드” 대신, Next.js App Router 권장안을 쓴다.

| 역할 | 파일 | 하는 일 |
| --- | --- | --- |
| 브라우저 | `lib/supabase/client.js` | `createBrowserClient`. 로그인 버튼의 `signInWithOAuth` |
| 서버 | `lib/supabase/server.js` | `createServerClient` + cookies. 페이지·Route Handler에서 `getUser()` |
| 미들웨어 | `lib/supabase/middleware.js` + 루트 `proxy.js` | 세션 쿠키 refresh + 보호 경로 리다이렉트 |

보호 경로 (`proxy.js`):

- `/posts/new`
- `/posts/[id]/edit`

`/`와 `/posts/[id]`는 서버 컴포넌트에서 `getUser()`로 세션을 확인해도 된다.  
비로그인 사용자는 `/login`으로 보낸다. 헤더의 로그인/로그아웃은 쿠키 세션을 읽고 쓰는 작은 클라이언트 컴포넌트면 충분하다.

로그인 호출 예:

```js
await supabase.auth.signInWithOAuth({
  provider: "github",
  options: {
    redirectTo: `${window.location.origin}/auth/callback`,
  },
});
```

로그아웃:

```js
await supabase.auth.signOut();
router.refresh();
```

`router.refresh()`로 서버 컴포넌트가 쿠키를 다시 읽게 한다. 클라이언트 store를 비울 필요가 없다.

검증은 `getSession()`이 아니라 **`getUser()`** 로 한다. `getSession()`은 쿠키 값만 보고, 위조 여부를 서버에 묻지 않는다.

### 6.3 강의 커리큘럼과 다른 점

강의에서 진행한 항목과 이 프로젝트에서 채택하는 방식을 대응한다.

| 강의 | 이 프로젝트 | 판단 |
| --- | --- | --- |
| GitHub OAuth 설정 | 동일 (6.1) | 그대로 진행 |
| Supabase Auth 클라이언트 설정 | 브라우저 / 서버 / 미들웨어 **3개** | App Router는 실행 위치가 갈린다. 클라이언트 하나만 두면 쿠키 세션이 깨진다 |
| GitHub 소셜 로그인 | 동일. 콜백은 `/auth/callback` Route Handler에서 `exchangeCodeForSession` | 세션을 쿠키에 넣어야 서버가 사용자를 안다 |
| 로그인/로그아웃 컴포넌트 | `LoginButton`, `LogoutButton` | UI는 강의와 같다. 상태는 Zustand가 아니라 Supabase 세션 |
| 인증 상태 관리 (Zustand) | **쓰지 않음** | 아래 이유 |
| 보호된 라우트 | `proxy.js` + 서버 `getUser()` | 클라이언트 `useEffect` 리다이렉트만 쓰면 첫 페인트에 보호 페이지가 잠깐 보인다 |

**Zustand를 빼는 이유**

- 진짜 세션은 이미 **httpOnly에 가까운 쿠키**(Supabase SSR 쿠키)에 있다. store는 복사본이 된다.
- 새로고침·다른 탭·만료된 토큰에서 Zustand와 쿠키가 어긋나기 쉽다.
- 미들웨어와 서버 컴포넌트는 Zustand를 읽을 수 없다. 보호 라우트의 근거가 될 수 없다.
- 패키지와 `onAuthStateChange` 동기화 코드가 늘고, 학습 초점은 OAuth·RLS에서 store 보일러플레이트로 빠진다.

강의가 Vite/CSR이거나 `localStorage` 세션을 전제로 했다면 Zustand는 자연스럽다. 이 앱은 Next.js App Router + `@supabase/ssr`이므로 **쿠키 + 서버 확인**이 더 맞다.

---

## 7. BlockNote 연동

#참고사항
- [Blocknote 에디터 설치방법](https://www.blocknotejs.org/docs/getting-started)
- [Blocknote 에디터 툴바 설정](https://www.blocknotejs.org/examples/ui-components/formatting-toolbar-buttons)
- [Blocknote 에디터 저장기능](https://www.blocknotejs.org/examples/backend/saving-loading)
- [Blocknote 에디터 저장기능2](https://www.blocknotejs.org/docs/foundations/supported-formats) 

### 7.1 Next.js에서 쓰는 방법

1. `components/Editor.jsx` — `"use client"`, `useCreateBlockNote`, `BlockNoteView`
2. `components/DynamicEditor.jsx` — `next/dynamic` + `{ ssr: false }`
3. 페이지는 DynamicEditor만 import

필수 CSS:

- `@blocknote/core/fonts/inter.css`
- `@blocknote/mantine/style.css`

### 7.2 저장 / 불러오기

| 시점 | 방법 |
| --- | --- |
| 저장 | `JSON.stringify` 없이 `editor.document`를 그대로 `jsonb`에 insert/update |
| 불러오기 | `useCreateBlockNote({ initialContent: post.content })` |
| 읽기 전용 | `<BlockNoteView editor={editor} editable={false} />` |

주의:

- `initialContent`는 에디터 **생성 시 한 번만** 넣는다. 로딩이 끝나기 전에 에디터를 만들면 빈 문서가 고정된다.
- 로딩 중에는 에디터를 렌더하지 말고, 데이터가 온 뒤에 `useMemo` + `BlockNoteEditor.create({ initialContent })`로 생성한다.
- 본문만 저장하면 제목·색·중첩 블록이 깨지므로 **Block JSON 전체**를 저장한다.

### 7.3 저장 UX

- 작성/수정 모두 **명시적 저장 버튼** (자동저장은 나중에)
- 저장 중 버튼 비활성, 실패 시 에러 메시지
- 빈 제목은 `"제목 없음"`으로 저장

---

## 8. 데이터 접근 방식

학습용으로 **클라이언트에서 Supabase JS를 직접 호출**해도 충분하다.  
작성자 확인은 RLS가 하므로 API Route를 꼭 만들 필요는 없다.

권장 흐름:

1. 서버 컴포넌트에서 세션 확인 (없으면 `/login`)
2. 목록/상세는 서버에서 `select` 후 props로 전달하거나, 클라이언트에서 조회
3. insert / update / delete는 클라이언트 또는 Server Action

Server Action을 쓰면 쿠키 세션을 서버에서 그대로 쓸 수 있어 조금 더 단순하다.

```
작성 저장 → insert { user_id: session.user.id, title, content }
수정 저장 → update { title, content } where id
삭제     → delete where id
```

`user_id`는 클라이언트가 임의로 넣지 말고, 가능하면 서버에서 `session.user.id`를 넣는다.  
RLS의 `with check (auth.uid() = user_id)`가 위조 insert를 막는다.

---

## 9. UI 스케치

전체 톤은 Notion처럼 넓고 단순한 흰 배경, 중앙 정렬 에디터.

```
┌─────────────────────────────────────────┐
│  Logo          새 글          로그아웃   │
├─────────────────────────────────────────┤
│                                         │
│  내 글                                  │
│  ┌─────────────────────────────────┐    │
│  │ 회의 메모              09.07    │    │
│  │ 프로젝트 계획          09.06    │    │
│  └─────────────────────────────────┘    │
│                                         │
└─────────────────────────────────────────┘

작성/수정
┌─────────────────────────────────────────┐
│  [제목]                     [저장]      │
│  ─────────────────────────────────────  │
│  / 를 입력해 블록 추가…                 │
│                                         │
└─────────────────────────────────────────┘
```

공통 헤더: 로고(홈), 로그인 여부에 따른 버튼.

---

## 10. 환경 변수

`.env.local` (커밋하지 않음):

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
```

Dashboard → Project Settings → API에서 복사한다.  
service role 키는 프론트에 넣지 않는다.

---

## 11. 구현 순서

작업은 아래 순서로 진행한다. 한 단계가 동작한 뒤에 다음 단계로 간다.

### Phase 1 — 프로젝트 골격

- Next.js JS 앱 생성
- 기본 레이아웃, 헤더, 빈 페이지
- `.env.local` 연결 확인

### Phase 2 — DB

- `schema.sql` 실행 (테이블, 트리거, RLS)
- Dashboard SQL Editor 또는 Supabase CLI로 적용
- Table Editor에서 RLS가 켜져 있는지 확인
- RLS는 `auth.uid()` 기준이므로, 실제 권한 동작은 Phase 3 로그인 이후에 확인한다

### Phase 3 — Supabase Auth

강의 항목을 이 순서로 옮긴다. Zustand는 넣지 않는다.

1. GitHub OAuth 앱 + Supabase Provider + `.env.local`
2. `@supabase/ssr` 클라이언트 3종 (`client` / `server` / `middleware`)
3. GitHub 소셜 로그인: `/login` → OAuth → `/auth/callback`에서 쿠키 세션
4. `LoginButton` / `LogoutButton` (헤더에 배치)
5. 보호된 라우트: `proxy.js`에서 `getUser()`, 비로그인은 `/login`
6. 새로고침 후에도 로그인이 유지되는지, `/posts/new` 직접 접근이 막히는지 확인

### Phase 4 — BlockNote

- `Editor` + `DynamicEditor` 연결
- `/posts/new`에서 로컬 상태로 타이핑되는지 확인 (아직 저장/CRUD는 없음)

### Phase 5 — CRUD

- 작성: insert 후 상세로 이동
- 목록: 홈에서 내 글 조회
- 상세: 읽기 전용 렌더 + 수정/삭제
- 수정: 기존 content 로드 후 update
- 삭제: confirm 후 delete

### Phase 6 — 권한·예외 점검

- 비로그인으로 `/posts/new`, `/posts/[id]`, `/posts/[id]/edit` 접근 → `/`
- 다른 사용자 글 URL 직접 접근 → 404
- 잘못된 id 형식 → 404
- 제목 빈 값(첫 블록/`제목 없음`), 저장 실패 메시지
- 수정·삭제가 0건이면 성공으로 처리하지 않음
- 저장 중 세션 만료 → `/`
- 커스텀 404: 글을 찾을 수 없습니다 + 목록 이동

---

## 12. 구현 시 주의점

1. **JS만 사용** — `tsconfig`, `.tsx`를 만들지 않는다.
2. **BlockNote는 클라이언트 전용** — `ssr: false` 없이 서버에서 import하면 빌드/하이드레이션 오류가 난다.
3. **RLS를 끄지 않는다** — 프론트 가드만으로는 다른 사람 글을 지울 수 있다.
4. **content는 jsonb** — 문자열로 이중 직렬화하면 불러올 때 `JSON.parse`가 한 번 더 필요하다. 가능하면 배열 그대로 저장한다.
5. **미들웨어·서버에서 `getUser()`** — `getSession()`만 쓰면 쿠키 위조를 검증하지 못한다.
6. **인증에 Zustand를 쓰지 않는다** — 세션은 쿠키가 단일 소스다. 헤더 UI는 서버에서 받은 user 또는 작은 클라이언트 버튼이면 된다.
7. **보호는 미들웨어 + RLS** — 클라이언트 리다이렉트만으로는 부족하다.
8. **Mantine 스타일** — BlockNote Mantine 뷰를 쓰므로 해당 CSS를 전역 또는 에디터 컴포넌트에 import한다.

---

## 13. 완료 기준

아래가 모두 되면 1차 완성이다.

- [ ] GitHub 계정으로 로그인/로그아웃이 된다
- [ ] 새로고침 후에도 로그인 상태가 유지된다
- [ ] 로그인한 사용자만 글을 쓸 수 있다
- [ ] BlockNote로 제목·본문을 작성하고 저장할 수 있다
- [ ] 홈에서 내 글 목록이 보인다
- [ ] 글을 열어 읽기 전용으로 볼 수 있다
- [ ] 작성자가 글을 수정·삭제할 수 있다
- [ ] 다른 사용자의 글은 조회/수정/삭제가 되지 않는다

---

## 14. 나중에 넣으면 좋은 것

우선순위 낮은 확장. 1차가 끝난 뒤에만 검토한다.

- 자동저장 (debounce)
- 글 공개 / 공유 링크
- Supabase Storage 이미지 블록
- 슬래시 메뉴 커스텀 블록
- 검색, 폴더, 즐겨찾기
- 실시간 공동 편집
- 인증 이외의 클라이언트 UI 상태가 커지면 Zustand 검토. **로그인 상태에는 쓰지 않는다**
