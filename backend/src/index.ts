
export {};

import cors from 'cors';
import express from 'express';
import { createRepository } from './persistence';
import { ItemRepository } from './domain/ItemRepository';
import session from 'express-session';
import { v4 as uuid } from 'uuid';
import bcrypt from 'bcrypt';
const app = express();
const getItems = require('./routes/getItems');
const addItem = require('./routes/addItem');
const updateItem = require('./routes/updateItem');
const deleteItem = require('./routes/deleteItem');
const path = require('path');

app.use(cors({
  origin: 'http://localhost:5173', // ou '*' pour autoriser tout
  credentials: true
}));

app.use(express.json());
app.use(express.static(path.join(__dirname, '../../frontend')));
app.use(session({
  name: 'sessionId',
  secret: 'supersecretdev',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: false, // true en HTTPS
    sameSite: 'lax'
  }
}));
let db: ItemRepository;

function authMiddleware(req: any, res: any, next: any) {
  if (!req.session || !req.session.userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
}

async function startServer() {
  try {
    // Création et initialisation du repository selon l'environnement
    db = await createRepository();

    // Routes avec injection du repository
    app.get('/items', authMiddleware, getItems(db));
    app.post('/items', authMiddleware, addItem(db));
    app.put('/items/:id', authMiddleware, updateItem(db));
    app.delete('/items/:id', authMiddleware, deleteItem(db));
    app.post('/logout', (req: any, res: any) => {
      req.session.destroy((err: any) => {
        if (err) {
          return res.status(500).json({ error: 'Logout failed' });
        }

        res.clearCookie('sessionId'); // nom du cookie que tu as défini
        res.sendStatus(200);
      });
    });
    app.get('/auth/me', (req: any, res: any) => {
      if (!req.session.userId) {
        return res.status(401).json({ authenticated: false });
      }

      res.json({
        authenticated: true,
        userId: req.session.userId
      });
    });
    app.post('/register', express.json(), async (req: any, res: any) => {
      const { username, password } = req.body;
      if (!username || !password) return res.status(400).json({ error: 'Missing username or password' });

      try {
        // Vérifie si l'utilisateur existe déjà
        const existingUser = await db.getUserByUsername(username);
        if (existingUser) return res.status(409).json({ error: 'Username already taken' });

        // Hash le mot de passe
        const passwordHash = await bcrypt.hash(password, 10);

        // Crée l'utilisateur
        const userId = uuid();
        await db.createUser({ id: userId, username, passwordHash });

        // Crée la session directement après l'inscription
        req.session.userId = userId;

        res.status(201).json({ message: 'User registered', username });
      } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Registration failed' });
      }
    });

    app.post('/login', express.json(), async (req: any, res: any) => {
      const { username, password } = req.body;
      if (!username || !password) return res.status(400).json({ error: 'Missing username or password' });

      try {
        // Récupère l'utilisateur
        const user = await db.getUserByUsername(username);
        if (!user) return res.status(401).json({ error: 'Invalid credentials' });

        // Vérifie le mot de passe
        const passwordMatch = await bcrypt.compare(password, user.passwordHash);
        if (!passwordMatch) return res.status(401).json({ error: 'Invalid credentials' });

        // Crée la session
        req.session.userId = user.id;

        res.json({ message: 'Login successful', username });
      } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Login failed' });
      }
    });

    // Démarrage du serveur
    app.listen(3000, () => console.log('Listening on port 3000'));
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

startServer();

const gracefulShutdown = async () => {
  try {
    if (db) {
      await db.teardown();
    }
  } catch (_) {}
  process.exit();
};

process.on('SIGINT', gracefulShutdown);
process.on('SIGTERM', gracefulShutdown);
process.on('SIGUSR2', gracefulShutdown); // Sent by nodemon
