import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Política de Privacidade",
  description: "Política de privacidade do Tráfego DDG — Dose de Growth",
};

export default function PrivacidadePage() {
  return (
    <article>
      <h1>Política de Privacidade</h1>
      <p className="text-xs text-muted-foreground">
        Última atualização: 29 de abril de 2026 · Vigência imediata
      </p>

      <h2>1. Quem somos</h2>
      <p>
        O <strong>Tráfego DDG</strong> é uma plataforma proprietária de gestão
        de tráfego pago, operada pela <strong>Dose de Growth (&ldquo;DDG&rdquo;)</strong>,
        agência brasileira especializada em marketing digital. Esta política descreve
        como coletamos, usamos, armazenamos e protegemos os dados pessoais
        tratados pelo sistema.
      </p>
      <p>
        <strong>Controlador dos dados:</strong> Dose de Growth (DD Growth) <br />
        <strong>Email para questões de privacidade:</strong> lucas@dmaisum.com.br <br />
        <strong>Site:</strong>{" "}
        <a href="https://paineldosedegrowth.vercel.app">
          paineldosedegrowth.vercel.app
        </a>
      </p>

      <h2>2. Para quem essa política se aplica</h2>
      <p>
        O painel é uma <strong>ferramenta operacional interna</strong> da agência,
        utilizada por:
      </p>
      <ul>
        <li>Equipe da DDG (gestores de tráfego)</li>
        <li>
          Clientes contratantes da DDG (acesso somente leitura aos próprios dados)
        </li>
      </ul>
      <p>
        <strong>O painel não é destinado ao público em geral nem ao usuário final
        de nossos clientes.</strong>
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

      <h2>4. Como usamos os dados</h2>
      <ul>
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
          para gerenciar campanhas e enviar conversões
        </li>
        <li>
          <strong>Google:</strong> via Google Ads API e Enhanced Conversions
        </li>
        <li>
          <strong>Supabase (PostgreSQL gerenciado):</strong> banco de dados
          principal, hospedado em São Paulo (sa-east-1)
        </li>
        <li>
          <strong>Vercel:</strong> hospedagem da aplicação web
        </li>
        <li>
          <strong>Anthropic (Claude):</strong> processamento de IA — apenas dados
          agregados e métricas, nunca dados pessoais identificáveis
        </li>
      </ul>
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
        <a href="mailto:lucas@dmaisum.com.br">lucas@dmaisum.com.br</a> com o
        assunto &ldquo;LGPD - [direito desejado]&rdquo;. Responderemos em até 15
        dias úteis.
      </p>

      <h2>9. Exclusão de dados</h2>
      <p>
        Para solicitar exclusão imediata dos seus dados, acesse{" "}
        <a href="/excluir-dados">nossa página dedicada</a> ou envie email para{" "}
        <a href="mailto:lucas@dmaisum.com.br">lucas@dmaisum.com.br</a>.
      </p>

      <h2>10. Cookies e tracking</h2>
      <p>
        O painel usa apenas cookies estritamente necessários para autenticação
        (Supabase Auth). Não usamos cookies de marketing, retargeting ou
        analytics de terceiros no painel.
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
