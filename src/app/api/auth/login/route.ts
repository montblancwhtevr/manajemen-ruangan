import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getUserByEmail } from '@/lib/db';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { email, password } = body;

        if (!email || !password) {
            return NextResponse.json(
                { success: false, error: 'Email dan password harus diisi' },
                { status: 400 }
            );
        }

        // Real auth - check against database
        const user = await getUserByEmail(email) as any;

        if (!user || user.passwordHash !== password) {
            return NextResponse.json(
                { success: false, error: 'Email atau password salah' },
                { status: 401 }
            );
        }

        // Create session
        const sessionData = {
            email: user.email,
            role: user.role,
            timestamp: Date.now(),
        };

        const cookieStore = await cookies();
        cookieStore.set('session', JSON.stringify(sessionData), {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60 * 24 * 7, // 7 days
        });

        return NextResponse.json({
            success: true,
            data: { email: user.email, role: user.role },
        });
    } catch (error) {
        console.error('Login error:', error);
        return NextResponse.json(
            { success: false, error: 'Terjadi kesalahan saat login' },
            { status: 500 }
        );
    }
}
