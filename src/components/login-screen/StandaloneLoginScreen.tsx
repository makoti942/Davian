import React, { useState, useEffect, useCallback } from 'react';
import Cookies from 'js-cookie';
import { startNewSignup } from '@/auth/NewDerivAuth';
import { generateOAuthURL } from '@/components/shared';
import './LoginScreen.scss';

const isUserLoggedIn = () => {
    const loggedState = Cookies.get('logged_state') === 'true';
    const accountsList = JSON.parse(localStorage.getItem('accountsList') ?? '{}');
    const hasAccounts = Object.keys(accountsList).length > 0;
    return loggedState || hasAccounts;
};

const isCallbackOrEndpoint = () => {
    const path = window.location.pathname;
    return path.includes('/callback') || path.includes('/endpoint');
};

const StandaloneLoginScreen: React.FC = () => {
    const [show, setShow] = useState(!isUserLoggedIn() && !isCallbackOrEndpoint());
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        if (!show) return;
        const t = setTimeout(() => setVisible(true), 60);
        return () => clearTimeout(t);
    }, [show]);

    // Listen for auth changes and hide the screen when user logs in
    useEffect(() => {
        const check = () => {
            if (isUserLoggedIn()) setShow(false);
        };

        const interval = setInterval(check, 800);
        window.addEventListener('storage', check);

        return () => {
            clearInterval(interval);
            window.removeEventListener('storage', check);
        };
    }, []);

    const handleLogin = useCallback(() => {
        window.location.href = generateOAuthURL(false, 'home');
    }, []);

    if (!show) return null;

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
                        className='login-screen__btn login-screen__btn--primary'
                        onClick={handleLogin}
                    >
                        <span className='login-screen__btn-icon'>✦</span>
                        Login (New Accounts)
                    </button>
                </div>

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

export default StandaloneLoginScreen;
