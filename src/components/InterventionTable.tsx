import React, { useState, useMemo } from 'react';
import { ArrowUpDown, Filter } from 'lucide-react';
import { Intervention } from '../types/intervention';
import { getStatusColor } from '../utils/statusColors';
import { getRowBackground } from '../utils/rowBackground';

interface Props {
  interventions: Intervention[];
}

export function InterventionTable({ interventions }: Props) {
  const [sortField, setSortField] = useState<keyof Intervention>('dataHoraInicio');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [filters, setFilters] = useState({
    situacao: '',
    responsavel: '',
    possuiRecomendacao: ''
  });

  const handleSort = (field: keyof Intervention) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const filteredAndSortedInterventions = useMemo(() => {
    return interventions
      .filter(intervention => {
        return (
          (!filters.situacao || intervention.situacao.toLowerCase().includes(filters.situacao.toLowerCase())) &&
          (!filters.responsavel || intervention.responsavel.toLowerCase().includes(filters.responsavel.toLowerCase())) &&
          (filters.possuiRecomendacao === '' || 
           intervention.possuiRecomendacao === (filters.possuiRecomendacao === 'true'))
        );
      })
      .sort((a, b) => {
        const aValue = a[sortField];
        const bValue = b[sortField];
        const modifier = sortDirection === 'asc' ? 1 : -1;
        
        if (typeof aValue === 'string' && typeof bValue === 'string') {
          return aValue.localeCompare(bValue) * modifier;
        }
        return 0;
      });
  }, [interventions, sortField, sortDirection, filters]);

  return (
    <div className="bg-white shadow-lg rounded-lg overflow-hidden">
      <div className="p-4 border-b">
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Situação</label>
            <input
              type="text"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              value={filters.situacao}
              onChange={(e) => setFilters(prev => ({ ...prev, situacao: e.target.value }))}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Responsável</label>
            <input
              type="text"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              value={filters.responsavel}
              onChange={(e) => setFilters(prev => ({ ...prev, responsavel: e.target.value }))}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Possui Recomendação</label>
            <select
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              value={filters.possuiRecomendacao}
              onChange={(e) => setFilters(prev => ({ ...prev, possuiRecomendacao: e.target.value }))}
            >
              <option value="">Todos</option>
              <option value="true">Sim</option>
              <option value="false">Não</option>
            </select>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {[
                { key: 'numeroONS', label: 'Número ONS' },
                { key: 'dataHoraInicio', label: 'Data/Hora Início' },
                { key: 'dataHoraFim', label: 'Data/Hora Fim' },
                { key: 'situacao', label: 'Situação' },
                { key: 'responsavel', label: 'Responsável' },
                { key: 'possuiRecomendacao', label: 'Possui Recomendação' }
              ].map(({ key, label }) => (
                <th
                  key={key}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort(key as keyof Intervention)}
                >
                  <div className="flex items-center gap-2">
                    {label}
                    <ArrowUpDown className="h-4 w-4" />
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredAndSortedInterventions.map((intervention) => (
              <tr
                key={intervention.numeroONS}
                className={`${getRowBackground(intervention.dataHoraInicio)} ${
                  intervention.situacao.toLowerCase() === 'indeferido' ? 'bg-red-50' : ''
                }`}
              >
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {intervention.numeroONS}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(intervention.dataHoraInicio).toLocaleString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(intervention.dataHoraFim).toLocaleString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    getStatusColor(intervention.situacao)
                  }`}>
                    {intervention.situacao}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {intervention.responsavel}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {intervention.possuiRecomendacao ? 'Sim' : 'Não'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
