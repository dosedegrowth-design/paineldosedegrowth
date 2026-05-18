"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Props {
  contas: { id: string; display_name: string }[];
}

export function TemplatesFilters({ contas }: Props) {
  const router = useRouter();
  const sp = useSearchParams();
  const current = sp.get("conta_id") ?? "all";

  return (
    <Select
      value={current}
      onValueChange={(v) => {
        const url = v === "all" ? "/disparador/templates" : `/disparador/templates?conta_id=${v}`;
        router.push(url);
      }}
    >
      <SelectTrigger className="w-[220px]">
        <SelectValue placeholder="Todas as contas" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">Todas as contas</SelectItem>
        {contas.map((c) => (
          <SelectItem key={c.id} value={c.id}>
            {c.display_name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
