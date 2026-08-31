import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  onSnapshot,
  Firestore,
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

const app = !getApps().length
  ? initializeApp({
      apiKey: firebaseConfig.apiKey,
      authDomain: firebaseConfig.authDomain,
      projectId: firebaseConfig.projectId,
      storageBucket: firebaseConfig.storageBucket,
      messagingSenderId: firebaseConfig.messagingSenderId,
      appId: firebaseConfig.appId,
    })
  : getApp();

export const db: Firestore = getFirestore(
  app,
  firebaseConfig.firestoreDatabaseId || undefined
);

const STATE_DOC_REF = () => doc(db, 'app_state', 'global_workspace');

/**
 * Synchronise l'état global du workspace dans Firestore.
 */
export async function syncWorkspaceToFirebase(state: Record<string, any>): Promise<void> {
  try {
    const docRef = STATE_DOC_REF();
    await setDoc(docRef, {
      ...state,
      updated_at: new Date().toISOString(),
    }, { merge: true });
  } catch (error) {
    console.warn('Erreur de synchronisation Firestore:', error);
  }
}

/**
 * Charge l'état actuel depuis Firestore.
 */
export async function loadWorkspaceFromFirebase(): Promise<Record<string, any> | null> {
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
 * Écoute en temps réel les changements dans Firestore (multi-appareils / multi-utilisateurs).
 */
export function subscribeToFirebaseWorkspace(
  callback: (data: Record<string, any>) => void
): () => void {
  try {
    const docRef = STATE_DOC_REF();
    const unsubscribe = onSnapshot(
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
    return unsubscribe;
  } catch (error) {
    console.warn('Impossible d initialiser le flux Firestore:', error);
    return () => {};
  }
}
