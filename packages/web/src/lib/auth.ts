import { hash, compare } from 'bcryptjs'
import { SignJWT, jwtVerify } from 'jose'
import { getEnv } from './env'

const SALT_ROUNDS = 10
const TOKEN_EXPIRY = '7d'

export async function hashPassword(password: string): Promise<string> {
  return hash(password, SALT_ROUNDS)
}

export async function verifyPassword(password: string, passwordHash: string): Promise<boolean> {
  return compare(password, passwordHash)
}

function getSecret(): Uint8Array {
  return new TextEncoder().encode(getEnv().JWT_SECRET)
}

export async function signToken(payload: { userId: string }): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime(TOKEN_EXPIRY)
    .setIssuedAt()
    .sign(getSecret())
}

export async function verifyToken(token: string): Promise<{ userId: string }> {
  const { payload } = await jwtVerify(token, getSecret())
  if (typeof payload.userId !== 'string' || !payload.userId) {
    throw new Error('Invalid token: missing userId claim')
  }
  return { userId: payload.userId }
}
