import { cookies } from 'next/headers';

export async function getSession() {
    try {
        const cookieStore = await cookies();
        const sessionCookie = cookieStore.get('session');

        if (!sessionCookie) {
            return null;
        }

        const session = JSON.parse(sessionCookie.value);
        return session;
    } catch (error) {
        console.error('Session parse error:', error);
        return null;
    }
}

export async function requireAuth() {
    const session = await getSession();

    if (!session) {
        throw new Error('Unauthorized');
    }

    return session;
}

export async function requireAdmin() {
    const session = await requireAuth();

    if (session.role !== 'admin') {
        throw new Error('Admin access required');
    }

    return session;
}
