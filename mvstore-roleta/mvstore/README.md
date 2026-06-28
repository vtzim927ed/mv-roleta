# 👑 MV Store - Roleta de Prêmios

Plataforma completa de roleta de prêmios para clientes da MV Store.

## 🚀 Stack Tecnológica

- **Frontend**: Next.js 14 + React 18
- **Estilo**: Tailwind CSS com tema cyan/dark premium
- **Banco de dados**: Supabase (PostgreSQL)
- **Animações**: Framer Motion + Canvas API
- **Deploy**: Vercel (gratuito)

---

## 📦 Instalação Local

### 1. Clonar e instalar dependências
```bash
git clone <seu-repositorio>
cd mvstore-roleta
npm install
```

### 2. Configurar variáveis de ambiente
```bash
cp .env.local.example .env.local
```
Edite `.env.local` com suas credenciais:
```
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhb...
NEXT_PUBLIC_ADMIN_USER=admin
NEXT_PUBLIC_ADMIN_PASS=sua_senha_aqui
```

### 3. Configurar banco de dados (Supabase)
1. Acesse [supabase.com](https://supabase.com) e crie um projeto gratuito
2. No painel do projeto, vá em **SQL Editor**
3. Cole o conteúdo de `supabase-schema.sql` e execute
4. Copie a URL e a anon key em **Settings > API**
5. Cole no seu `.env.local`

### 4. Rodar localmente
```bash
npm run dev
```
Acesse: `http://localhost:3000`

---

## 🌐 Deploy na Vercel (Gratuito)

### Opção 1 - Via GitHub (Recomendado)
1. Suba o projeto para um repositório GitHub
2. Acesse [vercel.com](https://vercel.com) e importe o repositório
3. Em **Environment Variables**, adicione:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_ADMIN_USER`
   - `NEXT_PUBLIC_ADMIN_PASS`
4. Clique em **Deploy**

### Opção 2 - Via CLI
```bash
npm install -g vercel
vercel login
vercel --prod
```

---

## 🎯 Como Usar

### Área do Cliente
- Acesse a URL principal do site
- Insira o código único recebido após a compra
- O sistema valida o código e mostra os giros disponíveis
- Cada giro usa 1 crédito automaticamente
- Ao ganhar um prêmio, entre em contato via WhatsApp

### Painel Administrativo
- Acesse `/admin`
- Login com as credenciais configuradas
- **Aba Clientes**: Criar códigos, adicionar giros, buscar clientes
- **Aba Histórico**: Ver todos os giros realizados
- **Aba Prêmios**: Editar nomes, porcentagens, cores, ativar/desativar
- **Aba Estatísticas**: Ver métricas e prêmios mais sorteados

---

## 🎰 Prêmios e Porcentagens

| Prêmio | Porcentagem |
|--------|-------------|
| 💵 Pix R$5 | 6,8% |
| 💵 Pix R$15 | 3,4% |
| 💵 Pix R$20 | 1,7% |
| 🔥 Conta Nitrada | 10,2% |
| 🎨 Decoração R$15,99 | 8,2% |
| 🚀 2 Impulsos | 8,2% |
| 🚀 2 Impulsos | 10,2% |
| 🎁 Produto à escolha | 1,4% |
| 🔄 Tente novamente | 50,0% |
| **Total** | **100%** |

---

## 📁 Estrutura do Projeto

```
mvstore-roleta/
├── pages/
│   ├── index.js          # Página principal (cliente)
│   ├── _app.js
│   └── admin/
│       ├── index.js      # Login admin
│       └── dashboard.js  # Painel admin completo
├── components/
│   ├── SpinWheel.js      # Roleta canvas animada
│   ├── PrizeModal.js     # Modal de prêmio
│   └── StarsBackground.js # Fundo animado
├── lib/
│   ├── supabase.js       # Cliente e helpers do Supabase
│   └── prizes.js         # Lógica da roleta e prêmios
├── styles/
│   └── globals.css       # Estilos globais
├── supabase-schema.sql   # Schema do banco de dados
├── .env.local.example    # Template de variáveis
└── vercel.json           # Config de deploy
```

---

## 🔒 Segurança

- Autenticação do admin via session storage
- RLS (Row Level Security) habilitado no Supabase
- Validação de códigos no lado do servidor
- Prevenção de giros negativos no banco

---

## 🎨 Customização

### Alterar código de admin
No `.env.local`:
```
NEXT_PUBLIC_ADMIN_USER=seu_usuario
NEXT_PUBLIC_ADMIN_PASS=sua_senha_forte
```

### Alterar número do WhatsApp
Em `components/PrizeModal.js`, linha com `wa.me/`:
```js
href="https://wa.me/5511999999999?text=..."
```

### Alterar prêmios
Pelo painel admin > Aba Prêmios, ou diretamente no banco.

---

## 📞 Suporte

Para dúvidas técnicas, consulte a documentação:
- [Next.js Docs](https://nextjs.org/docs)
- [Supabase Docs](https://supabase.com/docs)
- [Vercel Docs](https://vercel.com/docs)
