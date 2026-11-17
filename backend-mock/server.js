/**
 * Backend mock do blog (Tech Challenge Fase 4).
 *
 * Reproduz o contrato REST consumido pelo app mobile:
 *   POST   /auth/login
 *   GET    /posts?q=termo
 *   GET    /posts/:id
 *   POST   /posts                (professor)
 *   PUT    /posts/:id            (professor)
 *   DELETE /posts/:id            (professor)
 *   GET    /posts/:id/comments
 *   POST   /posts/:id/comments   (autenticado)
 *   GET    /teachers?page=&limit=      (professor)
 *   POST   /teachers                   (professor)
 *   GET    /teachers/:id               (professor)
 *   PUT    /teachers/:id               (professor)
 *   DELETE /teachers/:id               (professor)
 *   (idem para /students)
 *
 * Os dados ficam em data.json (criado a partir do seed na primeira execução).
 */
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;
const SECRET = process.env.JWT_SECRET || 'fiap-tech-challenge-4-secret';
const DB_FILE = path.join(__dirname, 'data.json');

// ---------------------------------------------------------------- persistência
const now = () => new Date().toISOString();

function seed() {
  return {
    seq: { post: 6, teacher: 3, student: 9, comment: 3 },
    teachers: [
      { id: 1, name: 'Profa. Ana Souza', email: 'prof@fiap.com', password: '123456', subject: 'Desenvolvimento Mobile' },
      { id: 2, name: 'Prof. Carlos Lima', email: 'carlos@fiap.com', password: '123456', subject: 'Arquitetura de Software' },
    ],
    students: [
      { id: 1, name: 'João Pereira', email: 'aluno@fiap.com', password: '123456', classGroup: '3SOAT' },
      { id: 2, name: 'Maria Oliveira', email: 'maria@fiap.com', password: '123456', classGroup: '3SOAT' },
      { id: 3, name: 'Pedro Santos', email: 'pedro@fiap.com', password: '123456', classGroup: '2SOAT' },
      { id: 4, name: 'Beatriz Costa', email: 'beatriz@fiap.com', password: '123456', classGroup: '2SOAT' },
      { id: 5, name: 'Lucas Almeida', email: 'lucas@fiap.com', password: '123456', classGroup: '3SOAT' },
      { id: 6, name: 'Fernanda Rocha', email: 'fernanda@fiap.com', password: '123456', classGroup: '1SOAT' },
      { id: 7, name: 'Rafael Martins', email: 'rafael@fiap.com', password: '123456', classGroup: '1SOAT' },
      { id: 8, name: 'Camila Ribeiro', email: 'camila@fiap.com', password: '123456', classGroup: '3SOAT' },
    ],
    posts: [
      {
        id: 1,
        title: 'Introdução ao React Native',
        author: 'Profa. Ana Souza',
        content:
          'React Native permite construir aplicativos nativos para Android e iOS usando JavaScript e React. Neste post vemos como o Expo simplifica o setup do ambiente, como funcionam os componentes básicos (View, Text, Image) e como o Metro faz o hot reload durante o desenvolvimento.',
        createdAt: now(),
        updatedAt: now(),
      },
      {
        id: 2,
        title: 'React Navigation na prática',
        author: 'Profa. Ana Souza',
        content:
          'A biblioteca React Navigation é a solução mais usada para navegação em apps React Native. Aprenda a combinar Stack Navigator e Bottom Tabs, passar parâmetros entre telas e proteger rotas de acordo com o perfil do usuário autenticado.',
        createdAt: now(),
        updatedAt: now(),
      },
      {
        id: 3,
        title: 'Consumindo APIs REST com fetch',
        author: 'Prof. Carlos Lima',
        content:
          'Toda aplicação mobile conectada precisa conversar com um back-end. Veja como organizar uma camada de serviços, enviar o token JWT no header Authorization, tratar erros de rede e exibir estados de carregamento ao usuário.',
        createdAt: now(),
        updatedAt: now(),
      },
      {
        id: 4,
        title: 'FlatList e performance de listas',
        author: 'Prof. Carlos Lima',
        content:
          'Listas longas são um desafio em dispositivos móveis. A FlatList renderiza apenas os itens visíveis, suporta cabeçalho, rodapé, pull-to-refresh e paginação. Entenda keyExtractor, getItemLayout e boas práticas para evitar re-renderizações.',
        createdAt: now(),
        updatedAt: now(),
      },
      {
        id: 5,
        title: 'Testes com Jest em React Native',
        author: 'Profa. Ana Souza',
        content:
          'Testes automatizados garantem que o app continue funcionando a cada mudança. Com Jest e o Testing Library é possível testar componentes, hooks e serviços, simulando chamadas de rede e navegação.',
        createdAt: now(),
        updatedAt: now(),
      },
    ],
    comments: [
      { id: 1, postId: 1, author: 'João Pereira', text: 'Ótimo conteúdo, ajudou muito no setup!', createdAt: now() },
      { id: 2, postId: 2, author: 'Maria Oliveira', text: 'Consegui proteger as rotas de professor. Valeu!', createdAt: now() },
    ],
  };
}

function load() {
  if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, JSON.stringify(seed(), null, 2));
  }
  return JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
}

let db = load();
const save = () => fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));
const nextId = (key) => db.seq[key]++;

// ------------------------------------------------------------------ utilidades
const app = express();
app.use(cors());
app.use(express.json());
app.use((req, _res, next) => {
  console.log(`${new Date().toLocaleTimeString()} ${req.method} ${req.originalUrl}`);
  next();
});

const publicUser = ({ password, ...rest }) => rest;
const fail = (res, status, message) => res.status(status).json({ message });

function authenticate(req, _res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (token) {
    try {
      req.user = jwt.verify(token, SECRET);
    } catch {
      req.user = null;
    }
  }
  next();
}
app.use(authenticate);

const requireAuth = (req, res, next) =>
  req.user ? next() : fail(res, 401, 'Autenticação necessária.');

const requireTeacher = (req, res, next) => {
  if (!req.user) return fail(res, 401, 'Autenticação necessária.');
  if (req.user.role !== 'teacher') return fail(res, 403, 'Apenas professores podem executar esta ação.');
  next();
};

function validate(body, required) {
  const missing = required.filter((f) => !String(body[f] ?? '').trim());
  return missing.length ? `Campos obrigatórios: ${missing.join(', ')}.` : null;
}

// ------------------------------------------------------------------------ auth
app.post('/auth/login', (req, res) => {
  const { email, password } = req.body || {};
  const error = validate(req.body || {}, ['email', 'password']);
  if (error) return fail(res, 400, error);

  const norm = String(email).trim().toLowerCase();
  const teacher = db.teachers.find((t) => t.email.toLowerCase() === norm && t.password === password);
  const student = !teacher && db.students.find((s) => s.email.toLowerCase() === norm && s.password === password);
  const found = teacher || student;
  if (!found) return fail(res, 401, 'E-mail ou senha inválidos.');

  const role = teacher ? 'teacher' : 'student';
  const user = { ...publicUser(found), role };
  const token = jwt.sign({ id: found.id, role, name: found.name, email: found.email }, SECRET, { expiresIn: '8h' });
  res.json({ token, user });
});

// ------------------------------------------------------------------------ posts
app.get('/posts', (req, res) => {
  const q = String(req.query.q || '').trim().toLowerCase();
  let list = [...db.posts].sort((a, b) => b.id - a.id);
  if (q) {
    list = list.filter((p) =>
      [p.title, p.content, p.author].some((f) => String(f).toLowerCase().includes(q)),
    );
  }
  res.json(list);
});

app.get('/posts/:id', (req, res) => {
  const post = db.posts.find((p) => p.id === Number(req.params.id));
  return post ? res.json(post) : fail(res, 404, 'Post não encontrado.');
});

app.post('/posts', requireTeacher, (req, res) => {
  const error = validate(req.body, ['title', 'content', 'author']);
  if (error) return fail(res, 400, error);
  const post = {
    id: nextId('post'),
    title: req.body.title.trim(),
    content: req.body.content.trim(),
    author: req.body.author.trim(),
    createdAt: now(),
    updatedAt: now(),
  };
  db.posts.push(post);
  save();
  res.status(201).json(post);
});

app.put('/posts/:id', requireTeacher, (req, res) => {
  const post = db.posts.find((p) => p.id === Number(req.params.id));
  if (!post) return fail(res, 404, 'Post não encontrado.');
  const error = validate(req.body, ['title', 'content', 'author']);
  if (error) return fail(res, 400, error);
  Object.assign(post, {
    title: req.body.title.trim(),
    content: req.body.content.trim(),
    author: req.body.author.trim(),
    updatedAt: now(),
  });
  save();
  res.json(post);
});

app.delete('/posts/:id', requireTeacher, (req, res) => {
  const id = Number(req.params.id);
  if (!db.posts.some((p) => p.id === id)) return fail(res, 404, 'Post não encontrado.');
  db.posts = db.posts.filter((p) => p.id !== id);
  db.comments = db.comments.filter((c) => c.postId !== id);
  save();
  res.status(204).end();
});

// -------------------------------------------------------------------- comments
app.get('/posts/:id/comments', (req, res) => {
  const id = Number(req.params.id);
  res.json(db.comments.filter((c) => c.postId === id).sort((a, b) => a.id - b.id));
});

app.post('/posts/:id/comments', requireAuth, (req, res) => {
  const id = Number(req.params.id);
  if (!db.posts.some((p) => p.id === id)) return fail(res, 404, 'Post não encontrado.');
  const error = validate(req.body, ['text']);
  if (error) return fail(res, 400, error);
  const comment = {
    id: nextId('comment'),
    postId: id,
    author: req.user.name,
    text: req.body.text.trim(),
    createdAt: now(),
  };
  db.comments.push(comment);
  save();
  res.status(201).json(comment);
});

// ---------------------------------------------- professores e alunos (CRUD igual)
function registerUsersCrud(route, collection, seqKey, extraField) {
  const required = ['name', 'email', extraField];

  app.get(`/${route}`, requireTeacher, (req, res) => {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.max(1, Number(req.query.limit) || 5);
    const all = [...db[collection]].sort((a, b) => a.name.localeCompare(b.name));
    const total = all.length;
    const totalPages = Math.max(1, Math.ceil(total / limit));
    const data = all.slice((page - 1) * limit, page * limit).map(publicUser);
    res.json({ data, page, limit, total, totalPages });
  });

  app.get(`/${route}/:id`, requireTeacher, (req, res) => {
    const item = db[collection].find((u) => u.id === Number(req.params.id));
    return item ? res.json(publicUser(item)) : fail(res, 404, 'Registro não encontrado.');
  });

  app.post(`/${route}`, requireTeacher, (req, res) => {
    const error = validate(req.body, [...required, 'password']);
    if (error) return fail(res, 400, error);
    const email = req.body.email.trim().toLowerCase();
    const exists = [...db.teachers, ...db.students].some((u) => u.email.toLowerCase() === email);
    if (exists) return fail(res, 409, 'Já existe um usuário com este e-mail.');
    const item = {
      id: nextId(seqKey),
      name: req.body.name.trim(),
      email,
      password: req.body.password,
      [extraField]: String(req.body[extraField]).trim(),
    };
    db[collection].push(item);
    save();
    res.status(201).json(publicUser(item));
  });

  app.put(`/${route}/:id`, requireTeacher, (req, res) => {
    const item = db[collection].find((u) => u.id === Number(req.params.id));
    if (!item) return fail(res, 404, 'Registro não encontrado.');
    const error = validate(req.body, required);
    if (error) return fail(res, 400, error);
    const email = req.body.email.trim().toLowerCase();
    const clash = [...db.teachers, ...db.students].some(
      (u) => u.email.toLowerCase() === email && !(u === item),
    );
    if (clash) return fail(res, 409, 'Já existe um usuário com este e-mail.');
    item.name = req.body.name.trim();
    item.email = email;
    item[extraField] = String(req.body[extraField]).trim();
    if (String(req.body.password || '').trim()) item.password = req.body.password; // senha opcional na edição
    save();
    res.json(publicUser(item));
  });

  app.delete(`/${route}/:id`, requireTeacher, (req, res) => {
    const id = Number(req.params.id);
    if (!db[collection].some((u) => u.id === id)) return fail(res, 404, 'Registro não encontrado.');
    if (collection === 'teachers' && req.user.role === 'teacher' && req.user.id === id) {
      return fail(res, 400, 'Você não pode excluir o próprio usuário.');
    }
    db[collection] = db[collection].filter((u) => u.id !== id);
    save();
    res.status(204).end();
  });
}

registerUsersCrud('teachers', 'teachers', 'teacher', 'subject');
registerUsersCrud('students', 'students', 'student', 'classGroup');

app.get('/health', (_req, res) => res.json({ status: 'ok' }));
app.use((_req, res) => fail(res, 404, 'Rota não encontrada.'));

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Backend mock rodando em http://localhost:${PORT}`);
  console.log('Professor: prof@fiap.com / 123456  |  Aluno: aluno@fiap.com / 123456');
});
