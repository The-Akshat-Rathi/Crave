import { useState, useEffect } from 'react';

/**
 * A hook that detects if a media query is matched
 * @param query The media query to match
 * @returns Whether the media query is matched
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState<boolean>(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    if (media.matches !== matches) {
      setMatches(media.matches);
    }

    const listener = () => setMatches(media.matches);
    media.addEventListener('change', listener);
    
    return () => media.removeEventListener('change', listener);
  }, [matches, query]);

  return matches;
}

/**
 * A hook that detects if the viewport is mobile-sized
 * @returns Whether the viewport is mobile-sized
 */
export function useMobile(): boolean {
  return useMediaQuery('(max-width: 768px)');
}

/**
 * A hook that detects if the viewport is tablet-sized
 * @returns Whether the viewport is tablet-sized
 */
export function useTablet(): boolean {
  return useMediaQuery('(min-width: 769px) and (max-width: 1024px)');
}

/**
 * A hook that detects if the viewport is desktop-sized
 * @returns Whether the viewport is desktop-sized
 */
export function useDesktop(): boolean {
  return useMediaQuery('(min-width: 1025px)');
}