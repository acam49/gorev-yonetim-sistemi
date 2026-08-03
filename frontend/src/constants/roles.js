export const ROLES = Object.freeze({
  ADMIN: 'Admin',
  MANAGER: 'Müdür',
  STAFF: 'Personel'
});

export const isManagerOrAdmin = (role) => {
  if (!role) return false;
  const normalized = String(role).trim().toLocaleLowerCase('tr-TR');
  const adminNormalized = ROLES.ADMIN.toLocaleLowerCase('tr-TR');
  const managerNormalized = ROLES.MANAGER.toLocaleLowerCase('tr-TR');
  const managerASCII = 'mudur';
  return normalized === adminNormalized || normalized === managerNormalized || normalized === managerASCII;
};
