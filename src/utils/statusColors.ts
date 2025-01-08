export const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case 'indeferido':
      return 'bg-red-100 text-red-800';
    case 'em andamento':
      return 'bg-green-100 text-green-800';
    case 'concluído':
      return 'bg-blue-100 text-blue-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};
