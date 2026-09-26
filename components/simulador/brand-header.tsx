import { BRAND, COPY } from "@/lib/simulador/config";
import { BrandMark, CheckIcon } from "./icons";

export function BrandHeader() {
  return (
    <header className="sim-header">
      <div className="sim-brand">
        <BrandMark />
        <span className="sim-brand__name">{BRAND.name}</span>
        <span className="sim-brand__tag">{BRAND.tagline}</span>
      </div>
      <span className="sim-pill">
        <CheckIcon size={14} />
        {COPY.header.pill}
      </span>
    </header>
  );
}
