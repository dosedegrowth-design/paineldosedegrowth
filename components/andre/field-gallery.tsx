import { PhotoPanel } from "./photo-panel";
import { Chapter } from "./chapter";
import { RevealSection } from "./tilt-card";

export function FieldGallery() {
  return (
    <section className="relative py-24 lg:py-36">
      <div className="max-w-6xl mx-auto px-5 lg:px-8">
        <RevealSection className="max-w-2xl mb-12">
          <Chapter n="05" label="Na prática" />
          <h2 className="mt-4 text-4xl sm:text-5xl lg:text-[3.6rem] font-black leading-tight tracking-tight text-white">
            O padrão de execução que{" "}
            <span className="andre-gradient-text">você pode exigir</span>.
          </h2>
          <p className="mt-4 text-slate-300 text-base leading-relaxed">
            Manômetro na recarga, laudo no diagnóstico e ambiente entregue
            limpo. Técnica não é opcional.
          </p>
        </RevealSection>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-5">
          <PhotoPanel
            src="/andre/tecnico-manutencao.jpg"
            alt="Técnico verificando pressão do sistema com manifold"
            caption="Diagnóstico em campo"
            ratio="3/4"
          />
          <PhotoPanel
            src="/andre/tecnico-gas.jpg"
            alt="Recarga de gás com manômetro de precisão"
            caption="Recarga com manômetro"
            ratio="3/4"
            delay={0.12}
          />
          <PhotoPanel
            src="/andre/ambiente-quarto.jpg"
            alt="Quarto climatizado com split instalado e acabamento limpo"
            caption="Resultado entregue"
            ratio="3/4"
            delay={0.24}
            className="sm:col-span-2 lg:col-span-1"
          />
        </div>
      </div>
    </section>
  );
}
