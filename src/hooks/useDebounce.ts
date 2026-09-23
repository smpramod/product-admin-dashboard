import { useState, useEffect } from "react";

/**
 * Custom hook to debounce a rapidly changing value (e.g., search input)
 * @param value The raw input value
 * @param delay Milliseconds to delay updating the debounced value (default 400ms)
 */
export function useDebounce<T>(value: T, delay: number = 400): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Cancel timer if value changes before delay window finishes
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

export default useDebounce;
