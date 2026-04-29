/**
 * Meta Marketing API Client (skeleton).
 * Documentação: https://developers.facebook.com/docs/marketing-api/
 */

const API_VERSION = "v22.0";
const BASE_URL = `https://graph.facebook.com/${API_VERSION}`;

export interface MetaCredentials {
  accessToken: string; // System User long-lived token
  adAccountId: string; // formato: "act_123456789"
  pixelId?: string;
}

export class MetaAdsClient {
  constructor(private creds: MetaCredentials) {}

  private async fetch(path: string, init?: RequestInit) {
    const url = path.startsWith("http") ? path : `${BASE_URL}${path}`;
    const sep = url.includes("?") ? "&" : "?";
    const finalUrl = `${url}${sep}access_token=${this.creds.accessToken}`;
    const res = await fetch(finalUrl, init);
    if (!res.ok) {
      throw new Error(`Meta API ${path} failed: ${await res.text()}`);
    }
    return res.json();
  }

  /**
   * Lista campanhas com insights.
   */
  async getCampaigns(daysBack: number = 30) {
    const since = new Date(Date.now() - daysBack * 86400000)
      .toISOString()
      .split("T")[0];
    const until = new Date().toISOString().split("T")[0];
    const fields = [
      "id",
      "name",
      "status",
      "objective",
      `insights.time_range({"since":"${since}","until":"${until}"}).time_increment(1){spend,impressions,clicks,actions,action_values,date_start,date_stop}`,
    ].join(",");

    return this.fetch(
      `/${this.creds.adAccountId}/campaigns?fields=${encodeURIComponent(fields)}&limit=200`
    );
  }

  /**
   * Lista ad sets de uma campanha.
   */
  async getAdSets(campaignId: string) {
    const fields = "id,name,status,daily_budget,lifetime_budget,targeting";
    return this.fetch(`/${campaignId}/adsets?fields=${fields}&limit=200`);
  }

  /**
   * Lista ads com criativos.
   */
  async getAds(adsetId: string) {
    const fields = "id,name,status,creative{thumbnail_url,image_url,body,title,call_to_action_type}";
    return this.fetch(`/${adsetId}/ads?fields=${fields}&limit=200`);
  }

  /**
   * Pause/resume campanha.
   */
  async setCampaignStatus(campaignId: string, status: "ACTIVE" | "PAUSED") {
    return this.fetch(`/${campaignId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
  }

  /**
   * Atualiza daily budget (com lock 20%).
   */
  async updateDailyBudget(campaignId: string, newBudgetCents: number, currentBudgetCents: number) {
    const change = Math.abs((newBudgetCents - currentBudgetCents) / currentBudgetCents);
    if (change > 0.2) {
      throw new Error("Mudança de budget acima de 20%. Requer confirmação extra.");
    }
    return this.fetch(`/${campaignId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ daily_budget: newBudgetCents }),
    });
  }

  /**
   * CAPI Offline Events.
   * https://developers.facebook.com/docs/marketing-api/conversions-api/offline
   */
  async sendOfflineConversion(params: {
    eventName: "Purchase" | "Lead" | "CompleteRegistration";
    eventTime: number; // unix timestamp
    eventId: string; // dedup
    valueBrl?: number;
    emailHash?: string;
    phoneHash?: string;
    fbclid?: string;
    fbp?: string;
  }) {
    if (!this.creds.pixelId) {
      throw new Error("pixelId required for CAPI events");
    }
    const userData: Record<string, string> = {};
    if (params.emailHash) userData.em = params.emailHash;
    if (params.phoneHash) userData.ph = params.phoneHash;
    if (params.fbclid) userData.fbc = `fb.1.${params.eventTime}.${params.fbclid}`;
    if (params.fbp) userData.fbp = params.fbp;

    return this.fetch(`/${this.creds.pixelId}/events`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        data: [
          {
            event_name: params.eventName,
            event_time: params.eventTime,
            event_id: params.eventId,
            action_source: "system_generated",
            user_data: userData,
            custom_data: params.valueBrl
              ? { value: params.valueBrl, currency: "BRL" }
              : {},
          },
        ],
      }),
    });
  }
}
