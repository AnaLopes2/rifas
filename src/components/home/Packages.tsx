import { motion } from 'motion/react';
import { Check } from 'lucide-react';
import { useApp } from '../../store/AppContext';
import { brl } from '../../utils/format';
import { SectionHeading } from '../ui/SectionHeading';

export function Packages() {
  const { campaign, packageSize, selectPackage } = useApp();

  const choose = (size: number) => {
    selectPackage(size);
    // Leva a pessoa até a grade, sem abrir checkout.
    window.setTimeout(() => document.getElementById('numeros')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 150);
  };

  return (
    <section id="pacotes" className="container-page scroll-mt-20 pt-16 sm:pt-20">
      <SectionHeading title="Escolha seu pacote" subtitle={`Cada número custa ${brl(campaign.unitPrice)}.`} />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-5" role="radiogroup" aria-label="Pacotes">
        {campaign.packages.map((size) => {
          const active = packageSize === size;
          return (
            <motion.button
              key={size}
              role="radio"
              aria-checked={active}
              whileTap={{ scale: 0.97 }}
              onClick={() => choose(size)}
              className={`card group relative flex flex-col items-start gap-1 p-5 text-left transition duration-200 last:col-span-2 sm:last:col-span-1 ${
                active ? 'card-glow bg-navy-800/90' : 'hover:border-neon/30 hover:bg-navy-800/60'
              }`}
            >
              <span
                className={`absolute top-4 right-4 grid h-6 w-6 place-items-center rounded-full border transition ${
                  active ? 'border-neon bg-neon text-ink' : 'border-white/15 text-transparent'
                }`}
                aria-hidden
              >
                <Check size={14} strokeWidth={3} />
              </span>
              <span className="font-display text-4xl font-bold text-white">{size}</span>
              <span className="text-sm text-slate-400">{size === 1 ? 'número' : 'números'}</span>
              <span className={`mt-3 font-display text-lg font-semibold ${active ? 'text-neon' : 'text-slate-100'}`}>
                {brl(size * campaign.unitPrice)}
              </span>
            </motion.button>
          );
        })}
      </div>
    </section>
  );
}
