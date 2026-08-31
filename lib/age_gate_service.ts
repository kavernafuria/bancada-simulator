/**
 * AgeGateService - Serviço de Persistência e Gerenciamento do Age Gate 18+
 * 
 * Regra: Trata a verificação de idade estritamente como um controle de acesso
 * da interface gráfica, sem coleta de dados pessoais, CPF ou documentos.
 */

const STORAGE_KEY = "bancada_age_verified";

export const AgeGateService = {
  /**
   * Verifica se o usuário já confirmou que possui 18 anos ou mais.
   */
  isVerified(): boolean {
    if (typeof window === "undefined") return false;
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored === "true";
    } catch {
      return false;
    }
  },

  /**
   * Registra a confirmação de 18+ no localStorage.
   */
  setVerified(verified: boolean): void {
    if (typeof window === "undefined") return;
    try {
      if (verified) {
        localStorage.setItem(STORAGE_KEY, "true");
      } else {
        localStorage.removeItem(STORAGE_KEY);
      }
    } catch (err) {
      console.error("[AgeGateService] Erro ao salvar status de idade:", err);
    }
  },

  /**
   * Limpa a confirmação de idade.
   */
  clearVerification(): void {
    if (typeof window === "undefined") return;
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (err) {
      console.error("[AgeGateService] Erro ao limpar confirmação:", err);
    }
  },
};
