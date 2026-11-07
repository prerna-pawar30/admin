/**
 * Data hooks for the task screens: a paged, filtered list that refetches when filters change
 * (search debounced), the dashboard summary, and a single task with its comments.
 * Stale responses are ignored, so typing fast in search never shows an older result.
 */
import { useCallback, useEffect, useRef, useState } from "react";

export const useDebouncedValue = (value, delayMs = 350) => {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(timer);
  }, [value, delayMs]);
  return debounced;
};

/**
 * @param {(filters: object) => Promise<{ items: object[], meta: object }>} fetchList
 * @param {object} filters
 */
export const useTaskList = (fetchList, filters) => {
  const [state, setState] = useState({ items: [], meta: null, isLoading: true, error: null });
  const requestRef = useRef(0);
  const key = JSON.stringify(filters);

  const load = useCallback(
    async ({ silent = false } = {}) => {
      const requestId = ++requestRef.current;
      if (!silent) setState((previous) => ({ ...previous, isLoading: true, error: null }));
      try {
        const { items, meta } = await fetchList(JSON.parse(key));
        if (requestId === requestRef.current) setState({ items, meta, isLoading: false, error: null });
      } catch (error) {
        if (requestId === requestRef.current) setState((previous) => ({ ...previous, isLoading: false, error }));
      }
    },
    [fetchList, key]
  );

  useEffect(() => {
    load();
  }, [load]);

  /** Replace one task in place after an update (no refetch flicker). */
  const patchItem = useCallback((task) => {
    setState((previous) => ({
      ...previous,
      items: previous.items.map((item) => (item.taskId === task.taskId ? { ...item, ...task } : item)),
    }));
  }, []);

  return { ...state, reload: load, patchItem };
};

export const useTaskSummary = (fetchSummary) => {
  const [summary, setSummary] = useState(null);
  const load = useCallback(async () => {
    try {
      setSummary(await fetchSummary());
    } catch {
      // The stat cards are optional: the list still works, and the next refresh retries.
      setSummary((previous) => previous);
    }
  }, [fetchSummary]);
  useEffect(() => {
    load();
  }, [load]);
  return { summary, reload: load };
};

/**
 * One task plus its comments, for the detail drawer.
 *
 * @param {{ get: Function, comments: Function }} api adminTaskApi or myTaskApi
 * @param {string | null} taskId
 */
export const useTaskDetail = (api, taskId) => {
  const [task, setTask] = useState(null);
  const [comments, setComments] = useState([]);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const load = useCallback(async () => {
    if (!taskId) return;
    setIsLoading(true);
    setError(null);
    try {
      const [loadedTask, loadedComments] = await Promise.all([api.get(taskId), api.comments(taskId)]);
      setTask(loadedTask);
      setComments(loadedComments);
    } catch (loadError) {
      setError(loadError);
    } finally {
      setIsLoading(false);
    }
  }, [api, taskId]);

  useEffect(() => {
    setTask(null);
    setComments([]);
    load();
  }, [load]);

  return { task, setTask, comments, setComments, error, isLoading, reload: load };
};
