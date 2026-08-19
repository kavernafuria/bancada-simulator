"use client";

import React, { useState, useEffect, useRef } from "react";
import { Search, Loader2, Plus, AlertCircle } from "lucide-react";
import { PlayerData } from "./PlayerCard";
import { PlayerAvatar } from "./PlayerAvatar";

interface AutocompleteProps {
  onSelectPlayer: (player: PlayerData) => void;
  disabled?: boolean;
  usedPlayerIds: string[];
  isLoadingValidation?: boolean;
}

export function Autocomplete({
  onSelectPlayer,
  disabled,
  usedPlayerIds,
  isLoadingValidation,
}: AutocompleteProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<PlayerData[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/players/search?q=${encodeURIComponent(query)}`);
        if (res.ok) {
          const data = await res.json();
          setResults(data);
        }
      } catch (err) {
        console.error("Erro na busca de jogadores:", err);
      } finally {
        setIsSearching(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (player: PlayerData) => {
    if (usedPlayerIds.includes(player.id)) return;
    onSelectPlayer(player);
    setQuery("");
    setResults([]);
    setIsOpen(false);
  };

  return (
    <div className="relative w-full my-2" ref={dropdownRef}>
      <div className="relative flex items-center">
        <div className="absolute left-3.5 text-zinc-400 pointer-events-none">
          {isLoadingValidation || isSearching ? (
            <Loader2 className="w-5 h-5 animate-spin text-kavers-purple dark:text-purple-400" />
          ) : (
            <Search className="w-5 h-5 text-zinc-400" />
          )}
        </div>

        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          disabled={disabled || isLoadingValidation}
          placeholder={
            disabled
              ? "Fase Concluída! 🎉"
              : "Digite o nome do próximo jogador..."
          }
          className="w-full bg-paper-card dark:bg-kavers-card border-2 border-paper-border dark:border-kavers-border focus:border-kavers-purple dark:focus:border-purple-500 text-zinc-900 dark:text-white placeholder-zinc-400 rounded-2xl pl-11 pr-4 py-3.5 text-sm font-semibold shadow-lg focus:outline-none focus:ring-2 focus:ring-kavers-purple/20 transition-all disabled:opacity-50"
        />
      </div>

      {isOpen && query.trim().length > 0 && (
        <div className="absolute left-0 right-0 top-full mt-2 bg-paper-card/95 dark:bg-kavers-card/95 border-2 border-paper-border dark:border-kavers-border rounded-2xl shadow-2xl overflow-hidden z-50 max-h-64 overflow-y-auto backdrop-blur-xl">
          {isSearching ? (
            <div className="p-4 text-center text-zinc-500 dark:text-zinc-400 text-sm flex items-center justify-center gap-2 font-bold">
              <Loader2 className="w-4 h-4 animate-spin text-kavers-purple" />
              Buscando na base de craques...
            </div>
          ) : results.length > 0 ? (
            <ul className="divide-y divide-paper-border dark:divide-kavers-border">
              {results.map((player) => {
                const isAlreadyUsed = usedPlayerIds.includes(player.id);

                return (
                  <li key={player.id}>
                    <button
                      onClick={() => handleSelect(player)}
                      disabled={isAlreadyUsed}
                      className={`w-full text-left p-3 flex items-center gap-3 transition-colors ${
                        isAlreadyUsed
                          ? "opacity-40 cursor-not-allowed bg-paper-light/40 dark:bg-kavers-dark/40"
                          : "hover:bg-paper-border/40 dark:hover:bg-kavers-border/40 active:bg-paper-border dark:active:bg-kavers-border"
                      }`}
                    >
                      <PlayerAvatar
                        photo={player.photoUrl}
                        name={player.name}
                        country={player.nationality}
                        size="sm"
                      />

                      <div className="flex-1 min-w-0">
                        <div className="font-black text-zinc-900 dark:text-white text-sm truncate">
                          {player.name}
                        </div>
                        <div className="text-xs text-zinc-500 dark:text-zinc-400 truncate font-medium">
                          {player.club} {player.nationality ? `• ${player.nationality}` : ""}
                        </div>
                      </div>

                      {isAlreadyUsed ? (
                        <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30 shrink-0 uppercase tracking-wider">
                          Na corrente
                        </span>
                      ) : (
                        <Plus className="w-4 h-4 text-kavers-purple shrink-0 stroke-[2.5]" />
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          ) : (
            <div className="p-4 text-center text-zinc-500 dark:text-zinc-400 text-sm flex flex-col items-center gap-1 font-semibold">
              <AlertCircle className="w-5 h-5 text-zinc-400" />
              Nenhum jogador encontrado para &quot;{query}&quot;
            </div>
          )}
        </div>
      )}
    </div>
  );
}
