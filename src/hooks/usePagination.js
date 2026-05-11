import { useState, useCallback, useMemo } from "react";
import { DEFAULT_PAGE_SIZE } from "../constants/AppConfig";

export function usePagination(totalItems = 0, pageSize = DEFAULT_PAGE_SIZE) {
  const [page, setPage] = useState(1);

  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize) || 1);

  const safePage = Math.min(page, totalPages);
  const offset = (safePage - 1) * pageSize;

  const goToPage = useCallback((p) => {
    setPage((prev) => {
      const next = Math.max(1, Math.min(Number(p) || 1, totalPages));
      return next;
    });
  }, [totalPages]);

  const slice = useCallback(
    (list) => {
      if (!Array.isArray(list)) return [];
      return list.slice(offset, offset + pageSize);
    },
    [offset, pageSize]
  );

  return useMemo(
    () => ({
      page: safePage,
      pageSize,
      totalPages,
      offset,
      setPage: goToPage,
      hasNext: safePage < totalPages,
      hasPrev: safePage > 1,
      next: () => goToPage(safePage + 1),
      prev: () => goToPage(safePage - 1),
      slice,
    }),
    [safePage, pageSize, totalPages, offset, goToPage, slice]
  );
}
