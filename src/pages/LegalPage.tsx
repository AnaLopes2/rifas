import { Link, useParams } from 'react-router-dom';
import { FileText } from 'lucide-react';
import { LEGAL_DOCS } from '../content/legal';
import { NotFoundPage } from './NotFoundPage';

export function LegalPage() {
  const { slug } = useParams();
  const doc = LEGAL_DOCS.find((d) => d.slug === slug);
  if (!doc) return <NotFoundPage />;

  return (
    <div className="container-page py-10 sm:py-16">
      <div className="grid gap-10 lg:grid-cols-[240px_1fr]">
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <p className="eyebrow mb-3">Informações legais</p>
          <nav className="scrollbar-thin -mx-4 flex gap-1.5 overflow-x-auto px-4 lg:mx-0 lg:flex-col lg:px-0">
            {LEGAL_DOCS.map((d) => (
              <Link
                key={d.slug}
                to={`/legal/${d.slug}`}
                className={`shrink-0 rounded-lg px-3 py-2 text-sm transition ${d.slug === doc.slug ? 'bg-neon/10 text-white ring-1 ring-neon/40' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}
              >
                {d.title}
              </Link>
            ))}
          </nav>
        </aside>

        <article className="card p-6 sm:p-10">
          <span className="mb-4 grid h-11 w-11 place-items-center rounded-xl bg-neon/10 text-neon">
            <FileText size={20} />
          </span>
          <h1 className="text-3xl font-semibold tracking-tight">{doc.title}</h1>
          <p className="mt-2 text-slate-400">{doc.summary}</p>
          <div className="mt-5 rounded-xl border border-amber-400/20 bg-amber-400/[0.06] px-4 py-3 text-sm text-amber-100/90">
            Minuta preliminar, sujeita a revisão jurídica antes da publicação definitiva. Campos entre colchetes serão preenchidos com os dados reais da empresa.
          </div>
          <div className="mt-8 space-y-8">
            {doc.sections.map((s) => (
              <section key={s.heading}>
                <h2 className="text-lg font-semibold">{s.heading}</h2>
                {s.paragraphs.map((p, i) => (
                  <p key={i} className="mt-2 leading-relaxed text-slate-300">{p}</p>
                ))}
              </section>
            ))}
          </div>
        </article>
      </div>
    </div>
  );
}
