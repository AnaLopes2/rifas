import { Link } from 'react-router-dom';
import { SITE } from '../../config/site';
import { LEGAL_DOCS } from '../../content/legal';
import { Logo } from '../ui/Logo';

export function Footer() {
  return (
    <footer className="mt-24 border-t border-white/[0.06] bg-navy-950/60">
      <div className="container-page grid gap-10 py-12 md:grid-cols-[1.2fr_2fr]">
        <div className="space-y-4">
          <Logo onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} />
          <p className="max-w-sm text-sm leading-relaxed text-slate-400">
            Plataforma em fase de protótipo. Pagamentos reais estão desativados até a definição de uma modalidade
            de promoção legalmente permitida e das autorizações aplicáveis.
          </p>
          <span className="badge-demo">Modo demonstrativo</span>
        </div>
        <div className="grid gap-8 sm:grid-cols-2">
          <div>
            <h3 className="mb-3 text-sm font-semibold text-white">Informações legais</h3>
            <ul className="space-y-2 text-sm">
              {LEGAL_DOCS.map((d) => (
                <li key={d.slug}>
                  <Link to={`/legal/${d.slug}`} className="text-slate-400 transition hover:text-neon">
                    {d.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="mb-3 text-sm font-semibold text-white">Empresa</h3>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>{SITE.company.legalName}</li>
              <li>CNPJ: {SITE.company.cnpj}</li>
              <li>{SITE.company.email}</li>
              <li>{SITE.company.supportHours}</li>
            </ul>
          </div>
        </div>
      </div>
      <div className="border-t border-white/5">
        <div className="container-page flex flex-col gap-2 py-5 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} {SITE.name}. Todos os direitos reservados.</p>
          <p>Project developed by Ana Lopes</p>
        </div>
      </div>
    </footer>
  );
}
