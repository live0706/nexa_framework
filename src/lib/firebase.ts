import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  getDocs,
  collection,
  deleteDoc,
  onSnapshot,
  Firestore,
} from 'firebase/firestore';
import {
  getDatabase,
  ref as rtdbRef,
  set as rtdbSet,
  get as rtdbGet,
  onValue as rtdbOnValue,
  Database,
} from 'firebase/database';
import firebaseConfig from '../../firebase-applet-config.json';
import { User, Project, Task, Milestone } from '../types';

const app = !getApps().length
  ? initializeApp({
      apiKey: firebaseConfig.apiKey,
      authDomain: firebaseConfig.authDomain,
      projectId: firebaseConfig.projectId,
      storageBucket: firebaseConfig.storageBucket,
      messagingSenderId: firebaseConfig.messagingSenderId,
      appId: firebaseConfig.appId,
      databaseURL: (firebaseConfig as any).databaseURL || `https://${firebaseConfig.projectId}-default-rtdb.firebaseio.com`,
    })
  : getApp();

export const db: Firestore = getFirestore(
  app,
  firebaseConfig.firestoreDatabaseId || undefined
);

let rtdbInstance: Database | null = null;
try {
  rtdbInstance = getDatabase(app);
} catch (e) {
  // Realtime database optional fallback
}

export const rtdb = rtdbInstance;

const STATE_DOC_REF = () => doc(db, 'app_state', 'global_workspace');
const RTDB_STATE_PATH = 'app_state/global_workspace';

// Circuit breaker to protect from quota exhaustion
let isFirestoreQuotaExceeded = false;

function handleFirestoreError(err: any, context: string): void {
  const errMsg = err?.message || String(err);
  const errCode = err?.code || '';
  if (errCode === 'resource-exhausted' || errMsg.includes('Quota limit exceeded') || errMsg.includes('resource-exhausted')) {
    if (!isFirestoreQuotaExceeded) {
      isFirestoreQuotaExceeded = true;
      console.warn(`[Firebase Firestore] Quota journalier atteint (${context}). Passage transparent en mode Local & Serveur.`);
    }
  } else {
    console.warn(`[Firebase] Erreur (${context}):`, errMsg);
  }
}

/**
 * Sauvegarde un utilisateur spécifique directement dans Firestore et Realtime Database
 */
export async function saveUserDirectlyToFirebase(user: User): Promise<void> {
  if (!user || !user.id) return;
  const cleanUser: User = {
    ...user,
    email: user.email.trim().toLowerCase(),
    password: user.password ? user.password.trim() : 'Nexa2026!',
    created_at: user.created_at || new Date().toISOString(),
  };

  // 1. Realtime Database 'users' path
  if (rtdb) {
    try {
      await rtdbSet(rtdbRef(rtdb, `users/${cleanUser.id}`), cleanUser);
    } catch (err) {
      // RTDB fallback
    }
  }

  // 2. Firestore 'users' collection (if quota not exceeded)
  if (!isFirestoreQuotaExceeded) {
    try {
      const userRef = doc(db, 'users', cleanUser.id);
      await setDoc(userRef, cleanUser, { merge: true });
    } catch (err) {
      handleFirestoreError(err, 'saveUserDirectlyToFirebase');
    }
  }
}

/**
 * Charge tous les utilisateurs depuis la collection Firestore 'users'.
 */
export async function loadAllUsersFromFirebase(): Promise<User[]> {
  if (isFirestoreQuotaExceeded) return [];
  const usersList: User[] = [];
  try {
    const snap = await getDocs(collection(db, 'users'));
    snap.forEach((docSnap) => {
      if (docSnap.exists()) {
        const u = docSnap.data() as User;
        if (u && u.id && u.email) {
          usersList.push(u);
        }
      }
    });
  } catch (err) {
    handleFirestoreError(err, 'loadAllUsersFromFirebase');
  }
  return usersList;
}

/**
 * Synchronise l'état global du workspace dans Realtime Database et Firestore.
 * N'exécute qu'une seule écriture globale atomique pour préserver les quotas.
 */
export async function syncWorkspaceToFirebase(state: Record<string, any>): Promise<void> {
  const payload = {
    ...state,
    updated_at: new Date().toISOString(),
  };

  // 1. Sauvegarder l'état global complet dans Firebase Realtime Database
  if (rtdb) {
    try {
      const dbRef = rtdbRef(rtdb, RTDB_STATE_PATH);
      await rtdbSet(dbRef, payload);
    } catch (rtdbErr) {
      // RTDB fallback
    }
  }

  // 2. Sauvegarder dans Firestore document app_state (si quota disponible)
  if (!isFirestoreQuotaExceeded) {
    try {
      const docRef = STATE_DOC_REF();
      await setDoc(docRef, payload, { merge: true });
    } catch (error) {
      handleFirestoreError(error, 'syncWorkspaceToFirebase');
    }
  }
}

/**
 * Supprime un utilisateur de Firestore et Realtime Database
 */
export async function deleteUserFromFirebase(userId: string): Promise<void> {
  if (rtdb) {
    try {
      await rtdbSet(rtdbRef(rtdb, `users/${userId}`), null);
    } catch (err) {}
  }
  if (!isFirestoreQuotaExceeded) {
    try {
      await deleteDoc(doc(db, 'users', userId));
    } catch (err) {
      handleFirestoreError(err, 'deleteUserFromFirebase');
    }
  }
}

/**
 * Recherche directe d'un utilisateur par son e-mail sur Firebase (Firestore & RTDB)
 */
export async function fetchUserByEmailFromFirebase(email: string): Promise<User | null> {
  const cleanEmail = email.trim().toLowerCase();

  // 1. Essai Realtime Database
  if (rtdb) {
    try {
      const dbRef = rtdbRef(rtdb, `users`);
      const snap = await rtdbGet(dbRef);
      if (snap.exists()) {
        const usersObj = snap.val();
        if (usersObj && typeof usersObj === 'object') {
          const list = Object.values(usersObj) as User[];
          const found = list.find((u) => u && u.email && u.email.trim().toLowerCase() === cleanEmail);
          if (found) return found;
        }
      }
    } catch (e) {}
  }

  if (isFirestoreQuotaExceeded) return null;

  // 2. Lire depuis la collection Firestore 'users'
  try {
    const usersCol = collection(db, 'users');
    const snap = await getDocs(usersCol);
    for (const docSnap of snap.docs) {
      const data = docSnap.data() as User;
      if (data && data.email && data.email.trim().toLowerCase() === cleanEmail) {
        return data;
      }
    }
  } catch (err) {
    handleFirestoreError(err, 'fetchUserByEmailFromFirebase (users)');
  }

  // 3. Lire depuis le doc global app_state
  try {
    const stateDoc = await getDoc(STATE_DOC_REF());
    if (stateDoc.exists()) {
      const state = stateDoc.data();
      if (state && Array.isArray(state.users)) {
        const found = (state.users as User[]).find(
          (u) => u && u.email && u.email.trim().toLowerCase() === cleanEmail
        );
        if (found) return found;
      }
    }
  } catch (err) {
    handleFirestoreError(err, 'fetchUserByEmailFromFirebase (app_state)');
  }

  return null;
}

/**
 * Charge l'état actuel depuis Realtime Database ou Firestore.
 */
export async function loadWorkspaceFromFirebase(): Promise<Record<string, any> | null> {
  // 1. Essai Realtime Database
  if (rtdb) {
    try {
      const dbRef = rtdbRef(rtdb, RTDB_STATE_PATH);
      const snap = await rtdbGet(dbRef);
      if (snap.exists()) {
        return snap.val();
      }
    } catch (e) {
      // Fallback vers Firestore
    }
  }

  // 2. Essai Firestore
  try {
    const docRef = STATE_DOC_REF();
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return snap.data();
    }
    return null;
  } catch (error) {
    console.warn('Erreur de chargement Firestore:', error);
    return null;
  }
}

/**
 * Écoute en temps réel les changements (Realtime Database & Firestore multi-appareils).
 */
export function subscribeToFirebaseWorkspace(
  callback: (data: Record<string, any>) => void
): () => void {
  const unsubscribers: Array<() => void> = [];

  // Écouteur temps réel Realtime Database
  if (rtdb) {
    try {
      const dbRef = rtdbRef(rtdb, RTDB_STATE_PATH);
      const unsubRtdb = rtdbOnValue(dbRef, (snapshot) => {
        if (snapshot.exists()) {
          callback(snapshot.val());
        }
      });
      unsubscribers.push(() => unsubRtdb());
    } catch (e) {
      // RTDB listener non disponible
    }
  }

  // Écouteur temps réel Cloud Firestore
  try {
    const docRef = STATE_DOC_REF();
    const unsubFirestore = onSnapshot(
      docRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data();
          callback(data);
        }
      },
      (error) => {
        console.warn('Abonnement Firestore interrompu:', error);
      }
    );
    unsubscribers.push(unsubFirestore);
  } catch (error) {
    console.warn('Impossible d initialiser le flux Firestore:', error);
  }

  return () => {
    unsubscribers.forEach((unsub) => {
      try {
        unsub();
      } catch (err) {}
    });
  };
}

/**
 * Écoute en temps réel la collection Firestore 'users'
 */
export function subscribeToFirebaseUsers(
  callback: (users: User[]) => void
): () => void {
  try {
    const usersCol = collection(db, 'users');
    const unsubscribe = onSnapshot(
      usersCol,
      (snapshot) => {
        const usersList: User[] = [];
        snapshot.forEach((docSnap) => {
          if (docSnap.exists()) {
            const u = docSnap.data() as User;
            if (u && u.id && u.email) {
              usersList.push(u);
            }
          }
        });
        if (usersList.length > 0) {
          callback(usersList);
        }
      },
      (error) => {
        console.warn('Flux collection users Firestore interrompu:', error);
      }
    );
    return unsubscribe;
  } catch (err) {
    console.warn('Erreur subscribeToFirebaseUsers:', err);
    return () => {};
  }
}

