import { AdProvider } from "./ad_service";

/**
 * MockAdProvider - Provedor de Testes para Ambiente de Desenvolvimento
 * 
 * Regra:
 * 1. Simula visualmente a reprodução de um Rewarded Ad em ambiente DEV.
 * 2. Exibe temporizador e aviso visível de [AMBIENTE DE DESENVOLVIMENTO].
 * 3. Valida a entrega da recompensa apenas se o vídeo for assistido até o fim.
 */
export class MockAdProvider implements AdProvider {
  name = "MockAdProvider (Ambiente de Desenvolvimento)";

  private mockDisplayHandler?: (
    onComplete: () => void,
    onCancel: () => void
  ) => void;

  /**
   * Permite registrar um handler visual React para renderizar o modal do anúncio mock.
   */
  setMockDisplayHandler(
    handler: (onComplete: () => void, onCancel: () => void) => void
  ) {
    this.mockDisplayHandler = handler;
  }

  async isAvailable(): Promise<boolean> {
    // Em desenvolvimento o mock sempre está disponível
    return true;
  }

  showRewardedAd(
    onReward: () => void,
    onError: (err: string) => void,
    onClose: () => void
  ): void {
    if (process.env.NODE_ENV === "production") {
      console.warn("[MockAdProvider] ALERTA: MockAdProvider chamado em ambiente de produção!");
    }

    if (this.mockDisplayHandler) {
      this.mockDisplayHandler(
        () => {
          onReward();
          onClose();
        },
        () => {
          onClose();
        }
      );
    } else {
      // Fallback sem UI: simula 3 segundos
      setTimeout(() => {
        onReward();
        onClose();
      }, 3000);
    }
  }
}
