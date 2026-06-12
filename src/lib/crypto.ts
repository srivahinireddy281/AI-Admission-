import crypto from 'crypto';

const SECRET_KEY = process.env.JWT_SECRET || 'institutions_secure_jwt_admissions_secret_token_2026';

/**
 * Hashes a password securely using SHA-256 with an optional solid salt
 */
export function hashPassword(password: string): string {
  const salt = 'admissions_salt_2026_';
  return crypto.createHmac('sha256', salt).update(password).digest('hex');
}

/**
 * Verifies if clean password matches current hash
 */
export function verifyPassword(password: string, hash: string): boolean {
  return hashPassword(password) === hash;
}

/**
 * Signs a payload into a secure Base64 JWT Token using HS256 algorithm
 */
export function signJwt(payload: object, expiresInHours = 24): string {
  const header = { alg: 'HS256', typ: 'JWT' };
  const exp = Math.floor(Date.now() / 1000) + expiresInHours * 3600;
  
  const finalPayload = { ...payload, exp };
  
  const b64Header = Buffer.from(JSON.stringify(header)).toString('base64url');
  const b64Payload = Buffer.from(JSON.stringify(finalPayload)).toString('base64url');
  
  const signature = crypto
    .createHmac('sha256', SECRET_KEY)
    .update(`${b64Header}.${b64Payload}`)
    .digest('base64url');
    
  return `${b64Header}.${b64Payload}.${signature}`;
}

/**
 * Verifies a HS256 JWT Token and decodes its payload
 */
export function verifyJwt(token: string): any {
  try {
    const [header, payload, signature] = token.split('.');
    if (!header || !payload || !signature) return null;
    
    const recalculatedSignature = crypto
      .createHmac('sha256', SECRET_KEY)
      .update(`${header}.${payload}`)
      .digest('base64url');
      
    if (recalculatedSignature !== signature) return null;
    
    const decodedPayload = JSON.parse(Buffer.from(payload, 'base64').toString('utf-8'));
    
    // Check expiration
    if (decodedPayload.exp && decodedPayload.exp < Math.floor(Date.now() / 1000)) {
      console.log('JWT Token verification failed: Token is expired.');
      return null;
    }
    
    return decodedPayload;
  } catch (err) {
    console.error('JWT Token verification error:', err);
    return null;
  }
}
