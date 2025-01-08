export const getRowBackground = (date: string) => {
  const day = new Date(date).getDate();
  return day % 2 === 0 ? 'bg-gray-50' : 'bg-white';
};
