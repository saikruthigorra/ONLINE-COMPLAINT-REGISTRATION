export const statusClass = (status) => {
  const map = {
    OPEN: 'secondary',
    ASSIGNED: 'info',
    IN_PROGRESS: 'primary',
    WAITING_USER: 'warning',
    RESOLVED: 'success',
    CLOSED: 'dark',
    REJECTED: 'danger'
  };
  return map[status] || 'secondary';
};

export const formatStatus = (status = '') => status.replaceAll('_', ' ').toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase());

export const roleHome = (role) => {
  if (role === 'ADMIN') return '/admin';
  if (role === 'AGENT') return '/agent';
  return '/dashboard';
};
