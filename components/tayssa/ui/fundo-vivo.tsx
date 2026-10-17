/**
 * O fundo que nunca fica parado (linguagem do painel da iWin): três luzes
 * desfocadas derivando devagar (vinho, rosé e uma de ouro), uma grade fina
 * que anda, um chão em perspectiva que vem na direção de quem olha (o fundo
 * não acaba), as bordas fechadas em ameixa — perto — para o centro parecer
 * fundo, e uma faixa de brilho que cruza de tempos em tempos. Tudo em transform —
 * no celular e com menos movimento ele assenta (regras em identidade.css).
 */
export function FundoVivo({ tom = "noite", className }: { tom?: "noite" | "dia" | "vip" | "perola"; className?: string }) {
  return (
    <div className={["ty-vivo", className ?? ""].join(" ").trim()} data-tom={tom} aria-hidden>
      <span className="ty-vivo__luz ty-vivo__luz--1" />
      <span className="ty-vivo__luz ty-vivo__luz--2" />
      <span className="ty-vivo__luz ty-vivo__luz--ouro" />
      <span className="ty-vivo__grade" />
      <span className="ty-vivo__chao" />
      <span className="ty-vivo__varre" />
      <span className="ty-vivo__borda" />
      <span className="ty-vivo__grao" />
    </div>
  );
}
