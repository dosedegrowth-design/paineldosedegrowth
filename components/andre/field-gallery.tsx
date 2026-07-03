import { PhotoPanel } from "./photo-panel";
import { RevealSection } from "./tilt-card";

export function FieldGallery() {
  return (
    <section
      className="relative py-20 lg:py-28 overflow-hidden"
      style={{ background: "rgba(7, 12, 24, 0.45)" }}
    >
      <div className="relative z-10 max-w-6xl mx-auto px-5 lg:px-8">
        <RevealSection className="max-w-2xl mb-12">
          <span className="andre-chip">Na prática</span>
          <h2 className="mt-4 text-3xl sm:text-4xl lg:text-5xl font-black leading-tight tracking-tight">
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
            caption="DIAGNOSTICO_EM_CAMPO"
            ratio="3/4"
          />
          <PhotoPanel
            src="/andre/tecnico-gas.jpg"
            alt="Recarga de gás com manômetro de precisão"
            caption="RECARGA_COM_MANOMETRO"
            ratio="3/4"
            delay={0.12}
          />
          <PhotoPanel
            src="/andre/ambiente-quarto.jpg"
            alt="Quarto climatizado com split instalado e acabamento limpo"
            caption="RESULTADO_ENTREGUE"
            ratio="3/4"
            delay={0.24}
            className="sm:col-span-2 lg:col-span-1"
          />
        </div>
      </div>
    </section>
  );
}
