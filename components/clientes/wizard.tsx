"use client";

import { useState, useTransition } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Building2,
  ShoppingBag,
  MessageSquare,
  Layers,
  CheckCircle2,
  Save,
  ArrowLeft,
  ArrowRight,
  Loader2,
  XCircle,
  AlertCircle,
  Globe,
  Webhook,
  Sparkles,
  ChevronRight,
} from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { createCliente, type TipoNegocio, type CreateClienteInput } from "@/lib/actions/clientes";

const TIPOS: {
  value: TipoNegocio;
  label: string;
  icon: typeof Building2;
  desc: string;
  examples: string[];
  color: string;
  paineis: string[];
  kpis: string[];
}[] = [
  {
    value: "lead_whatsapp",
    label: "Lead/WhatsApp",
    icon: MessageSquare,
    desc: "Campanhas que direcionam pra WhatsApp. Vendas fechadas no chat.",
    examples: ["Petderma", "Clínicas", "Serviços", "Imobiliárias"],
    color: "text-violet-400 bg-violet-500/10 border-violet-500/30",
    paineis: ["Vendas Manuais", "CTWA Tracking", "CPL/CAC Real"],
    kpis: ["CPL", "Leads gerados", "Leads fechados", "CAC real", "Ticket médio", "ROAS real"],
  },
  {
    value: "ecommerce",
    label: "E-commerce",
    icon: ShoppingBag,
    desc: "Loja online. Venda no checkout do site.",
    examples: ["Marina Saleme", "Shopify shops", "Nuvemshop"],
    color: "text-blue-400 bg-blue-500/10 border-blue-500/30",
    paineis: ["Carrinho Abandonado", "ROAS por produto", "Funil de Checkout"],
    kpis: ["ROAS", "Receita", "CPA", "Add to Cart", "Iniciaram Checkout", "Compras"],
  },
  {
    value: "hibrido",
    label: "Híbrido",
    icon: Layers,
    desc: "Vende via site E também via WhatsApp.",
    examples: ["Moda + atendimento", "Educação", "Estética"],
    color: "text-amber-400 bg-amber-500/10 border-amber-500/30",
    paineis: ["Tudo: Vendas Manuais + Carrinho", "Visão dupla"],
    kpis: ["Todos do Lead/WPP + todos do E-commerce"],
  },
];

const STEPS = [
  { id: 1, label: "Identidade" },
  { id: 2, label: "Tipo de Negócio" },
  { id: 3, label: "Meta Ads" },
  { id: 4, label: "Google Ads" },
  { id: 5, label: "Específico" },
  { id: 6, label: "Confirmação" },
];

interface WizardProps {
  onClose: () => void;
}

export function ClienteWizard({ onClose }: WizardProps) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [pending, startTransition] = useTransition();

  // Step 1
  const [nome, setNome] = useState("");
  const [slug, setSlug] = useState("");
  const [corPrimaria, setCorPrimaria] = useState("#F15839");

  // Step 2
  const [tipo, setTipo] = useState<TipoNegocio | null>(null);

  // Step 3 - Meta
  const [metaConectado, setMetaConectado] = useState(false);

  // Step 4 - Google
  const [googleConectado, setGoogleConectado] = useState(false);

  // Step 5 - Específico
  // ecommerce
  const [plataformaEcom, setPlataformaEcom] = useState("");
  const [dominioSite, setDominioSite] = useState("");
  const [pixelInstalado, setPixelInstalado] = useState(false);
  const [webhookCarrinho, setWebhookCarrinho] = useState(false);
  // lead_whatsapp
  const [frequencia, setFrequencia] = useState<"semanal" | "quinzenal" | "mensal">("semanal");
  const [painelComercialTipo, setPainelComercialTipo] = useState("");
  const [painelComercialUrl, setPainelComercialUrl] = useState("");
  // comuns
  const [cacMaximo, setCacMaximo] = useState("");
  const [ticketMedio, setTicketMedio] = useState("");
  const [observacoes, setObservacoes] = useState("");

  const slugify = (s: string) =>
    s
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

  // Validação por step
  const canProceed = () => {
    if (step === 1) return nome.length >= 2 && slug.length >= 3;
    if (step === 2) return tipo !== null;
    if (step === 3) return true; // skip ok
    if (step === 4) return true; // skip ok
    if (step === 5) return true;
    return true;
  };

  const handleSubmit = () => {
    if (!tipo) return;
    startTransition(async () => {
      const input: CreateClienteInput = {
        nome,
        slug,
        cor_primaria: corPrimaria,
        tipo_negocio: tipo,
        cac_maximo: cacMaximo ? parseFloat(cacMaximo) : null,
        ticket_medio: ticketMedio ? parseFloat(ticketMedio) : null,
        plataforma_ecom: plataformaEcom || null,
        dominio_site: dominioSite || null,
        pixel_instalado: pixelInstalado,
        webhook_carrinho_abandonado: webhookCarrinho,
        frequencia_vendas_manuais: tipo === "ecommerce" ? undefined : frequencia,
        painel_comercial_tipo: painelComercialTipo || null,
        painel_comercial_url: painelComercialUrl || null,
        observacoes: observacoes || null,
      };

      const res = await createCliente(input);
      if (!res.ok) {
        toast.error("Erro ao criar cliente", { description: res.error });
        return;
      }
      toast.success("Cliente criado com sucesso!", {
        description: `${nome} foi cadastrado. Próximo passo: conectar Meta e Google Ads.`,
      });
      onClose();
      router.refresh();
    });
  };

  const tipoSelecionado = TIPOS.find((t) => t.value === tipo);

  return (
    <Card className="border-[var(--ddg-orange)]/40 ddg-gradient-subtle">
      <CardContent className="p-0">
        {/* Stepper */}
        <div className="px-6 py-4 border-b border-border">
          <div className="flex items-center justify-between gap-2">
            {STEPS.map((s, idx) => {
              const isCurrent = step === s.id;
              const isDone = step > s.id;
              return (
                <div key={s.id} className="flex items-center flex-1">
                  <div className="flex items-center gap-2">
                    <div
                      className={cn(
                        "size-7 rounded-full flex items-center justify-center text-xs font-bold transition-all shrink-0",
                        isCurrent && "bg-[var(--ddg-orange)] text-white ring-4 ring-[var(--ddg-orange)]/20",
                        isDone && "bg-emerald-500 text-white",
                        !isCurrent && !isDone && "bg-muted text-muted-foreground"
                      )}
                    >
                      {isDone ? <CheckCircle2 className="size-4" /> : s.id}
                    </div>
                    <span
                      className={cn(
                        "text-xs font-medium hidden md:inline",
                        isCurrent ? "text-foreground" : "text-muted-foreground"
                      )}
                    >
                      {s.label}
                    </span>
                  </div>
                  {idx < STEPS.length - 1 && (
                    <div
                      className={cn(
                        "flex-1 h-px mx-2 transition-colors",
                        isDone ? "bg-emerald-500" : "bg-border"
                      )}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Body */}
        <div className="p-6 min-h-[420px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              {step === 1 && (
                <div className="space-y-5">
                  <div>
                    <h3 className="text-lg font-semibold mb-1">Identidade do cliente</h3>
                    <p className="text-sm text-muted-foreground">
                      Como esse cliente vai aparecer no painel
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium">Nome *</label>
                      <Input
                        required
                        autoFocus
                        value={nome}
                        onChange={(e) => {
                          setNome(e.target.value);
                          if (!slug || slug === slugify(nome))
                            setSlug(slugify(e.target.value));
                        }}
                        placeholder="Marina Saleme"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium">Slug (URL) *</label>
                      <Input
                        required
                        value={slug}
                        onChange={(e) => setSlug(slugify(e.target.value))}
                        placeholder="marina-saleme"
                      />
                      <p className="text-[10px] text-muted-foreground">
                        Será acessível em /cliente/{slug || "exemplo"}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium">Cor primária da marca</label>
                    <div className="flex gap-2 max-w-xs">
                      <input
                        type="color"
                        value={corPrimaria}
                        onChange={(e) => setCorPrimaria(e.target.value)}
                        className="h-9 w-12 rounded-md border border-input cursor-pointer"
                      />
                      <Input
                        value={corPrimaria}
                        onChange={(e) => setCorPrimaria(e.target.value)}
                        className="flex-1 font-mono"
                      />
                    </div>
                    <p className="text-[10px] text-muted-foreground">
                      Será usada como destaque no dashboard quando esse cliente estiver ativo
                    </p>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold mb-1">Tipo de Negócio</h3>
                    <p className="text-sm text-muted-foreground">
                      Define quais painéis e KPIs serão exibidos pra esse cliente
                    </p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {TIPOS.map((t) => {
                      const Icon = t.icon;
                      const selected = tipo === t.value;
                      return (
                        <button
                          key={t.value}
                          type="button"
                          onClick={() => setTipo(t.value)}
                          className={cn(
                            "relative text-left p-4 rounded-lg border-2 transition-all",
                            selected
                              ? `${t.color} ring-2 ring-[var(--ddg-orange)] scale-[1.02]`
                              : "border-border hover:border-[var(--ddg-orange)]/40 bg-card"
                          )}
                        >
                          {selected && (
                            <CheckCircle2 className="absolute top-3 right-3 size-5 text-[var(--ddg-orange)]" />
                          )}
                          <Icon className="size-7 mb-3" />
                          <p className="font-bold text-base mb-1">{t.label}</p>
                          <p className="text-xs text-muted-foreground mb-3 leading-relaxed">
                            {t.desc}
                          </p>
                          <div className="space-y-1.5 pt-3 border-t border-border/50">
                            <p className="text-[10px] uppercase tracking-widest text-muted-foreground/70">
                              Exemplos
                            </p>
                            <p className="text-xs">{t.examples.slice(0, 3).join(" · ")}</p>
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {tipoSelecionado && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="rounded-lg border border-[var(--ddg-orange)]/30 bg-[var(--ddg-orange)]/5 p-4"
                    >
                      <p className="text-xs uppercase tracking-widest text-[var(--ddg-orange)] font-bold mb-3">
                        🎯 Esse cliente verá:
                      </p>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs font-semibold mb-1.5">Painéis disponíveis</p>
                          <ul className="space-y-1">
                            {tipoSelecionado.paineis.map((p) => (
                              <li key={p} className="text-xs text-muted-foreground flex items-center gap-1.5">
                                <ChevronRight className="size-3 text-[var(--ddg-orange)]" />
                                {p}
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <p className="text-xs font-semibold mb-1.5">KPIs principais</p>
                          <ul className="space-y-1">
                            {tipoSelecionado.kpis.map((k) => (
                              <li key={k} className="text-xs text-muted-foreground flex items-center gap-1.5">
                                <ChevronRight className="size-3 text-[var(--ddg-orange)]" />
                                {k}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </div>
              )}

              {step === 3 && (
                <ConexaoStep
                  titulo="Conectar Meta Ads"
                  descricao="Acesso ao Business Manager para puxar campanhas, ads e enviar conversões via CAPI"
                  icone={MessageSquare}
                  cor="bg-violet-500/10 text-violet-400"
                  conectado={metaConectado}
                  onConectar={() => {
                    setMetaConectado(true);
                    toast.success("Meta marcado como conectar depois", {
                      description: "Você poderá conectar via OAuth na página de Configurações.",
                    });
                  }}
                  badges={["OAuth Business", "Pixel ID", "Ad Account ID", "CAPI"]}
                />
              )}

              {step === 4 && (
                <ConexaoStep
                  titulo="Conectar Google Ads"
                  descricao="Acesso à conta Google Ads para puxar campanhas e enviar Enhanced Conversions"
                  icone={Sparkles}
                  cor="bg-blue-500/10 text-blue-400"
                  conectado={googleConectado}
                  onConectar={() => {
                    setGoogleConectado(true);
                    toast.success("Google marcado como conectar depois", {
                      description: "Aguardando aprovação do developer token DDG (3-7 dias).",
                    });
                  }}
                  badges={["OAuth Google", "Customer ID", "Conversion Action", "Enhanced Conv."]}
                />
              )}

              {step === 5 && (
                <div className="space-y-5">
                  <div>
                    <h3 className="text-lg font-semibold mb-1">
                      Configurações do {tipoSelecionado?.label}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Específicas pro tipo de negócio escolhido
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium">CAC máximo (R$)</label>
                      <Input
                        type="number"
                        step="0.01"
                        value={cacMaximo}
                        onChange={(e) => setCacMaximo(e.target.value)}
                        placeholder="80"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium">Ticket médio (R$)</label>
                      <Input
                        type="number"
                        step="0.01"
                        value={ticketMedio}
                        onChange={(e) => setTicketMedio(e.target.value)}
                        placeholder="250"
                      />
                    </div>
                  </div>

                  {(tipo === "ecommerce" || tipo === "hibrido") && (
                    <div className="rounded-lg border border-blue-500/30 bg-blue-500/5 p-4 space-y-3">
                      <p className="text-xs uppercase tracking-widest text-blue-400 font-bold flex items-center gap-2">
                        <ShoppingBag className="size-3.5" />
                        E-commerce
                      </p>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                          <label className="text-xs">Plataforma</label>
                          <select
                            value={plataformaEcom}
                            onChange={(e) => setPlataformaEcom(e.target.value)}
                            className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
                          >
                            <option value="">Selecione...</option>
                            <option value="shopify">Shopify</option>
                            <option value="nuvemshop">Nuvemshop</option>
                            <option value="woocommerce">WooCommerce</option>
                            <option value="vtex">VTEX</option>
                            <option value="custom">Custom</option>
                          </select>
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs">Domínio do site</label>
                          <Input
                            value={dominioSite}
                            onChange={(e) => setDominioSite(e.target.value)}
                            placeholder="marinasaleme.com.br"
                          />
                        </div>
                      </div>
                      <div className="flex flex-col gap-2">
                        <label className="flex items-center gap-2 text-xs cursor-pointer">
                          <input
                            type="checkbox"
                            checked={pixelInstalado}
                            onChange={(e) => setPixelInstalado(e.target.checked)}
                            className="size-4 rounded accent-[var(--ddg-orange)]"
                          />
                          Pixel/GTM já instalado no site
                        </label>
                        <label className="flex items-center gap-2 text-xs cursor-pointer">
                          <input
                            type="checkbox"
                            checked={webhookCarrinho}
                            onChange={(e) => setWebhookCarrinho(e.target.checked)}
                            className="size-4 rounded accent-[var(--ddg-orange)]"
                          />
                          Webhook de carrinho abandonado disponível
                        </label>
                      </div>
                    </div>
                  )}

                  {(tipo === "lead_whatsapp" || tipo === "hibrido") && (
                    <div className="rounded-lg border border-violet-500/30 bg-violet-500/5 p-4 space-y-3">
                      <p className="text-xs uppercase tracking-widest text-violet-400 font-bold flex items-center gap-2">
                        <MessageSquare className="size-3.5" />
                        Lead/WhatsApp
                      </p>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                          <label className="text-xs">Frequência de vendas manuais</label>
                          <select
                            value={frequencia}
                            onChange={(e) => setFrequencia(e.target.value as typeof frequencia)}
                            className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
                          >
                            <option value="semanal">Semanal</option>
                            <option value="quinzenal">Quinzenal</option>
                            <option value="mensal">Mensal</option>
                          </select>
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs">Painel comercial</label>
                          <select
                            value={painelComercialTipo}
                            onChange={(e) => setPainelComercialTipo(e.target.value)}
                            className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
                          >
                            <option value="">Sem painel</option>
                            <option value="crm_proprio">CRM próprio</option>
                            <option value="planilha">Planilha</option>
                            <option value="chatwoot">Chatwoot</option>
                            <option value="outro">Outro</option>
                          </select>
                        </div>
                      </div>
                      {painelComercialTipo && painelComercialTipo !== "" && (
                        <div className="space-y-1.5">
                          <label className="text-xs">URL do painel comercial</label>
                          <Input
                            value={painelComercialUrl}
                            onChange={(e) => setPainelComercialUrl(e.target.value)}
                            placeholder="https://..."
                          />
                        </div>
                      )}
                    </div>
                  )}

                  <div className="space-y-1.5">
                    <label className="text-xs font-medium">Observações (opcional)</label>
                    <textarea
                      rows={2}
                      value={observacoes}
                      onChange={(e) => setObservacoes(e.target.value)}
                      placeholder="Particularidades, contexto inicial, etc."
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm resize-none"
                    />
                  </div>
                </div>
              )}

              {step === 6 && tipoSelecionado && (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold mb-1">Confirmação</h3>
                    <p className="text-sm text-muted-foreground">
                      Revise antes de criar
                    </p>
                  </div>

                  <div className="rounded-lg border border-border p-4 space-y-3">
                    <div className="flex items-center gap-3 pb-3 border-b border-border">
                      <div
                        className="size-12 rounded-lg flex items-center justify-center"
                        style={{ background: `${corPrimaria}20`, color: corPrimaria }}
                      >
                        <Building2 className="size-6" />
                      </div>
                      <div className="flex-1">
                        <p className="font-bold text-base">{nome}</p>
                        <p className="text-xs text-muted-foreground">/{slug}</p>
                      </div>
                      <Badge className={tipoSelecionado.color}>
                        {tipoSelecionado.label}
                      </Badge>
                    </div>

                    <SummaryRow label="Tipo de negócio" value={tipoSelecionado.label} />
                    {cacMaximo && <SummaryRow label="CAC máximo" value={`R$ ${cacMaximo}`} />}
                    {ticketMedio && <SummaryRow label="Ticket médio" value={`R$ ${ticketMedio}`} />}
                    {plataformaEcom && <SummaryRow label="Plataforma" value={plataformaEcom} />}
                    {dominioSite && <SummaryRow label="Domínio" value={dominioSite} />}
                    {tipo !== "ecommerce" && <SummaryRow label="Frequência vendas manuais" value={frequencia} />}
                    {painelComercialTipo && <SummaryRow label="Painel comercial" value={painelComercialTipo} />}
                  </div>

                  <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-4">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="size-5 text-amber-400 mt-0.5 shrink-0" />
                      <div className="flex-1">
                        <p className="text-sm font-semibold mb-1">Pendências de conexão</p>
                        <p className="text-xs text-muted-foreground mb-3">
                          O cliente será criado, mas as conexões abaixo precisam ser feitas em Configurações:
                        </p>
                        <div className="flex flex-wrap gap-2">
                          <Badge variant="outline" className="gap-1">
                            <XCircle className="size-3 text-muted-foreground" />
                            Meta Ads
                          </Badge>
                          <Badge variant="outline" className="gap-1">
                            <XCircle className="size-3 text-muted-foreground" />
                            Google Ads
                          </Badge>
                          <Badge variant="outline" className="gap-1">
                            <XCircle className="size-3 text-muted-foreground" />
                            Painel Comercial (webhook)
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-border flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={onClose}>
            Cancelar
          </Button>
          <div className="flex gap-2">
            {step > 1 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setStep(step - 1)}
                disabled={pending}
              >
                <ArrowLeft className="size-4" />
                Voltar
              </Button>
            )}
            {step < 6 ? (
              <Button
                variant="ddg"
                size="sm"
                onClick={() => setStep(step + 1)}
                disabled={!canProceed() || pending}
                className="gap-1"
              >
                Próximo
                <ArrowRight className="size-4" />
              </Button>
            ) : (
              <Button
                variant="ddg"
                size="sm"
                onClick={handleSubmit}
                disabled={pending}
                className="gap-2"
              >
                {pending && <Loader2 className="size-4 animate-spin" />}
                {!pending && <Save className="size-4" />}
                {pending ? "Criando..." : "Criar cliente"}
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function ConexaoStep({
  titulo,
  descricao,
  icone: Icon,
  cor,
  conectado,
  onConectar,
  badges,
}: {
  titulo: string;
  descricao: string;
  icone: typeof MessageSquare;
  cor: string;
  conectado: boolean;
  onConectar: () => void;
  badges: string[];
}) {
  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-lg font-semibold mb-1">{titulo}</h3>
        <p className="text-sm text-muted-foreground">{descricao}</p>
      </div>

      <Card className={cn("border-2", conectado ? "border-emerald-500/40 bg-emerald-500/5" : "border-border")}>
        <CardContent className="p-5 space-y-4">
          <div className="flex items-center gap-3">
            <div className={cn("size-12 rounded-lg flex items-center justify-center", cor)}>
              <Icon className="size-6" />
            </div>
            <div className="flex-1">
              <p className="font-semibold">{titulo}</p>
              <p className="text-xs text-muted-foreground">
                {conectado ? "Marcado para conectar depois" : "Pendente"}
              </p>
            </div>
            {conectado ? (
              <Badge variant="warning" className="gap-1">
                <AlertCircle className="size-3" />
                Pendente
              </Badge>
            ) : (
              <Badge variant="secondary">Não configurado</Badge>
            )}
          </div>

          <div className="flex flex-wrap gap-1.5">
            {badges.map((b) => (
              <Badge key={b} variant="outline" className="text-[10px]">{b}</Badge>
            ))}
          </div>

          <div className="rounded-md bg-muted/40 p-3 text-xs space-y-1">
            <p className="font-semibold flex items-center gap-1.5">
              <AlertCircle className="size-3.5 text-amber-400" />
              Conexão completa só após Fase 1
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Aguardando aprovação do Google Ads developer token DDG (3-7 dias) e configuração do Meta App. Por agora, você pode marcar como &ldquo;conectar depois&rdquo; e finalizar o cadastro.
            </p>
          </div>

          <Button
            type="button"
            variant={conectado ? "outline" : "ddg"}
            className="w-full gap-2"
            onClick={onConectar}
            disabled={conectado}
          >
            {conectado ? (
              <>
                <CheckCircle2 className="size-4" />
                Marcado pra conectar depois
              </>
            ) : (
              <>
                <Webhook className="size-4" />
                Marcar como conectar depois
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      <p className="text-xs text-muted-foreground flex items-center gap-1.5">
        <Globe className="size-3" />
        Você pode conectar agora ou depois pela página /configuracoes do cliente
      </p>
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}
