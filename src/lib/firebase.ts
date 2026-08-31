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
  console.warn('Realtime Database fallback warning:', e);
}

export const rtdb = rtdbInstance;

const STATE_DOC_REF = () => doc(db, 'app_state', 'global_workspace');
const RTDB_STATE_PATH = 'app_state/global_workspace';

/**
 * Synchronise l'état global du workspace dans Firestore (collections & doc) et Realtime Database.
 */
export async function syncWorkspaceToFirebase(state: Record<string, any>): Promise<void> {
  const payload = {
    ...state,
    updated_at: new Date().toISOString(),
  };

  // 1. Sauvegarder chaque utilisateur individuellement dans la collection Firestore "users"
  if (Array.isArray(state.users)) {
    for (const user of state.users as User[]) {
      if (user && user.id) {
        try {
          await setDoc(doc(db, 'users', user.id), {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            password: user.password || 'Nexa2026!',
            job_title: user.job_title || '',
            avatar: user.avatar || '',
            created_at: user.created_at || new Date().toISOString(),
          }, { merge: true });

          if (rtdb) {
            await rtdbSet(rtdbRef(rtdb, `users/${user.id}`), user);
          }
        } catch (err) {
          console.warn('Erreur écriture user Firestore:', err);
        }
      }
    }
  }

  // 2. Sauvegarder chaque projet dans la collection Firestore "projects"
  if (Array.isArray(state.projects)) {
    for (const proj of state.projects as Project[]) {
      if (proj && proj.id) {
        try {
          await setDoc(doc(db, 'projects', proj.id), proj, { merge: true });
          if (rtdb) {
            await rtdbSet(rtdbRef(rtdb, `projects/${proj.id}`), proj);
          }
        } catch (err) {
          console.warn('Erreur écriture projet Firestore:', err);
        }
      }
    }
  }

  // 3. Sauvegarder l'état global complet dans Firebase Realtime Database
  if (rtdb) {
    try {
      const dbRef = rtdbRef(rtdb, RTDB_STATE_PATH);
      await rtdbSet(dbRef, payload);
    } catch (rtdbErr) {
      // RTDB fallback
    }
  }

  // 4. Sauvegarder l'état global complet dans Firestore document app_state
  try {
    const docRef = STATE_DOC_REF();
    await setDoc(docRef, payload, { merge: true });
  } catch (error) {
    console.warn('Erreur de synchronisation Firestore app_state:', error);
  }
}

/**
 * Supprime un utilisateur de Firestore et Realtime Database
 */
export async function deleteUserFromFirebase(userId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'users', userId));
    if (rtdb) {
      await rtdbSet(rtdbRef(rtdb, `users/${userId}`), null);
    }
  } catch (err) {
    console.warn('Erreur suppression utilisateur Firebase:', err);
  }
}

/**
 * Recherche directe d'un utilisateur par son e-mail sur Firebase (Firestore & RTDB)
 * Utilisé pour une connexion mobile infaillible même si le state local n'a pas encore chargé.
 */
export async function fetchUserByEmailFromFirebase(email: string): Promise<User | null> {
  const cleanEmail = email.trim().toLowerCase();

  try {
    // 1. Lire depuis la collection Firestore 'users'
    const usersCol = collection(db, 'users');
    const snap = await getDocs(usersCol);
    for (const docSnap of snap.docs) {
      const data = docSnap.data() as User;
      if (data && data.email && data.email.trim().toLowerCase() === cleanEmail) {
        return data;
      }
    }
  } catch (err) {
    console.warn('Erreur recherche collection users Firestore:', err);
  }

  // 2. Lire depuis le doc global app_state
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
    console.warn('Erreur recherche app_state Firestore:', err);
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

