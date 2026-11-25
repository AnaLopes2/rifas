/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** 'true' somente no build de demonstração (vite.demo.config.ts). */
  readonly VITE_DEMO_BUILD?: string;
}
