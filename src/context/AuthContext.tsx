import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInAnonymously,
  signOut, 
  updateProfile,
  updateEmail,
  updatePassword,
  User as FirebaseUser 
} from 'firebase/auth';
import { auth, db, handleFirestoreError, OperationType } from '../lib/firebase';
import { setDoc, getDoc, doc } from 'firebase/firestore';
import { AppUser } from '../types';

interface AuthContextType {
  currentUser: AppUser | null;
  firebaseUser: FirebaseUser | null;
  loading: boolean;
  loginWithEmail: (email: string, pass: string) => Promise<void>;
  registerWithEmail: (name: string, email: string, pass: string) => Promise<void>;
  loginAsGuest: () => Promise<void>;
  logout: () => Promise<void>;
  updateUserProfile: (name: string, email: string, pass?: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [currentUser, setCurrentUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if there is a saved local guest user session
    const savedLocalGuest = localStorage.getItem('estudex_local_guest');
    if (savedLocalGuest) {
      try {
        const guestObj = JSON.parse(savedLocalGuest);
        setCurrentUser(guestObj);
      } catch (e) {
        localStorage.removeItem('estudex_local_guest');
      }
    }

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setFirebaseUser(user);
      if (user) {
        localStorage.removeItem('estudex_local_guest');
        let appUser: AppUser = {
          uid: user.uid,
          displayName: user.displayName || (user.isAnonymous ? 'Estudante Concurseiro' : user.email?.split('@')[0] || 'Usuário'),
          email: user.email || (user.isAnonymous ? 'visitante@estudex.app' : ''),
          isAnonymous: user.isAnonymous,
          photoURL: user.photoURL || undefined
        };

        // Try to fetch or initialize user profile document in Firestore
        try {
          const userDocRef = doc(db, 'users', user.uid);
          const snap = await getDoc(userDocRef);
          if (snap.exists()) {
            const data = snap.data() as any;
            appUser.displayName = data?.displayName || appUser.displayName;
            appUser.email = data?.email || appUser.email;
          } else {
            await setDoc(userDocRef, {
              uid: user.uid,
              displayName: appUser.displayName,
              email: appUser.email,
              createdAt: new Date().toISOString()
            }, { merge: true });
          }
        } catch (err) {
          console.warn("User document profile warning:", err);
        }

        setCurrentUser(appUser);
      } else {
        const remainingGuest = localStorage.getItem('estudex_local_guest');
        if (remainingGuest) {
          try {
            setCurrentUser(JSON.parse(remainingGuest));
          } catch (e) {
            setCurrentUser(null);
          }
        } else {
          setCurrentUser(null);
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loginWithEmail = async (email: string, pass: string) => {
    try {
      await signInWithEmailAndPassword(auth, email.trim(), pass);
    } catch (error: any) {
      if (error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential') {
        throw new Error('E-mail ou senha incorretos.');
      } else if (error.code === 'auth/invalid-email') {
        throw new Error('Formato de e-mail inválido.');
      }
      throw new Error(error.message || 'Erro ao realizar login.');
    }
  };

  const registerWithEmail = async (name: string, email: string, pass: string) => {
    try {
      const cred = await createUserWithEmailAndPassword(auth, email.trim(), pass);
      await updateProfile(cred.user, { displayName: name.trim() });
      
      const userDocRef = doc(db, 'users', cred.user.uid);
      try {
        await setDoc(userDocRef, {
          uid: cred.user.uid,
          displayName: name.trim(),
          email: email.trim(),
          createdAt: new Date().toISOString()
        });
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `users/${cred.user.uid}`);
      }
    } catch (error: any) {
      if (error.code === 'auth/email-already-in-use') {
        throw new Error('Este e-mail já está em uso por outra conta.');
      } else if (error.code === 'auth/weak-password') {
        throw new Error('A senha deve conter no mínimo 6 caracteres.');
      }
      throw new Error(error.message || 'Erro ao criar conta.');
    }
  };

  const loginAsGuest = async () => {
    try {
      await signInAnonymously(auth);
    } catch (error: any) {
      if (
        error.code === 'auth/admin-restricted-operation' ||
        error.code === 'auth/operation-not-allowed' ||
        error.message?.includes('admin-restricted-operation') ||
        error.message?.includes('operation-not-allowed')
      ) {
        const guestId = localStorage.getItem('estudex_guest_id') || Math.random().toString(36).substring(2, 9);
        localStorage.setItem('estudex_guest_id', guestId);
        const localGuest: AppUser = {
          uid: 'guest_' + guestId,
          displayName: 'Estudante Concurseiro (Visitante)',
          email: 'visitante@estudex.app',
          isAnonymous: true
        };
        localStorage.setItem('estudex_local_guest', JSON.stringify(localGuest));
        setCurrentUser(localGuest);
        return;
      }
      throw new Error('Erro ao entrar como convidado: ' + error.message);
    }
  };

  const logout = async () => {
    localStorage.removeItem('estudex_local_guest');
    setCurrentUser(null);
    if (auth.currentUser) {
      await signOut(auth);
    }
  };

  const updateUserProfile = async (name: string, newEmail: string, pass?: string) => {
    if (currentUser?.uid.startsWith('guest_')) {
      const updatedUser: AppUser = {
        ...currentUser,
        displayName: name.trim() || currentUser.displayName,
        email: newEmail.trim() || currentUser.email
      };
      localStorage.setItem('estudex_local_guest', JSON.stringify(updatedUser));
      setCurrentUser(updatedUser);
      return;
    }

    if (!auth.currentUser) return;
    const user = auth.currentUser;

    try {
      if (name.trim() && name !== user.displayName) {
        await updateProfile(user, { displayName: name.trim() });
      }

      if (newEmail.trim() && newEmail !== user.email && !user.isAnonymous) {
        await updateEmail(user, newEmail.trim());
      }

      if (pass && pass.trim().length >= 6) {
        await updatePassword(user, pass.trim());
      }

      // Sync Firestore profile
      const userDocRef = doc(db, 'users', user.uid);
      await setDoc(userDocRef, {
        displayName: name.trim(),
        email: newEmail.trim(),
        updatedAt: new Date().toISOString()
      }, { merge: true });

      setCurrentUser(prev => prev ? {
        ...prev,
        displayName: name.trim(),
        email: newEmail.trim()
      } : null);

    } catch (error: any) {
      throw new Error('Erro ao atualizar perfil: ' + (error.message || ''));
    }
  };

  return (
    <AuthContext.Provider value={{
      currentUser,
      firebaseUser,
      loading,
      loginWithEmail,
      registerWithEmail,
      loginAsGuest,
      logout,
      updateUserProfile
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
