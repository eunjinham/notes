function getInlineText(content) {
  if (typeof content === "string") {
    return content;
  }

  if (!Array.isArray(content)) {
    return "";
  }

  return content
    .map((item) => {
      if (typeof item === "string") {
        return item;
      }

      if (item?.text) {
        return item.text;
      }

      if (item?.content) {
        return getInlineText(item.content);
      }

      return "";
    })
    .join("");
}

export function resolvePostTitle(title, blocks) {
  const trimmed = typeof title === "string" ? title.trim() : "";
  if (trimmed) {
    return trimmed;
  }

  const first = Array.isArray(blocks) ? blocks[0] : null;
  const fromBlock = getInlineText(first?.content).trim();
  return fromBlock || "제목 없음";
}

export function getEditorInitialContent(content) {
  if (Array.isArray(content) && content.length > 0) {
    return content;
  }

  return undefined;
}

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function isPostId(value) {
  return typeof value === "string" && UUID_RE.test(value);
}

export const POSTS_PAGE_SIZE = 20;

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

function firstParam(value) {
  if (Array.isArray(value)) {
    return value[0];
  }
  return value;
}

export function parsePage(value) {
  const page = Number.parseInt(firstParam(value), 10);
  if (!Number.isFinite(page) || page < 1) {
    return 1;
  }
  return page;
}

export function parseDateParam(value) {
  const raw = (firstParam(value) || "").trim();
  if (!DATE_RE.test(raw)) {
    return "";
  }

  const date = new Date(`${raw}T00:00:00+09:00`);
  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return raw;
}

export function parseListFilters(params = {}) {
  const title = (firstParam(params.title) || "").trim().slice(0, 100);
  const from = parseDateParam(params.from);
  const to = parseDateParam(params.to);
  const invalidRange = Boolean(from && to && from > to);

  return { title, from, to, invalidRange };
}

export function isInvalidDateRange(from, to) {
  return Boolean(from && to && from > to);
}

export function hasListFilters({ title, from, to, invalidRange }) {
  if (invalidRange) {
    return Boolean(title);
  }
  return Boolean(title || from || to);
}

export function buildListHref({ page = 1, title = "", from = "", to = "" } = {}) {
  const query = new URLSearchParams();
  if (title) {
    query.set("title", title);
  }
  if (from) {
    query.set("from", from);
  }
  if (to) {
    query.set("to", to);
  }
  if (page > 1) {
    query.set("page", String(page));
  }

  const search = query.toString();
  return search ? `/?${search}` : "/";
}

export function getPageHref(page, filters = {}) {
  return buildListHref({ page, ...filters });
}

export function toCreatedAtStart(dateStr) {
  return new Date(`${dateStr}T00:00:00+09:00`).toISOString();
}

export function toCreatedAtEnd(dateStr) {
  return new Date(`${dateStr}T23:59:59.999+09:00`).toISOString();
}

export function escapeIlike(value) {
  return value.replace(/\\/g, "\\\\").replace(/%/g, "\\%").replace(/_/g, "\\_");
}

export function getVisiblePages(current, total, windowSize = 5) {
  if (total <= 0) {
    return [];
  }

  if (total <= windowSize) {
    return Array.from({ length: total }, (_, index) => index + 1);
  }

  const half = Math.floor(windowSize / 2);
  let start = Math.max(1, current - half);
  let end = start + windowSize - 1;

  if (end > total) {
    end = total;
    start = end - windowSize + 1;
  }

  return Array.from({ length: end - start + 1 }, (_, index) => start + index);
}

export function formatPostDate(value) {
  if (!value) {
    return "";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
