import type { Campaign } from '../types';

/** Caminho de um arquivo em /public que funciona no site normal e na versão de demonstração (arquivo local). */
const asset = (path: string) => `${import.meta.env.BASE_URL}${path}`;

/**
 * Fotos PROVISÓRIAS do slide do destaque (Unsplash, salvas em public/carros/ para funcionar sem acesso externo).
 * Para trocar, substitua os arquivos em public/carros/ ou edite a lista (aceita URLs). A ordem da lista é a ordem do slide.
 * Obs.: apenas a primeira é o Aventador azul; as demais são outros Lamborghinis, só para demonstrar o slide.
 */
export const PLACEHOLDER_HERO_IMAGES = [
  asset('carros/carro-1.jpg'), // Lamborghini azul
  asset('carros/carro-2.jpg'), // Lamborghini escuro, frente
  asset('carros/carro-3.jpg'), // Lamborghini laranja
];

/** Campanha inicial (editável pelo administrador quando houver backend). */
export const DEFAULT_CAMPAIGN: Campaign = {
  id: 'campanha-001',
  name: 'Campanha #001',
  description: 'Primeira campanha da Rifa Premium.',
  car: {
    // Dados provisórios, combinando com a foto provisória.
    model: 'Lamborghini Aventador S',
    year: '2021',
    power: '740 cv',
    transmission: 'Automático',
    color: 'Azul',
  },
  heroImages: PLACEHOLDER_HERO_IMAGES,
  totalNumbers: 1000,
  unitPrice: 100,
  packages: [1, 5, 10, 20, 50],
  status: 'rascunho',
  startDate: null,
  drawDate: null,
  authorizationRef: null,
};

/**
 * Lista de campanhas (um cartão por carro na página Início).
 * Para adicionar outro carro, inclua um novo objeto aqui com `id` único — no futuro virá do backend.
 */
export const CAMPAIGNS: Campaign[] = [DEFAULT_CAMPAIGN];
