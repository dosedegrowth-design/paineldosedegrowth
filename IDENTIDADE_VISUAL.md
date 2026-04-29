# IDENTIDADE VISUAL — Tráfego DDG
**Brand Guidelines aplicado ao projeto**

> Este documento traduz o brand guidelines da Dose de Growth para tokens de design utilizáveis no código (Tailwind v4 + shadcn).

---

## 1. CORES

### Light Spectrum (paleta principal)

| Token | Hex | Uso |
|---|---|---|
| `--ddg-orange` | `#F15839` | Cor primária — CTAs, highlights, gráficos de destaque |
| `--ddg-black` | `#171717` | Background principal (dark mode default) |
| `--ddg-white` | `#F3F3F3` | Texto principal sobre fundo escuro |

### Gold Spectrum (acento premium)

| Token | Hex | Uso |
|---|---|---|
| `--ddg-gold-dark` | `#AC802E` | Versão "premium"/dourado escuro |
| `--ddg-gold-light` | `#E3D4A6` | Versão "premium"/dourado claro |

> **Decisão**: usar `Light Spectrum` como base. `Gold` reservado para tier premium / clientes whitelabel especiais.

### Estados (derivados, propostos)

| Token | Hex | Uso |
|---|---|---|
| `--success` | `#10B981` | ROAS bom, CPA dentro da meta, conversão subindo |
| `--warning` | `#F59E0B` | Alertas médios, anomalia leve |
| `--danger` | `#EF4444` | CPA acima do limite, ROAS caindo, erro crítico |
| `--neutral-700` | `#374151` | Bordas e divisores |
| `--neutral-500` | `#6B7280` | Texto secundário |
| `--neutral-300` | `#D1D5DB` | Placeholders |

---

## 2. TIPOGRAFIA

**Fonte oficial**: `Montserrat`

### Pesos utilizados
- **Bold (700)** — títulos, KPIs grandes, ações destacadas
- **Medium (500)** — subtítulos, labels de tabela
- **Light (300)** — texto auxiliar, descrições

### Escala (proposta para o produto)

| Classe Tailwind | Tamanho | Uso |
|---|---|---|
| `text-6xl font-bold` | 60px | Hero / KPI gigante (página inicial) |
| `text-4xl font-bold` | 36px | Page title |
| `text-2xl font-bold` | 24px | Section title |
| `text-xl font-medium` | 20px | Card title |
| `text-base font-medium` | 16px | Body / table cell |
| `text-sm font-light` | 14px | Auxiliar / labels |
| `text-xs font-light` | 12px | Hint / helper text |

### Aplicação Tailwind v4
```css
/* globals.css */
@import "tailwindcss";

@theme {
  --font-sans: "Montserrat", system-ui, sans-serif;
  --font-display: "Montserrat", system-ui, sans-serif;
}
```

```bash
# instalação
npm install @fontsource/montserrat
```

```typescript
// app/layout.tsx
import "@fontsource/montserrat/300.css";  // Light
import "@fontsource/montserrat/500.css";  // Medium
import "@fontsource/montserrat/700.css";  // Bold
```

---

## 3. LOGO

### Variações disponíveis (do brand guidelines)
1. Logo + "Dose de Growth" (full)
2. Logo + "DG" (compacto)
3. Logo + "DD Growth" (alt)
4. Logo isolado (icon-only — para favicon e mobile)
5. Apenas a flecha estilizada (símbolo)

### Uso no produto
- **Header (desktop)**: Logo + "DG" em laranja
- **Sidebar collapsed**: apenas o ícone hexagonal
- **Favicon**: ícone hexagonal laranja
- **Login page**: Logo + "Dose de Growth" full
- **Email/Relatório PDF**: Logo + "Dose de Growth" + tagline

### Onde colocar os arquivos
```
trafego-ddg/
└── public/
    └── brand/
        ├── logo-full.svg         # Logo + "Dose de Growth"
        ├── logo-compact.svg      # Logo + "DG"
        ├── logo-icon.svg         # Apenas hexágono
        ├── logo-symbol.svg       # Apenas flecha
        ├── logo-gold-full.svg    # Versão dourada (premium)
        └── favicon.ico
```

---

## 4. ICONOGRAFIA

### Estilo
- **Linha**: stroke 1.5-2px
- **Cor padrão**: `#F3F3F3` no dark / `#171717` no light
- **Cor de destaque**: `#F15839` (laranja DDG)

### Biblioteca recomendada
**Lucide React** (`lucide-react`) — ícones limpos, monoline, padrão shadcn.

```bash
npm install lucide-react
```

### Mapeamento dos ícones do brand guidelines → Lucide
| Brand DDG | Lucide |
|---|---|
| Chip / processador | `Cpu` |
| Carrinho | `ShoppingCart` |
| Apresentação / dashboard | `Presentation` |
| Bandeira | `Flag` |
| Alvo | `Target` |
| Megafone | `Megaphone` |
| Suporte / atendente | `Headset` |
| Chat | `MessageSquare` |

---

## 5. IMAGENS / FOTOGRAFIA

### Estilo do brand DDG
- **Tons**: laranja avermelhado + dourado, contraste com preto
- **Conceito**: tecnologia + movimento + luz (long exposure, bokeh, neon)
- **Atmosfera**: noturna, urbana, futurista

### Aplicação no produto
- **Hero da landing/login**: imagem com filtro escuro + overlay laranja
- **Empty states**: ilustrações monocromáticas em laranja
- **Cards de relatório**: gradient `#171717` → `#F15839` 20% opacity

---

## 6. SHADCN/UI — TEMA DDG

### Cores customizadas (`components.json` + `globals.css`)

```css
/* globals.css */
@layer base {
  :root {
    /* Default = DARK MODE (DDG é dark-first) */
    --background: 0 0% 9%;          /* #171717 */
    --foreground: 0 0% 95%;         /* #F3F3F3 */

    --card: 0 0% 12%;
    --card-foreground: 0 0% 95%;

    --popover: 0 0% 12%;
    --popover-foreground: 0 0% 95%;

    --primary: 11 87% 58%;          /* #F15839 - laranja DDG */
    --primary-foreground: 0 0% 95%;

    --secondary: 0 0% 18%;
    --secondary-foreground: 0 0% 95%;

    --muted: 0 0% 15%;
    --muted-foreground: 0 0% 60%;

    --accent: 11 87% 58%;
    --accent-foreground: 0 0% 95%;

    --destructive: 0 84% 60%;       /* vermelho */
    --destructive-foreground: 0 0% 95%;

    --border: 0 0% 18%;
    --input: 0 0% 18%;
    --ring: 11 87% 58%;             /* foco laranja DDG */

    --success: 158 64% 42%;
    --warning: 38 92% 50%;

    --radius: 0.5rem;
  }

  .light {
    --background: 0 0% 98%;
    --foreground: 0 0% 9%;

    --card: 0 0% 100%;
    --card-foreground: 0 0% 9%;

    --primary: 11 87% 58%;
    --primary-foreground: 0 0% 100%;

    /* etc */
  }
}
```

---

## 7. PRINCÍPIOS DE DESIGN

### 1. **Dark-first**
Dark mode é o default. Light mode é opcional (não obrigatório no MVP).

### 2. **Laranja é estratégico**
Não inundar de laranja. Usar para:
- CTAs primários
- KPIs em destaque
- Linha de gráfico principal
- Estado ativo/selecionado

### 3. **Densidade alta, hierarquia clara**
Dashboard de tráfego = muita informação. Usar:
- Espaçamento consistente (padding 4/6/8)
- Cards com borda sutil (`border-neutral-800`)
- Tipografia escalada

### 4. **Tabelas são protagonistas**
Maior parte do tempo o gestor olha tabelas. Investir em:
- Sort + filter sempre
- Sticky header
- Color-coding de células (verde/amarelo/vermelho por threshold)
- Densidade ajustável (compact/comfortable)

### 5. **Microinterações sutis**
- Framer Motion para transições de página
- Hover states com transition 150ms
- Skeleton loading em vez de spinner

---

## 8. EXEMPLOS DE COMPONENTES

### KPI Card
```tsx
<Card className="bg-card border-neutral-800">
  <CardHeader className="pb-2">
    <CardTitle className="text-sm font-light text-muted-foreground">
      Investimento Hoje
    </CardTitle>
  </CardHeader>
  <CardContent>
    <div className="text-3xl font-bold">R$ 12.450</div>
    <div className="flex items-center gap-1 text-sm text-success">
      <TrendingUp className="w-4 h-4" />
      +18% vs média 7d
    </div>
  </CardContent>
</Card>
```

### Botão primário
```tsx
<Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
  Sincronizar agora
</Button>
```

### Status badge
```tsx
<Badge className="bg-success/20 text-success border-success/40">
  ROAS bom
</Badge>
```

---

## 9. CHECKLIST DE IMPLEMENTAÇÃO

- [ ] Adicionar Montserrat via `@fontsource/montserrat`
- [ ] Configurar `globals.css` com variáveis CSS DDG
- [ ] Configurar `components.json` shadcn com tema custom
- [ ] Baixar logos oficiais e salvar em `public/brand/`
- [ ] Criar `favicon.ico` a partir do hexágono laranja
- [ ] Definir Open Graph image padrão (`public/og-image.png`)
- [ ] Configurar metadata Next.js com cor `#F15839` (theme-color)

```typescript
// app/layout.tsx
export const metadata = {
  title: "Tráfego DDG",
  description: "Dashboard inteligente de tráfego pago",
  themeColor: "#F15839",
};
```

---

## 10. REFERÊNCIA

Brand Guidelines DDG: imagem fornecida pelo Lucas em 2026-04-28
