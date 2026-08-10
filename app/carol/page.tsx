import { CarolNavbar } from "@/components/carol/navbar";
import { CarolHero } from "@/components/carol/hero";
import { CarolMarcasStrip } from "@/components/carol/marcas-strip";
import { CarolCaminhos } from "@/components/carol/caminhos";
import { CarolSobre } from "@/components/carol/sobre";
import { CarolNumeros } from "@/components/carol/numeros";
import { CarolUgcStats } from "@/components/carol/ugc-stats";
import { CarolPortfolio } from "@/components/carol/portfolio";
import { CarolFotografia } from "@/components/carol/fotografia";
import { CarolServicos } from "@/components/carol/servicos";
import { CarolProcesso } from "@/components/carol/processo";
import { CarolComunidade } from "@/components/carol/comunidade";
import { CarolInvestimento } from "@/components/carol/investimento";
import { CarolContato } from "@/components/carol/contato";

export default function CarolPage() {
  return (
    <>
      <CarolNavbar />
      <main>
        <CarolHero />
        <CarolMarcasStrip />
        <CarolCaminhos />
        <CarolSobre />
        <CarolNumeros />
        <CarolUgcStats />
        <CarolPortfolio />
        <CarolFotografia />
        <CarolServicos />
        <CarolProcesso />
        <CarolComunidade />
        <CarolInvestimento />
        <CarolContato />
      </main>
    </>
  );
}
