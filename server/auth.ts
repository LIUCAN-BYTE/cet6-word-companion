import type { RequestHandler } from 'express';

export function isBasicAuthValid(header: string | undefined, username: string, password: string): boolean {
  if (!header?.startsWith('Basic ')) return false;
  try {
    const decoded = Buffer.from(header.slice(6), 'base64').toString('utf8');
    const separator = decoded.indexOf(':');
    return separator >= 0 && decoded.slice(0, separator) === username && decoded.slice(separator + 1) === password;
  } catch {
    return false;
  }
}

export function createBasicAuth(username = process.env.APP_USERNAME ?? 'student', password = process.env.APP_PASSWORD ?? ''): RequestHandler {
  return (req, res, next) => {
    if (!password || isBasicAuthValid(req.headers.authorization, username, password)) {
      next();
      return;
    }
    res.setHeader('WWW-Authenticate', 'Basic realm="CET-6 Word Companion"');
    res.status(401).send('需要访问密码');
  };
}
