"use client"

/**
 * @file useLocalStorage.ts
 * @description Custom React hook to bind state values directly to localStorage keys,
 * facilitating seamless client-side state caching, data persistence, and offline fallback operations.
 */

import { useState, useEffect, useCallback } from "react"

/**
 * Custom hook to read and write values to localStorage.
 * Automatically handles string parsing and serialization.
 * @param key - The localStorage key name
 * @param initialValue - Fallback value if key is not found in localStorage
 * @returns Array containing the current state value and a setter function
 */
export function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T | ((prev: T) => T)) => void] {
  // Initialize state with the default fallback value
  const [storedValue, setStoredValue] = useState<T>(initialValue)

  // Effect to load cached value from local storage on component mount/key change
  useEffect(() => {
    try {
      const item = window.localStorage.getItem(key)
      if (item) {
        setStoredValue(JSON.parse(item))
      }
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error)
    }
  }, [key])

  // Memoized setter function to update both React state and localStorage cache
  const setValue = useCallback(
    (value: T | ((prev: T) => T)) => {
      try {
        setStoredValue((prev) => {
          const newValue = value instanceof Function ? value(prev) : value
          window.localStorage.setItem(key, JSON.stringify(newValue))
          return newValue
        })
      } catch (error) {
        console.warn(`Error setting localStorage key "${key}":`, error)
      }
    },
    [key]
  )

  return [storedValue, setValue]
}
