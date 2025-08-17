import { NextRequest, NextResponse } from 'next/server';
import { adminAuth } from '@/lib/firebase-admin'; // Import from the centralized admin file
import { DecodedIdToken } from 'firebase-admin/auth';

export interface AuthenticatedRequest extends NextRequest {
  user?: DecodedIdToken;
}

export async function verifyAuth(request: NextRequest): Promise<{
  user?: DecodedIdToken;
  error?: string;
  status?: number;
}> {
  try {
    // Get token from Authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return { 
        error: 'No valid authorization token provided',
        status: 401 
      };
    }

    const token = authHeader.split('Bearer ')[1];
    if (!token) {
      return { 
        error: 'Invalid token format',
        status: 401 
      };
    }

    // Verify the token with Firebase Admin
    const decodedToken = await adminAuth.verifyIdToken(token);
    
    if (!decodedToken) {
      return { 
        error: 'Invalid token',
        status: 401 
      };
    }

    // Check if email is verified (optional, depending on your requirements)
    if (!decodedToken.email_verified) {
      return { 
        error: 'Email not verified',
        status: 403 
      };
    }

    return { user: decodedToken };

  } catch (error) {
    console.error('🔐 Auth Middleware Error:', error);
    
    if (error instanceof Error) {
      // Handle specific Firebase auth errors
      if (error.message.includes('token expired')) {
        return { 
          error: 'Token expired',
          status: 401 
        };
      }
      if (error.message.includes('invalid token')) {
        return { 
          error: 'Invalid token',
          status: 401 
        };
      }
    }

    return { 
      error: 'Authentication failed',
      status: 500 
    };
  }
}

export async function requireAuth(request: NextRequest): Promise<NextResponse | null> {
  const authResult = await verifyAuth(request);
  
  if (authResult.error) {
    return NextResponse.json(
      { 
        error: authResult.error,
        message: 'Authentication required'
      },
      { status: authResult.status || 401 }
    );
  }

  return null; // Continue with the request
}

// Helper function to get user from request
export function getUserFromRequest(request: AuthenticatedRequest) {
  return request.user;
}

// Rate limiting helper (simple in-memory for now)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

export function checkRateLimit(identifier: string, limit: number = 100, windowMs: number = 60000): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(identifier);

  if (!record || now > record.resetTime) {
    rateLimitMap.set(identifier, { count: 1, resetTime: now + windowMs });
    return true;
  }

  if (record.count >= limit) {
    return false;
  }

  record.count++;
  return true;
}
