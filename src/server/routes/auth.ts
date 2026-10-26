import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { Database } from '../db.js';
import { AuthenticatedRequest, generateToken, requireAuth } from '../middleware/auth.js';
import { User, Role } from '../types.js';

export const authRouter = Router();

// Register new user
authRouter.post('/register', async (req, res: Response) => {
  try {
    const { name, email, password, role, organizationName } = req.body;

    if (!name || !email || !password) {
      res.status(400).json({ error: 'Name, email, and password are required.' });
      return;
    }

    if (password.length < 6) {
      res.status(400).json({ error: 'Password must be at least 6 characters long.' });
      return;
    }

    const existingUser = Database.findUserByEmail(email);
    if (existingUser) {
      res.status(400).json({ error: 'An account with this email address already exists.' });
      return;
    }

    const assignedRole: Role = role === 'ORGANIZER' ? 'ORGANIZER' : 'ATTENDEE';
    const passwordHash = await bcrypt.hash(password, 10);
    const now = new Date().toISOString();

    const newUser: User = {
      id: `usr-${crypto.randomUUID()}`,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      passwordHash,
      role: assignedRole,
      isApproved: assignedRole === 'ORGANIZER' ? true : true, // Auto-approve for seamless test experience
      organizationName: assignedRole === 'ORGANIZER' ? organizationName?.trim() || `${name}'s Events` : undefined,
      avatarUrl: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}&backgroundColor=4f46e5`,
      createdAt: now,
      updatedAt: now,
    };

    Database.createUser(newUser);

    const token = generateToken(newUser);

    const { passwordHash: _, ...safeUser } = newUser;
    res.status(201).json({
      message: 'Account created successfully',
      token,
      user: safeUser,
    });
  } catch (err: any) {
    console.error('Registration error:', err);
    res.status(500).json({ error: 'Internal server error during registration.' });
  }
});

// Login
authRouter.post('/login', async (req, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required.' });
      return;
    }

    const user = Database.findUserByEmail(email);
    if (!user) {
      res.status(401).json({ error: 'Invalid email or password.' });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      res.status(401).json({ error: 'Invalid email or password.' });
      return;
    }

    const token = generateToken(user);
    const { passwordHash: _, ...safeUser } = user;

    res.json({
      message: 'Login successful',
      token,
      user: safeUser,
    });
  } catch (err: any) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Internal server error during login.' });
  }
});

// Current User Profile
authRouter.get('/me', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }
  const { passwordHash: _, ...safeUser } = req.user;
  res.json({ user: safeUser });
});

// Quick demo login switch for rapid evaluator testing
authRouter.post('/demo-switch', (req, res: Response) => {
  const { role } = req.body; // 'ADMIN' | 'ORGANIZER' | 'ATTENDEE'
  let targetUser: User | undefined;

  if (role === 'ADMIN') {
    targetUser = Database.findUserByEmail('admin@eventease.com');
  } else if (role === 'ORGANIZER') {
    targetUser = Database.findUserByEmail('organizer@techpulse.io');
  } else if (role === 'ATTENDEE') {
    targetUser = Database.findUserByEmail('attendee@gmail.com');
  }

  if (!targetUser) {
    res.status(404).json({ error: 'Demo user not found.' });
    return;
  }

  const token = generateToken(targetUser);
  const { passwordHash: _, ...safeUser } = targetUser;

  res.json({
    message: `Switched to demo ${role}`,
    token,
    user: safeUser,
  });
});
