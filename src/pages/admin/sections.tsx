import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { Eye, FileUp, ImagePlus, Pause, Play, RefreshCw, RotateCcw, Search, Square, Upload } from 'lucide-react';
import { SITE } from '../../config/site';
import { LEGAL_DOCS } from '../../content/legal';
import { getAudit, type AuditEntry } from '../../services/adminApi';
import { listDemoParticipants } from '../../services/participantAuth';
import { useApp } from '../../store/AppContext';
import { NUMBER_STATUS, type NumberFilter, type ReservationStatus } from '../../types';
import { brl, formatDateTime, formatInt, pad3 } from '../../utils/format';
import { hideCPF, hideEmail, hidePhone } from '../../utils/validation';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { Panel, Stat, Table, TextField, useDemoAction } from './ui';

/* ───────────────────────── 1. Dashboard ───────────────────────── */

export function DashboardSection() {
  const { counts, campaign, reservations } = useApp();
  const [audit, setAudit] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const load = useCallback(async () => {
    setLoading(true);
    setAudit(await getAudit());
    setLoading(false);
  }, []);
  useEffect(() => {
    void load();
  }, [load]);

  const pending = reservations.filter((r) => r.status === 'pendente').length;
  const participants = listDemoParticipants().length;

  return (
    <>
      <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-3">
        <Stat label="Campanhas ativas" value={campaign.status === 'publicada' ? 1 : 0} hint={`1 campanha em ${campaign.status}`} />
        <Stat label="Participantes" value={participants} hint="Cadastros demonstrativos desta sessão" />
        <Stat label="Total de números" value={formatInt(counts.all)} />
        <Stat label="Disponíveis" value={formatInt(counts.available)} tone="text-emerald-300" />
        <Stat label="Reservados" value={formatInt(counts.reserved)} tone="text-amber-300" />
        <Stat label="Confirmados" value={formatInt(counts.paid)} tone="text-paid" />
        <Stat label="Pedidos pendentes" value={pending} />
        <Stat label="Pagamentos confirmados" value="—" hint="Pagamentos desabilitados" />
        <Stat label="Receita confirmada" value="—" hint="Não aplicável no protótipo" />
      </div>

      <Panel
        title="Histórico de auditoria"
        subtitle="Registrado no servidor: logins, tentativas e ações administrativas."
        action={
          <button onClick={load} className="btn-ghost py-2" disabled={loading}>
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} /> Atualizar
          </button>
        }
      >
        <Table head={['Data', 'Usuário', 'Ação', 'Detalhes']} empty={audit.length === 0 && 'Nenhum registro ainda.'}>
          {audit.map((a) => (
            <tr key={a.id}>
              <td className="px-5 py-3 whitespace-nowrap text-slate-400 sm:px-3">{formatDateTime(a.at)}</td>
              <td className="px-5 py-3 sm:px-3">{a.actor}</td>
              <td className="px-5 py-3 font-mono text-xs text-neon sm:px-3">{a.action}</td>
              <td className="px-5 py-3 text-slate-400 sm:px-3">{a.details ?? '—'}</td>
            </tr>
          ))}
        </Table>
      </Panel>
    </>
  );
}

/* ───────────────────── 2. Carro e campanhas ───────────────────── */

export function CampaignsSection() {
  const { campaign, previewCampaign, resetCampaignPreview, toast } = useApp();
  const demo = useDemoAction();
  const [f, setF] = useState(() => ({
    name: campaign.name,
    description: campaign.description,
    heroImages: campaign.heroImages.join('\n'),
    startDate: campaign.startDate ?? '',
    drawDate: campaign.drawDate ?? '',
    ...campaign.car,
  }));
  const set = (k: keyof typeof f) => (v: string) => setF((s) => ({ ...s, [k]: v }));
  const started = campaign.status !== 'rascunho';

  const preview = () => {
    const heroImages = f.heroImages.split('\n').map((s) => s.trim()).filter(Boolean);
    if (!heroImages.length) return toast('Informe pelo menos uma foto.', 'warning');
    previewCampaign({
      name: f.name,
      description: f.description,
      heroImages,
      startDate: f.startDate || null,
      drawDate: f.drawDate || null,
      car: { model: f.model, year: f.year, power: f.power, transmission: f.transmission, color: f.color },
    });
    demo('campanha.pre_visualizacao', `${f.name} — ${f.model}`, 'Pré-visualização aplicada nesta aba (não persistida).');
  };

  return (
    <>
      <Panel
        title={campaign.name}
        subtitle={`Status: ${campaign.status}. Autorização: ${campaign.authorizationRef ?? 'nenhum documento associado'}.`}
        action={
          <div className="flex flex-wrap gap-2">
            <button className="btn-ghost py-2" onClick={() => demo('campanha.publicar', campaign.id, 'Publicação bloqueada: requer backend seguro, regras e documentação de autorização.')}>
              <Play size={15} /> Publicar
            </button>
            <button className="btn-ghost py-2" onClick={() => demo('campanha.pausar', campaign.id)}><Pause size={15} /> Pausar</button>
            <button className="btn-danger py-2" onClick={() => demo('campanha.encerrar', campaign.id)}><Square size={15} /> Encerrar</button>
          </div>
        }
      >
        <div className="grid gap-4 md:grid-cols-2">
          <div className="md:col-span-2">
            <TextField label="Nome da campanha" value={f.name} onChange={set('name')} />
          </div>
          <div className="md:col-span-2">
            <TextField
              label="Fotos do slide (URLs)"
              value={f.heroImages}
              onChange={set('heroImages')}
              textarea
              hint="Uma URL por linha, na ordem do slide. A primeira também aparece como miniatura no pedido."
            />
          </div>
          <div className="md:col-span-2">
            <TextField label="Descrição" value={f.description} onChange={set('description')} textarea />
          </div>
        </div>

        <h3 className="mt-6 mb-3 text-sm font-semibold text-slate-200">Veículo</h3>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <TextField label="Modelo" value={f.model} onChange={set('model')} />
          <TextField label="Ano" value={f.year} onChange={set('year')} />
          <TextField label="Potência" value={f.power} onChange={set('power')} />
          <TextField label="Câmbio" value={f.transmission} onChange={set('transmission')} />
          <TextField label="Cor" value={f.color} onChange={set('color')} />
        </div>

        <h3 className="mt-6 mb-3 text-sm font-semibold text-slate-200">Datas</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField label="Início" type="date" value={f.startDate} onChange={set('startDate')} />
          <TextField label="Data da apuração" type="date" value={f.drawDate} onChange={set('drawDate')} />
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <button className="btn-ghost justify-start py-3" onClick={() => demo('campanha.fotos', undefined, 'Upload de fotos requer armazenamento seguro no backend.')}>
            <ImagePlus size={17} /> Adicionar fotos
          </button>
          <button className="btn-ghost justify-start py-3" onClick={() => demo('campanha.documentos', undefined, 'Associação de regras e autorizações requer backend e documentação real.')}>
            <FileUp size={17} /> Associar regras e documentos de autorização
          </button>
        </div>

        {started && (
          <p className="mt-4 text-sm text-amber-200">Campanha iniciada: alterações de condições exigem aditivo publicado e registrado em auditoria.</p>
        )}
        <p className="mt-4 text-xs text-slate-500">
          Regra: as condições de uma campanha não podem ser alteradas silenciosamente após o início. No backend, cada alteração gera uma nova versão com data, autor e justificativa.
        </p>

        <div className="mt-6 flex flex-wrap gap-2 border-t border-white/5 pt-5">
          <button className="btn-primary" onClick={preview}><Eye size={16} /> Pré-visualizar no site</button>
          <button
            className="btn-ghost"
            onClick={() => {
              resetCampaignPreview();
              toast('Dados originais restaurados.', 'info');
            }}
          >
            <RotateCcw size={16} /> Restaurar original
          </button>
        </div>
      </Panel>
      <button className="btn-ghost" onClick={() => demo('campanha.criar', undefined, 'Criação de campanhas requer backend com banco de dados.')}>
        + Criar nova campanha
      </button>
    </>
  );
}

/* ───────────────────── 3. Números e pacotes ───────────────────── */

const STATUS_LABEL = ['Disponível', 'Reservado', 'Pago'];
const STATUS_CLS = ['text-emerald-300', 'text-amber-300', 'text-paid'];

export function NumbersSection() {
  const { campaign, previewCampaign, numbers, reservations, counts } = useApp();
  const demo = useDemoAction();
  const [price, setPrice] = useState(String(campaign.unitPrice));
  const [packages, setPackages] = useState(campaign.packages.join(', '));
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<NumberFilter>('all');
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(0);
  const PER = 50;

  const owner = useMemo(() => {
    const m = new Map<number, (typeof reservations)[number]>();
    for (const r of reservations) if (r.status === 'pendente' || r.status === 'confirmada') for (const n of r.numbers) m.set(n, r);
    return m;
  }, [reservations]);
  const participants = useMemo(() => new Map(listDemoParticipants().map((p) => [p.id, p])), [reservations]); // eslint-disable-line react-hooks/exhaustive-deps

  const rows = useMemo(() => {
    const out: number[] = [];
    for (let i = 0; i < numbers.length; i++) {
      const s = numbers[i];
      if (filter === 'available' && s !== NUMBER_STATUS.available) continue;
      if (filter === 'reserved' && s !== NUMBER_STATUS.reserved) continue;
      if (filter === 'paid' && s !== NUMBER_STATUS.paid) continue;
      if (query && !pad3(i).includes(query)) continue;
      out.push(i);
    }
    return out;
  }, [numbers, filter, query]);
  const pages = Math.max(1, Math.ceil(rows.length / PER));
  const safePage = Math.min(page, pages - 1);

  const apply = (e: FormEvent) => {
    e.preventDefault();
    const p = Number(price.replace(',', '.'));
    const pk = Array.from(new Set(packages.split(/[,\s]+/).filter(Boolean).map(Number))).sort((a, b) => a - b);
    if (!(p > 0)) return setError('Preço unitário inválido.');
    if (!pk.length || pk.some((x) => !Number.isInteger(x) || x < 1 || x > campaign.totalNumbers)) return setError('Pacotes inválidos.');
    setError('');
    previewCampaign({ unitPrice: p, packages: pk });
    demo('numeros.config_pre_visualizacao', `Preço ${brl(p)}; pacotes ${pk.join(', ')}`, 'Pré-visualização aplicada nesta aba (não persistida).');
  };

  return (
    <>
      <Panel title="Preço e pacotes" subtitle="Valor total = quantidade × preço unitário. Sem descontos nesta fase.">
        <form onSubmit={apply} className="grid gap-4 sm:grid-cols-3">
          <TextField label="Preço unitário (R$)" value={price} onChange={setPrice} />
          <TextField label="Pacotes (quantidades)" value={packages} onChange={setPackages} hint="Separados por vírgula" />
          <TextField label="Total de números" value={String(campaign.totalNumbers)} disabled hint="Bloqueado: não pode mudar após criação" />
          {error && <p className="text-sm text-red-300 sm:col-span-3">{error}</p>}
          <div className="sm:col-span-3">
            <button className="btn-primary"><Eye size={16} /> Pré-visualizar no site</button>
          </div>
        </form>
      </Panel>

      <Panel title="Números" subtitle={`${formatInt(counts.available)} disponíveis · ${formatInt(counts.reserved)} reservados · ${formatInt(counts.paid)} pagos`}>
        <div className="mb-4 flex flex-wrap gap-2">
          {(['all', 'available', 'reserved', 'paid'] as NumberFilter[]).map((k) => (
            <button
              key={k}
              onClick={() => { setFilter(k); setPage(0); }}
              className={`rounded-lg border px-3 py-1.5 text-sm transition ${filter === k ? 'border-neon/60 bg-neon/10 text-white' : 'border-white/10 text-slate-400 hover:text-white'}`}
            >
              {{ all: 'Todos', available: 'Disponíveis', reserved: 'Reservados', paid: 'Pagos' }[k]}
            </button>
          ))}
          <div className="relative ml-auto">
            <Search size={15} className="absolute top-1/2 left-3 -translate-y-1/2 text-slate-500" />
            <input value={query} onChange={(e) => { setQuery(e.target.value.replace(/\D/g, '').slice(0, 3)); setPage(0); }} placeholder="Buscar número" className="input w-44 py-2 pl-9" inputMode="numeric" />
          </div>
        </div>
        <Table head={['Número', 'Estado', 'Participante', 'Reserva', 'Confirmação', 'Expiração']} empty={rows.length === 0 && 'Nenhum número encontrado.'}>
          {rows.slice(safePage * PER, safePage * PER + PER).map((n) => {
            const r = owner.get(n);
            const p = r ? participants.get(r.participantId) : undefined;
            return (
              <tr key={n}>
                <td className="px-5 py-2.5 font-mono sm:px-3">{pad3(n)}</td>
                <td className={`px-5 py-2.5 sm:px-3 ${STATUS_CLS[numbers[n]]}`}>{STATUS_LABEL[numbers[n]]}</td>
                <td className="px-5 py-2.5 text-slate-300 sm:px-3">{p ? p.name : '—'}</td>
                <td className="px-5 py-2.5 text-slate-400 sm:px-3">{r ? formatDateTime(r.createdAt) : '—'}</td>
                <td className="px-5 py-2.5 text-slate-400 sm:px-3">{r?.confirmedAt ? formatDateTime(r.confirmedAt) : '—'}</td>
                <td className="px-5 py-2.5 text-slate-400 sm:px-3">{r && r.status === 'pendente' ? formatDateTime(r.expiresAt) : '—'}</td>
              </tr>
            );
          })}
        </Table>
        <div className="mt-4 flex items-center justify-between text-sm text-slate-400">
          <span>Página {safePage + 1} de {pages}</span>
          <div className="flex gap-2">
            <button className="btn-ghost py-1.5" disabled={safePage === 0} onClick={() => setPage(safePage - 1)}>Anterior</button>
            <button className="btn-ghost py-1.5" disabled={safePage >= pages - 1} onClick={() => setPage(safePage + 1)}>Próxima</button>
          </div>
        </div>
        <p className="mt-4 text-xs text-slate-500">Alterações manuais de estado de números serão registradas no histórico de auditoria quando o backend existir.</p>
      </Panel>
    </>
  );
}

/* ───────────────────────── 4. Participantes ───────────────────────── */

export function ParticipantsSection() {
  const { reservations } = useApp();
  const [q, setQ] = useState('');
  const list = listDemoParticipants().filter((p) => !q || p.name.toLowerCase().includes(q.toLowerCase()) || p.cpf.includes(q.replace(/\D/g, '') || '§'));

  return (
    <Panel
      title="Participantes"
      subtitle="Dados sensíveis exibidos parcialmente. Acesso completo dependerá do perfil de permissão no backend."
      action={
        <div className="relative">
          <Search size={15} className="absolute top-1/2 left-3 -translate-y-1/2 text-slate-500" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Nome ou CPF" className="input w-56 py-2 pl-9" />
        </div>
      }
    >
      <Table head={['Nome', 'CPF', 'E-mail', 'Celular', 'Cadastro', 'Pedidos']} empty={list.length === 0 && 'Nenhum participante cadastrado. Cadastros de teste feitos no site aparecem aqui durante a sessão.'}>
        {list.map((p) => (
          <tr key={p.id}>
            <td className="px-5 py-3 text-white sm:px-3">{p.name}</td>
            <td className="px-5 py-3 font-mono text-xs sm:px-3">{hideCPF(p.cpf)}</td>
            <td className="px-5 py-3 text-slate-400 sm:px-3">{hideEmail(p.email)}</td>
            <td className="px-5 py-3 text-slate-400 sm:px-3">{hidePhone(p.phone)}</td>
            <td className="px-5 py-3 text-slate-400 sm:px-3">{formatDateTime(p.createdAt)}</td>
            <td className="px-5 py-3 sm:px-3">{reservations.filter((r) => r.participantId === p.id).length}</td>
          </tr>
        ))}
      </Table>
    </Panel>
  );
}

/* ───────────────────── 5. Reservas e pagamentos ───────────────────── */

export function ReservationsSection() {
  const { reservations } = useApp();
  const [status, setStatus] = useState<ReservationStatus | 'todas'>('todas');
  const participants = new Map(listDemoParticipants().map((p) => [p.id, p]));
  const list = reservations.filter((r) => status === 'todas' || r.status === status);

  return (
    <Panel title="Reservas e pagamentos" subtitle="Confirmações só ocorrerão via webhook assinado do provedor. Pagamentos reais estão desativados.">
      <div className="mb-4 flex flex-wrap gap-2">
        {(['todas', 'pendente', 'confirmada', 'expirada', 'cancelada'] as const).map((s) => (
          <button
            key={s}
            onClick={() => setStatus(s)}
            className={`rounded-lg border px-3 py-1.5 text-sm capitalize transition ${status === s ? 'border-neon/60 bg-neon/10 text-white' : 'border-white/10 text-slate-400 hover:text-white'}`}
          >
            {s}
          </button>
        ))}
      </div>
      <Table head={['Pedido', 'Participante', 'Números', 'Total', 'Criado', 'Estado']} empty={list.length === 0 && 'Nenhuma reserva ou pedido.'}>
        {list.map((r) => (
          <tr key={r.id}>
            <td className="px-5 py-3 font-mono text-xs text-slate-400 sm:px-3">{r.id.slice(0, 10)}</td>
            <td className="px-5 py-3 sm:px-3">{participants.get(r.participantId)?.name ?? '—'}</td>
            <td className="px-5 py-3 font-mono text-xs sm:px-3">{r.numbers.map(pad3).join(' ')}</td>
            <td className="px-5 py-3 text-neon sm:px-3">{brl(r.total)}</td>
            <td className="px-5 py-3 text-slate-400 sm:px-3">{formatDateTime(r.createdAt)}</td>
            <td className="px-5 py-3 sm:px-3"><StatusBadge status={r.status} /></td>
          </tr>
        ))}
      </Table>
    </Panel>
  );
}

/* ───────────────────── 6. Resultados dos Sorteios ───────────────────── */

export function ResultsSection() {
  const { campaign, results } = useApp();
  const demo = useDemoAction();
  const [f, setF] = useState({ date: '', number: '', winner: '' });
  const [error, setError] = useState('');

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const n = Number(f.number);
    if (!f.date) return setError('Informe a data da apuração.');
    if (f.number === '' || !Number.isInteger(n) || n < 0 || n >= campaign.totalNumbers) return setError(`Número vencedor deve estar entre 000 e ${pad3(campaign.totalNumbers - 1)}.`);
    setError('');
    demo('resultado.publicar', `${campaign.name} — nº ${pad3(n)}`, 'Publicação bloqueada: resultados exigem backend seguro, vencedor verificado e documentação da apuração.');
  };

  return (
    <>
      <Panel title="Registrar resultado" subtitle="Resultados publicados devem ser verificáveis e só podem ser corrigidos com registro público da correção.">
        <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label" htmlFor="res-camp">Campanha</label>
            <select id="res-camp" className="input">
              <option>{campaign.name}</option>
            </select>
          </div>
          <TextField label="Data da apuração" type="date" value={f.date} onChange={(v) => setF((s) => ({ ...s, date: v }))} />
          <TextField label="Número vencedor" value={f.number} onChange={(v) => setF((s) => ({ ...s, number: v.replace(/\D/g, '').slice(0, 3) }))} />
          <div>
            <label className="label" htmlFor="res-winner">Vencedor verificado</label>
            <select id="res-winner" className="input" value={f.winner} onChange={(e) => setF((s) => ({ ...s, winner: e.target.value }))}>
              <option value="">Nenhum participante com pagamento confirmado</option>
            </select>
          </div>
          <button type="button" className="btn-ghost justify-start py-3" onClick={() => demo('resultado.fotos', undefined, 'Upload de fotos autorizadas requer backend.')}>
            <Upload size={16} /> Adicionar fotos autorizadas
          </button>
          <button type="button" className="btn-ghost justify-start py-3" onClick={() => demo('resultado.documentos', undefined, 'Upload de documentos requer backend.')}>
            <FileUp size={16} /> Adicionar documentos de comprovação
          </button>
          {error && <p className="text-sm text-red-300 sm:col-span-2">{error}</p>}
          <div className="flex flex-wrap gap-2 sm:col-span-2">
            <button className="btn-primary">Publicar resultado</button>
            <button type="button" className="btn-ghost" onClick={() => demo('resultado.correcao', undefined, 'Não há resultados publicados para corrigir.')}>Registrar correção</button>
          </div>
        </form>
      </Panel>
      <Panel title="Resultados publicados">
        {results.length === 0 ? <p className="py-6 text-center text-sm text-slate-400">Ainda não realizamos nenhum sorteio.</p> : null}
      </Panel>
    </>
  );
}

/* ───────────────────── 7. Configurações do site ───────────────────── */

export function SettingsSection() {
  const demo = useDemoAction();
  const [f, setF] = useState({
    siteName: SITE.name,
    logo: '',
    primary: '#1f6fff',
    accent: '#38bdff',
    email: SITE.company.email,
    phone: SITE.company.phone,
    legalName: SITE.company.legalName,
    cnpj: SITE.company.cnpj,
    address: SITE.company.address,
    about: '',
  });
  const set = (k: keyof typeof f) => (v: string) => setF((s) => ({ ...s, [k]: v }));

  return (
    <>
      <Panel title="Identidade">
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField label="Nome do site" value={f.siteName} onChange={set('siteName')} />
          <TextField label="Logo (URL)" value={f.logo} onChange={set('logo')} hint="Vazio = logotipo padrão" />
          <div className="grid grid-cols-2 gap-4">
            {(['primary', 'accent'] as const).map((k) => (
              <div key={k}>
                <label className="label" htmlFor={`c-${k}`}>{k === 'primary' ? 'Cor principal' : 'Cor de destaque'}</label>
                <div className="flex items-center gap-2">
                  <input id={`c-${k}`} type="color" value={f[k]} onChange={(e) => set(k)(e.target.value)} className="h-11 w-14 cursor-pointer rounded-lg border border-white/10 bg-transparent" />
                  <span className="font-mono text-xs text-slate-400">{f[k]}</span>
                </div>
              </div>
            ))}
          </div>
          <div>
            <p className="label">Fotos do destaque</p>
            <Link to="/admin?secao=campanhas" className="btn-ghost w-full justify-start py-3">
              <ImagePlus size={16} /> Gerenciar em "Carro e campanhas"
            </Link>
          </div>
        </div>
      </Panel>
      <Panel title="Empresa e contato">
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField label="Razão social" value={f.legalName} onChange={set('legalName')} />
          <TextField label="CNPJ" value={f.cnpj} onChange={set('cnpj')} />
          <TextField label="E-mail de contato" value={f.email} onChange={set('email')} />
          <TextField label="Telefone" value={f.phone} onChange={set('phone')} />
          <div className="sm:col-span-2"><TextField label="Endereço" value={f.address} onChange={set('address')} /></div>
          <div className="sm:col-span-2"><TextField label="Texto institucional" value={f.about} onChange={set('about')} textarea /></div>
        </div>
      </Panel>
      <Panel title="Políticas" subtitle="Minutas preliminares — revisão jurídica obrigatória antes da publicação.">
        <ul className="grid gap-2 sm:grid-cols-2">
          {LEGAL_DOCS.map((d) => (
            <li key={d.slug}>
              <Link to={`/legal/${d.slug}`} target="_blank" className="flex items-center justify-between rounded-xl border border-white/10 px-4 py-3 text-sm hover:border-neon/40">
                {d.title} <Eye size={15} className="text-neon" />
              </Link>
            </li>
          ))}
        </ul>
      </Panel>
      <div className="flex justify-end">
        <button className="btn-primary" onClick={() => demo('config.salvar', f.siteName)}>Salvar configurações</button>
      </div>
    </>
  );
}
