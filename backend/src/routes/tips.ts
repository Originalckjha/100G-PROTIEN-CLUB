import { Router } from 'express';
import { v4 as uuid } from 'uuid';
import { tips, users } from '../data/store.js';
import { requireAuth, optionalAuth } from '../middleware/auth.js';
import type { Tip, TipCategory } from '../types.js';

const router = Router();

function withAuthor(tip: Tip) {
  const author = users.get(tip.authorId);
  return {
    ...tip,
    author: author
      ? { id: author.id, username: author.username, displayName: author.displayName, avatar: author.avatar, role: author.role, followers: author.followers }
      : null,
  };
}

router.get('/', optionalAuth, (req, res) => {
  const { category, tag, sort } = req.query as { category?: TipCategory; tag?: string; sort?: string };

  let list = [...tips.values()];

  if (category) list = list.filter(t => t.category === category);
  if (tag) list = list.filter(t => t.tags.includes(tag));

  switch (sort) {
    case 'popular':
      list.sort((a, b) => b.likes.length - a.likes.length);
      break;
    default:
      list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  res.json({ data: list.map(withAuthor) });
});

router.get('/:id', optionalAuth, (req, res) => {
  const tip = tips.get(req.params.id);
  if (!tip) {
    res.status(404).json({ error: 'Tip not found' });
    return;
  }
  res.json({ data: withAuthor(tip) });
});

router.post('/', requireAuth, (req, res) => {
  const { title, content, category, tags, emoji } = req.body as Partial<Tip>;

  if (!title || !content || !category) {
    res.status(400).json({ error: 'title, content, and category are required' });
    return;
  }

  const tip: Tip = {
    id: `tip-${uuid()}`,
    title,
    content,
    authorId: req.user!.userId,
    category,
    tags: tags ?? [],
    emoji: emoji ?? '💡',
    likes: [],
    saves: [],
    comments: [],
    createdAt: new Date().toISOString(),
  };

  tips.set(tip.id, tip);
  res.status(201).json({ data: withAuthor(tip) });
});

router.post('/:id/like', requireAuth, (req, res) => {
  const tip = tips.get(req.params.id);
  if (!tip) {
    res.status(404).json({ error: 'Tip not found' });
    return;
  }

  const userId = req.user!.userId;
  if (tip.likes.includes(userId)) {
    tip.likes = tip.likes.filter(id => id !== userId);
  } else {
    tip.likes.push(userId);
  }

  res.json({ data: { liked: tip.likes.includes(userId), count: tip.likes.length } });
});

router.post('/:id/save', requireAuth, (req, res) => {
  const tip = tips.get(req.params.id);
  if (!tip) {
    res.status(404).json({ error: 'Tip not found' });
    return;
  }

  const userId = req.user!.userId;
  if (tip.saves.includes(userId)) {
    tip.saves = tip.saves.filter(id => id !== userId);
  } else {
    tip.saves.push(userId);
  }

  res.json({ data: { saved: tip.saves.includes(userId), count: tip.saves.length } });
});

router.post('/:id/comment', requireAuth, (req, res) => {
  const tip = tips.get(req.params.id);
  if (!tip) {
    res.status(404).json({ error: 'Tip not found' });
    return;
  }

  const { content } = req.body as { content: string };
  if (!content?.trim()) {
    res.status(400).json({ error: 'Comment content is required' });
    return;
  }

  const author = users.get(req.user!.userId);
  if (!author) {
    res.status(404).json({ error: 'User not found' });
    return;
  }

  const comment = {
    id: `c-${uuid()}`,
    authorId: author.id,
    authorUsername: author.username,
    authorAvatar: author.avatar,
    content: content.trim(),
    createdAt: new Date().toISOString(),
  };

  tip.comments.push(comment);
  res.status(201).json({ data: comment });
});

export default router;
