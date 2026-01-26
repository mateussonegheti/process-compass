# Process Compass - Ferramenta de Gestão de Processos

## 🚀 Acesso Online (GitHub Pages)

O projeto está **hosteado gratuitamente no GitHub Pages** e pode ser acessado em:

**[process-compass.mateussonegheti.me](https://mateussonegheti.github.io/process-compass/)**

Ou diretamente via GitHub Pages:
**[https://mateussonegheti.github.io/process-compass/](https://mateussonegheti.github.io/process-compass/)**

### Funcionalidades Principais

- **Dashboard de Supervisor** - Visualize e gerencie avaliações de processos
- **Formulário de Avaliação** - Avalie processos empresariais
- **Painel de Relatórios** - Análise consolidada de dados
- **Merge de Planilhas** - Combine múltiplos arquivos de dados
- **Autenticação Integrada** - Sistema de login seguro via Supabase

## 📋 Desenvolvimento Local

### Pré-requisitos

- Node.js 20+ ou Bun
- npm/bun para gerenciador de pacotes

### Instalação

```sh
# Clone o repositório
git clone https://github.com/mateussonegheti/process-compass.git
cd process-compass

# Instale as dependências (com npm)
npm install

# Ou com bun
bun install
```

### Executar Localmente

```sh
# Desenvolvimento com hot reload
npm run dev
# ou
bun run dev

# Acessar em: http://localhost:8080
```

### Build para Produção

```sh
npm run build
# ou
bun run build

# Preview da build
npm run preview
```

## 🔧 Configuração do GitHub Pages

Este projeto está automaticamente configurado para deploy no GitHub Pages através de um workflow do GitHub Actions:

- **Workflow**: `.github/workflows/deploy.yml`
- **Base URL**: `/process-compass/`
- **Trigger**: Deploy automático ao fazer push para a branch `main`

O site é reconstruído e reimplantado automaticamente a cada atualização.

## 📁 Estrutura do Projeto

```
src/
├── components/
│   ├── cogede/          # Componentes principais da aplicação
│   └── ui/              # Componentes shadcn/ui reutilizáveis
├── pages/               # Páginas da aplicação
├── hooks/               # React hooks customizados
├── integrations/        # Integrações externas (Supabase)
├── lib/                 # Utilitários e helpers
└── types/               # Definições de tipos TypeScript
```

## 🏗️ Stack Tecnológico

- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Database**: Supabase PostgreSQL
- **Autenticação**: Supabase Auth
- **State Management**: React Query
- **Formulários**: React Hook Form

## 📝 Desenvolvimento
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)
