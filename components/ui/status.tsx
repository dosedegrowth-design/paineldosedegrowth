import type {
  ClientBenefitStatus,
  ReferralStatus,
  ServiceStatus,
} from "@/lib/types";
import {
  BENEFIT_STATUS_LABEL,
  REFERRAL_STATUS_LABEL,
  SERVICE_STATUS_LABEL,
} from "@/lib/types";

type Tone = "ok" | "wait" | "accent" | "off" | "fg";

export function StatusText({ tone, children }: { tone: Tone; children: React.ReactNode }) {
  return <span className={`ty-status ty-status--${tone}`}>{children}</span>;
}

const SERVICE_TONE: Record<ServiceStatus, Tone> = {
  pending: "wait",
  approved: "ok",
  rejected: "off",
};
const REFERRAL_TONE: Record<ReferralStatus, Tone> = {
  pending: "wait",
  contacted: "wait",
  scheduled: "wait",
  completed: "fg",
  approved: "ok",
  rejected: "off",
};
const BENEFIT_TONE: Record<ClientBenefitStatus, Tone> = {
  pending_validation: "wait",
  available: "accent",
  requested: "wait",
  approved: "ok",
  redeemed: "off",
  expired: "off",
  rejected: "off",
};

export function ServiceStatusText({ status }: { status: ServiceStatus }) {
  return <StatusText tone={SERVICE_TONE[status]}>{SERVICE_STATUS_LABEL[status]}</StatusText>;
}
export function ReferralStatusText({ status }: { status: ReferralStatus }) {
  return <StatusText tone={REFERRAL_TONE[status]}>{REFERRAL_STATUS_LABEL[status]}</StatusText>;
}
export function BenefitStatusText({ status }: { status: ClientBenefitStatus }) {
  return <StatusText tone={BENEFIT_TONE[status]}>{BENEFIT_STATUS_LABEL[status]}</StatusText>;
}
