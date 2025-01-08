import { useState, useCallback } from 'react';
import { ONSClient } from '../services/ons/onsClient';
import { logger } from '../utils/logger';
import type { SearchFilters } from '../components/search/SearchForm';

export function useInterventionSearch() {
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  const searchInterventions = useCallback(async (filters: SearchFilters) => {
    setIsSearching(true);
    setSearchError(null);

    try {
      const client = ONSClient.getInstance();
      const response = await client.getInterventions(filters);
      return response.intervencoes || [];
    } catch (error) {
      const message = error instanceof Error 
        ? error.message 
        : 'Erro ao buscar intervenções';
      logger.error('Erro na pesquisa:', error);
      setSearchError(message);
      return [];
    } finally {
      setIsSearching(false);
    }
  }, []);

  return {
    searchInterventions,
    isSearching,
    searchError
  };
}
