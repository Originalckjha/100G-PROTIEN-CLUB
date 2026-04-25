import { Router } from 'express';
import { v4 as uuid } from 'uuid';
import { recipes, users } from '../data/store.js';
import { requireAuth, optionalAuth } from '../middleware/auth.js';
import type { Recipe, RecipeCategory } from '../types.js';

const router = Router();

function withAuthor(recipe: Recipe) {
  const author = users.get(recipe.authorId);
  return {
    ...recipe,
    author: author
      ? { id: author.id, username: author.username, displayName: author.displayName, avatar: author.avatar, role: author.role, followers: author.followers }
      : null,
  };
}

router.get('/', optionalAuth, (req, res) => {
  const { category, tag, sort } = req.query as { category?: RecipeCategory; tag?: string; sort?: string };

  let list = [...recipes.values()];

  if (category) list = list.filter(r => r.category === category);
  if (tag) list = list.filter(r => r.tags.includes(tag));

  switch (sort) {
    case 'popular':
      list.sort((a, b) => b.likes.length - a.likes.length);
      break;
    case 'protein':
      list.sort((a, b) => b.macros.protein - a.macros.protein);
      break;
    default:
      list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  res.json({ data: list.map(withAuthor) });
});

router.get('/:id', optionalAuth, (req, res) => {
  const recipe = recipes.get(req.params.id);
  if (!recipe) {
    res.status(404).json({ error: 'Recipe not found' });
    return;
  }
  res.json({ data: withAuthor(recipe) });
});

router.post('/', requireAuth, (req, res) => {
  const {
    title, description, ingredients, instructions, macros,
    category, tags, emoji, prepTime, cookTime, servings,
  } = req.body as Partial<Recipe>;

  if (!title || !description || !ingredients || !instructions || !macros || !category) {
    res.status(400).json({ error: 'Missing required fields' });
    return;
  }

  const recipe: Recipe = {
    id: `recipe-${uuid()}`,
    title,
    description,
    authorId: req.user!.userId,
    ingredients,
    instructions,
    macros,
    category,
    tags: tags ?? [],
    emoji: emoji ?? '🍽️',
    prepTime: prepTime ?? 0,
    cookTime: cookTime ?? 0,
    servings: servings ?? 1,
    likes: [],
    saves: [],
    comments: [],
    createdAt: new Date().toISOString(),
  };

  recipes.set(recipe.id, recipe);
  res.status(201).json({ data: withAuthor(recipe) });
});

router.post('/:id/like', requireAuth, (req, res) => {
  const recipe = recipes.get(req.params.id);
  if (!recipe) {
    res.status(404).json({ error: 'Recipe not found' });
    return;
  }

  const userId = req.user!.userId;
  if (recipe.likes.includes(userId)) {
    recipe.likes = recipe.likes.filter(id => id !== userId);
  } else {
    recipe.likes.push(userId);
  }

  res.json({ data: { liked: recipe.likes.includes(userId), count: recipe.likes.length } });
});

router.post('/:id/save', requireAuth, (req, res) => {
  const recipe = recipes.get(req.params.id);
  if (!recipe) {
    res.status(404).json({ error: 'Recipe not found' });
    return;
  }

  const userId = req.user!.userId;
  if (recipe.saves.includes(userId)) {
    recipe.saves = recipe.saves.filter(id => id !== userId);
  } else {
    recipe.saves.push(userId);
  }

  res.json({ data: { saved: recipe.saves.includes(userId), count: recipe.saves.length } });
});

router.post('/:id/comment', requireAuth, (req, res) => {
  const recipe = recipes.get(req.params.id);
  if (!recipe) {
    res.status(404).json({ error: 'Recipe not found' });
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

  recipe.comments.push(comment);
  res.status(201).json({ data: comment });
});

export default router;
