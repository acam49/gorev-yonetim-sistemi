export const formatDate = (value) => {
  if (!value) return '-';
  return new Date(value).toLocaleDateString('tr-TR');
};

export const formatDateTime = (value) => {
  if (!value) return '-';
  return new Date(value).toLocaleString('tr-TR');
};

export const getTodayString = () => {
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const dd = String(today.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};
