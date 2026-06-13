import { useEffect, useState } from "react";


export function useLocalStorage<T>(key: string, initialValue: T) {

  // use useState to get data from localStorage when mounted
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(error);
      return initialValue;
    }
  });

  // when storedValue or key changes, it will automatically save data to localStorage
  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(storedValue));
    } catch (error) {
      console.error(error);
    }
  }, [key, storedValue]);

  // If not using as const: it will be understood as an array
  // If using ts, it will be understood as a fixed tuple
  // It will be understood when using destructuring:
  return [storedValue, setStoredValue] as const;
}