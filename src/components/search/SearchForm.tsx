import { useState } from 'react';
import { Search, Calendar, Users } from 'lucide-react';
import { DEFAULT_SEARCH_CONFIG, CEMIG_AGENTS } from '../../config/searchDefaults';

interface SearchFormProps {
  onSearch: (filters: SearchFilters) => void;
  isLoading?: boolean;
}

export interface SearchFilters {
  startDate: string;
  endDate: string;
  agents: string[];
}

const { startDate: defaultStartDate, endDate: defaultEndDate } = DEFAULT_SEARCH_CONFIG.getDefaultDates();

export function SearchForm({ onSearch, isLoading }: SearchFormProps) {
  const [filters, setFilters] = useState<SearchFilters>({
    startDate: defaultStartDate,
    endDate: defaultEndDate,
    agents: [...CEMIG_AGENTS]
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(filters);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md mb-6">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">Filtros de Pesquisa</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Calendar className="inline-block w-4 h-4 mr-2" />
            Data Inicial
          </label>
          <input
            type="date"
            value={filters.startDate}
            onChange={(e) => setFilters(prev => ({ ...prev, startDate: e.target.value }))}
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            max={filters.endDate}
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Calendar className="inline-block w-4 h-4 mr-2" />
            Data Final
          </label>
          <input
            type="date"
            value={filters.endDate}
            onChange={(e) => setFilters(prev => ({ ...prev, endDate: e.target.value }))}
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            min={filters.startDate}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Users className="inline-block w-4 h-4 mr-2" />
            Agentes CEMIG
          </label>
          <select
            multiple
            value={filters.agents}
            onChange={(e) => setFilters(prev => ({
              ...prev,
              agents: Array.from(e.target.selectedOptions, option => option.value)
            }))}
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 min-h-[120px]"
          >
            {CEMIG_AGENTS.map(agent => (
              <option key={agent} value={agent}>
                {agent}
              </option>
            ))}
          </select>
          <p className="mt-1 text-sm text-gray-500">
            Pressione Ctrl para selecionar múltiplos agentes
          </p>
        </div>
      </div>

      <div className="mt-6 flex justify-end">
        <button
          type="submit"
          disabled={isLoading}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <>
              <div className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
              Pesquisando...
            </>
          ) : (
            <>
              <Search className="w-4 h-4 mr-2" />
              Pesquisar
            </>
          )}
        </button>
      </div>
    </form>
  );
}
