import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { startNewLogin, startNewSignup } from '@/auth/NewDerivAuth';
import './LoginScreen.scss';

const LoginScreenInner = () => {
    const [isNewLoginLoading, setIsNewLoginLoading] = useState(false);
    const [newLoginError, setNewLoginError] = useState('');
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const t = setTimeout(() => setVisible(true), 80);
        return () => clearTimeout(t);
    }, []);

    const handleNewAccountsLogin = async (e: React.MouseEvent) => {
        e.preventDefault();
        if (isNewLoginLoading) return;
        setIsNewLoginLoading(true);
        setNewLoginError('');
        try {
            await startNewLogin();
            setIsNewLoginLoading(false);
        } catch (error) {
            console.error('[New Accounts Login]', error);
            setIsNewLoginLoading(false);
            setNewLoginError('Login failed to start. Please try again or use a different browser.');
        }
    };

    return (
        <div className={`login-screen${visible ? ' login-screen--visible' : ''}`}>
            <div className='login-screen__bg' style={{ backgroundImage: "url('https://images.unsplash.com/photo-1557683316-973673baf926?w=1920&q=80')" }} />
            <div className='login-screen__overlay' />

            <div className='login-screen__content'>
                <div className='login-screen__logo-wrap'>
                    <img src='/jojo-logo.svg' alt='Davian Trading Hub' className='login-screen__logo' />
                </div>

                <div className='login-screen__brand'>
                    <h1 className='login-screen__title'>DAVIANTRADING HUB</h1>
                    <p className='login-screen__sub'>POWERED BY DERIV</p>
                </div>

                <p className='login-screen__tagline'>
                    Your intelligent trading platform.<br />
                    Automate strategies. Trade smarter.
                </p>

                <div className='login-screen__buttons'>
                    <button
                        className={`login-screen__btn login-screen__btn--secondary${isNewLoginLoading ? ' login-screen__btn--loading' : ''}`}
                        onClick={handleNewAccountsLogin}
                        disabled={isNewLoginLoading}
                    >
                        <span className='login-screen__btn-icon'>✦</span>
                        {isNewLoginLoading ? 'Preparing…' : 'Login (New Accounts)'}
                    </button>
                </div>

                {newLoginError && (
                    <p className='login-screen__error'>{newLoginError}</p>
                )}

                <div className='login-screen__divider'>
                    <span>or</span>
                </div>

                <div className='login-screen__create-wrap'>
                    <button
                        className='login-screen__btn login-screen__btn--create'
                        onClick={startNewSignup}
                    >
                        <span className='login-screen__btn-icon'>+</span>
                        Create Account
                    </button>
                </div>

                <p className='login-screen__footer-note'>
                    Secure login powered by Deriv OAuth
                </p>
            </div>

            <div className='login-screen__particles'>
                {[...Array(12)].map((_, i) => (
                    <div key={i} className={`login-screen__particle login-screen__particle--${i + 1}`} />
                ))}
            </div>
        </div>
    );
};

const LoginScreen = () => {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        return () => setMounted(false);
    }, []);

    if (!mounted) return null;

    return ReactDOM.createPortal(<LoginScreenInner />, document.body);
};

export default LoginScreen;
