import { NextRequest, NextResponse } from 'next/server';
import { generateSDKJWT } from '@/lib/zoom-api';

export async function POST(request: NextRequest) {
  try {
    const { sessionName, userIdentity, roleType } = await request.json();
    
    if (!sessionName || !userIdentity) {
      return NextResponse.json(
        { error: 'Session name and user identity are required' },
        { status: 400 }
      );
    }

    const token = generateSDKJWT(sessionName, userIdentity, roleType);
    return NextResponse.json({ token });
  } catch (error) {
    console.error('Error generating SDK token:', error);
    return NextResponse.json(
      { error: 'Failed to generate SDK token' },
      { status: 500 }
    );
  }
}