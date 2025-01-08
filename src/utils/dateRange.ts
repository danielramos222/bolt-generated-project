/**
 * Utilitário para cálculo de períodos de data
 */
export function getDateRange() {
  const today = new Date();
  
  // Data inicial: hoje - 89 dias
  const pastDate = new Date(today);
  pastDate.setDate(today.getDate() - 89);
  
  // Data final: hoje + 89 dias
  const futureDate = new Date(today);
  futureDate.setDate(today.getDate() + 89);
  
  return {
    startDate: pastDate.toISOString().split('T')[0],
    endDate: futureDate.toISOString().split('T')[0]
  };
}
