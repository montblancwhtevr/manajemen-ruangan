'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FiLogIn } from 'react-icons/fi';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function LoginPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        email: 'admin@example.com',
        password: '',
        role: 'admin' as 'admin' | 'user',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (data.success) {
                router.push('/');
                router.refresh();
            } else {
                setError(data.error || 'Login gagal');
            }
        } catch (err) {
            setError('Terjadi kesalahan. Silakan coba lagi.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)',
            padding: 'var(--spacing-lg)',
        }}>
            <div className="card" style={{ maxWidth: '400px', width: '100%' }}>
                <div style={{ textAlign: 'center', marginBottom: 'var(--spacing-xl)' }}>
                    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 'var(--spacing-md)' }}>
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <rect x="3" y="3" width="7" height="7" rx="1" fill="var(--primary)" />
                            <rect x="3" y="13" width="7" height="7" rx="1" fill="var(--primary)" opacity="0.6" />
                            <rect x="13" y="3" width="7" height="7" rx="1" fill="var(--primary)" opacity="0.6" />
                            <rect x="13" y="13" width="7" height="7" rx="1" fill="var(--primary)" />
                        </svg>
                    </div>
                    <h2 style={{ margin: 0, color: 'var(--primary)' }}>Manajemen Ruangan</h2>
                    <p className="text-muted" style={{ marginTop: 'var(--spacing-xs)', marginBottom: 0 }}>
                        Silakan login untuk melanjutkan
                    </p>
                </div>

                {error && (
                    <div style={{
                        padding: 'var(--spacing-md)',
                        background: 'rgba(239, 68, 68, 0.1)',
                        border: '1px solid var(--danger)',
                        borderRadius: 'var(--radius-md)',
                        color: 'var(--danger)',
                        marginBottom: 'var(--spacing-lg)',
                        fontSize: '0.875rem',
                    }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>


                    <div className="form-group">
                        <label className="label">Password</label>
                        <input
                            type="password"
                            className="input"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            placeholder="••••••••"
                            required
                        />
                    </div>



                    <button
                        type="submit"
                        className="btn btn-primary btn-lg"
                        style={{ width: '100%' }}
                        disabled={loading}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                            {loading ? <LoadingSpinner size="sm" /> : <FiLogIn />}
                            {loading ? 'Memproses...' : 'Login'}
                        </div>
                    </button>
                </form>


            </div>
        </div>
    );
}
