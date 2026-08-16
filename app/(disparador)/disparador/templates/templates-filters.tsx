"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Props {
  wabas: { waba_id: string; display_name: string }[];
}

export function TemplatesFilters({ wabas }: Props) {
  const router = useRouter();
  const sp = useSearchParams();
  const current = sp.get("waba_id") ?? "all";

  return (
    <Select
      value={current}
      onValueChange={(v) => {
        const url = v === "all" ? "/disparador/templates" : `/disparador/templates?waba_id=${v}`;
        router.push(url);
      }}
    >
      <SelectTrigger className="w-[260px]">
        <SelectValue placeholder="Todos os números" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">Todos os números</SelectItem>
        {wabas.map((w) => (
          <SelectItem key={w.waba_id} value={w.waba_id}>
            {w.display_name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
