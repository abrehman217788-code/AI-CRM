import { useState, useCallback } from 'react';

interface UsePaginationReturn {
  page: number;
  setPage: (page: number) => void;
  nextPage: () => void;
  prevPage: () => void;
  totalPages: number;
  setTotalPages: (total: number) => void;
  from: number;
  to: number;
  total: number;
  setTotal: (total: number) => void;
}

export function usePagination(initialPage = 1, pageSize = 20): UsePaginationReturn {
  const [page, setPage] = useState(initialPage);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const nextPage = useCallback(() => {
    setPage((p) => Math.min(p + 1, totalPages));
  }, [totalPages]);

  const prevPage = useCallback(() => {
    setPage((p) => Math.max(p - 1, 1));
  }, []);

  const from = (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);

  return { page, setPage, nextPage, prevPage, totalPages, setTotalPages, from, to, total, setTotal };
}
