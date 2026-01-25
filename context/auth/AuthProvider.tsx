import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { AuthService, AuthUser } from '../../system/firebase/AuthService';

interface AuthContextValue {
    user: AuthUser | null;
    loading: boolean;
    signIn: (email: string, password: string) => Promise<void>;
    signUp: (email: string, password: string, displayName: string) => Promise<void>;
    signOut: () => Promise<void>;
    sendPasswordReset: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [loading, setLoading] = useState(true);
    const authService = AuthService.getInstance();

    useEffect(() => {
        // Listen to auth state changes
        const unsubscribe = authService.onAuthStateChanged((authUser) => {
            setUser(authUser);
            setLoading(false);
        });

        return unsubscribe;
    }, []);

    const signIn = async (email: string, password: string) => {
        const authUser = await authService.signIn(email, password);
        setUser(authUser);
    };

    const signUp = async (email: string, password: string, displayName: string) => {
        const authUser = await authService.signUp(email, password, displayName);
        setUser(authUser);
    };

    const signOut = async () => {
        await authService.signOut();
        setUser(null);
    };

    const sendPasswordReset = async (email: string) => {
        await authService.sendPasswordResetEmail(email);
    };

    const value: AuthContextValue = {
        user,
        loading,
        signIn,
        signUp,
        signOut,
        sendPasswordReset,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
