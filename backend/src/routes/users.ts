import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { v4 as uuid } from 'uuid';
import { users } from '../data/store.js';
import { requireAuth, signToken } from '../middleware/auth.js';
import type { User, PublicUser } from '../types.js';

const router = Router();

function toPublic(user: User): PublicUser {
  const { passwordHash: _, ...pub } = user;
  return pub;
}

router.post('/register', async (req, res) => {
  const { username, displayName, email, password, role, bio, avatar } = req.body as {
    username: string;
    displayName: string;
    email: string;
    password: string;
    role?: 'enthusiast' | 'influencer' | 'trainer';
    bio?: string;
    avatar?: string;
  };

  if (!username || !displayName || !email || !password) {
    res.status(400).json({ error: 'username, displayName, email, and password are required' });
    return;
  }

  const existing = [...users.values()].find(
    u => u.username === username || u.email === email
  );
  if (existing) {
    res.status(409).json({ error: 'Username or email already taken' });
    return;
  }

  const newUser: User = {
    id: `user-${uuid()}`,
    username,
    displayName,
    email,
    passwordHash: await bcrypt.hash(password, 10),
    avatar: avatar ?? '🏃',
    bio: bio ?? '',
    role: role ?? 'enthusiast',
    followers: 0,
    following: [],
    badges: ['New Member'],
    joinedAt: new Date().toISOString(),
  };

  users.set(newUser.id, newUser);
  const token = signToken({ userId: newUser.id, username: newUser.username });
  res.status(201).json({ data: { user: toPublic(newUser), token } });
});

router.post('/login', async (req, res) => {
  const { username, password } = req.body as { username: string; password: string };

  const user = [...users.values()].find(u => u.username === username);
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    res.status(401).json({ error: 'Invalid username or password' });
    return;
  }

  const token = signToken({ userId: user.id, username: user.username });
  res.json({ data: { user: toPublic(user), token } });
});

router.get('/', (_req, res) => {
  const all = [...users.values()].map(toPublic);
  res.json({ data: all });
});

router.get('/:username', (req, res) => {
  const user = [...users.values()].find(u => u.username === req.params.username);
  if (!user) {
    res.status(404).json({ error: 'User not found' });
    return;
  }
  res.json({ data: toPublic(user) });
});

router.post('/:id/follow', requireAuth, (req, res) => {
  const targetUser = users.get(req.params.id);
  const currentUser = users.get(req.user!.userId);

  if (!targetUser || !currentUser) {
    res.status(404).json({ error: 'User not found' });
    return;
  }

  if (currentUser.following.includes(targetUser.id)) {
    currentUser.following = currentUser.following.filter(id => id !== targetUser.id);
    targetUser.followers -= 1;
  } else {
    currentUser.following.push(targetUser.id);
    targetUser.followers += 1;
  }

  res.json({ data: { following: currentUser.following.includes(targetUser.id), followers: targetUser.followers } });
});

export default router;
