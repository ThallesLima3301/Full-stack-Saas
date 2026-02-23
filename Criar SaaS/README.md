# 🚀 TaskFlow - SaaS de Gestão de Projetos

> Sistema completo de gerenciamento de projetos e tarefas com autenticação, 
> dashboard interativo e quadro Kanban. Desenvolvido do zero com Node.js, 
> React, TypeScript e SQLite.
---

## 📋 O que eu construí
### Backend (Node.js + Express)
- **API RESTful** completa com autenticação JWT (access + refresh tokens)
- **Banco de dados SQLite** com Prisma ORM - sem necessidade de Docker ou PostgreSQL
- **Sistema de autenticação** seguro com hash de senhas (bcrypt)
- **CRUD completo** de projetos, tarefas, membros e atividades
- **Middleware de proteção** de rotas e tratamento de erros global
- **CORS configurado** para comunicação com o frontend

### Frontend (React + TypeScript)
- **Landing Page** moderna e responsiva com seções de hero, recursos, estatísticas e preços
- **Dashboard interativo** com visualização de projetos, estatísticas e Kanban board
- **Sistema de autenticação** integrado com o backend
- **UI components** customizados (botões, cards, modais, badges)
- **Drag-and-drop ready** para o quadro Kanban (estrutura preparada)

---

## 🛠️ Tecnologias Utilizadas

### Backend
| Tecnologia | Propósito |
|------------|-----------|
| Node.js + Express | Servidor HTTP e rotas |
| TypeScript | Tipagem segura |
| Prisma ORM | Acesso ao banco de dados |
| SQLite | Banco de dados local (sem Docker) |
| JWT | Autenticação stateless |
| Bcrypt | Hash de senhas |
| Zod | Validação de dados |

### Frontend
| Tecnologia | Propósito |
|------------|-----------|
| React 18 | Interface do usuário |
| TypeScript | Tipagem segura |
| Tailwind CSS | Estilização utilitária |
| Lucide React | Ícones modernos |
| Radix UI | Componentes acessíveis |

---

## 📁 Estrutura do Projeto
taskflow/
├── taskflow-backend/          # API Node.js
│   ├── prisma/
│   │   ├── schema.prisma      # Modelos do banco
│   │   └── dev.db             # Banco SQLite
│   ├── src/
│   │   ├── config/            # Configurações (env, database)
│   │   ├── middleware/        # Auth, error handler, rate limiter
│   │   ├── modules/           # Módulos da API
│   │   │   ├── auth/          # Login, register, refresh token
│   │   │   ├── projects/      # CRUD de projetos
│   │   │   └── tasks/         # CRUD de tarefas + Kanban
│   │   ├── utils/             # JWT, hash, validadores
│   │   ├── app.ts             # Configuração Express
│   │   └── server.ts          # Entry point
│   └── package.json
│
└── taskflow-frontend/         # Aplicação React
├── src/
│   ├── components/        # Componentes React
│   │   ├── LandingPage.tsx    # Página inicial
│   │   ├── Dashboard.tsx      # Painel principal
│   │   └── ui/                # Componentes de UI
│   ├── hooks/             # Custom hooks (useAuth)
│   ├── services/          # Chamadas à API
│   └── App.tsx            # Roteamento principal
└── package.json
plain


---

## 🚀 Como executar

### Pré-requisitos
- Node.js 18+
- npm ou yarn

### Backend

cd taskflow-backend

# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp .env.example .env

# Gerar cliente Prisma e criar banco
npx prisma generate
npx prisma migrate dev --name init

# Iniciar servidor
npm run dev

# Servidor rodando em http://localhost:5000
Frontend

cd taskflow-frontend

# Instalar dependências
npm install

# Iniciar aplicação
npm run dev

# Aplicação em http://localhost:5173
🔐 API Endpoints
Autenticação
Table

Método	Endpoint	Descrição
POST	/api/v1/auth/register	Criar conta
POST	/api/v1/auth/login	Fazer login
POST	/api/v1/auth/refresh-token	Renovar token
GET	/api/v1/auth/me	Perfil do usuário
POST	/api/v1/auth/logout	Sair
Projetos
Table

Método	Endpoint	Descrição
GET	/api/v1/projects	Listar projetos
POST	/api/v1/projects	Criar projeto
GET	/api/v1/projects/:id	Detalhes do projeto
PATCH	/api/v1/projects/:id	Atualizar projeto
DELETE	/api/v1/projects/:id	Excluir projeto
POST	/api/v1/projects/:id/members	Adicionar membro
Tarefas (Kanban)


Método	Endpoint	Descrição
GET	/api/v1/tasks/project/:id	Tarefas do projeto
POST	/api/v1/tasks	Criar tarefa
PATCH	/api/v1/tasks/:id	Atualizar tarefa
PATCH	/api/v1/tasks/:id/reorder	Mover no Kanban
DELETE	/api/v1/tasks/:id	Excluir tarefa
🎯 Funcionalidades Implementadas
✅ Backend
[x] Registro e login de usuários
[x] Autenticação JWT com refresh tokens
[x] CRUD completo de projetos
[x] CRUD completo de tarefas
[x] Sistema de permissões (owner, admin, member)
[x] Validação de dados com Zod
[x] Tratamento global de erros
[x] Rate limiting em rotas de auth
✅ Frontend
[x] Landing page responsiva
[x] Formulário de login funcional
[x] Dashboard com estatísticas
[x] Listagem de projetos
[x] Quadro Kanban (visual)
[x] Modais de criação (tarefas e projetos)
[x] Integração com API backend
🗄️ Modelo do Banco de Dados
prisma

User {
  id, email, password, name, avatar, role, status
  ownedProjects[], memberships[], assignedTasks[]
}

Project {
  id, name, description, status, color
  owner, members[], tasks[], tags[]
}

Task {
  id, title, description, status, priority, dueDate, order
  project, assignee, creator, tags[]
}

RefreshToken {
  id, hashedToken, user, revoked, expiresAt
}
🧪 Testando a API
Use o arquivo test-api.http na raiz do backend:
http

### Health Check
GET http://localhost:5000/health

### Registrar
POST http://localhost:5000/api/v1/auth/register
Content-Type: application/json

{
  "name": "Meu Nome",
  "email": "email@teste.com",
  "password": "123456"
}
Ou acesse o Prisma Studio:


npx prisma studio
# http://localhost:5555
🚧 Próximos Passos
[ ] Implementar drag-and-drop funcional no Kanban (@hello-pangea/dnd)
[ ] Adicionar WebSockets para atualizações em tempo real
[ ] Sistema de notificações
[ ] Upload de arquivos (avatar, anexos)
[ ] Testes automatizados (Jest)
[ ] Deploy (Railway/Render para backend, Vercel para frontend)
📝 Aprendizados
Durante este projeto, aprendi a:
Configurar uma API REST completa com TypeScript e Express
Usar Prisma ORM com SQLite para desenvolvimento local
Implementar autenticação JWT segura com refresh tokens
Estruturar um projeto em camadas (controllers, services, middleware)
Integrar frontend React com backend Node.js
Lidar com CORS e variáveis de ambiente
Criar hooks customizados no React para gerenciamento de estado
👨‍💻 Autor
Desenvolvido como projeto de aprendizado de desenvolvimento full-stack
com Node.js, React e TypeScript.
