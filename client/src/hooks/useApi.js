import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';

// Custom hook for API calls with loading and error states
export const useApi = (apiFunction, immediate = false) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const execute = useCallback(async (...args) => {
    try {
      setLoading(true);
      setError(null);
      const result = await apiFunction(...args);
      setData(result);
      return result;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [apiFunction]);

  useEffect(() => {
    if (immediate) {
      execute();
    }
  }, [execute, immediate]);

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setLoading(false);
  }, []);

  return { data, loading, error, execute, reset };
};

// Custom hook for async operations with optimistic updates
export const useAsyncOperation = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const execute = useCallback(async (operation, optimisticUpdate = null) => {
    try {
      setLoading(true);
      setError(null);

      // Apply optimistic update if provided
      if (optimisticUpdate) {
        optimisticUpdate();
      }

      const result = await operation();
      return result;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setError(null);
    setLoading(false);
  }, []);

  return { loading, error, execute, reset };
};

// Custom hook for pagination
export const usePagination = (fetchFunction, initialPage = 1, initialLimit = 10) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(initialPage);
  const [limit, setLimit] = useState(initialLimit);
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const fetchData = useCallback(async (pageNum = page, pageLimit = limit) => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await fetchFunction({
        page: pageNum,
        limit: pageLimit,
      });

      if (pageNum === 1) {
        setData(result.data || []);
      } else {
        setData(prev => [...prev, ...(result.data || [])]);
      }

      setTotal(result.total || 0);
      setHasMore(result.data?.length === pageLimit);
      setPage(pageNum);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [fetchFunction, page, limit]);

  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      fetchData(page + 1, limit);
    }
  }, [fetchData, page, limit, loading, hasMore]);

  const refresh = useCallback(() => {
    setData([]);
    fetchData(1, limit);
  }, [fetchData, limit]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    data,
    loading,
    error,
    page,
    limit,
    total,
    hasMore,
    setPage,
    setLimit,
    loadMore,
    refresh,
  };
};

// Custom hook for real-time data updates
export const useRealTimeData = (fetchFunction, interval = 30000) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await fetchFunction();
      setData(result);
      setLastUpdated(new Date());
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [fetchFunction]);

  useEffect(() => {
    fetchData();

    const intervalId = setInterval(fetchData, interval);
    return () => clearInterval(intervalId);
  }, [fetchData, interval]);

  const manualRefresh = useCallback(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, lastUpdated, manualRefresh };
};

// Custom hook for debounced API calls
export const useDebouncedApi = (apiFunction, delay = 500) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [debouncedValue, setDebouncedValue] = useState(null);

  const execute = useCallback((...args) => {
    setDebouncedValue({ args, timestamp: Date.now() });
  }, []);

  useEffect(() => {
    const handler = setTimeout(async () => {
      if (debouncedValue) {
        try {
          setLoading(true);
          setError(null);
          const result = await apiFunction(...debouncedValue.args);
          setData(result);
        } catch (err) {
          setError(err);
        } finally {
          setLoading(false);
        }
      }
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [debouncedValue, apiFunction, delay]);

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setLoading(false);
    setDebouncedValue(null);
  }, []);

  return { data, loading, error, execute, reset };
};

// Custom hook for cached API calls
export const useCachedApi = (apiFunction, cacheKey, cacheTime = 5 * 60 * 1000) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const getCachedData = useCallback(() => {
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      const { data: cachedData, timestamp } = JSON.parse(cached);
      if (Date.now() - timestamp < cacheTime) {
        return cachedData;
      }
    }
    return null;
  }, [cacheKey, cacheTime]);

  const setCachedData = useCallback((dataToCache) => {
    localStorage.setItem(cacheKey, JSON.stringify({
      data: dataToCache,
      timestamp: Date.now()
    }));
  }, [cacheKey]);

  const execute = useCallback(async (...args) => {
    try {
      setLoading(true);
      setError(null);

      // Check cache first
      const cachedData = getCachedData();
      if (cachedData) {
        setData(cachedData);
        setLoading(false);
        return cachedData;
      }

      // Fetch fresh data
      const result = await apiFunction(...args);
      setData(result);
      setCachedData(result);
      return result;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [apiFunction, getCachedData, setCachedData]);

  const invalidateCache = useCallback(() => {
    localStorage.removeItem(cacheKey);
    setData(null);
    setError(null);
  }, [cacheKey]);

  return { data, loading, error, execute, invalidateCache };
};
