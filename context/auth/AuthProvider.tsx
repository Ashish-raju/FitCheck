import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { AuthService, AuthUser } from '../../system/firebase/AuthService';

interface AuthContextValue {
    user: AuthUser | null;
    loading: boolean;
    signIn: (email: string, password: string) => Promise<void>;
    signUp: (email: string, password: string, displayName: string) => Promise<void>;
    signOut: () => Promise<void>;
    sendPasswordReset: (email: string) => Promise<void>;
    // Debug helper
    getConfig?: () => any;
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
        // DEMO MODE BYPASS
        if (email.startsWith('@demo_')) {
            console.log('[Auth] Entering Demo Mode:', email);
            const isMale = email === '@demo_male_user';

            // Create dummy user
            const demoUser: any = {
                uid: isMale ? 'demo_male' : 'demo_female',
                email: isMale ? 'demo.male@example.com' : 'demo.female@example.com',
                displayName: isMale ? 'Ashish (Demo)' : 'Priya (Demo)',
                photoURL: isMale
                    ? 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?fit=crop&w=200&h=200'
                    : 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?fit=crop&w=200&h=200',
                emailVerified: true,
                isAnonymous: false,
                metadata: { creationTime: new Date().toISOString(), lastSignInTime: new Date().toISOString() },
                providerData: [],
                getIdToken: async () => 'demo-token',
                delete: async () => { },
                reload: async () => { },
            };

            setUser(demoUser);
            return;
        }

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
        getConfig: () => {
            // Safe access to internals for debug
            const services = AuthService.getInstance();
            // @ts-ignore
            const app = services.getCurrentApp ? services.getCurrentApp() : null;
            return {
                appName: app?.name,
                projectId: (app?.options as any)?.projectId
            };
        }
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
