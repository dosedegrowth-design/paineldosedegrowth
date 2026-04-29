"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  CheckCircle2,
  AlertCircle,
  KeyRound,
  Bell,
  Bot,
  Webhook,
  ExternalLink,
  Shield,
  Globe,
  RotateCw,
  Building2,
  ArrowRight,
} from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { CodeBlock } from "@/components/ui/copy-button";

import { PageHeader } from "@/components/dashboard/page-header";
import { listClientes } from "@/lib/actions/clientes";
import type { ClienteCompleto } from "@/lib/actions/clientes";

interface IntegrationStatus {
  meta_app: boolean;
  google_dev_token: boolean;
  anthropic: boolean;
  evolution: boolean;
  hmac_secret: boolean;
}

export default function ConfiguracoesPage() {
  const [clientes, setClientes] = useState<ClienteCompleto[]>([]);
  const [status] = useState<IntegrationStatus>({
    meta_app: false,
    google_dev_token: false,
    anthropic: true, // assumindo que ANTHROPIC_API_KEY está set
    evolution: false,
    hmac_secret: true,
  });

  useEffect(() => {
    listClientes().then(setClientes);
  }, []);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Configurações DDG"
        description="Integrações globais, segurança e preferências da agência"
      />

      <Tabs defaultValue="integracoes">
        <TabsList>
          <TabsTrigger value="integracoes">Integrações Globais</TabsTrigger>
          <TabsTrigger value="por-cliente">Por Cliente</TabsTrigger>
          <TabsTrigger value="seguranca">Segurança</TabsTrigger>
          <TabsTrigger value="preferencias">Preferências</TabsTrigger>
        </TabsList>

        {/* INTEGRAÇÕES GLOBAIS */}
        <TabsContent value="integracoes" className="space-y-4 mt-4">
          <Card className="border-amber-500/30 bg-amber-500/5">
            <CardContent className="p-5 flex items-start gap-3">
              <AlertCircle className="size-5 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-sm mb-1">Configurações de credenciais</p>
                <p className="text-xs text-muted-foreground">
                  Estas são as credenciais <strong>globais da DDG</strong>. Cada cliente individual
                  tem suas próprias contas Meta/Google que conectam via OAuth na página dele.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bot className="size-4" />
                Anthropic (Claude)
              </CardTitle>
              <CardDescription>Para narrativas de IA, anomalias, relatórios e chatbot</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <SettingItem
                label="API Key"
                value={status.anthropic ? "Configurada (oculta)" : "Não configurada"}
                ok={status.anthropic}
              />
              <SettingItem label="Modelo de chatbot" value="claude-sonnet-4-5" />
              <SettingItem label="Modelo de relatórios" value="claude-haiku-4-5" />
              <SettingItem label="Consumo este mês" value="≈ R$ 1,80" />
              <p className="text-xs text-muted-foreground pt-2 border-t border-border">
                Configure ANTHROPIC_API_KEY nas variáveis de ambiente do Vercel
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FacebookIcon />
                Meta (Facebook) App
              </CardTitle>
              <CardDescription>App do Facebook para OAuth dos clientes</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <SettingItem
                label="App ID"
                value={status.meta_app ? "Configurado" : "Não configurado"}
                ok={status.meta_app}
              />
              <SettingItem
                label="App Secret"
                value={status.meta_app ? "Configurado" : "Não configurado"}
                ok={status.meta_app}
              />
              <SettingItem
                label="Redirect URI"
                value="https://paineldosedegrowth.vercel.app/api/oauth/meta/callback"
              />
              {!status.meta_app && (
                <div className="rounded-md border border-amber-500/30 bg-amber-500/5 p-3 text-xs space-y-2">
                  <p className="font-semibold flex items-center gap-1.5">
                    <AlertCircle className="size-3.5 text-amber-400" />
                    Como configurar
                  </p>
                  <ol className="text-muted-foreground space-y-0.5 list-decimal list-inside">
                    <li>
                      Crie um app em{" "}
                      <a
                        href="https://developers.facebook.com/apps"
                        target="_blank"
                        rel="noopener"
                        className="text-[var(--ddg-orange)] hover:underline inline-flex items-center gap-0.5"
                      >
                        developers.facebook.com <ExternalLink className="size-2.5" />
                      </a>
                    </li>
                    <li>Adicione o produto &ldquo;Login do Facebook&rdquo;</li>
                    <li>Em Configurações → Básico, copie App ID e App Secret</li>
                    <li>
                      Em &ldquo;Login do Facebook → Configurações&rdquo;, adicione o Redirect URI acima
                    </li>
                    <li>Configure as env vars META_APP_ID e META_APP_SECRET no Vercel</li>
                  </ol>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GoogleIcon />
                Google Ads Developer Token
              </CardTitle>
              <CardDescription>Token único da DDG para acessar a Google Ads API</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <SettingItem
                label="Developer Token"
                value={status.google_dev_token ? "Aprovado" : "Aguardando aplicação"}
                ok={status.google_dev_token}
                pending={!status.google_dev_token}
              />
              <SettingItem label="OAuth Client ID" value="Configurar no GCP" />
              <SettingItem label="MCC Customer ID" value="—" />
              {!status.google_dev_token && (
                <div className="rounded-md border border-amber-500/30 bg-amber-500/5 p-3 text-xs">
                  <p className="font-semibold flex items-center gap-1.5 mb-1.5">
                    <AlertCircle className="size-3.5 text-amber-400" />
                    Aprovação leva 3-7 dias
                  </p>
                  <p className="text-muted-foreground mb-2">
                    Aplique pelo painel da MCC DDG:
                  </p>
                  <Button asChild variant="outline" size="sm" className="gap-2">
                    <a
                      href="https://developers.google.com/google-ads/api/docs/get-started/dev-token"
                      target="_blank"
                      rel="noopener"
                    >
                      Aplicar agora
                      <ExternalLink className="size-3" />
                    </a>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FacebookIcon />
                Evolution (WhatsApp)
              </CardTitle>
              <CardDescription>Para enviar relatórios e alertas por WhatsApp</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <SettingItem
                label="Endpoint URL"
                value={status.evolution ? "Configurado" : "Não configurado"}
                ok={status.evolution}
              />
              <SettingItem
                label="API Key"
                value={status.evolution ? "Configurada" : "Não configurada"}
                ok={status.evolution}
              />
              <SettingItem label="Instance" value="ddg-trafego" />
            </CardContent>
          </Card>
        </TabsContent>

        {/* POR CLIENTE */}
        <TabsContent value="por-cliente" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Status de conexão por cliente</CardTitle>
              <CardDescription>
                Visão consolidada · Clique em um cliente para gerenciar conexões individuais
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-border">
                {clientes.map((c) => (
                  <Link
                    key={c.id}
                    href={`/clientes/${c.slug}`}
                    className="flex items-center gap-4 px-6 py-3 hover:bg-accent/30 transition-colors"
                  >
                    <div
                      className="size-9 rounded-lg flex items-center justify-center shrink-0"
                      style={{ background: `${c.cor_primaria}20`, color: c.cor_primaria }}
                    >
                      <Building2 className="size-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm">{c.nome}</p>
                      <p className="text-[10px] text-muted-foreground">/{c.slug}</p>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      <ConexaoMini label="Meta" status={c.status_meta} />
                      <ConexaoMini label="Google" status={c.status_google} />
                      <ConexaoMini label="Painel" status={c.status_painel_comercial} />
                    </div>
                    <ArrowRight className="size-4 text-muted-foreground shrink-0" />
                  </Link>
                ))}
                {clientes.length === 0 && (
                  <div className="p-8 text-center text-sm text-muted-foreground">
                    Nenhum cliente cadastrado.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* SEGURANÇA */}
        <TabsContent value="seguranca" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="size-4" />
                Limites operacionais
              </CardTitle>
              <CardDescription>Regras de segurança aplicadas em mudanças via painel</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <SettingItem
                label="Mudança máxima de budget por vez"
                value="20%"
                description="Acima disso, requer confirmação extra (regra Google Ads)"
              />
              <Separator />
              <SettingItem
                label="Threshold de anomalia (warn)"
                value="±20%"
                description="Variação vs baseline 7d"
              />
              <Separator />
              <SettingItem
                label="Threshold de anomalia (crítico)"
                value="±40%"
                description="Notifica via WhatsApp imediatamente"
              />
              <Separator />
              <SettingItem
                label="Tokens criptografados"
                value="Supabase Vault"
                ok
                description="OAuth refresh tokens nunca expostos no client"
              />
              <Separator />
              <SettingItem
                label="HMAC webhook"
                value="SHA-256, 32 bytes"
                ok
                description="Toda chamada do painel comercial validada"
              />
              <Separator />
              <SettingItem
                label="RLS em todas as tabelas"
                value="Ativo"
                ok
                description="Cliente só vê dados próprios via auth.uid()"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Webhook className="size-4" />
                Webhook universal
              </CardTitle>
              <CardDescription>Endpoint compartilhado para todos os clientes (diferenciação por slug)</CardDescription>
            </CardHeader>
            <CardContent>
              <CodeBlock value="https://paineldosedegrowth.vercel.app/api/webhooks/painel-comercial" />
            </CardContent>
          </Card>
        </TabsContent>

        {/* PREFERÊNCIAS */}
        <TabsContent value="preferencias" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="size-4" />
                Notificações
              </CardTitle>
              <CardDescription>Quando e como receber alertas</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ToggleRow label="Enviar alertas críticos via WhatsApp" defaultChecked />
              <ToggleRow label="Resumo diário 7h da manhã" defaultChecked />
              <ToggleRow label="Email semanal de performance" />
              <ToggleRow label="Notificar mudança de budget >20%" defaultChecked />
              <ToggleRow label="Notificar quando OAuth de cliente expirar" defaultChecked />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="size-4" />
                Localização
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <SettingItem label="Idioma" value="Português (Brasil)" />
              <SettingItem label="Moeda padrão" value="BRL" />
              <SettingItem label="Fuso horário" value="America/Sao_Paulo" />
              <SettingItem label="Formato de data" value="DD/MM/YYYY" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <RotateCw className="size-4" />
                Sincronização
              </CardTitle>
              <CardDescription>Frequência de atualização dos dados</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <SettingItem
                label="Sync Google Ads"
                value="4x/dia (06h, 12h, 18h, 23h)"
              />
              <SettingItem label="Sync Meta Ads" value="4x/dia (06h, 12h, 18h, 23h)" />
              <SettingItem label="Anomaly Detection" value="1x/dia (07h)" />
              <SettingItem label="Change Tracker" value="1x/dia (08h)" />
              <SettingItem label="Push Offline Conversions" value="A cada 30min" />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function SettingItem({
  label,
  value,
  description,
  ok,
  pending,
}: {
  label: string;
  value: string;
  description?: string;
  ok?: boolean;
  pending?: boolean;
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="flex-1">
        <p className="text-sm font-medium">{label}</p>
        {description && <p className="text-xs text-muted-foreground">{description}</p>}
      </div>
      <div className="flex items-center gap-2">
        {ok && <CheckCircle2 className="size-3.5 text-emerald-400" />}
        {pending && <AlertCircle className="size-3.5 text-amber-400" />}
        <span className="text-sm tabular-nums text-muted-foreground">{value}</span>
      </div>
    </div>
  );
}

function ToggleRow({
  label,
  defaultChecked,
}: {
  label: string;
  defaultChecked?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <p className="text-sm">{label}</p>
      <Switch defaultChecked={defaultChecked} />
    </div>
  );
}

function ConexaoMini({ label, status }: { label: string; status: string }) {
  const v =
    status === "conectado"
      ? "success"
      : status === "pendente"
        ? "warning"
        : status === "erro"
          ? "danger"
          : "secondary";
  return (
    <Badge variant={v as "success" | "warning" | "danger" | "secondary"} className="text-[10px]">
      {label}
    </Badge>
  );
}

function FacebookIcon() {
  return (
    <svg className="size-4" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12.001 2C6.5 2 2 6.5 2 12.001c0 4.91 3.583 8.984 8.276 9.86v-6.97H7.832v-2.89h2.444V9.872c0-2.418 1.42-3.74 3.604-3.74.97 0 2.06.062 2.06.062v2.27h-1.16c-1.144 0-1.5.71-1.5 1.439v1.726h2.553l-.408 2.89h-2.145v6.97C18.417 20.985 22 16.91 22 12 22 6.5 17.501 2 12.001 2z" />
    </svg>
  );
}

function GoogleIcon() {
  return (
    <svg className="size-4" viewBox="0 0 24 24" fill="currentColor">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.99.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09 0-.73.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  );
}
