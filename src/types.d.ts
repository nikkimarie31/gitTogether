// src/type.d.ts
import { JwtUserPayload } from './types/JwtUserPayload';

declare global {
  namespace Express {
    interface Request {
      user?: JwtUserPayload;
    }
  }
}

export {};
