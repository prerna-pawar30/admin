import { useMemo, useState, useCallback } from "react";

/**
 * Client-side table state: sort key/dir, generic filter string, page (1-based), pageSize.
 * For large lists prefer server-side pagination + debounced filter; keep derived rows in useMemo.
 */
export function useTableQuery({
  initialSortKey = null,
  initialSortDir = "asc",
  initialPage = 1,
  pageSize = 25,
} = {}) {
  const [sortKey, setSortKey] = useState(initialSortKey);
  const [sortDir, setSortDir] = useState(initialSortDir);
  const [filter, setFilter] = useState("");
  const [page, setPage] = useState(initialPage);

  const toggleSort = useCallback((key) => {
    setSortKey((prev) => {
      if (prev !== key) {
        setSortDir("asc");
        return key;
      }
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
      return key;
    });
    setPage(1);
  }, []);

  const pagination = useMemo(
    () => ({ page, pageSize, setPage }),
    [page, pageSize]
  );

  return {
    sortKey,
    sortDir,
    setSortKey,
    setSortDir,
    toggleSort,
    filter,
    setFilter,
    pagination,
  };
}
