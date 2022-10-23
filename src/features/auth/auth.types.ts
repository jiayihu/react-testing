import { User as FirebaseUser } from 'firebase/auth';

export type AuthUser = FirebaseUser;

export type UserInfo = {
  uid: string;
  displayName: string;
  email: string;
  emailVerified: boolean;
  photoURL: string | null;
};
