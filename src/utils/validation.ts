export const onlyDigits = (v: string) => v.replace(/\D/g, '');

export function isValidCPF(value: string) {
  const d = onlyDigits(value);
  if (d.length !== 11 || /^(\d)\1{10}$/.test(d)) return false;
  const calc = (len: number) => {
    let sum = 0;
    for (let i = 0; i < len; i++) sum += Number(d[i]) * (len + 1 - i);
    const r = (sum * 10) % 11;
    return r === 10 ? 0 : r;
  };
  return calc(9) === Number(d[9]) && calc(10) === Number(d[10]);
}

export function maskCPF(value: string) {
  const d = onlyDigits(value).slice(0, 11);
  return d
    .replace(/^(\d{3})(\d)/, '$1.$2')
    .replace(/^(\d{3})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/\.(\d{3})(\d{1,2})$/, '.$1-$2');
}

/** CPF parcialmente oculto: ***.456.789-** */
export function hideCPF(value: string) {
  const d = onlyDigits(value);
  if (d.length !== 11) return '***.***.***-**';
  return `***.${d.slice(3, 6)}.${d.slice(6, 9)}-**`;
}

/** Celular brasileiro com código do país: +55 (11) 91234-5678 */
export function maskPhone(value: string) {
  let d = onlyDigits(value);
  if (d.startsWith('55') && d.length > 11) d = d.slice(2);
  d = d.slice(0, 11);
  if (!d) return '';
  let out = '+55 (' + d.slice(0, 2);
  if (d.length >= 2) out += ') ';
  if (d.length > 2) out += d.slice(2, 7);
  if (d.length > 7) out += '-' + d.slice(7);
  return out;
}

export function phoneDigits(masked: string) {
  let d = onlyDigits(masked);
  if (d.startsWith('55') && d.length > 11) d = d.slice(2);
  return d;
}

export function isValidMobile(masked: string) {
  const d = phoneDigits(masked);
  return d.length === 11 && d[2] === '9' && Number(d.slice(0, 2)) >= 11;
}

export function hidePhone(masked: string) {
  const d = phoneDigits(masked);
  return `+55 (${d.slice(0, 2)}) *****-${d.slice(7)}`;
}

export function hideEmail(email: string) {
  const [user, domain] = email.split('@');
  if (!domain) return '***';
  return `${user.slice(0, 2)}***@${domain}`;
}

export const isValidEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim());

export function ageFrom(dateIso: string, now = new Date()) {
  const b = new Date(dateIso + 'T00:00:00');
  if (Number.isNaN(b.getTime())) return -1;
  let age = now.getFullYear() - b.getFullYear();
  const m = now.getMonth() - b.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < b.getDate())) age--;
  return age;
}
