import { Calendar, Car, Cog, Gauge, Palette } from 'lucide-react';
import { useApp } from '../../store/AppContext';

export function CarSpecs() {
  const { car } = useApp().campaign;
  const items = [
    { icon: Car, label: 'Modelo', value: car.model },
    { icon: Calendar, label: 'Ano', value: car.year },
    { icon: Gauge, label: 'Potência', value: car.power },
    { icon: Cog, label: 'Câmbio', value: car.transmission },
    { icon: Palette, label: 'Cor', value: car.color },
  ];
  return (
    <section className="container-page relative z-10 -mt-6" aria-label="Detalhes do veículo">
      <div className="card grid grid-cols-2 gap-px overflow-hidden bg-white/[0.04] sm:grid-cols-5">
        {items.map(({ icon: Icon, label, value }, i) => (
          <div
            key={label}
            className={`flex items-center gap-3 bg-navy-900/90 px-4 py-4 sm:justify-center sm:py-5 ${i === 0 ? 'col-span-2 sm:col-span-1' : ''}`}
          >
            <Icon size={20} className="shrink-0 text-neon" aria-hidden />
            <div className="min-w-0">
              <p className="text-[11px] tracking-wider text-slate-500 uppercase">{label}</p>
              <p className="font-display text-[15px] leading-snug font-semibold text-white">{value}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
