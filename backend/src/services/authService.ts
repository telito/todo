import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { Response } from 'express';
import { env } from '../config/env';
import { User } from '../models/User';
import { AppError } from '../utils/errors';

const SALT_ROUNDS = 12;

export interface JwtPayload {
  userId: string;
}

export const hashPassword = async (password: string): Promise<string> =>
  bcrypt.hash(password, SALT_ROUNDS);

export const verifyPassword = async (password: string, hash: string): Promise<boolean> =>
  bcrypt.compare(password, hash);

export const signToken = (userId: string): string =>
  jwt.sign({ userId }, env.jwtSecret, { expiresIn: env.jwtExpiresIn } as jwt.SignOptions);

export const verifyToken = (token: string): JwtPayload => {
  try {
    return jwt.verify(token, env.jwtSecret) as JwtPayload;
  } catch {
    throw new AppError(401, 'Invalid or expired token');
  }
};

export const setAuthCookie = (res: Response, token: string): void => {
  res.cookie(env.cookieName, token, {
    httpOnly: true,
    secure: env.nodeEnv === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
};

export const clearAuthCookie = (res: Response): void => {
  res.clearCookie(env.cookieName, {
    httpOnly: true,
    secure: env.nodeEnv === 'production',
    sameSite: 'lax',
  });
};

export const validateEmail = (email: string): boolean =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

export const validatePassword = (password: string): boolean => password.length >= 6;

export const registerUser = async (email: string, password: string) => {
  const normalizedEmail = email.toLowerCase().trim();

  if (!validateEmail(normalizedEmail)) {
    throw new AppError(400, 'Invalid email format');
  }

  if (!validatePassword(password)) {
    throw new AppError(400, 'Password must be at least 6 characters');
  }

  const existing = await User.findOne({ email: normalizedEmail });
  if (existing) {
    throw new AppError(409, 'Email already registered');
  }

  const passwordHash = await hashPassword(password);
  const user = await User.create({ email: normalizedEmail, passwordHash });

  return { id: user._id.toString(), email: user.email };
};

export const loginUser = async (email: string, password: string) => {
  const normalizedEmail = email.toLowerCase().trim();
  const user = await User.findOne({ email: normalizedEmail });

  if (!user) {
    throw new AppError(401, 'Invalid email or password');
  }

  const valid = await verifyPassword(password, user.passwordHash);
  if (!valid) {
    throw new AppError(401, 'Invalid email or password');
  }

  return { id: user._id.toString(), email: user.email };
};

export const getUserById = async (userId: string) => {
  const user = await User.findById(userId).select('-passwordHash');
  if (!user) {
    throw new AppError(404, 'User not found');
  }
  return { id: user._id.toString(), email: user.email };
};
