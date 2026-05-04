/**
 * Google Ads API Client (skeleton).
 *
 * Implementação da Fase 1.
 * Documentação: https://developers.google.com/google-ads/api/docs/start
 *
 * Fluxo OAuth:
 * 1. Admin DDG inicia OAuth flow no /configuracoes
 * 2. Usuário do cliente autoriza acesso à conta Google Ads
 * 3. Refresh token salvo (criptografado) em clientes_acessos.google_oauth_refresh_token
 * 4. Cada chamada de API usa refresh_token → access_token
 */

export interface GoogleAdsCredentials {
  developerToken: string;
  clientId: string;
  clientSecret: string;
  refreshToken: string;
  customerId: string; // sem hifens, ex: "1234567890"
  loginCustomerId?: string; // se MCC
}

export interface CampaignRow {
  campaign_id: string;
  campaign_name: string;
  campaign_status: string;
  metrics_cost_micros: number;
  metrics_impressions: number;
  metrics_clicks: number;
  metrics_conversions: number;
  metrics_conversions_value: number;
  segments_date: string;
}

export class GoogleAdsClient {
  constructor(private creds: GoogleAdsCredentials) {}

  /**
   * Obtém access token a partir do refresh token.
   */
  private async getAccessToken(): Promise<string> {
    const res = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: this.creds.clientId,
        client_secret: this.creds.clientSecret,
        refresh_token: this.creds.refreshToken,
        grant_type: "refresh_token",
      }),
    });
    if (!res.ok) throw new Error(`OAuth failed: ${await res.text()}`);
    const json = await res.json();
    return json.access_token as string;
  }

  /**
   * Executa GAQL query.
   * https://developers.google.com/google-ads/api/docs/query/overview
   */
  async query<T = Record<string, unknown>>(gaql: string): Promise<T[]> {
    const accessToken = await this.getAccessToken();
    const url = `https://googleads.googleapis.com/v23/customers/${this.creds.customerId}/googleAds:searchStream`;
    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "developer-token": this.creds.developerToken,
        "Content-Type": "application/json",
        ...(this.creds.loginCustomerId && {
          "login-customer-id": this.creds.loginCustomerId,
        }),
      },
      body: JSON.stringify({ query: gaql }),
    });
    if (!res.ok) {
      throw new Error(`Google Ads query failed: ${await res.text()}`);
    }
    const stream = await res.json();
    const rows: T[] = [];
    for (const chunk of stream) {
      if (chunk.results) rows.push(...chunk.results);
    }
    return rows;
  }

  /**
   * Sync de campanhas dos últimos N dias.
   */
  async getCampaigns(daysBack: number = 30): Promise<CampaignRow[]> {
    const since = new Date(Date.now() - daysBack * 86400000)
      .toISOString()
      .split("T")[0];
    return this.query<CampaignRow>(`
      SELECT
        campaign.id,
        campaign.name,
        campaign.status,
        metrics.cost_micros,
        metrics.impressions,
        metrics.clicks,
        metrics.conversions,
        metrics.conversions_value,
        segments.date
      FROM campaign
      WHERE segments.date >= '${since}'
      ORDER BY segments.date DESC
    `);
  }

  /**
   * Sync de search terms.
   */
  async getSearchTerms(daysBack: number = 14) {
    const since = new Date(Date.now() - daysBack * 86400000)
      .toISOString()
      .split("T")[0];
    return this.query(`
      SELECT
        search_term_view.search_term,
        campaign.id,
        campaign.name,
        ad_group.id,
        metrics.cost_micros,
        metrics.clicks,
        metrics.conversions
      FROM search_term_view
      WHERE segments.date >= '${since}'
        AND metrics.cost_micros > 0
      ORDER BY metrics.cost_micros DESC
      LIMIT 500
    `);
  }

  /**
   * Adiciona keyword negativa em uma campanha.
   * https://developers.google.com/google-ads/api/docs/keywords/add-negative-keywords
   */
  async addNegativeKeyword(campaignId: string, keyword: string, matchType: "EXACT" | "PHRASE" | "BROAD" = "PHRASE") {
    // TODO: implementar via mutate na Fase 2
    return { success: true, campaignId, keyword, matchType };
  }

  /**
   * Atualiza budget de uma campanha (com lock de 20% máximo).
   */
  async updateCampaignBudget(campaignId: string, newBudgetMicros: number, currentBudgetMicros: number) {
    const change = Math.abs((newBudgetMicros - currentBudgetMicros) / currentBudgetMicros);
    if (change > 0.2) {
      throw new Error("Mudança de budget acima de 20%. Requer confirmação extra.");
    }
    // TODO: implementar via mutate
    return { success: true, campaignId, newBudgetMicros };
  }

  /**
   * Pause/resume campanha.
   */
  async setCampaignStatus(campaignId: string, status: "ENABLED" | "PAUSED") {
    // TODO: implementar via mutate
    return { success: true, campaignId, status };
  }

  /**
   * Upload de Enhanced Conversions (server-side).
   * https://developers.google.com/google-ads/api/docs/conversions/upload-clicks
   */
  async uploadOfflineConversion(params: {
    conversionActionId: string;
    gclid?: string;
    emailHash?: string;
    phoneHash?: string;
    conversionDateTime: string; // ISO
    conversionValue: number;
    currencyCode?: string;
  }) {
    // TODO: implementar via OfflineUserDataJobService na Fase 4
    return { success: true, ...params };
  }
}
