'use client';

import { FiCheckCircle, FiXCircle, FiAlertTriangle, FiInfo, FiHelpCircle } from 'react-icons/fi';

export type ModalType = 'success' | 'error' | 'warning' | 'info' | 'confirm';

interface ModalProps {
    isOpen: boolean;
    type: ModalType;
    title: string;
    message: string;
    onConfirm: () => void;
    onCancel?: () => void;
    confirmText?: string;
    cancelText?: string;
}

export default function Modal({
    isOpen,
    type,
    title,
    message,
    onConfirm,
    onCancel,
    confirmText = 'OK',
    cancelText = 'Batal',
}: ModalProps) {
    if (!isOpen) return null;

    const getIcon = () => {
        switch (type) {
            case 'success': return <FiCheckCircle className="text-success" size={48} />;
            case 'error': return <FiXCircle className="text-danger" size={48} />;
            case 'warning': return <FiAlertTriangle className="text-warning" size={48} />;
            case 'confirm': return <FiHelpCircle className="text-primary" size={48} />;
            default: return <FiInfo className="text-info" size={48} />;
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content animate-scale">
                <div className="modal-icon">
                    {getIcon()}
                </div>
                <h3 className="modal-title">{title}</h3>
                <p className="modal-message">{message}</p>
                <div className="modal-actions">
                    {type === 'confirm' && (
                        <button
                            className="btn btn-secondary"
                            onClick={onCancel}
                        >
                            {cancelText}
                        </button>
                    )}
                    <button
                        className={`btn ${type === 'error' ? 'btn-danger' : 'btn-primary'}`}
                        onClick={onConfirm}
                    >
                        {type === 'confirm' ? 'Ya, Lanjutkan' : confirmText}
                    </button>
                </div>
            </div>

            <style jsx>{`
                .modal-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(0, 0, 0, 0.5);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 9999;
                    backdrop-filter: blur(4px);
                }

                .modal-content {
                    background: var(--bg-primary);
                    padding: var(--spacing-2xl);
                    border-radius: var(--radius-xl);
                    max-width: 400px;
                    width: 90%;
                    text-align: center;
                    box-shadow: var(--shadow-xl);
                    border: 1px solid var(--border-color);
                }

                .modal-icon {
                    margin-bottom: var(--spacing-lg);
                    display: flex;
                    justify-content: center;
                }

                .modal-title {
                    margin-bottom: var(--spacing-sm);
                    font-size: 1.5rem;
                }

                .modal-message {
                    color: var(--text-secondary);
                    margin-bottom: var(--spacing-xl);
                    line-height: 1.5;
                }

                .modal-actions {
                    display: flex;
                    gap: var(--spacing-md);
                    justify-content: center;
                }

                .animate-scale {
                    animation: scaleIn 0.2s ease-out;
                }

                @keyframes scaleIn {
                    from { transform: scale(0.9); opacity: 0; }
                    to { transform: scale(1); opacity: 1; }
                }
            `}</style>
        </div>
    );
}
