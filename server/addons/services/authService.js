import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { config } from '../config.js';
import { addonStore } from '../db/addonStore.js';

export async function registerUser({ name, email, password, role, aliases = [] }) {
  if (!name || !email || !password) {
    throw new Error('Name, email, and password are required');
  }
  
  const sanitizedRole = (role === 'teacher') ? 'teacher' : 'student';
  const existing = addonStore.findUserByEmail(email);
  if (existing) {
    throw new Error('User with this email already exists');
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = addonStore.createUser({
    name: name.trim(),
    email: email.trim().toLowerCase(),
    passwordHash,
    role: sanitizedRole,
    aliases: Array.isArray(aliases) ? aliases : []
  });

  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    config.JWT_SECRET,
    { expiresIn: '7d' }
  );

  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      aliases: user.aliases
    },
    token
  };
}

export async function loginUser({ email, password }) {
  if (!email || !password) {
    throw new Error('Email and password are required');
  }

  const user = addonStore.findUserByEmail(email);
  if (!user) {
    throw new Error('Invalid email or password');
  }

  const isMatch = await bcrypt.compare(password, user.passwordHash);
  if (!isMatch) {
    throw new Error('Invalid email or password');
  }

  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    config.JWT_SECRET,
    { expiresIn: '7d' }
  );

  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      aliases: user.aliases || []
    },
    token
  };
}
