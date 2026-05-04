"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import {
  Search,
  Check,
  ChevronDown,
  Star,
  CircleCheck,
  CircleSlash,
  ChevronRight,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface ComboboxOption {
  /** ID único usado como value */
  id: string;
  /** Nome principal (ex: "Pet Derma") */
  name: string;
  /** Identificador secundário (ex: "act_1856518087872503" ou "1234567890") */
  subId?: string;
  /** Status: 'ativa' | 'inativa' | 'teste' | etc */
  status?: "ativa" | "inativa" | "teste" | "outra";
  /** Badges secundários (ex: ['BRL', 'Marina Saleme [BM]']) */
  badges?: string[];
  /** Texto adicional buscável (não exibido) */
  searchExtra?: string;
}

interface AccountComboboxProps {
  /** Opções a exibir */
  options: ComboboxOption[];
  /** ID atualmente selecionado */
  value: string;
  /** Callback de mudança */
  onChange: (id: string) => void;
  /** Placeholder quando nada selecionado */
  placeholder?: string;
  /** Texto p/ destacar como "sugerido" (ex: nome do cliente) */
  sugestaoMatch?: string;
  /** Permite limpar seleção */
  clearable?: boolean;
  /** Disabled state */
  disabled?: boolean;
  /** Empty state custom */
  emptyText?: string;
}

/**
 * Combobox com busca, agrupamento (sugeridas/ativas/inativas) e badges visuais.
 * Substitui <select> nativo pra listas grandes (10+ opções).
 */
export function AccountCombobox({
  options,
  value,
  onChange,
  placeholder = "Selecione...",
  sugestaoMatch,
  clearable = false,
  disabled = false,
  emptyText = "Nenhuma opção encontrada",
}: AccountComboboxProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [showInativas, setShowInativas] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const selected = options.find((o) => o.id === value);

  // Filtra por query
  const filtered = useMemo(() => {
    if (!query.trim()) return options;
    const q = query.toLowerCase().trim();
    return options.filter(
      (o) =>
        o.name.toLowerCase().includes(q) ||
        o.subId?.toLowerCase().includes(q) ||
        o.searchExtra?.toLowerCase().includes(q) ||
        o.badges?.some((b) => b.toLowerCase().includes(q))
    );
  }, [options, query]);

  // Agrupa
  const { sugeridas, ativas, inativas } = useMemo(() => {
    const matchTokens = (sugestaoMatch ?? "")
      .toLowerCase()
      .split(/[\s_-]+/)
      .filter((t) => t.length >= 3);

    const matchesSugestao = (o: ComboboxOption) => {
      if (matchTokens.length === 0) return false;
      const hay = `${o.name} ${o.subId ?? ""} ${o.searchExtra ?? ""}`.toLowerCase();
      return matchTokens.some((t) => hay.includes(t));
    };

    const sug: ComboboxOption[] = [];
    const ati: ComboboxOption[] = [];
    const ina: ComboboxOption[] = [];

    for (const o of filtered) {
      if (o.status === "inativa") {
        ina.push(o);
      } else if (matchesSugestao(o)) {
        sug.push(o);
      } else {
        ati.push(o);
      }
    }
    return { sugeridas: sug, ativas: ati, inativas: ina };
  }, [filtered, sugestaoMatch]);

  // Fecha ao clicar fora
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        setQuery("");
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  // Auto-focus no input ao abrir
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  const handleSelect = (id: string) => {
    onChange(id);
    setOpen(false);
    setQuery("");
  };

  return (
    <div ref={containerRef} className="relative w-full">
      {/* Trigger */}
      <button
        type="button"
        onClick={() => !disabled && setOpen((o) => !o)}
        disabled={disabled}
        className={cn(
          "w-full h-10 px-3 rounded-md border border-input bg-background text-sm text-left flex items-center gap-2 transition-colors",
          "hover:border-[var(--ddg-orange)]/40 focus:outline-none focus:ring-2 focus:ring-ring",
          disabled && "opacity-50 cursor-not-allowed",
          open && "border-[var(--ddg-orange)]/60 ring-2 ring-[var(--ddg-orange)]/20"
        )}
      >
        <div className="flex-1 min-w-0">
          {selected ? (
            <div className="flex items-center gap-2 min-w-0">
              <span className="font-medium truncate">{selected.name}</span>
              {selected.subId && (
                <span className="text-[10px] font-mono text-muted-foreground truncate">
                  {selected.subId}
                </span>
              )}
            </div>
          ) : (
            <span className="text-muted-foreground">{placeholder}</span>
          )}
        </div>
        {clearable && selected && !disabled && (
          <span
            role="button"
            tabIndex={0}
            onClick={(e) => {
              e.stopPropagation();
              onChange("");
            }}
            className="size-5 rounded-full hover:bg-muted flex items-center justify-center"
            aria-label="Limpar seleção"
          >
            <X className="size-3 text-muted-foreground" />
          </span>
        )}
        <ChevronDown
          className={cn(
            "size-4 text-muted-foreground transition-transform shrink-0",
            open && "rotate-180"
          )}
        />
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute z-50 mt-1 w-full rounded-md border border-border bg-popover shadow-lg overflow-hidden animate-in fade-in-0 zoom-in-95 slide-in-from-top-2 duration-150">
          {/* Search */}
          <div className="p-2 border-b border-border">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar por nome, ID ou BM..."
                className="w-full h-8 pl-8 pr-2 rounded-md bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring border border-input"
              />
            </div>
            <div className="flex items-center justify-between mt-1.5 px-1">
              <span className="text-[10px] text-muted-foreground">
                {filtered.length} de {options.length}
                {options.length > filtered.length && " (filtradas)"}
              </span>
              {inativas.length > 0 && (
                <span className="text-[10px] text-muted-foreground">
                  {inativas.length} inativa{inativas.length > 1 ? "s" : ""}
                </span>
              )}
            </div>
          </div>

          {/* Lista */}
          <div className="max-h-[320px] overflow-y-auto py-1">
            {filtered.length === 0 && (
              <div className="px-3 py-8 text-center text-xs text-muted-foreground">
                {emptyText}
              </div>
            )}

            {/* Sugeridas */}
            {sugeridas.length > 0 && (
              <Group
                label={`Sugeridas pra "${sugestaoMatch}"`}
                icon={<Star className="size-3 text-amber-400 fill-amber-400" />}
                count={sugeridas.length}
              >
                {sugeridas.map((o) => (
                  <Item
                    key={o.id}
                    option={o}
                    selected={o.id === value}
                    onSelect={handleSelect}
                    query={query}
                    highlight
                  />
                ))}
              </Group>
            )}

            {/* Ativas */}
            {ativas.length > 0 && (
              <Group
                label="Ativas"
                icon={<CircleCheck className="size-3 text-emerald-500" />}
                count={ativas.length}
              >
                {ativas.map((o) => (
                  <Item
                    key={o.id}
                    option={o}
                    selected={o.id === value}
                    onSelect={handleSelect}
                    query={query}
                  />
                ))}
              </Group>
            )}

            {/* Inativas (collapse) */}
            {inativas.length > 0 && (
              <div className="border-t border-border mt-1">
                <button
                  type="button"
                  onClick={() => setShowInativas((s) => !s)}
                  className="w-full px-3 py-2 flex items-center gap-2 text-[10px] uppercase tracking-wider text-muted-foreground hover:bg-muted/50 transition-colors"
                >
                  <ChevronRight
                    className={cn(
                      "size-3 transition-transform",
                      showInativas && "rotate-90"
                    )}
                  />
                  <CircleSlash className="size-3" />
                  Inativas
                  <span className="ml-auto bg-muted text-muted-foreground rounded px-1.5 py-0.5 text-[9px]">
                    {inativas.length}
                  </span>
                </button>
                {showInativas && (
                  <div className="pb-1">
                    {inativas.map((o) => (
                      <Item
                        key={o.id}
                        option={o}
                        selected={o.id === value}
                        onSelect={handleSelect}
                        query={query}
                        muted
                      />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function Group({
  label,
  icon,
  count,
  children,
}: {
  label: string;
  icon: React.ReactNode;
  count: number;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="px-3 py-1.5 flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-muted-foreground bg-muted/30">
        {icon}
        {label}
        <span className="ml-auto bg-background border border-border rounded px-1.5 py-0.5 text-[9px]">
          {count}
        </span>
      </div>
      <div className="py-0.5">{children}</div>
    </div>
  );
}

function Item({
  option,
  selected,
  onSelect,
  query,
  highlight,
  muted,
}: {
  option: ComboboxOption;
  selected: boolean;
  onSelect: (id: string) => void;
  query: string;
  highlight?: boolean;
  muted?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={() => onSelect(option.id)}
      className={cn(
        "w-full px-3 py-2 flex items-start gap-2 text-left transition-colors text-xs hover:bg-muted/50",
        selected && "bg-[var(--ddg-orange)]/10 hover:bg-[var(--ddg-orange)]/15",
        highlight && !selected && "bg-amber-500/[0.03]",
        muted && "opacity-60"
      )}
    >
      <div className="size-4 shrink-0 mt-0.5 flex items-center justify-center">
        {selected ? (
          <Check className="size-3.5 text-[var(--ddg-orange)]" />
        ) : (
          <span className="size-3 rounded-full border border-border" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 flex-wrap">
          <HighlightedText text={option.name} query={query} className="font-medium" />
          {option.badges?.map((b, i) => (
            <span
              key={i}
              className="text-[9px] font-medium bg-muted text-muted-foreground px-1 py-0.5 rounded border border-border"
            >
              {b}
            </span>
          ))}
        </div>
        {option.subId && (
          <div className="text-[10px] font-mono text-muted-foreground mt-0.5 truncate">
            <HighlightedText text={option.subId} query={query} />
          </div>
        )}
        {option.searchExtra && (
          <div className="text-[10px] text-muted-foreground mt-0.5 truncate">
            <HighlightedText text={option.searchExtra} query={query} />
          </div>
        )}
      </div>
      {option.status === "teste" && (
        <span className="text-[9px] font-medium bg-blue-500/10 text-blue-400 px-1 py-0.5 rounded border border-blue-500/30">
          TESTE
        </span>
      )}
    </button>
  );
}

function HighlightedText({
  text,
  query,
  className,
}: {
  text: string;
  query: string;
  className?: string;
}) {
  if (!query.trim()) return <span className={className}>{text}</span>;
  const q = query.trim();
  const idx = text.toLowerCase().indexOf(q.toLowerCase());
  if (idx === -1) return <span className={className}>{text}</span>;
  return (
    <span className={className}>
      {text.slice(0, idx)}
      <mark className="bg-[var(--ddg-orange)]/30 text-foreground rounded px-0.5">
        {text.slice(idx, idx + q.length)}
      </mark>
      {text.slice(idx + q.length)}
    </span>
  );
}
