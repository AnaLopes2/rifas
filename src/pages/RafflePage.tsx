import { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useApp } from '../store/AppContext';
import { Hero } from '../components/home/Hero';
import { CarSpecs } from '../components/home/CarSpecs';
import { Packages } from '../components/home/Packages';
import { TopBuyers } from '../components/home/TopBuyers';
import { NumberSection } from '../components/home/NumberSection';
import { SelectionSummary } from '../components/home/SelectionSummary';
import { NotFoundPage } from './NotFoundPage';

/** Página da rifa do carro selecionado no Início. */
export function RafflePage() {
  const { id } = useParams();
  const { campaigns, campaign, selectCampaign } = useApp();
  const target = campaigns.find((c) => c.id === id);

  useEffect(() => {
    if (target) selectCampaign(target.id);
  }, [target, selectCampaign]);

  if (!target) return <NotFoundPage />;
  if (campaign.id !== target.id) return null; // aguarda a troca de campanha

  return (
    <>
      <div className="container-page pt-4 pb-3">
        <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-slate-400 transition hover:text-white">
          <ArrowLeft size={15} /> Todas as rifas
        </Link>
      </div>
      <Hero />
      <CarSpecs />
      <Packages />
      <TopBuyers />
      <NumberSection />
      <SelectionSummary />
    </>
  );
}
