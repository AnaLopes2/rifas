import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowRight, Calendar, Gauge } from 'lucide-react';
import type { Campaign } from '../../types';
import { brl, formatInt } from '../../utils/format';

export function CampaignCard({ campaign, available }: { campaign: Campaign; available: number }) {
  const [failed, setFailed] = useState(false);
  const cover = campaign.heroImages[0];

  return (
    <motion.article whileHover={{ y: -4 }} transition={{ type: 'spring', stiffness: 300, damping: 24 }} className="group">
      <Link
        to={`/rifa/${campaign.id}`}
        className="card block overflow-hidden transition duration-300 group-hover:border-neon/50 group-hover:shadow-[0_20px_50px_-20px_rgb(56_189_255/0.5)]"
        aria-label={`Ver rifa: ${campaign.car.model}`}
      >
        <div className="relative aspect-[16/10] overflow-hidden bg-navy-950">
          {cover && !failed ? (
            <img
              src={cover.replace('w=2400', 'w=1000')}
              alt={campaign.car.model}
              loading="lazy"
              onError={() => setFailed(true)}
              className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
            />
          ) : (
            <div className="grid h-full place-items-center text-sm text-slate-500">Foto indisponível</div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-navy-900 via-transparent to-transparent" />
          <span className="absolute top-3 left-3 rounded-full border border-white/15 bg-ink/60 px-2.5 py-1 text-[11px] font-semibold tracking-wide text-slate-200 uppercase backdrop-blur">
            {campaign.name}
          </span>
        </div>
        <div className="p-5">
          <h3 className="text-xl leading-tight font-bold tracking-tight uppercase">{campaign.car.model}</h3>
          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-400">
            <span className="flex items-center gap-1.5"><Calendar size={14} className="text-neon" /> {campaign.car.year}</span>
            <span className="flex items-center gap-1.5"><Gauge size={14} className="text-neon" /> {campaign.car.power}</span>
          </div>
          <div className="mt-5 flex items-end justify-between gap-3 border-t border-white/5 pt-4">
            <div>
              <p className="text-xs text-slate-500">Por número</p>
              <p className="font-display text-lg font-bold text-neon">{brl(campaign.unitPrice)}</p>
              <p className="text-xs text-slate-500">{formatInt(available)} de {formatInt(campaign.totalNumbers)} disponíveis</p>
            </div>
            <span className="btn-primary px-4 py-2.5">
              Ver rifa <ArrowRight size={16} className="transition group-hover:translate-x-0.5" />
            </span>
          </div>
        </div>
      </Link>
    </motion.article>
  );
}
