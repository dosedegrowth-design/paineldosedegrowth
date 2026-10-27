import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Política de Privacidade",
  description: "Política de privacidade das plataformas da Dose de Growth: Tráfego DDG, CRM Dose de Growth e Disparador de WhatsApp",
};

export default function PrivacidadePage() {
  return (
    <article>
      <h1>Política de Privacidade</h1>
      <p className="text-xs text-muted-foreground">
        Última atualização: 27 de outubro de 2026 · Vigência imediata
      </p>

      <h2>1. Quem somos</h2>
      <p>
        A <strong>Dose de Growth (&ldquo;DDG&rdquo;)</strong>{" "}é uma agência brasileira
        de marketing digital e atendimento. Esta política descreve como coletamos,
        usamos, armazenamos e protegemos os dados pessoais tratados pelas nossas
        plataformas, todas ligadas ao app &ldquo;Dose de Growth&rdquo; na Meta:
      </p>
      <ul>
        <li>
          <strong>Tráfego DDG</strong> (
          <a href="https://painel.dosedegrowth.com">painel.dosedegrowth.com</a>):
          gestão de tráfego pago (Meta Ads e Google Ads)
        </li>
        <li>
          <strong>CRM Dose de Growth</strong> (
          <a href="https://painel.dosedegrowthcrm.com.br">painel.dosedegrowthcrm.com.br</a>):
          central de atendimento onde as empresas clientes respondem os próprios
          clientes pelo número oficial de WhatsApp delas
        </li>
        <li>
          <strong>Disparador</strong>: envio de mensagens com modelos aprovados
          pela Meta, pelo número oficial de WhatsApp da empresa cliente
        </li>
      </ul>
      <p>
        <strong>Empresa:</strong> Dose de Growth (DD Growth), CNPJ 44.474.032/0001-02 <br />
        <strong>Email para questões de privacidade:</strong> lucas@dmaisum.com.br <br />
        <strong>Site:</strong>{" "}
        <a href="https://painel.dosedegrowth.com">painel.dosedegrowth.com</a>
      </p>
      <p>
        Nos dados dos nossos usuários e da própria operação, a DDG é a
        <strong> controladora</strong>. Nas conversas de WhatsApp, a empresa
        cliente é a controladora dos dados dos clientes dela, e a DDG atua como
        <strong> operadora</strong>, tratando esses dados só para prestar o
        serviço contratado e conforme as instruções da empresa.
      </p>

      <h2>2. Para quem essa política se aplica</h2>
      <ul>
        <li>Equipe da DDG</li>
        <li>
          Empresas clientes da DDG e as pessoas da equipe delas que usam as
          plataformas
        </li>
        <li>
          Pessoas que conversam pelo WhatsApp com uma empresa cliente que usa o
          CRM Dose de Growth ou o Disparador
        </li>
      </ul>
      <p>
        <strong>As plataformas não são abertas ao público em geral.</strong> Cada
        acesso é liberado individualmente pela DDG.
      </p>

      <h2>3. Quais dados coletamos</h2>

      <h3>3.1. Dados dos usuários autenticados (equipe + clientes contratantes)</h3>
      <ul>
        <li>Nome e email (informados no cadastro ou via Login do Facebook)</li>
        <li>Foto de perfil (apenas se conectar via Facebook Login for Business)</li>
        <li>
          Identificador interno do usuário no Facebook (apenas para autenticação)
        </li>
        <li>Logs de acesso e ações realizadas no sistema (auditoria)</li>
      </ul>

      <h3>3.2. Dados das contas publicitárias conectadas</h3>
      <p>
        Quando um cliente conecta sua conta Meta Ads ou Google Ads, recebemos
        dados sobre as campanhas publicitárias dessa conta:
      </p>
      <ul>
        <li>
          Métricas de performance (impressões, cliques, conversões, gasto, ROAS)
        </li>
        <li>Estrutura de campanhas, conjuntos de anúncios e criativos</li>
        <li>Termos de pesquisa (Google Ads)</li>
        <li>Token de acesso OAuth (criptografado em repouso no banco de dados)</li>
      </ul>

      <h3>3.3. Dados de leads/conversões (apenas via webhook autorizado)</h3>
      <p>
        Quando o cliente integra o Painel Comercial dele com nosso sistema via
        webhook autenticado, recebemos eventos de fechamento de venda contendo:
      </p>
      <ul>
        <li>
          ID interno do lead no sistema do cliente (sem informações pessoais)
        </li>
        <li>
          Identificadores de clique (gclid, fbclid) para atribuição de campanhas
        </li>
        <li>
          Email e telefone do lead — <strong>sempre transformados em hash SHA-256
          antes do armazenamento</strong> (não armazenamos versão original)
        </li>
        <li>Valor da venda e data do fechamento</li>
      </ul>

      <h3>3.4. Dados do WhatsApp Business (CRM Dose de Growth e Disparador)</h3>
      <p>
        Quando uma empresa cliente conecta o número oficial de WhatsApp dela às
        nossas plataformas, recebemos da Plataforma do WhatsApp Business (Meta):
      </p>
      <ul>
        <li>
          Dados da conta do WhatsApp Business e dos números: identificadores,
          nome de exibição, status e qualidade do número
        </li>
        <li>Modelos de mensagem da empresa e o status de aprovação de cada um</li>
        <li>
          Das pessoas que conversam com a empresa: número de telefone, nome do
          perfil do WhatsApp, conteúdo das mensagens trocadas (texto, imagens,
          áudios, vídeos e documentos), data e hora, e o status de entrega e
          leitura
        </li>
        <li>
          Token de acesso à Plataforma do WhatsApp Business, guardado só no
          servidor e nunca exibido no navegador
        </li>
      </ul>
      <p>
        Esses dados chegam por webhook assinado pela Meta e são usados apenas
        para prestar o atendimento da empresa cliente. Não usamos dados do
        WhatsApp para publicidade, não montamos perfis para terceiros e não
        vendemos esses dados.
      </p>

      <h2>4. Como usamos os dados</h2>
      <ul>
        <li>
          <strong>Atendimento pelo WhatsApp:</strong> mostrar as conversas na caixa
          de entrada da empresa cliente, enviar as respostas da equipe dela,
          enviar modelos aprovados pela Meta quando a janela de 24 horas está
          fechada e criar ou gerenciar esses modelos a pedido da empresa
        </li>
        <li>
          <strong>Assistente de atendimento (opcional):</strong> quando a empresa
          cliente ativa o atendimento automático, o conteúdo da conversa é
          processado por provedores de IA só para gerar a resposta daquela
          conversa
        </li>
        <li>
          <strong>Operação do painel:</strong> exibir métricas, alertas, relatórios
        </li>
        <li>
          <strong>Otimização de campanhas:</strong> enviar conversões offline para
          Meta CAPI e Google Enhanced Conversions, melhorando a inteligência das
          plataformas (Server-Side Conversions)
        </li>
        <li>
          <strong>Análise por IA:</strong> geração de narrativas, detecção de
          anomalias e sugestões de otimização via Anthropic Claude
        </li>
        <li>
          <strong>Auditoria e segurança:</strong> registro de ações para investigação
          de problemas
        </li>
      </ul>

      <h2>5. Com quem compartilhamos</h2>
      <p>
        Compartilhamos dados estritamente com prestadores de serviço necessários
        à operação:
      </p>
      <ul>
        <li>
          <strong>Meta (Facebook):</strong> via Marketing API e Conversions API,
          para gerenciar campanhas e enviar conversões, e via Plataforma do
          WhatsApp Business (Cloud API), para enviar e receber as mensagens das
          empresas clientes
        </li>
        <li>
          <strong>Google:</strong> via Google Ads API e Enhanced Conversions
        </li>
        <li>
          <strong>Supabase (PostgreSQL gerenciado):</strong> banco de dados,
          hospedado em São Paulo (sa-east-1)
        </li>
        <li>
          <strong>DigitalOcean:</strong> servidores, banco de dados e
          armazenamento de arquivos do CRM e do atendimento pelo WhatsApp,
          nos Estados Unidos
        </li>
        <li>
          <strong>Vercel:</strong> hospedagem das aplicações web
        </li>
        <li>
          <strong>Anthropic (Claude), OpenAI e Google (Gemini):</strong>{" "}
          processamento de IA. No Tráfego DDG, apenas métricas agregadas. No
          atendimento pelo WhatsApp, o conteúdo da conversa, somente quando a
          empresa cliente ativa o assistente de atendimento. Esses provedores não
          usam os dados para treinar os modelos deles
        </li>
      </ul>
      <p>
        Por causa desses provedores, parte dos dados é tratada fora do Brasil
        (Estados Unidos), sempre com as garantias previstas na LGPD.
      </p>
      <p>
        <strong>Não vendemos, alugamos ou compartilhamos dados pessoais com
        terceiros para fins de marketing.</strong>
      </p>

      <h2>6. Como protegemos</h2>
      <ul>
        <li>
          <strong>Criptografia em repouso:</strong> tokens OAuth e dados sensíveis
          armazenados via Supabase Vault
        </li>
        <li>
          <strong>Criptografia em trânsito:</strong> HTTPS/TLS em todas as
          comunicações
        </li>
        <li>
          <strong>RLS (Row Level Security):</strong> banco de dados isolado por
          cliente — cada usuário só acessa os dados dele
        </li>
        <li>
          <strong>HMAC SHA-256:</strong> webhooks autenticados com assinatura
          criptográfica
        </li>
        <li>
          <strong>Hash de PII:</strong> emails e telefones de leads são hash
          SHA-256 antes do armazenamento
        </li>
        <li>
          <strong>Auditoria:</strong> todos os acessos e ações são registrados
        </li>
        <li>
          <strong>WhatsApp:</strong> webhooks da Meta conferidos pela assinatura
          do app antes de qualquer gravação; cada empresa só enxerga as
          conversas dos próprios números, e cada pessoa da equipe só as caixas
          que a empresa liberou para ela
        </li>
      </ul>

      <h2>7. Por quanto tempo guardamos</h2>
      <ul>
        <li>
          <strong>Dados de campanhas:</strong> enquanto o contrato com a DDG
          estiver ativo
        </li>
        <li>
          <strong>Logs de auditoria:</strong> 12 meses
        </li>
        <li>
          <strong>Tokens OAuth:</strong> até o cliente desconectar a integração
        </li>
        <li>
          <strong>Conversas e arquivos do WhatsApp:</strong> enquanto o contrato
          da empresa cliente estiver ativo, ou até ela pedir a exclusão
        </li>
        <li>
          <strong>Após encerramento do contrato:</strong> dados são arquivados
          (soft delete) por 30 dias e depois excluídos permanentemente, exceto
          quando obrigação legal exigir retenção maior (ex: dados fiscais)
        </li>
      </ul>

      <h2>8. Seus direitos (LGPD)</h2>
      <p>De acordo com a Lei Geral de Proteção de Dados (Lei 13.709/2018), você tem direito a:</p>
      <ul>
        <li>Confirmar a existência de tratamento dos seus dados</li>
        <li>Acessar os dados</li>
        <li>Corrigir dados incompletos, inexatos ou desatualizados</li>
        <li>Solicitar anonimização, bloqueio ou eliminação</li>
        <li>Solicitar a portabilidade dos dados</li>
        <li>Revogar o consentimento</li>
      </ul>
      <p>
        Para exercer qualquer desses direitos, envie email para{" "}
        <a href="mailto:lucas@dmaisum.com.br">lucas@dmaisum.com.br</a>{" "}com o
        assunto &ldquo;LGPD - [direito desejado]&rdquo;. Responderemos em até 15
        dias úteis.
      </p>
      <p>
        Se você conversou pelo WhatsApp com uma empresa que usa as nossas
        plataformas, pode fazer o pedido direto a essa empresa ou a nós pelo
        mesmo email, informando o número de telefone e o nome da empresa. Nós
        avisamos a empresa e cumprimos o pedido conforme a instrução dela e a LGPD.
      </p>

      <h2>9. Exclusão de dados</h2>
      <p>
        Para solicitar exclusão imediata dos seus dados, acesse{" "}
        <a href="/excluir-dados">nossa página dedicada</a> ou envie email para{" "}
        <a href="mailto:lucas@dmaisum.com.br">lucas@dmaisum.com.br</a>.
      </p>

      <h2>10. Cookies e tracking</h2>
      <p>
        As plataformas usam apenas cookies estritamente necessários para
        autenticação. Não usamos cookies de marketing, retargeting ou analytics
        de terceiros nas plataformas.
      </p>

      <h2>11. Crianças</h2>
      <p>
        Esta plataforma <strong>não é destinada a menores de 18 anos</strong>. Não
        coletamos intencionalmente dados de crianças.
      </p>

      <h2>12. Mudanças nesta política</h2>
      <p>
        Podemos atualizar esta política conforme necessário. Mudanças
        significativas serão notificadas por email aos usuários do painel. A data
        da última atualização sempre ficará visível no topo desta página.
      </p>

      <h2>13. Contato</h2>
      <p>
        <strong>Encarregado de Proteção de Dados (DPO):</strong>
        <br />
        Nome: Lucas Cassiano
        <br />
        Email: <a href="mailto:lucas@dmaisum.com.br">lucas@dmaisum.com.br</a>
        <br />
        Empresa: Dose de Growth (DD Growth)
      </p>
    </article>
  );
}
