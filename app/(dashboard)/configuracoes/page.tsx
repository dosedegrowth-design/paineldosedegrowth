"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { PageHeader } from "@/components/dashboard/page-header";
import { CheckCircle2, AlertCircle, Link as LinkIcon, Bell, Bot, KeyRound } from "lucide-react";

export default function ConfiguracoesPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Configurações"
        description="Integrações, alertas e preferências"
      />

      {/* Integrações */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LinkIcon className="size-4" />
            Integrações
          </CardTitle>
          <CardDescription>
            Contas conectadas para sync de dados e envio de eventos
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <IntegrationRow
            name="Google Ads"
            account="123-456-7890 · Petderma"
            status="connected"
            lastSync="há 8 min"
          />
          <IntegrationRow
            name="Meta Marketing API"
            account="act_2354678901 · Petderma"
            status="connected"
            lastSync="há 5 min"
          />
          <IntegrationRow
            name="Anthropic Claude"
            account="API Key configurada"
            status="connected"
          />
          <IntegrationRow
            name="Evolution (WhatsApp)"
            account="instance: ddg-trafego"
            status="connected"
          />
          <IntegrationRow
            name="Painel Comercial Petderma"
            account="Webhook: aguardando configuração"
            status="pending"
          />
          <IntegrationRow
            name="TikTok Ads"
            account="Não conectado"
            status="disconnected"
          />
        </CardContent>
      </Card>

      {/* Limites operacionais */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <KeyRound className="size-4" />
            Limites operacionais
          </CardTitle>
          <CardDescription>
            Regras de segurança para mudanças via painel
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <SettingRow
            label="Mudança máxima de budget por vez"
            value="20%"
            description="Acima disso, requer confirmação extra (regra Google Ads)"
          />
          <Separator />
          <SettingRow
            label="Pausar campanhas em ROAS abaixo de"
            value="1.5x"
            description="Sugestão automática, não auto-pause"
          />
          <Separator />
          <SettingRow
            label="Threshold de anomalia (warn)"
            value="±20%"
            description="Variação vs baseline 7d"
          />
          <Separator />
          <SettingRow
            label="Threshold de anomalia (crítico)"
            value="±40%"
            description="Notifica via WhatsApp imediatamente"
          />
        </CardContent>
      </Card>

      {/* Alertas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="size-4" />
            Notificações
          </CardTitle>
          <CardDescription>
            Quando e como receber alertas
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <ToggleRow label="Enviar alertas críticos via WhatsApp" defaultChecked />
          <ToggleRow label="Resumo diário 7h da manhã" defaultChecked />
          <ToggleRow label="Email semanal de performance" defaultChecked={false} />
          <ToggleRow label="Notificar mudança de budget >20%" defaultChecked />
        </CardContent>
      </Card>

      {/* IA */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="size-4" />
            Inteligência IA
          </CardTitle>
          <CardDescription>
            Modelos e custos
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <SettingRow
            label="Modelo do Chatbot"
            value="Claude Sonnet 4.5"
            description="Qualidade > custo. Usado para conversas complexas."
          />
          <Separator />
          <SettingRow
            label="Modelo de relatórios em massa"
            value="Claude Haiku 4.5"
            description="Mais barato, ótimo para narrativas curtas."
          />
          <Separator />
          <SettingRow
            label="Consumo este mês"
            value="≈ R$ 18,40"
            description="Estimativa baseada em tokens"
          />
        </CardContent>
      </Card>
    </div>
  );
}

function IntegrationRow({
  name,
  account,
  status,
  lastSync,
}: {
  name: string;
  account: string;
  status: "connected" | "pending" | "disconnected";
  lastSync?: string;
}) {
  return (
    <div className="flex items-center gap-4">
      <div className="size-10 rounded-lg bg-muted flex items-center justify-center shrink-0">
        {status === "connected" && <CheckCircle2 className="size-4 text-emerald-400" />}
        {status === "pending" && <AlertCircle className="size-4 text-amber-400" />}
        {status === "disconnected" && <AlertCircle className="size-4 text-muted-foreground" />}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm">{name}</p>
        <p className="text-xs text-muted-foreground truncate">{account}</p>
      </div>
      {lastSync && (
        <span className="text-xs text-muted-foreground hidden sm:inline">
          Sync {lastSync}
        </span>
      )}
      <Badge
        variant={
          status === "connected"
            ? "success"
            : status === "pending"
            ? "warning"
            : "secondary"
        }
      >
        {status === "connected" && "Conectado"}
        {status === "pending" && "Pendente"}
        {status === "disconnected" && "Desconectado"}
      </Badge>
      <Button size="sm" variant="outline">
        {status === "connected" ? "Gerenciar" : "Conectar"}
      </Button>
    </div>
  );
}

function SettingRow({
  label,
  value,
  description,
}: {
  label: string;
  value: string;
  description?: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="flex-1">
        <p className="text-sm font-medium">{label}</p>
        {description && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}
      </div>
      <Input value={value} readOnly className="max-w-[160px] text-right tabular-nums" />
    </div>
  );
}

function ToggleRow({ label, defaultChecked }: { label: string; defaultChecked?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <p className="text-sm">{label}</p>
      <Switch defaultChecked={defaultChecked} />
    </div>
  );
}
