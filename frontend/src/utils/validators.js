export const validatePassword = (pwd) => {
  if (!pwd || pwd.length < 6) return 'Şifre en az 6 karakter olmalıdır.';
  if (!/[A-Z]/.test(pwd)) return 'Şifre en az 1 büyük harf içermelidir.';
  if (!/[0-9]/.test(pwd)) return 'Şifre en az 1 rakam içermelidir.';
  return null;
};
