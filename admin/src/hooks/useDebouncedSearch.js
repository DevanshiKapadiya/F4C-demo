// src/hooks/useDebouncedSearch.js
import { useState, useRef, useCallback } from 'react';

/**
 * Reusable debounced search handler
 *
 * @param {Function} fetchListFn - Function to fetch list (should accept search term)
 * @param {Object} options
 * @param {string} [options.initialSearch='']
 * @param {number} [options.delay=200] - Debounce delay in ms
 * @returns {Object} { searchData, handleSearch }
 */

export default function useDebouncedSearch(fetchListFn, { initialSearch = '', delay = 200 } = {}) {
  const [searchData, setSearchData] = useState(initialSearch);
  const previousSearch = useRef(initialSearch);
  const timeoutId = useRef(null);

  const clearTimeoutId = () => {
    if (timeoutId.current) clearTimeout(timeoutId.current);
  };

  const handleSearch = useCallback(
    (search) => {
      // Immediate search if clearing input
      if (search === '' && previousSearch.current !== '') {
        clearTimeoutId();
        fetchListFn('');
        setSearchData('');
        previousSearch.current = '';
        return;
      }

      // Skip if same search value
      if (search === previousSearch.current) return;

      clearTimeoutId();

      if (search.trim() !== '') {
        timeoutId.current = setTimeout(() => {
          fetchListFn(search);
          setSearchData(search);
          previousSearch.current = search;
        }, delay);
      }
    },
    [fetchListFn, delay]
  );

  return { searchData, handleSearch };
}
