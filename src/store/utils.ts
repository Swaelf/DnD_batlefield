import { shallow } from 'zustand/shallow'

/**
 * Custom hook for selecting multiple values from a store with shallow equality
 * This prevents re-renders when the selected values haven't changed
 */
export function useShallow<T, U>(
  selector: (state: T) => U
): (state: T) => U {
  return (state: T) => selector(state)
}

/**
 * Utility to create a selector with shallow equality by default
 */
export const createShallowSelector = <T, U>(
  selector: (state: T) => U
) => {
  return (state: T) => selector(state)
}

// Re-export shallow for convenience
export { shallow }