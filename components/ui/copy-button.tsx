"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface CopyButtonProps {
  value: string;
  label?: string;
  className?: string;
}

export function CopyButton({ value, label = "Copiar", className }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      toast.success("Copiado para a área de transferência");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Falha ao copiar");
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleCopy}
      className={cn("gap-1.5", className)}
    >
      {copied ? (
        <Check className="size-3.5 text-emerald-400" />
      ) : (
        <Copy className="size-3.5" />
      )}
      {label}
    </Button>
  );
}

export function CodeBlock({ value, className }: { value: string; className?: string }) {
  return (
    <div
      className={cn(
        "flex items-center justify-between gap-2 rounded-md border border-border bg-muted/40 px-3 py-2 font-mono text-xs",
        className
      )}
    >
      <code className="flex-1 truncate select-all">{value}</code>
      <CopyButton value={value} label="" className="h-6 px-2" />
    </div>
  );
}
