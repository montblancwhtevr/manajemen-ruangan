'use client';

import { useRouter } from 'next/navigation';
import { FiLogIn, FiLogOut, FiUser } from 'react-icons/fi';

interface HeaderProps {
    user?: { email: string; role: 'admin' | 'user' } | null;
}

export default function Header({ user }: HeaderProps) {
    const router = useRouter();

    const handleLogout = async () => {
        try {
            await fetch('/api/auth/logout', { method: 'POST' });
            window.location.href = '/';
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

    return (
        <header style={{
            background: 'var(--bg-primary)',
            borderBottom: '1px solid var(--border-color)',
            padding: 'var(--spacing-md) 0',
            boxShadow: 'var(--shadow-sm)'
        }}>
            <div className="container" style={{
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 'var(--spacing-md)'
            }}>
                <div className="flex items-center gap-2">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect x="3" y="3" width="7" height="7" rx="1" fill="var(--primary)" />
                        <rect x="3" y="13" width="7" height="7" rx="1" fill="var(--primary)" opacity="0.6" />
                        <rect x="13" y="3" width="7" height="7" rx="1" fill="var(--primary)" opacity="0.6" />
                        <rect x="13" y="13" width="7" height="7" rx="1" fill="var(--primary)" />
                    </svg>
                    <h1 className="header-title">
                        Manajemen Ruangan
                    </h1>
                </div>

                <div style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    alignItems: 'center',
                    gap: 'var(--spacing-sm)'
                }}>
                    {user && (
                        <div className="user-info">
                            <FiUser />
                            <span className="user-email">{user.email}</span>
                            {user.role === 'admin' && (
                                <span className="admin-badge">
                                    Admin
                                </span>
                            )}
                        </div>
                    )}

                    {user ? (
                        <button onClick={handleLogout} className="btn btn-secondary btn-sm">
                            <FiLogOut />
                            <span className="btn-text">Logout</span>
                        </button>
                    ) : (
                        <button onClick={() => router.push('/login')} className="btn btn-primary btn-sm">
                            <FiLogIn />
                            <span className="btn-text">Login</span>
                        </button>
                    )}
                </div>
            </div>
        </header>
    );
}
