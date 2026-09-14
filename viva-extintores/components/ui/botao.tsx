import Link from "next/link";
import { Seta } from "@/components/ui/icones";
import { isExterno } from "@/lib/whatsapp";

/**
 * O caminho de conversão (§23). Link externo (WhatsApp) abre em aba nova;
 * âncora interna usa o Link do Next.
 */
export function Botao({
  href,
  children,
  variante = "solido",
  tamanho,
  className,
}: {
  href: string;
  children: React.ReactNode;
  variante?: "solido" | "ghost";
  tamanho?: "sm";
  className?: string;
}) {
  const classes = [
    "v-btn",
    variante === "ghost" ? "v-btn--ghost" : "",
    tamanho === "sm" ? "v-btn--sm" : "",
    className ?? "",
  ]
    .filter(Boolean)
    .join(" ");

  const conteudo = (
    <>
      <span>{children}</span>
      <Seta className="v-btn__arrow" />
    </>
  );

  if (isExterno(href)) {
    return (
      <a className={classes} href={href} target="_blank" rel="noopener noreferrer">
        {conteudo}
      </a>
    );
  }

  return (
    <Link className={classes} href={href}>
      {conteudo}
    </Link>
  );
}
