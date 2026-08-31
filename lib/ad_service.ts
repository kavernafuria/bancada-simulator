/**
 * AdService - Abstração e Gerenciamento de Anúncios Recompensados (Rewarded Ads)
 * 
 * Regra:
 * 1. O jogo interage com o AdService, não diretamente com SDKs de terceiros.
 * 2. Possui máquina de estados explícita: IDLE, LOADING, READY, SHOWING, REWARDED, CLOSED, FAILED.
 * 3. O fechamento do anúncio (CLOSED) NÃO concede recompensa por si só.
 *    A recompensa ocorre SOMENTE quando o evento 'REWARDED' for disparado validamente.
 */

export type AdState = "IDLE" | "LOADING" | "READY" | "SHOWING" | "REWARDED" | "CLOSED" | "FAILED";

export interface AdProvider {
  name: string;
  isAvailable(): Promise<boolean>;
  showRewardedAd(
    onReward: () => void,
    onError: (err: string) => void,
    onClose: () => void
  ): void;
}

let currentProvider: AdProvider | null = null;
let currentState: AdState = "IDLE";

export const AdService = {
  /**
   * Configura o provedor de anúncios ativo (ex: MockAdProvider ou Provedor de Produção).
   */
  setProvider(provider: AdProvider): void {
    currentProvider = provider;
    currentState = "IDLE";
  },

  /**
   * Obtém o estado atual da máquina de anúncios.
   */
  getState(): AdState {
    return currentState;
  },

  /**
   * Verifica se há anúncios recompensados disponíveis para exibição.
   */
  async isAvailable(): Promise<boolean> {
    if (!currentProvider) return false;
    try {
      currentState = "LOADING";
      const available = await currentProvider.isAvailable();
      currentState = available ? "READY" : "FAILED";
      return available;
    } catch {
      currentState = "FAILED";
      return false;
    }
  },

  /**
   * Solicita e exibe o Rewarded Ad.
   * A recompensa (onReward) só é processada se a conclusão válida ocorrer.
   */
  showRewardedAd(
    onReward: () => void,
    onError: (err: string) => void,
    onClose: () => void
  ): void {
    if (!currentProvider) {
      currentState = "FAILED";
      onError("Nenhum provedor de anúncios configurado.");
      return;
    }

    currentState = "SHOWING";

    currentProvider.showRewardedAd(
      () => {
        currentState = "REWARDED";
        onReward();
      },
      (err) => {
        currentState = "FAILED";
        onError(err);
      },
      () => {
        currentState = "CLOSED";
        onClose();
      }
    );
  },
};
