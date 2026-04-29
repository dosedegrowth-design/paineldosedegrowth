import { cn } from "@/lib/utils";

export function PlatformBadge({ platform }: { platform: "google" | "meta" }) {
  if (platform === "google") {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-400 border border-blue-500/20">
        <GoogleIcon />
        Google
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 text-xs px-2 py-0.5 rounded-md bg-violet-500/10 text-violet-400 border border-violet-500/20">
      <MetaIcon />
      Meta
    </span>
  );
}

function GoogleIcon() {
  return (
    <svg className="size-3" viewBox="0 0 24 24" fill="currentColor">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.99.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09 0-.73.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  );
}

function MetaIcon() {
  return (
    <svg className="size-3" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12.001 2C6.5 2 2 6.5 2 12.001c0 4.91 3.583 8.984 8.276 9.86v-6.97H7.832v-2.89h2.444V9.872c0-2.418 1.42-3.74 3.604-3.74.97 0 2.06.062 2.06.062v2.27h-1.16c-1.144 0-1.5.71-1.5 1.439v1.726h2.553l-.408 2.89h-2.145v6.97C18.417 20.985 22 16.91 22 12 22 6.5 17.501 2 12.001 2z" />
    </svg>
  );
}
