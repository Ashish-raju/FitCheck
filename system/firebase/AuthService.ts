import { FIREBASE_AUTH, FIREBASE_DB } from './firebaseConfig';
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';

export interface AuthUser {
    uid: string;
    email: string | null;
    displayName: string | null;
    photoURL: string | null;
}

export class AuthService {
    private static instance: AuthService;

    private constructor() { }

    public static getInstance(): AuthService {
        if (!AuthService.instance) {
            AuthService.instance = new AuthService();
        }
        return AuthService.instance;
    }

    /**
     * Sign in with email and password
     */
    public async signIn(email: string, password: string): Promise<AuthUser> {
        try {
            const userCredential = await FIREBASE_AUTH.signInWithEmailAndPassword(email, password);
            console.log('[AuthService] Sign in successful:', userCredential.user?.uid);
            return this.mapUser(userCredential.user);
        } catch (error: any) {
            console.error('[AuthService] Sign in failed:', error);
            throw this.mapError(error);
        }
    }

    /**
     * Sign up with email, password, and display name
     * Creates user profile in Firestore on first signup
     */
    public async signUp(email: string, password: string, displayName: string): Promise<AuthUser> {
        try {
            const userCredential = await FIREBASE_AUTH.createUserWithEmailAndPassword(email, password);
            const user = userCredential.user;

            if (!user) throw new Error('User creation failed');

            // Update display name
            await user.updateProfile({ displayName });

            // Create user profile in Firestore
            await this.createUserProfile(user.uid, {
                email: user.email || email,
                displayName,
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
            });

            console.log('[AuthService] Sign up successful:', user.uid);
            return this.mapUser(user);
        } catch (error: any) {
            console.error('[AuthService] Sign up failed:', error);
            throw this.mapError(error);
        }
    }

    /**
     * Sign in with Google (requires additional setup)
     * Note: This is a placeholder - full Google OAuth requires expo-auth-session or similar
     */
    public async signInWithGoogle(): Promise<AuthUser> {
        throw new Error('Google sign-in not yet implemented. Requires expo-auth-session setup.');
    }

    /**
     * Sign out current user
     */
    public async signOut(): Promise<void> {
        try {
            await FIREBASE_AUTH.signOut();
            console.log('[AuthService] Sign out successful');
        } catch (error: any) {
            console.error('[AuthService] Sign out failed:', error);
            throw this.mapError(error);
        }
    }

    /**
     * Get current authenticated user
     */
    public getCurrentUser(): AuthUser | null {
        const user = FIREBASE_AUTH.currentUser;
        return user ? this.mapUser(user) : null;
    }

    /**
     * Listen to auth state changes
     */
    public onAuthStateChanged(callback: (user: AuthUser | null) => void): () => void {
        const unsubscribe = FIREBASE_AUTH.onAuthStateChanged((firebaseUser) => {
            callback(firebaseUser ? this.mapUser(firebaseUser) : null);
        });
        return unsubscribe;
    }

    /**
     * Send password reset email
     */
    public async sendPasswordResetEmail(email: string): Promise<void> {
        try {
            await FIREBASE_AUTH.sendPasswordResetEmail(email);
            console.log('[AuthService] Password reset email sent to:', email);
        } catch (error: any) {
            console.error('[AuthService] Password reset failed:', error);
            throw this.mapError(error);
        }
    }

    /**
     * Create user profile document in Firestore
     */
    private async createUserProfile(uid: string, data: any): Promise<void> {
        try {
            await FIREBASE_DB.collection('users').doc(uid).set(data);
            console.log('[AuthService] User profile created:', uid);
        } catch (error) {
            console.error('[AuthService] Failed to create user profile:', error);
            throw error;
        }
    }

    /**
     * Map Firebase user to AuthUser
     */
    private mapUser(firebaseUser: firebase.User | null): AuthUser {
        if (!firebaseUser) {
            throw new Error('No user provided');
        }
        return {
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: firebaseUser.displayName,
            photoURL: firebaseUser.photoURL,
        };
    }

    /**
     * Map Firebase error to user-friendly message
     */
    private mapError(error: any): Error {
        const code = error.code;
        let message = error.message;

        switch (code) {
            case 'auth/email-already-in-use':
                message = 'This email is already registered';
                break;
            case 'auth/invalid-email':
                message = 'Invalid email address';
                break;
            case 'auth/weak-password':
                message = 'Password should be at least 6 characters';
                break;
            case 'auth/user-not-found':
            case 'auth/wrong-password':
                message = 'Invalid email or password';
                break;
            case 'auth/too-many-requests':
                message = 'Too many attempts. Please try again later';
                break;
            case 'auth/network-request-failed':
                message = 'Network error. Check your connection';
                break;
        }

        return new Error(message);
    }
}
