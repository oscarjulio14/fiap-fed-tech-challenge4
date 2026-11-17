/**
 * URL base da API REST.
 *
 * Padrão: http://localhost:3000
 *  - Web e iOS Simulator: "localhost" já aponta para o computador.
 *  - Emulador Android: o script `npm run android` executa `adb reverse tcp:3000 tcp:3000`,
 *    que faz o "localhost" do emulador apontar para o computador (mais confiável que 10.0.2.2
 *    nas imagens mais recentes do Android).
 *
 * Para usar outro back-end (ex.: o back-end real da Fase 2/3, IP do PC em celular físico ou
 * 10.0.2.2), defina EXPO_PUBLIC_API_URL no arquivo mobile/.env (veja .env.example).
 */
export const API_URL: string = (process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000').replace(
  /\/$/,
  '',
);

/** Tempo máximo (ms) de espera por uma resposta da API. */
export const REQUEST_TIMEOUT_MS = 10000;

/** Itens por página nas listagens administrativas. */
export const PAGE_SIZE = 5;
