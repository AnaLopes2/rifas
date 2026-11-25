const brlFormatter = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
const dateTimeFormatter = new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' });
const dateFormatter = new Intl.DateTimeFormat('pt-BR', { dateStyle: 'long' });

export const brl = (value: number) => brlFormatter.format(value);
export const pad3 = (n: number) => String(n).padStart(3, '0');
export const formatDateTime = (iso: string) => dateTimeFormatter.format(new Date(iso));
export const formatDate = (iso: string) => dateFormatter.format(new Date(iso));
export const formatInt = (n: number) => n.toLocaleString('pt-BR');

export function formatCountdown(ms: number) {
  const total = Math.max(0, Math.floor(ms / 1000));
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

/** "Ana Vitória Souza" -> "Ana V*** S***" */
export function maskName(name: string) {
  const parts = name.trim().split(/\s+/);
  return parts.map((p, i) => (i === 0 ? p : `${p[0]}***`)).join(' ');
}

export function randomId(prefix = '') {
  const bytes = new Uint8Array(8);
  crypto.getRandomValues(bytes);
  return prefix + Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
}
