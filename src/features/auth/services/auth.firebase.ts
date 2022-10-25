import {
  createUserWithEmailAndPassword,
  getAuth,
  GithubAuthProvider,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
} from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { app } from '../../../services/firebase';
import { db } from '../../../services/firestore';
import { AuthUser, UserInfo } from '../auth.types';

export const auth = getAuth(app);

export function createUser(email: string, password: string) {
  return createUserWithEmailAndPassword(auth, email, password).then((credentials) => {
    return saveUserInfo(credentials.user);
  });
}

export function signInUser(email: string, password: string) {
  return signInWithEmailAndPassword(auth, email, password);
}

export function signOutUser() {
  return signOut(auth);
}

const googleProvider = new GoogleAuthProvider();
googleProvider.addScope('https://www.googleapis.com/auth/userinfo.email');
googleProvider.addScope('https://www.googleapis.com/auth/userinfo.profile');

export function signInWithGoogle() {
  return signInWithPopup(auth, googleProvider).then((result) => {
    return saveUserInfo(result.user);
  });
}

const githubProvider = new GithubAuthProvider();

export function signInWithGithub() {
  return signInWithPopup(auth, githubProvider).then((result) => {
    return saveUserInfo(result.user);
  });
}

function saveUserInfo(user: AuthUser) {
  const docRef = doc(db, 'users', user.uid);
  const userInfo: UserInfo = {
    uid: user.uid,
    displayName: user.displayName || `User${user.uid}`,
    email: user.email!,
    emailVerified: user.emailVerified,
    photoURL: user.photoURL,
  };

  return setDoc(docRef, userInfo);
}
