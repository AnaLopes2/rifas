import { useApp } from '../store/AppContext';
import { NUMBER_STATUS } from '../types';
import { CampaignCard } from '../components/home/CampaignCard';
import { LatestDraws } from '../components/home/LatestDraws';
import { SectionHeading } from '../components/ui/SectionHeading';

/** Página Início: vitrine com um cartão por carro/campanha. */
export function HomePage() {
  const { campaigns, numbersById } = useApp();
  const visible = campaigns.filter((c) => c.status !== 'encerrada');

  const availableOf = (id: string) => {
    const st = numbersById[id];
    if (!st) return 0;
    let n = 0;
    for (let i = 0; i < st.length; i++) if (st[i] === NUMBER_STATUS.available) n++;
    return n;
  };

  return (
    <>
      <section className="container-page pt-10 sm:pt-14" aria-label="Rifas disponíveis">
        <SectionHeading eyebrow="Rifas disponíveis" title="Escolha seu carro" subtitle="Toque em um carro para ver os detalhes e escolher seus números." />
        {visible.length === 0 ? (
          <p className="card py-12 text-center text-sm text-slate-400">Nenhuma rifa disponível no momento.</p>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {visible.map((c) => (
              <CampaignCard key={c.id} campaign={c} available={availableOf(c.id)} />
            ))}
          </div>
        )}
      </section>
      <LatestDraws />
    </>
  );
}
