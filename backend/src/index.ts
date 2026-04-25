import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import usersRouter from './routes/users';
import recipesRouter from './routes/recipes';
import tipsRouter from './routes/tips';
import postsRouter from './routes/posts';

const app = express();
const PORT = process.env.PORT ?? 3001;

app.use(cors({ origin: ['http://localhost:5173', 'http://127.0.0.1:5173'] }));
app.use(express.json());

app.get('/api/health', (_req, res) => res.json({ status: 'ok', app: '100G Protein Club API' }));

app.use('/api/users', usersRouter);
app.use('/api/recipes', recipesRouter);
app.use('/api/tips', tipsRouter);
app.use('/api/posts', postsRouter);

app.listen(PORT, () => {
  console.log(`🥩 100G Protein Club API running on http://localhost:${PORT}`);
});

export default app;
