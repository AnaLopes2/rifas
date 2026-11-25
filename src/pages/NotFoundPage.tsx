import { Link } from 'react-router-dom';

export function NotFoundPage() {
  return (
    <div className="container-page grid min-h-[60vh] place-items-center py-16 text-center">
      <div>
        <p className="font-display text-7xl font-bold text-gradient">404</p>
        <h1 className="mt-3 text-xl font-semibold">Página não encontrada</h1>
        <Link to="/" className="btn-primary mt-6">Voltar ao início</Link>
      </div>
    </div>
  );
}
