# Blog FIAP Mobile — Tech Challenge Fase 4

Aplicativo mobile em **React Native (Expo + TypeScript)**.
Professores gerenciam posts, professores e alunos; alunos e visitantes leem os posts.

> Estrutura do repositório
>
> | Pasta | Conteúdo |
> |---|---|
> | `mobile/` | App React Native (Expo SDK 58, React Navigation, Context API, Jest) |
> | `backend-mock/` | API REST (Express + JWT) que reproduz os endpoints do back-end, usada para desenvolver e demonstrar o app |

---

## 1. Requisitos atendidos

| # | Requisito do enunciado | Onde está |
|---|---|---|
| 1 | Página principal: lista com título, autor, descrição e **busca** por palavra-chave | `screens/PostListScreen.tsx` |
| 2 | Leitura de post + **comentários** (opcional) | `screens/PostDetailScreen.tsx` |
| 3 | Criação de post (título, conteúdo, autor) | `screens/PostFormScreen.tsx` |
| 4 | Edição de post carregando dados atuais | `screens/PostFormScreen.tsx` (modo edição) |
| 5 | Cadastro de professores | `screens/PersonFormScreen.tsx` (`kind="teachers"`) |
| 6 | Edição de professores | `screens/PersonFormScreen.tsx` |
| 7 | Listagem **paginada** de professores com Editar/Excluir | `screens/PeopleListScreen.tsx` + `components/Pager.tsx` |
| 8 | Mesmo CRUD para **alunos** | mesmas telas, `kind="students"` |
| 9 | Página administrativa de posts (editar/excluir) | `screens/AdminPostsScreen.tsx` |
| 10 | **Login** de professores e autorização | `context/AuthContext.tsx`, `navigation/AppNavigator.tsx` |
| T1 | React Native | todo o projeto |
| T2 | Estilização | `theme/index.ts`, `components/ui.tsx` |
| T3 | Integração REST (posts, alunos, professores, auth) e permissões | `services/*` |
| T3 | Estado global com Context API | `context/AuthContext.tsx` |
| T4 | Documentação técnica | este README |

---

## 2. Como executar

### Pré-requisitos
- Node.js 20+ (testado com 22)
- Android Studio
- Variável `ANDROID_HOME` apontando para o Android SDK (o Android Studio configura em geral)

### Passo a passo

```bash
# 1) instalar dependências (uma vez)
npm run install:all

# 2) terminal 1 — API (porta 3000)
npm run backend

# 3) abrir o emulador pelo Android Studio (Device Manager > Play) e aguardar o boot

# 4) terminal 2 — app no emulador
npm run android
```

`npm run android` executa `mobile/scripts/dev-android.js`, que:
1. faz `adb reverse tcp:3000 tcp:3000` (o `localhost` do emulador passa a apontar para o seu computador);
2. roda `expo start --android`, que abre o **Expo Go** no emulador e carrega o app.

Alternativas:

| Quero rodar em… | Comando |
|---|---|
| Navegador (rápido para testar) | `npm run web` |
| Celular físico | `npm run mobile`, ler o QR Code com o Expo Go e definir `EXPO_PUBLIC_API_URL=http://<IP-do-PC>:3000` em `mobile/.env` |
| Outro back-end (o real das fases 2/3) | `EXPO_PUBLIC_API_URL=https://seu-backend` em `mobile/.env` (ver `mobile/.env.example`) |

### Contas de demonstração (seed do mock)

| Perfil | E-mail | Senha |
|---|---|---|
| Professor | `prof@fiap.com` | `123456` |
| Aluno | `aluno@fiap.com` | `123456` |

Para voltar os dados ao estado inicial: `npm run backend:reset` e reinicie a API.

### Testes e qualidade

```bash
npm test                      # Jest (24 testes)
npm --prefix mobile run typecheck
```

---

## 3. Guia de uso

1. **Login** — informe e-mail/senha ou toque em *Continuar como visitante* (somente leitura).
2. **Posts** — lista com título, autor, data e resumo. Digite na busca para filtrar (a consulta é enviada ao servidor com debounce de 400 ms). Puxe a lista para baixo para atualizar.
3. **Ler um post** — toque no card. Usuários autenticados podem comentar.
4. **Professor** vê abas extras:
   - **Admin**: todos os posts com *Editar* e *Excluir* (com confirmação); botão **+** cria um post.
   - **Professores / Alunos**: listagem paginada (5 por página), **+** para cadastrar, *Editar* e *Excluir*. Um professor não pode excluir a si mesmo.
5. **Conta** — dados do usuário, permissões e *Sair*.

---

## 4. Arquitetura

```
mobile/
├── App.tsx                      # SafeAreaProvider > AuthProvider > AppNavigator
├── src/
│   ├── config/env.ts            # API_URL, timeout, tamanho de página
│   ├── theme/                   # cores, espaçamentos, tipografia
│   ├── types/                   # Post, Person, AuthUser, Paginated...
│   ├── services/                # camada de acesso à API
│   │   ├── api.ts               #   fetch + JWT + timeout + ApiError + handler de 401
│   │   ├── authService.ts
│   │   ├── postService.ts
│   │   └── personService.ts     #   CRUD genérico (teachers | students)
│   ├── context/AuthContext.tsx  # sessão, perfil, persistência (AsyncStorage)
│   ├── hooks/                   # useResource (carga + refetch no foco), useDebounce
│   ├── navigation/              # tipos de rotas + AppNavigator
│   ├── components/              # Button, Input, Card, Banner, Pager, PostCard...
│   ├── screens/                 # 8 telas
│   └── utils/                   # validação, formatação, confirmAction
└── __tests__/                   # Jest + Testing Library
```

### Decisões de projeto

- **Camadas**: `screens` → `hooks/context` → `services` → `api.ts`.
- **Navegação e autorização**: o `AppNavigator` monta rotas **condicionalmente** pelo perfil. Sem login só existe `Login`; aluno/visitante não tem as rotas `PostForm`/`PersonForm` nem as abas administrativas. 
- **Reuso**: professores e alunos têm o mesmo formato de CRUD, então `PeopleListScreen`, `PersonFormScreen` e `personService` são genéricos.

### REST

| Método | Rota | Perfil | Observação |
|---|---|---|---|
| POST | `/auth/login` | público | `{email,password}` → `{token,user{role}}` |
| GET | `/posts?q=` | público | busca em título, conteúdo e autor |
| GET | `/posts/:id` | público | |
| POST/PUT/DELETE | `/posts[/:id]` | professor | `{title,content,author}` |
| GET/POST | `/posts/:id/comments` | leitura pública / POST autenticado | |
| GET | `/teachers?page=&limit=` | professor | `{data,page,limit,total,totalPages}` |
| GET/POST/PUT/DELETE | `/teachers[/:id]` | professor | `{name,email,password,subject}` |
| idem | `/students[/:id]` | professor | `{name,email,password,classGroup}` |

---

