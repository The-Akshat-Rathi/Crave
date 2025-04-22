import { useEffect, useState } from 'react';

/**
 * Hook that returns true if the screen size matches the provided media query
 * Defaults to checking for mobile screen size
 */
export function useMediaQuery(query: string = '(max-width: 768px)'): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    
    // Initial check
    setMatches(media.matches);
    
    // Add listener for changes
    const listener = (e: MediaQueryListEvent) => {
      setMatches(e.matches);
    };
    
    media.addEventListener('change', listener);
    
    // Clean up
    return () => {
      media.removeEventListener('change', listener);
    };
  }, [query]);

  return matches;
}

/**
 * Hook that returns true if the screen is mobile size
 */
export function useMobile(): boolean {
  return useMediaQuery('(max-width: 768px)');
}

/**
 * Hook that returns true if the screen is tablet size
 */
export function useTablet(): boolean {
  return useMediaQuery('(min-width: 769px) and (max-width: 1024px)');
}

/**
 * Hook that returns true if the screen is desktop size
 */
export function useDesktop(): boolean {
  return useMediaQuery('(min-width: 1025px)');
}