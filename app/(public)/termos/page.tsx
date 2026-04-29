import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Termos de Serviço",
  description: "Termos de uso do Tráfego DDG — Dose de Growth",
};

export default function TermosPage() {
  return (
    <article>
      <h1>Termos de Serviço</h1>
      <p className="text-xs text-muted-foreground">
        Última atualização: 29 de abril de 2026
      </p>

      <h2>1. Aceitação</h2>
      <p>
        Ao acessar e utilizar a plataforma <strong>Tráfego DDG</strong>{" "}
        (&ldquo;Plataforma&rdquo;), operada pela <strong>Dose de Growth</strong>{" "}
        (&ldquo;DDG&rdquo;), você concorda com estes Termos de Serviço. Se você
        não concorda, não utilize a Plataforma.
      </p>

      <h2>2. Sobre a Plataforma</h2>
      <p>
        Tráfego DDG é uma ferramenta proprietária de gestão de tráfego pago
        utilizada internamente pela DDG para operação de campanhas publicitárias
        de seus clientes. A Plataforma se conecta a:
      </p>
      <ul>
        <li>Meta Ads (Facebook/Instagram) via Marketing API e Conversions API</li>
        <li>Google Ads via Google Ads API e Enhanced Conversions</li>
        <li>Painéis comerciais de clientes via webhook autenticado</li>
      </ul>

      <h2>3. Quem pode usar</h2>
      <p>O acesso é restrito a:</p>
      <ul>
        <li>Equipe interna da DDG (gestores de tráfego)</li>
        <li>
          Clientes contratantes da DDG, com acesso somente leitura aos próprios
          dados
        </li>
      </ul>
      <p>
        <strong>A Plataforma não é aberta ao público.</strong> Cada acesso é
        autorizado individualmente pela administração DDG.
      </p>

      <h2>4. Cadastro e segurança</h2>
      <ul>
        <li>
          Você é responsável por manter a confidencialidade da sua senha e por
          todas as ações realizadas sob sua conta
        </li>
        <li>Notifique imediatamente sobre qualquer uso não autorizado</li>
        <li>
          Você concorda em fornecer informações verdadeiras, atualizadas e
          precisas
        </li>
        <li>Não é permitido compartilhar credenciais de acesso</li>
      </ul>

      <h2>5. Uso permitido</h2>
      <p>Você concorda em usar a Plataforma apenas para:</p>
      <ul>
        <li>Gerenciar campanhas publicitárias dos clientes da DDG</li>
        <li>Visualizar relatórios e métricas das próprias campanhas</li>
        <li>Configurar integrações entre seu sistema e o Tráfego DDG</li>
      </ul>

      <h2>6. Uso proibido</h2>
      <p>É expressamente proibido:</p>
      <ul>
        <li>Tentar acessar dados de outros clientes</li>
        <li>Realizar engenharia reversa do código ou da arquitetura</li>
        <li>Utilizar a Plataforma para atividades ilegais ou fraudulentas</li>
        <li>Sobrecarregar intencionalmente a infraestrutura</li>
        <li>Compartilhar tokens de acesso ou webhooks com terceiros</li>
        <li>Utilizar para promover conteúdo ilegal ou abusivo</li>
        <li>
          Coletar dados de terceiros sem consentimento adequado e fora dos termos
          das APIs do Meta e Google
        </li>
      </ul>

      <h2>7. Propriedade intelectual</h2>
      <p>
        Todo o código, design, logos, marcas e conteúdo da Plataforma são
        propriedade exclusiva da Dose de Growth. Os dados publicitários
        sincronizados pertencem aos respectivos clientes.
      </p>

      <h2>8. Conexões com Meta Ads e Google Ads</h2>
      <p>
        Quando você conecta uma conta de Meta Ads ou Google Ads à Plataforma:
      </p>
      <ul>
        <li>
          Você confirma ter autorização legítima para gerenciar essa conta
        </li>
        <li>
          Você concorda com os termos das próprias plataformas:
          <a href="https://www.facebook.com/legal/terms" target="_blank" rel="noopener">
            {" "}Termos do Meta
          </a>{" "}
          e
          <a
            href="https://policies.google.com/terms"
            target="_blank"
            rel="noopener"
          >
            {" "}Termos do Google
          </a>
        </li>
        <li>
          Você pode revogar a conexão a qualquer momento pela página
          /clientes/[slug]
        </li>
      </ul>

      <h2>9. Server-Side Conversions</h2>
      <p>
        Ao habilitar o envio de eventos de conversão offline para Meta CAPI e
        Google Enhanced Conversions, você confirma:
      </p>
      <ul>
        <li>
          Ter consentimento dos leads para tratamento de dados conforme LGPD
        </li>
        <li>
          Os identificadores enviados (email/telefone) sempre passam por hash
          SHA-256 antes de saírem do nosso sistema
        </li>
        <li>
          Você é responsável pela acurácia dos dados enviados via webhook
        </li>
      </ul>

      <h2>10. Disponibilidade</h2>
      <p>
        Buscamos manter a Plataforma operacional 24/7, mas não garantimos
        disponibilidade contínua. Manutenções programadas e falhas eventuais de
        terceiros (Meta, Google, Supabase, Vercel) podem causar indisponibilidade
        temporária.
      </p>

      <h2>11. Limitação de responsabilidade</h2>
      <p>
        A Plataforma é fornecida &ldquo;como está&rdquo;. A DDG não se
        responsabiliza por:
      </p>
      <ul>
        <li>Decisões de otimização tomadas pela equipe ou pelo cliente</li>
        <li>Falhas das APIs do Meta ou Google</li>
        <li>Perda de dados causada por terceiros</li>
        <li>Performance das campanhas (a cargo do gestor de tráfego)</li>
      </ul>
      <p>
        A DDG mantém este sistema com máxima diligência, mas a operação final é
        de responsabilidade dos seus operadores.
      </p>

      <h2>12. Encerramento</h2>
      <p>
        A DDG pode suspender ou encerrar o acesso de qualquer usuário que viole
        estes termos. O cliente também pode encerrar o acesso a qualquer momento
        solicitando por email a{" "}
        <a href="mailto:lucas@dmaisum.com.br">lucas@dmaisum.com.br</a>.
      </p>
      <p>
        Após o encerramento, os dados serão tratados conforme a{" "}
        <a href="/privacidade">Política de Privacidade</a>.
      </p>

      <h2>13. Alterações nos termos</h2>
      <p>
        Podemos atualizar estes Termos a qualquer momento. Mudanças significativas
        serão notificadas com pelo menos 30 dias de antecedência aos usuários
        ativos.
      </p>

      <h2>14. Lei aplicável e foro</h2>
      <p>
        Estes Termos são regidos pelas leis brasileiras. Fica eleito o foro da
        comarca de São Paulo/SP para dirimir quaisquer controvérsias.
      </p>

      <h2>15. Contato</h2>
      <p>
        Para qualquer questão sobre estes Termos:
        <br />
        Email: <a href="mailto:lucas@dmaisum.com.br">lucas@dmaisum.com.br</a>
        <br />
        Empresa: Dose de Growth (DD Growth)
      </p>
    </article>
  );
}
