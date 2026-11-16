import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Termos de Serviço",
  description: "Termos de uso das plataformas da Dose de Growth: Tráfego DDG, CRM Dose de Growth, Disparador de WhatsApp e Hub de Marketplaces",
};

export default function TermosPage() {
  return (
    <article>
      <h1>Termos de Serviço</h1>
      <p className="text-xs text-muted-foreground">
        Última atualização: 16 de novembro de 2026
      </p>

      <h2>1. Aceitação</h2>
      <p>
        Ao acessar e utilizar as plataformas <strong>Tráfego DDG</strong>,{" "}
        <strong>CRM Dose de Growth</strong>, <strong>Disparador</strong> e{" "}
        <strong>Hub de Marketplaces DDG</strong>{" "}
        (&ldquo;Plataforma&rdquo;), operadas pela <strong>Dose de Growth</strong>{" "}
        (&ldquo;DDG&rdquo;), você concorda com estes Termos de Serviço. Se você
        não concorda, não utilize a Plataforma.
      </p>

      <h2>2. Sobre a Plataforma</h2>
      <p>
        A Plataforma reúne as ferramentas proprietárias que a DDG usa para operar
        o marketing e o atendimento dos seus clientes: gestão de tráfego pago
        (Tráfego DDG), central de atendimento pelo WhatsApp oficial da empresa
        cliente (CRM Dose de Growth, em painel.dosedegrowthcrm.com.br) e envio de
        modelos de mensagem aprovados pela Meta (Disparador). A Plataforma se
        conecta a:
      </p>
      <ul>
        <li>Meta Ads (Facebook/Instagram) via Marketing API e Conversions API</li>
        <li>Google Ads via Google Ads API e Enhanced Conversions</li>
        <li>
          Plataforma do WhatsApp Business (Meta), via Cloud API, para enviar e
          receber mensagens do número oficial da empresa cliente
        </li>
        <li>Painéis comerciais de clientes via webhook autenticado</li>
        <li>
          Mercado Livre, Magalu, Shopee, Amazon e TikTok Shop, pelas APIs
          oficiais de cada marketplace, para vender os produtos da loja cliente
          (Hub de Marketplaces DDG)
        </li>
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
        <li>
          Atender os clientes da sua empresa pelo número oficial de WhatsApp dela
          e enviar modelos aprovados pela Meta para quem já se relaciona com a
          empresa
        </li>
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

      <h2>10. WhatsApp Business (CRM Dose de Growth e Disparador)</h2>
      <p>
        Quando a sua empresa conecta o número oficial de WhatsApp dela à
        Plataforma, você confirma que:
      </p>
      <ul>
        <li>
          A empresa é dona do número ou tem autorização legítima para usá-lo
        </li>
        <li>
          A empresa segue a{" "}
          <a href="https://business.whatsapp.com/policy" target="_blank" rel="noopener">
            Política do WhatsApp Business
          </a>{" "}
          e a{" "}
          <a href="https://www.whatsapp.com/legal/commerce-policy" target="_blank" rel="noopener">
            Política Comercial do WhatsApp
          </a>
        </li>
        <li>
          Só envia mensagens para quem já se relaciona com a empresa e aceitou
          receber contato pelo WhatsApp, e atende na hora qualquer pedido para
          parar de receber
        </li>
        <li>
          Fora da janela de 24 horas, só usa modelos aprovados pela Meta, e os
          custos dessas mensagens cobrados pela Meta são da empresa
        </li>
        <li>
          É a responsável pelos dados dos clientes dela; a DDG trata esses dados
          só para prestar o atendimento, conforme a{" "}
          <a href="/privacidade">Política de Privacidade</a>
        </li>
      </ul>
      <p>
        A empresa pode desconectar o número a qualquer momento, pedindo à DDG ou
        removendo o acesso no Gerenciador de Negócios da Meta.
      </p>

      <h2>11. Hub de Marketplaces DDG</h2>
      <p>
        O Hub de Marketplaces DDG conecta a conta de vendedor da loja cliente aos
        marketplaces. A loja autoriza a integração na conta dela e pode
        revogar a autorização a qualquer momento, pelo próprio marketplace ou
        pedindo à DDG.
      </p>
      <ul>
        <li>
          A venda é feita no CNPJ e na conta de vendedor da loja cliente, que
          continua responsável pelos produtos, pela nota fiscal e pelas regras
          de cada marketplace
        </li>
        <li>
          A DDG opera os anúncios, o estoque, os pedidos e o atendimento ao
          comprador conforme o contrato com a loja, e usa os dados de pedido e
          de comprador só para isso
        </li>
        <li>
          O estoque é único: quando um produto vende em um canal, a quantidade é
          baixada nos demais
        </li>
        <li>
          A DDG cumpre os termos e as políticas de uso de API e de proteção de
          dados de cada marketplace
        </li>
      </ul>

      <h2>12. Disponibilidade</h2>
      <p>
        Buscamos manter a Plataforma operacional 24/7, mas não garantimos
        disponibilidade contínua. Manutenções programadas e falhas eventuais de
        terceiros (Meta, Google, Supabase, Vercel) podem causar indisponibilidade
        temporária.
      </p>

      <h2>13. Limitação de responsabilidade</h2>
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

      <h2>14. Encerramento</h2>
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

      <h2>15. Alterações nos termos</h2>
      <p>
        Podemos atualizar estes Termos a qualquer momento. Mudanças significativas
        serão notificadas com pelo menos 30 dias de antecedência aos usuários
        ativos.
      </p>

      <h2>16. Lei aplicável e foro</h2>
      <p>
        Estes Termos são regidos pelas leis brasileiras. Fica eleito o foro da
        comarca de São Paulo/SP para dirimir quaisquer controvérsias.
      </p>

      <h2>17. Contato</h2>
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
