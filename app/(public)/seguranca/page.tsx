import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Política de Segurança da Informação",
  description: "Política de segurança da informação da Dose de Growth: controle de acesso, classificação de dados, infraestrutura, vulnerabilidades e resposta a incidentes",
};

export default function SegurancaPage() {
  return (
    <article>
      <h1>Política de Segurança da Informação</h1>
      <p className="text-xs text-muted-foreground">
        Última atualização: 16 de novembro de 2026 · Revisão anual obrigatória
      </p>

      <h2>1. Objetivo e alcance</h2>
      <p>
        Esta política define como a <strong>Dose de Growth</strong> (LC Assessoria
        Digital Sociedade Unipessoal Ltda, CNPJ 44.474.032/0001-02) protege as
        informações que trata nas suas plataformas: Tráfego DDG, CRM Dose de
        Growth, Disparador e Hub de Marketplaces DDG. Vale para toda a equipe,
        prestadores de serviço com acesso aos sistemas e para todos os dados de
        clientes, de compradores e da própria empresa.
      </p>
      <p>
        <strong>Responsável pela segurança e pela proteção de dados (DPO):</strong>{" "}
        Lucas Cassiano, <a href="mailto:lucas@dmaisum.com.br">lucas@dmaisum.com.br</a>.
        Esta política complementa a{" "}
        <a href="/privacidade">Política de Privacidade</a> e os{" "}
        <a href="/termos">Termos de Serviço</a>.
      </p>

      <h2>2. Controle de acesso</h2>
      <ul>
        <li>Cada pessoa tem login próprio. Não há usuário compartilhado.</li>
        <li>
          Acesso pelo menor privilégio necessário: papéis separados (equipe DDG,
          cliente, operador) e cada cliente só enxerga os próprios dados,
          garantido no banco de dados por isolamento por cliente (Row Level
          Security).
        </li>
        <li>
          Áreas com dados sensíveis (por exemplo, pedidos e compradores dos
          marketplaces) ficam restritas a uma lista nominal de pessoas da DDG que
          operam aquela loja.
        </li>
        <li>
          Sessões com cookie seguro (httpOnly, HTTPS) e senhas guardadas só em
          forma de hash. Tokens de acesso a APIs (Meta, Google, marketplaces)
          ficam só no servidor, criptografados, e nunca são exibidos no navegador.
        </li>
        <li>
          O acesso é revogado no mesmo dia em que a pessoa deixa a equipe ou o
          cliente encerra o contrato.
        </li>
        <li>Ações nos sistemas ficam registradas em log de auditoria por 12 meses.</li>
      </ul>

      <h2>3. Classificação de dados</h2>
      <ul>
        <li><strong>Público:</strong> site, materiais de divulgação.</li>
        <li><strong>Interno:</strong> documentação de processos e configurações sem dados pessoais.</li>
        <li>
          <strong>Confidencial:</strong> dados de clientes (campanhas, vendas,
          estoque, conversas de atendimento) e tokens de integração.
        </li>
        <li>
          <strong>Restrito:</strong> dados pessoais de compradores e de pessoas
          atendidas (nome, endereço, CPF, telefone) e credenciais.
        </li>
      </ul>
      <p>
        Dados confidenciais e restritos são criptografados em repouso e em
        trânsito (HTTPS/TLS), ficam só nos sistemas da DDG e nunca são copiados
        para planilhas, e-mails ou dispositivos pessoais. Dados restritos de
        compradores são apagados ou anonimizados em até 30 dias depois da
        entrega do pedido, exceto o que a lei fiscal exige guardar.
      </p>

      <h2>4. Infraestrutura e rede</h2>
      <ul>
        <li>
          Hospedagem em provedores gerenciados com segregação de rede e firewall:
          Supabase (banco de dados em São Paulo), Vercel (aplicações web) e
          DigitalOcean (servidores e banco do atendimento, nos Estados Unidos).
        </li>
        <li>
          Bancos de dados não ficam expostos à internet aberta: acesso por chave
          de serviço e, no banco do atendimento, firewall por endereço IP.
        </li>
        <li>
          Webhooks recebidos são conferidos por assinatura criptográfica (HMAC)
          antes de qualquer gravação.
        </li>
        <li>Ambientes de teste usam dados fictícios, nunca dados reais de clientes.</li>
      </ul>

      <h2>5. Estações de trabalho</h2>
      <ul>
        <li>
          Computadores da equipe com sistema operacional atualizado e proteção
          contra malware ativa (no macOS, XProtect e Gatekeeper).
        </li>
        <li>Bloqueio de tela automático e senha obrigatória no computador.</li>
        <li>Verificação em duas etapas nas contas de provedores e plataformas que oferecem.</li>
      </ul>

      <h2>6. Gestão de vulnerabilidades</h2>
      <ul>
        <li>
          Dependências e bibliotecas atualizadas com frequência; alertas de
          segurança dos provedores (por exemplo, o painel de segurança do
          Supabase) são acompanhados e tratados.
        </li>
        <li>
          Correção por prioridade: falha crítica que expõe dados é tratada no
          mesmo dia; as demais entram no ciclo normal de atualização.
        </li>
        <li>
          Mudanças em produção passam por teste em ambiente local antes de
          publicar.
        </li>
        <li>
          Teste de invasão (pentest) por empresa externa antes de liberar acesso a
          dados pessoais completos de compradores em marketplaces.
        </li>
      </ul>

      <h2>7. Resposta a incidentes</h2>
      <p>
        <strong>Responsável:</strong> Lucas Cassiano (DPO), apoiado pela equipe
        técnica da DDG.
      </p>
      <ol>
        <li><strong>Identificar:</strong> registrar o incidente, a hora e os sistemas envolvidos.</li>
        <li><strong>Conter:</strong> revogar tokens e acessos afetados, isolar o sistema.</li>
        <li><strong>Avaliar:</strong> quais dados e quais clientes ou compradores foram atingidos.</li>
        <li>
          <strong>Notificar:</strong> a loja cliente e o marketplace envolvido em
          até 24 horas da confirmação, e a ANPD e os titulares quando a LGPD
          exigir.
        </li>
        <li><strong>Corrigir e registrar:</strong> eliminar a causa e documentar o que foi feito.</li>
      </ol>

      <h2>8. Revisão</h2>
      <p>
        Esta política é revisada pelo menos uma vez por ano, ou antes, quando
        houver mudança relevante nos sistemas ou na legislação.
      </p>
    </article>
  );
}
