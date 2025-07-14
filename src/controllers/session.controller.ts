import { Request, Response } from 'express';
import { generateAccessToken, verifyRefreshToken } from '../utils/jwt';

export const refreshToken = (req: Request, res: Response) => {
  console.log('🔥 /session/refresh called');

  const token = req.cookies.refreshToken;

  if (!token) {
    console.log('❌ No refresh token found in cookie');
    return res.status(401).json({ message: 'Refresh token not found' });
  }

  try {
    const payload = verifyRefreshToken(token); // decode + verify refresh token
    const accessToken = generateAccessToken(payload.userId); // issue new short-lived token

    console.log('✅ Access token re-issued for user:', payload.userId);
    return res.json({ accessToken });
  } catch (err) {
    console.log('❌ Invalid or expired refresh token:', err);
    return res.status(403).json({ message: 'Invalid or expired refresh token' });
  }
};

export const logout = (req: Request, res: Response) => {
  console.log('👋 Logging out. Clearing refresh token cookie.');
  res.clearCookie('refreshToken', {
    httpOnly: true,
    sameSite: 'lax',
    secure: false, // change to true in production with HTTPS
  });

  return res.json({ message: 'Logged out successfully' });
};
