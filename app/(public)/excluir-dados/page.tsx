import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Exclusão de Dados",
  description: "Como solicitar a exclusão dos seus dados do Tráfego DDG",
};

export default function ExcluirDadosPage() {
  return (
    <article>
      <h1>Solicitação de Exclusão de Dados</h1>
      <p className="text-xs text-muted-foreground">
        Última atualização: 29 de abril de 2026
      </p>

      <h2>Visão geral</h2>
      <p>
        O <strong>Tráfego DDG</strong>, plataforma operada pela{" "}
        <strong>Dose de Growth</strong>, respeita o seu direito à exclusão de
        dados pessoais conforme estabelecido pela{" "}
        <strong>Lei Geral de Proteção de Dados (LGPD - Lei 13.709/2018)</strong>{" "}
        e pelas políticas de plataformas como Meta (Facebook) e Google.
      </p>

      <h2>Quem pode solicitar</h2>
      <ul>
        <li>Usuários do painel (equipe DDG ou clientes contratantes)</li>
        <li>Pessoas que acessaram o painel via Login do Facebook</li>
        <li>
          Leads cujos dados (email/telefone hash) foram enviados via webhook do
          painel comercial de algum cliente
        </li>
      </ul>

      <h2>Como solicitar a exclusão</h2>

      <h3>Opção 1 — Email direto (recomendado)</h3>
      <p>
        Envie um email para{" "}
        <a href="mailto:lucas@dmaisum.com.br?subject=LGPD%20-%20Exclus%C3%A3o%20de%20Dados">
          lucas@dmaisum.com.br
        </a>{" "}
        com:
      </p>
      <ul>
        <li>
          <strong>Assunto:</strong> &ldquo;LGPD - Exclusão de Dados&rdquo;
        </li>
        <li>
          <strong>Corpo da mensagem:</strong>
          <ul>
            <li>Seu nome completo</li>
            <li>Email associado à conta (se for usuário do painel)</li>
            <li>
              Ou: ID do lead no sistema do cliente (se você é lead que apareceu
              em webhook de cliente)
            </li>
            <li>Confirmação de que está solicitando exclusão dos seus dados</li>
          </ul>
        </li>
      </ul>

      <h3>Opção 2 — Pelo painel (se for usuário autenticado)</h3>
      <p>
        Após fazer login no painel, vá em <strong>Configurações → Minha conta →
        Solicitar exclusão</strong>. (Funcionalidade em implementação.)
      </p>

      <h3>Opção 3 — Para usuários do Facebook Login</h3>
      <p>
        Se você se conectou ao painel usando &ldquo;Login do Facebook&rdquo; e quer
        que removamos os dados associados ao seu perfil Facebook:
      </p>
      <ol>
        <li>
          Acesse{" "}
          <a
            href="https://www.facebook.com/settings?tab=applications"
            target="_blank"
            rel="noopener"
          >
            Configurações de Apps no Facebook
          </a>
        </li>
        <li>Encontre &ldquo;Tráfego DDG&rdquo; ou &ldquo;Dose de Growth&rdquo;</li>
        <li>Clique em &ldquo;Remover&rdquo;</li>
        <li>
          O Facebook nos enviará automaticamente um sinal de exclusão e nós
          removeremos seus dados em até 7 dias
        </li>
      </ol>

      <h2>O que será excluído</h2>
      <p>Após confirmação da solicitação, removeremos:</p>
      <ul>
        <li>Sua conta de usuário e dados de perfil (nome, email, foto)</li>
        <li>Vínculos com clientes (clientes_users)</li>
        <li>Logs de auditoria associados ao seu user_id</li>
        <li>Tokens OAuth (se houver)</li>
        <li>
          Hashes de email/telefone enviados via webhook (caso aplicável)
        </li>
      </ul>

      <h2>O que NÃO será excluído</h2>
      <p>Por obrigações legais ou contratuais, podemos manter:</p>
      <ul>
        <li>Dados agregados anonimizados (não identificáveis)</li>
        <li>
          Registros financeiros que a legislação exige reter (no mínimo 5 anos)
        </li>
        <li>
          Dados necessários para defesa em processos judiciais em andamento
        </li>
      </ul>

      <h2>Prazo de resposta</h2>
      <p>
        De acordo com a LGPD (Art. 19), responderemos sua solicitação em até{" "}
        <strong>15 dias úteis</strong> a partir do recebimento. Em casos
        complexos, o prazo pode ser estendido conforme previsto em lei, sempre
        com aviso prévio.
      </p>

      <h2>Confirmação de exclusão</h2>
      <p>
        Após a exclusão ser executada, você receberá um email de confirmação no
        endereço da solicitação contendo:
      </p>
      <ul>
        <li>Data e hora da exclusão</li>
        <li>Lista de dados removidos</li>
        <li>Lista de dados retidos (se houver) com justificativa legal</li>
      </ul>

      <h2>Dados em plataformas de terceiros</h2>
      <p>
        Importante: dados que enviamos para Meta Ads (CAPI) ou Google Ads
        (Enhanced Conversions) ficam sujeitos às políticas dessas plataformas.
        Para excluí-los lá, você precisa:
      </p>
      <ul>
        <li>
          <strong>Meta:</strong>{" "}
          <a
            href="https://www.facebook.com/help/contact/784491318687824"
            target="_blank"
            rel="noopener"
          >
            Solicitar exclusão de dados pessoais ao Meta
          </a>
        </li>
        <li>
          <strong>Google:</strong>{" "}
          <a
            href="https://support.google.com/accounts/answer/3024190"
            target="_blank"
            rel="noopener"
          >
            Solicitar exclusão de dados ao Google
          </a>
        </li>
      </ul>

      <h2>Dúvidas e contestações</h2>
      <p>
        Se você não estiver satisfeito com nossa resposta, pode contactar a{" "}
        <strong>Autoridade Nacional de Proteção de Dados (ANPD)</strong>:
      </p>
      <p>
        Site:{" "}
        <a
          href="https://www.gov.br/anpd/pt-br"
          target="_blank"
          rel="noopener"
        >
          gov.br/anpd
        </a>
      </p>

      <h2>Contato direto</h2>
      <p>
        <strong>Encarregado de Proteção de Dados (DPO):</strong>
        <br />
        Lucas Cassiano — Dose de Growth
        <br />
        Email:{" "}
        <a href="mailto:lucas@dmaisum.com.br">lucas@dmaisum.com.br</a>
      </p>
    </article>
  );
}
