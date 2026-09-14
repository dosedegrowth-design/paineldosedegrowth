/** A frase que assina o fim da página, com o traço vermelho embaixo. */
export function Fecho({ frase }: { frase: string }) {
  return (
    <div className="v-fecho">
      <div className="v-wrap">
        <p className="v-fecho__frase">{frase}</p>
      </div>
    </div>
  );
}
