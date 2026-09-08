import { redirect } from "next/navigation";

/**
 * A 24 pés é a porta de entrada: melhor preço por pessoa da frota (R$ 133 com
 * o barco cheio) e o argumento mais forte da campanha. O seletor no topo leva
 * pras outras duas.
 */
export default function Home() {
  redirect("/24-pes");
}
