"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Shield,
  Save,
  Plus,
  Trash2,
  Search,
  Filter,
  Download,
  Check,
  AlertTriangle,
  ArrowLeft,
  Palette,
  Users,
  Flame,
  Swords,
  Bus,
  Wallet,
  Sparkles,
  Lock,
  RefreshCw,
} from "lucide-react";
import { resolveTorcidaRivalries, getDefaultTorcidaColors } from "@/lib/bancada_engine";

export interface TeamAdminItem {
  estado: string;
  clube: string;
  torcida: string;
  tier: string;
  contingente: number;
  pressao_bancada: number;
  poder_pista: number;
  caravana: number;
  autonomia_financeira: number;
  perfil_predominante: string;
  eixo_alianca: string;
  primaryColor?: string;
  secondaryColor?: string;
  rival_principal?: string;
  rival_secundario?: string;
  torcida_aliada?: string;
}

const ALLIANCE_AXES = [
  { id: "INDEPENDENTE", label: "INDEPENDENTE (Sem Eixo Fixo)" },
  { id: "ALIANCA_ALVINEGRA", label: "ALIANÇA ALVINEGRA (Gaviões, Ceará, etc.)" },
  { id: "DPA", label: "DPA (Mancha, Força Jovem, Galoucura, etc.)" },
  { id: "PUNHO_CRUZADO", label: "PUNHO CRUZADO (Independente SP, Jovem Fla, Mafiosa, etc.)" },
  { id: "PUNHO_COLADO", label: "PUNHO COLADO (Young Flu, Fúria Ind., Raça Tricolor, Fúria Marcilista)" },
  { id: "PC", label: "PUNHO COLADO (PC - Alias)" },
  { id: "IRMANDADE", label: "IRMANDADE (Jovem Ponte, etc.)" },
  { id: "UPS", label: "UPS (União Paulista de Torcidas)" },
  { id: "PUNHO_SEGURO", label: "PUNHO SEGURO (Sub-Sedes / Linha de Frente)" },
];

const TIERS = ["S", "S-", "A+", "A", "A-", "B+", "B", "B-", "C+", "C", "C-"];

export default function AdminPage() {
  const [teams, setTeams] = useState<TeamAdminItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Filters & Search
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedState, setSelectedState] = useState<string>("ALL");
  const [selectedAlliance, setSelectedAlliance] = useState<string>("ALL");

  useEffect(() => {
    fetchTeams();
  }, []);

  const fetchTeams = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch("/api/admin/teams");
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Acesso negado ou erro no servidor");
      }
      const data = await res.json();
      setTeams(data.teams || []);
    } catch (err: any) {
      setErrorMsg(err.message || "Falha ao carregar torcidas");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveTeams = async () => {
    setIsSaving(true);
    setErrorMsg(null);
    setSuccessToast(null);
    try {
      const res = await fetch("/api/admin/teams", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ teams }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Erro ao salvar alterações");
      }

      const data = await res.json();
      setSuccessToast(data.message || "Alterações salvas com sucesso em data/bancada_teams.json!");
      setTimeout(() => setSuccessToast(null), 4000);
    } catch (err: any) {
      setErrorMsg(err.message || "Erro ao salvar alterações");
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdateTeam = (index: number, field: keyof TeamAdminItem, value: any) => {
    setTeams((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  const handleAddTeam = () => {
    const newTeam: TeamAdminItem = {
      estado: "SP",
      clube: "Novo Clube FC",
      torcida: "Nova Torcida Organizada",
      tier: "C+",
      contingente: 50,
      pressao_bancada: 50,
      poder_pista: 50,
      caravana: 50,
      autonomia_financeira: 40,
      perfil_predominante: "Nova Agremiação Cadastrada",
      eixo_alianca: "INDEPENDENTE",
      primaryColor: "#09090b",
      secondaryColor: "#f4f4f5",
    };
    setTeams((prev) => [newTeam, ...prev]);
    setSearchTerm("Nova Torcida");
  };

  const handleDeleteTeam = (index: number) => {
    const item = teams[index];
    if (confirm(`Tem certeza que deseja excluir a torcida "${item.torcida}" (${item.clube})?`)) {
      setTeams((prev) => prev.filter((_, i) => i !== index));
    }
  };

  const handleExportJson = () => {
    const jsonStr = JSON.stringify(teams, null, 2);
    const blob = new Blob([jsonStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `bancada_teams_backup.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Unique states
  const statesList = Array.from(new Set(teams.map((t) => t.estado))).sort();

  // Filtered teams
  const filteredTeams = teams.filter((t) => {
    const matchesSearch =
      t.torcida.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.clube.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.estado.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesState = selectedState === "ALL" || t.estado === selectedState;
    const matchesAlliance = selectedAlliance === "ALL" || t.eixo_alianca === selectedAlliance;

    return matchesSearch && matchesState && matchesAlliance;
  });

  if (errorMsg && errorMsg.includes("Acesso Negado")) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center p-4">
        <div className="bg-zinc-900 border border-red-500/50 rounded-3xl max-w-md w-full p-6 text-center shadow-2xl space-y-4">
          <div className="mx-auto w-12 h-12 rounded-2xl bg-red-500/20 text-red-400 flex items-center justify-center border border-red-500/30">
            <Lock className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-black uppercase text-red-400">ACESSO NEGADO (LOCALHOST ONLY)</h2>
          <p className="text-xs text-zinc-300 leading-relaxed font-medium">
            Esta página de administração local é exclusiva para o ambiente de desenvolvimento local (Localhost / 127.0.0.1).
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 py-2.5 px-4 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-bold uppercase transition-all"
          >
            <ArrowLeft className="w-4 h-4" /> Voltar ao Jogo
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-3 sm:p-6 space-y-5">
      {/* Top Admin Header */}
      <div className="bg-zinc-900 border border-amber-500/50 rounded-3xl p-4 sm:p-5 shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative overflow-hidden">
        <div className="space-y-1 z-10">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
              <Lock className="w-3.5 h-3.5" /> LOCALHOST ADMIN PANEL
            </span>
            <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
              {teams.length} Torcidas Cadastradas
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-white flex items-center gap-2">
            <Shield className="w-6 h-6 text-amber-400" /> GERENCIADOR DE TORCIDAS, CORES & ALIANÇAS
          </h1>
          <p className="text-xs text-zinc-400 font-medium">
            Edite atributos, paletas de cores e eixos de aliança. Ao clicar em <strong>"Salvar no Jogo"</strong>, o arquivo <code className="text-amber-300 bg-zinc-950 px-1 py-0.5 rounded">data/bancada_teams.json</code> é atualizado automaticamente!
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2 z-10 w-full md:w-auto">
          <Link
            href="/"
            className="py-2.5 px-3.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-black uppercase tracking-wider flex items-center gap-1.5 transition-all shadow"
          >
            <ArrowLeft className="w-4 h-4" /> Voltar ao Jogo
          </Link>

          <button
            onClick={handleAddTeam}
            className="py-2.5 px-3.5 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/40 text-xs font-black uppercase tracking-wider flex items-center gap-1.5 transition-all shadow cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Adicionar Torcida
          </button>

          <button
            onClick={handleExportJson}
            className="py-2.5 px-3.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 text-xs font-black uppercase tracking-wider flex items-center gap-1.5 transition-all shadow cursor-pointer"
          >
            <Download className="w-4 h-4" /> Exportar JSON
          </button>

          <button
            onClick={handleSaveTeams}
            disabled={isSaving}
            className="py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-black font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-xl active:scale-95 transition-all cursor-pointer"
          >
            {isSaving ? (
              <RefreshCw className="w-4 h-4 animate-spin text-black" />
            ) : (
              <Save className="w-4 h-4 text-black" />
            )}
            SALVAR NO JOGO (JSON)
          </button>
        </div>
      </div>

      {/* Toast Notifications */}
      {successToast && (
        <div className="bg-emerald-500/20 border border-emerald-500/50 text-emerald-300 text-xs font-bold p-3.5 rounded-2xl animate-fade-in flex items-center justify-between shadow-xl">
          <div className="flex items-center gap-2">
            <Check className="w-5 h-5 text-emerald-400 shrink-0" />
            <span>{successToast}</span>
          </div>
          <button onClick={() => setSuccessToast(null)} className="text-zinc-400 hover:text-white text-xs font-black uppercase">
            OK
          </button>
        </div>
      )}

      {errorMsg && (
        <div className="bg-red-500/20 border border-red-500/50 text-red-300 text-xs font-bold p-3.5 rounded-2xl animate-fade-in flex items-center justify-between shadow-xl">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-400 shrink-0" />
            <span>{errorMsg}</span>
          </div>
          <button onClick={() => setErrorMsg(null)} className="text-zinc-400 hover:text-white text-xs font-black uppercase">
            FECHAR
          </button>
        </div>
      )}

      {/* Search & Filters Toolbar */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-3.5 space-y-3 sm:space-y-0 sm:flex sm:items-center sm:justify-between gap-3 shadow-lg">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Pesquisar por torcida, clube ou estado..."
            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-9 pr-3 py-2 text-xs font-medium text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500/60"
          />
        </div>

        {/* State Filter */}
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-zinc-400 shrink-0" />
          <select
            value={selectedState}
            onChange={(e) => setSelectedState(e.target.value)}
            className="bg-zinc-950 border border-zinc-800 text-white rounded-xl px-2.5 py-2 text-xs font-bold focus:outline-none focus:border-amber-500/60"
          >
            <option value="ALL">Todos os Estados ({statesList.length})</option>
            {statesList.map((st) => (
              <option key={st} value={st}>
                UF: {st}
              </option>
            ))}
          </select>

          {/* Alliance Filter */}
          <select
            value={selectedAlliance}
            onChange={(e) => setSelectedAlliance(e.target.value)}
            className="bg-zinc-950 border border-zinc-800 text-white rounded-xl px-2.5 py-2 text-xs font-bold focus:outline-none focus:border-amber-500/60"
          >
            <option value="ALL">Todos os Eixos / Alianças</option>
            {ALLIANCE_AXES.map((ax) => (
              <option key={ax.id} value={ax.id}>
                {ax.id}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Global Datalist for Autocomplete of Torcidas */}
      <datalist id="registered-torcidas-list">
        {teams.map((t, index) => (
          <option key={`${t.clube}-${t.torcida}-${index}`} value={`${t.clube} (${t.torcida})`}>
            {t.clube} - {t.torcida} ({t.estado})
          </option>
        ))}
      </datalist>

      {/* Loading State */}
      {isLoading ? (
        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-12 text-center text-amber-400 animate-pulse font-bold text-sm">
          Carregando dados das torcidas de data/bancada_teams.json...
        </div>
      ) : (
        /* Team Cards List */
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-zinc-400 font-bold px-1">
            <span>Exibindo {filteredTeams.length} de {teams.length} Torcidas</span>
            <span>Edição direta em tempo real com Autocomplete</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredTeams.map((team) => {
              const realIndex = teams.findIndex(
                (t) => t.torcida === team.torcida && t.clube === team.clube
              );
              const idx = realIndex !== -1 ? realIndex : teams.indexOf(team);

              const defaultColors = getDefaultTorcidaColors(team.clube);
              const primaryHex = team.primaryColor || defaultColors.primary;
              const secondaryHex = team.secondaryColor || defaultColors.secondary;

              return (
                <div
                  key={`${team.clube}-${team.torcida}-${idx}`}
                  className="bg-zinc-900 border border-zinc-800 hover:border-amber-500/40 rounded-3xl p-4 shadow-xl space-y-3.5 transition-all text-left relative"
                >
                  {/* Card Header & Color Preview Badge */}
                  <div className="flex items-start justify-between gap-2 border-b border-zinc-800 pb-3">
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={team.torcida}
                          onChange={(e) => handleUpdateTeam(idx, "torcida", e.target.value)}
                          className="bg-zinc-950 border border-zinc-800 text-white font-black text-sm uppercase rounded-lg px-2 py-1 w-full focus:border-amber-500/60"
                        />
                      </div>
                      <div className="flex items-center gap-2 text-xs">
                        <span className="text-zinc-400 font-semibold">Clube:</span>
                        <input
                          type="text"
                          value={team.clube}
                          onChange={(e) => handleUpdateTeam(idx, "clube", e.target.value)}
                          className="bg-zinc-950 border border-zinc-800 text-amber-300 font-bold text-xs rounded-lg px-2 py-0.5 w-full focus:border-amber-500/60"
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {/* State & Tier inputs */}
                      <input
                        type="text"
                        value={team.estado}
                        onChange={(e) => handleUpdateTeam(idx, "estado", e.target.value.toUpperCase())}
                        maxLength={2}
                        className="bg-zinc-950 border border-zinc-800 text-white font-black text-xs uppercase rounded-lg px-1.5 py-1 w-10 text-center"
                      />
                      <select
                        value={team.tier}
                        onChange={(e) => handleUpdateTeam(idx, "tier", e.target.value)}
                        className="bg-zinc-950 border border-zinc-800 text-amber-400 font-black text-xs rounded-lg px-2 py-1"
                      >
                        {TIERS.map((tr) => (
                          <option key={tr} value={tr}>
                            Tier {tr}
                          </option>
                        ))}
                      </select>

                      <button
                        type="button"
                        onClick={() => handleDeleteTeam(idx)}
                        className="p-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 transition-all cursor-pointer"
                        title="Excluir Torcida"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Colors & Palette Selection */}
                  <div className="bg-zinc-950 p-3 rounded-2xl border border-zinc-800 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-amber-400 text-[10px] uppercase flex items-center gap-1">
                        <Palette className="w-3.5 h-3.5" /> Cores Oficiais da Agremiação:
                      </span>
                      {/* Live Badge Preview */}
                      <div className="flex items-center gap-1.5 bg-zinc-900 px-2 py-1 rounded-lg border border-zinc-800">
                        <span className="text-[9px] font-bold text-zinc-400">Preview:</span>
                        <div
                          className="w-4 h-4 rounded-full border border-white/20 shadow-sm"
                          style={{ backgroundColor: primaryHex }}
                        />
                        <div
                          className="w-4 h-4 rounded-full border border-white/20 shadow-sm"
                          style={{ backgroundColor: secondaryHex }}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="flex items-center gap-2 bg-zinc-900 p-2 rounded-xl border border-zinc-800">
                        <input
                          type="color"
                          value={primaryHex}
                          onChange={(e) => handleUpdateTeam(idx, "primaryColor", e.target.value)}
                          className="w-7 h-7 rounded-lg border border-zinc-700 bg-transparent cursor-pointer shrink-0"
                        />
                        <div className="flex-1">
                          <span className="text-[9px] font-bold text-zinc-400 block uppercase">Primária</span>
                          <input
                            type="text"
                            value={primaryHex}
                            onChange={(e) => handleUpdateTeam(idx, "primaryColor", e.target.value)}
                            className="bg-transparent text-white font-mono text-[10px] w-full focus:outline-none"
                          />
                        </div>
                      </div>

                      <div className="flex items-center gap-2 bg-zinc-900 p-2 rounded-xl border border-zinc-800">
                        <input
                          type="color"
                          value={secondaryHex}
                          onChange={(e) => handleUpdateTeam(idx, "secondaryColor", e.target.value)}
                          className="w-7 h-7 rounded-lg border border-zinc-700 bg-transparent cursor-pointer shrink-0"
                        />
                        <div className="flex-1">
                          <span className="text-[9px] font-bold text-zinc-400 block uppercase">Secundária</span>
                          <input
                            type="text"
                            value={secondaryHex}
                            onChange={(e) => handleUpdateTeam(idx, "secondaryColor", e.target.value)}
                            className="bg-transparent text-white font-mono text-[10px] w-full focus:outline-none"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Attributes Grid (Contingente, Bancada, Pista, Caravana, Finanças) */}
                  <div className="bg-zinc-950 p-3 rounded-2xl border border-zinc-800 space-y-2">
                    <span className="text-[10px] font-bold text-zinc-400 uppercase block">
                      ⚡ Atributos da Torcida (0 a 100 pts):
                    </span>
                    <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 text-xs">
                      <div className="bg-zinc-900 p-1.5 rounded-xl border border-zinc-800 text-center">
                        <span className="text-[8px] font-bold text-zinc-400 block uppercase flex items-center justify-center gap-0.5">
                          <Users className="w-3 h-3 text-amber-400" /> Massa
                        </span>
                        <input
                          type="number"
                          min={10}
                          max={100}
                          value={team.contingente}
                          onChange={(e) => handleUpdateTeam(idx, "contingente", parseInt(e.target.value) || 0)}
                          className="bg-zinc-950 text-amber-300 font-black text-xs text-center w-full rounded border border-zinc-800 mt-1"
                        />
                      </div>

                      <div className="bg-zinc-900 p-1.5 rounded-xl border border-zinc-800 text-center">
                        <span className="text-[8px] font-bold text-zinc-400 block uppercase flex items-center justify-center gap-0.5">
                          <Flame className="w-3 h-3 text-red-400" /> Bancada
                        </span>
                        <input
                          type="number"
                          min={10}
                          max={100}
                          value={team.pressao_bancada}
                          onChange={(e) => handleUpdateTeam(idx, "pressao_bancada", parseInt(e.target.value) || 0)}
                          className="bg-zinc-950 text-red-300 font-black text-xs text-center w-full rounded border border-zinc-800 mt-1"
                        />
                      </div>

                      <div className="bg-zinc-900 p-1.5 rounded-xl border border-zinc-800 text-center">
                        <span className="text-[8px] font-bold text-zinc-400 block uppercase flex items-center justify-center gap-0.5">
                          <Swords className="w-3 h-3 text-indigo-400" /> Pista
                        </span>
                        <input
                          type="number"
                          min={10}
                          max={100}
                          value={team.poder_pista}
                          onChange={(e) => handleUpdateTeam(idx, "poder_pista", parseInt(e.target.value) || 0)}
                          className="bg-zinc-950 text-indigo-300 font-black text-xs text-center w-full rounded border border-zinc-800 mt-1"
                        />
                      </div>

                      <div className="bg-zinc-900 p-1.5 rounded-xl border border-zinc-800 text-center">
                        <span className="text-[8px] font-bold text-zinc-400 block uppercase flex items-center justify-center gap-0.5">
                          <Bus className="w-3 h-3 text-emerald-400" /> Caravana
                        </span>
                        <input
                          type="number"
                          min={10}
                          max={100}
                          value={team.caravana}
                          onChange={(e) => handleUpdateTeam(idx, "caravana", parseInt(e.target.value) || 0)}
                          className="bg-zinc-950 text-emerald-300 font-black text-xs text-center w-full rounded border border-zinc-800 mt-1"
                        />
                      </div>

                      <div className="bg-zinc-900 p-1.5 rounded-xl border border-zinc-800 text-center col-span-3 sm:col-span-1">
                        <span className="text-[8px] font-bold text-zinc-400 block uppercase flex items-center justify-center gap-0.5">
                          <Wallet className="w-3 h-3 text-purple-400" /> Caixa
                        </span>
                        <input
                          type="number"
                          min={10}
                          max={100}
                          value={team.autonomia_financeira}
                          onChange={(e) => handleUpdateTeam(idx, "autonomia_financeira", parseInt(e.target.value) || 0)}
                          className="bg-zinc-950 text-purple-300 font-black text-xs text-center w-full rounded border border-zinc-800 mt-1"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Eixo de Aliança / União & Perfil */}
                  <div className="space-y-2">
                    <div>
                      <span className="text-[9px] font-bold text-zinc-400 uppercase block mb-1">
                        🤝 Eixo Diplomático / União:
                      </span>
                      <select
                        value={team.eixo_alianca}
                        onChange={(e) => handleUpdateTeam(idx, "eixo_alianca", e.target.value)}
                        className="bg-zinc-950 border border-zinc-800 text-white font-bold text-xs rounded-xl p-2 w-full focus:border-amber-500/60"
                      >
                        {ALLIANCE_AXES.map((ax) => (
                          <option key={ax.id} value={ax.id}>
                            {ax.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <span className="text-[9px] font-bold text-zinc-400 uppercase block mb-1">
                        📝 Perfil Predominante:
                      </span>
                      <input
                        type="text"
                        value={team.perfil_predominante}
                        onChange={(e) => handleUpdateTeam(idx, "perfil_predominante", e.target.value)}
                        className="bg-zinc-950 border border-zinc-800 text-zinc-200 text-xs rounded-xl p-2 w-full focus:border-amber-500/60"
                      />
                    </div>
                  </div>

                  {/* Rivalidades e Conexões Diplomáticas */}
                  {(() => {
                    const resolved = resolveTorcidaRivalries(team as any);
                    const mainPh = `${resolved.mainRival.clube} (${resolved.mainRival.torcida})`;
                    const secondPh = `${resolved.secondRival.clube} (${resolved.secondRival.torcida})`;
                    const allyPh = resolved.allyTorcida ? `${resolved.allyTorcida.clube} (${resolved.allyTorcida.torcida})` : "Sem Aliada Fixa";

                    return (
                      <div className="bg-zinc-950 p-3 rounded-2xl border border-zinc-800 space-y-2">
                        <span className="text-[10px] font-bold text-red-400 uppercase block flex items-center gap-1">
                          <Swords className="w-3.5 h-3.5 text-red-400" /> Rivalidades e Conexões Diplomáticas:
                        </span>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                          <div>
                            <span className="text-[9px] font-bold text-zinc-400 block uppercase mb-1">
                              🔥 Rival Principal:
                            </span>
                            <input
                              type="text"
                              list="registered-torcidas-list"
                              value={team.rival_principal || ""}
                              onChange={(e) => handleUpdateTeam(idx, "rival_principal", e.target.value)}
                              placeholder={mainPh}
                              className="bg-zinc-900 border border-zinc-800 text-red-300 font-bold text-xs rounded-xl p-2 w-full focus:border-red-500/60"
                            />
                          </div>

                          <div>
                            <span className="text-[9px] font-bold text-zinc-400 block uppercase mb-1">
                              ⚔️ Rival Secundário:
                            </span>
                            <input
                              type="text"
                              list="registered-torcidas-list"
                              value={team.rival_secundario || ""}
                              onChange={(e) => handleUpdateTeam(idx, "rival_secundario", e.target.value)}
                              placeholder={secondPh}
                              className="bg-zinc-900 border border-zinc-800 text-amber-300 font-bold text-xs rounded-xl p-2 w-full focus:border-amber-500/60"
                            />
                          </div>

                          <div>
                            <span className="text-[9px] font-bold text-zinc-400 block uppercase mb-1">
                              🤝 Torcida Aliada:
                            </span>
                            <input
                              type="text"
                              list="registered-torcidas-list"
                              value={team.torcida_aliada || ""}
                              onChange={(e) => handleUpdateTeam(idx, "torcida_aliada", e.target.value)}
                              placeholder={allyPh}
                              className="bg-zinc-900 border border-zinc-800 text-emerald-300 font-bold text-xs rounded-xl p-2 w-full focus:border-emerald-500/60"
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
