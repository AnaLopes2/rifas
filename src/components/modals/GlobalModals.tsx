import { Clock, CreditCard, HelpCircle, Search, UserRound } from 'lucide-react';
import { useApp } from '../../store/AppContext';
import { Modal } from '../ui/Modal';
import { AuthContent } from './AuthModal';
import { CheckoutContent } from './CheckoutContent';
import { PendingContent } from './PendingContent';
import { TitlesContent } from './TitlesContent';

const steps = [
  'Escolha seu pacote de números.',
  'Selecione os números disponíveis.',
  'Preencha seus dados.',
  'Finalize sua participação quando os pagamentos estiverem habilitados.',
  'Acompanhe seus títulos e os resultados.',
];

function HowItWorks({ onClose }: { onClose: () => void }) {
  return (
    <div className="space-y-5">
      <ol className="space-y-3">
        {steps.map((s, i) => (
          <li key={s} className="flex items-start gap-3">
            <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full border border-neon/40 bg-neon/10 font-display text-sm font-bold text-neon">
              {i + 1}
            </span>
            <span className="pt-0.5 text-[15px] text-slate-200">{s}</span>
          </li>
        ))}
      </ol>
      <button onClick={onClose} className="btn-primary w-full py-3">Entendi</button>
    </div>
  );
}

export function GlobalModals() {
  const { modal, closeModal, authIntent, participant } = useApp();

  return (
    <>
      <Modal open={modal === 'how'} onClose={closeModal} title="Como funciona?" icon={<HelpCircle size={17} />} size="sm">
        <HowItWorks onClose={closeModal} />
      </Modal>
      <Modal
        open={modal === 'auth'}
        onClose={closeModal}
        title={authIntent.mode === 'admin' ? 'Acesso administrativo' : 'Entrar / Cadastrar'}
        icon={<UserRound size={17} />}
      >
        <AuthContent initialMode={authIntent.mode ?? 'register'} />
      </Modal>
      <Modal open={modal === 'titles'} onClose={closeModal} title="Buscar meus títulos" icon={<Search size={17} />}>
        <TitlesContent />
      </Modal>
      <Modal open={modal === 'pending' && !!participant} onClose={closeModal} title="Pagamentos pendentes" icon={<Clock size={17} />}>
        <PendingContent />
      </Modal>
      <Modal open={modal === 'checkout' && !!participant} onClose={closeModal} title="Resumo do pedido" icon={<CreditCard size={17} />}>
        <CheckoutContent />
      </Modal>
    </>
  );
}
