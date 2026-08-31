import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
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
 * Synchronise l'état global du workspace dans Realtime Database et Firestore en continu.
 */
export async function syncWorkspaceToFirebase(state: Record<string, any>): Promise<void> {
  const payload = {
    ...state,
    updated_at: new Date().toISOString(),
  };

  // 1. Firebase Realtime Database
  if (rtdb) {
    try {
      const dbRef = rtdbRef(rtdb, RTDB_STATE_PATH);
      await rtdbSet(dbRef, payload);
    } catch (rtdbErr) {
      // Ignorer si RTDB non instancié sur ce projet spécifique
    }
  }

  // 2. Cloud Firestore (Temps Réel)
  try {
    const docRef = STATE_DOC_REF();
    await setDoc(docRef, payload, { merge: true });
  } catch (error) {
    console.warn('Erreur de synchronisation Firestore:', error);
  }
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

