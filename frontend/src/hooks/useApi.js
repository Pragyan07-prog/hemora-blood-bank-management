import { useState, useCallback } from 'react';
import toast from 'react-hot-toast';

export function useApi(apiFunc) {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const execute = useCallback(
    async (...args) => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await apiFunc(...args);
        setData(response.data || response);
        return response.data || response;
      } catch (err) {
        const message = err.response?.data?.message || err.message || 'An error occurred';
        setError(message);
        toast.error(message);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [apiFunc]
  );

  return { data, isLoading, error, execute, setData };
}

export default useApi;
