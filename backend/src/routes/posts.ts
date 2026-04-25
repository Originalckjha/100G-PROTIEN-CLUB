import { Router } from 'express';
import { v4 as uuid } from 'uuid';
import { posts, users, recipes, tips } from '../data/store.js';
import { requireAuth, optionalAuth } from '../middleware/auth.js';
import type { Post } from '../types.js';

const router = Router();

function withDetails(post: Post) {
  const author = users.get(post.authorId);
  const recipe = post.recipeId ? recipes.get(post.recipeId) : undefined;
  const tip = post.tipId ? tips.get(post.tipId) : undefined;

  return {
    ...post,
    author: author
      ? { id: author.id, username: author.username, displayName: author.displayName, avatar: author.avatar, role: author.role, followers: author.followers, badges: author.badges }
      : null,
    recipe: recipe ?? null,
    tip: tip ?? null,
  };
}

router.get('/', optionalAuth, (_req, res) => {
  const list = [...posts.values()].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  res.json({ data: list.map(withDetails) });
});

router.post('/', requireAuth, (req, res) => {
  const { content, type, recipeId, tipId, image } = req.body as Partial<Post>;

  if (!content?.trim()) {
    res.status(400).json({ error: 'Post content is required' });
    return;
  }

  const post: Post = {
    id: `post-${uuid()}`,
    authorId: req.user!.userId,
    content: content.trim(),
    type: type ?? 'general',
    recipeId,
    tipId,
    image,
    likes: [],
    createdAt: new Date().toISOString(),
  };

  posts.set(post.id, post);
  res.status(201).json({ data: withDetails(post) });
});

router.post('/:id/like', requireAuth, (req, res) => {
  const post = posts.get(req.params.id);
  if (!post) {
    res.status(404).json({ error: 'Post not found' });
    return;
  }

  const userId = req.user!.userId;
  if (post.likes.includes(userId)) {
    post.likes = post.likes.filter(id => id !== userId);
  } else {
    post.likes.push(userId);
  }

  res.json({ data: { liked: post.likes.includes(userId), count: post.likes.length } });
});

export default router;
