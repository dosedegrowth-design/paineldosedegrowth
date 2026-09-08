import { redirect } from "next/navigation";

/**
 * A 24 pés é a porta de entrada da frota: doze lugares num barco só resolve o
 * grupo que hoje se divide em dois barcos ou senta junto de desconhecido. O
 * seletor no topo leva pras outras duas.
 */
export default function Home() {
  redirect("/24-pes");
}
