import { Platform } from 'react-native';
import auth, { FirebaseAuthTypes } from '@react-native-firebase/auth';
import { getFirestore, doc, setDoc, serverTimestamp } from '@react-native-firebase/firestore';
import ReactNativeBlobUtil from 'react-native-blob-util';
import { getFCMToken } from 'utils/notifications';

const PROFILE_IMAGES_DIR = `${ReactNativeBlobUtil.fs.dirs.DocumentDir}/profile_images`;

function getFirebaseAuthErrorMessage(error: FirebaseAuthTypes.NativeFirebaseAuthError): string {
  switch (error.code) {
    case 'auth/invalid-email':
      return 'The email address is not valid.';
    case 'auth/user-disabled':
      return 'This account has been disabled. Please contact support.';
    case 'auth/user-not-found':
      return 'No account found with this email address.';
    case 'auth/wrong-password':
      return 'Incorrect password. Please try again.';
    case 'auth/email-already-in-use':
      return 'An account with this email already exists.';
    case 'auth/weak-password':
      return 'Password is too weak. Please use at least 6 characters.';
    case 'auth/too-many-requests':
      return 'Too many failed attempts. Please try again later.';
    case 'auth/network-request-failed':
      return 'Network error. Please check your internet connection.';
    case 'auth/invalid-credential':
      return 'Invalid email or password. Please try again.';
    default:
      return error.message || 'An unexpected error occurred. Please try again.';
  }
}

async function saveProfileImageLocally(uid: string, sourceUri: string): Promise<string> {
  const dirExists = await ReactNativeBlobUtil.fs.isDir(PROFILE_IMAGES_DIR);
  if (!dirExists) {
    await ReactNativeBlobUtil.fs.mkdir(PROFILE_IMAGES_DIR);
  }

  const extension = sourceUri.split('.').pop()?.split('?')[0] || 'jpg';
  const destPath = `${PROFILE_IMAGES_DIR}/${uid}.${extension}`;

  const normalizedSource = Platform.OS === 'ios'
    ? sourceUri.replace('file://', '')
    : sourceUri;

  const exists = await ReactNativeBlobUtil.fs.exists(destPath);
  if (exists) {
    await ReactNativeBlobUtil.fs.unlink(destPath);
  }

  await ReactNativeBlobUtil.fs.cp(normalizedSource, destPath);
  return Platform.OS === 'ios' ? destPath : `file://${destPath}`;
}

/** Returns the local profile image path if it exists on disk, otherwise null. */
async function getLocalProfileImage(uid: string): Promise<string | null> {
  try {
    const dirExists = await ReactNativeBlobUtil.fs.isDir(PROFILE_IMAGES_DIR);
    if (!dirExists) { return null; }

    const files = await ReactNativeBlobUtil.fs.ls(PROFILE_IMAGES_DIR);
    const match = files.find(f => f.startsWith(uid));
    if (!match) { return null; }

    const fullPath = `${PROFILE_IMAGES_DIR}/${match}`;
    return Platform.OS === 'ios' ? fullPath : `file://${fullPath}`;
  } catch {
    return null;
  }
}

export const firebaseAuth = {
  login: async (email: string, password: string): Promise<FirebaseAuthTypes.User> => {
    try {
      const userCredential = await auth().signInWithEmailAndPassword(email, password);
      return userCredential.user;
    } catch (error: any) {
      throw new Error(getFirebaseAuthErrorMessage(error));
    }
  },

  register: async (
    email: string,
    password: string,
    fullName: string,
    localImageUri?: string,
  ): Promise<{ user: FirebaseAuthTypes.User; localPhotoPath: string | null }> => {
    try {
      const userCredential = await auth().createUserWithEmailAndPassword(email, password);
      const { uid } = userCredential.user;
      let localPhotoPath: string | null = null;

      if (localImageUri) {
        localPhotoPath = await saveProfileImageLocally(uid, localImageUri);
      }

      await userCredential.user.updateProfile({ displayName: fullName });

      const fcmToken = await getFCMToken();
      const db = getFirestore();
      await setDoc(doc(db, 'users', uid), {
        uid,
        fullName,
        email,
        profileImagePath: localPhotoPath,
        fcmToken,
        platform: Platform.OS,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      await userCredential.user.reload();
      return { user: auth().currentUser!, localPhotoPath };
    } catch (error: any) {
      throw new Error(getFirebaseAuthErrorMessage(error));
    }
  },

  forgotPassword: async (email: string): Promise<void> => {
    try {
      await auth().sendPasswordResetEmail(email);
    } catch (error: any) {
      throw new Error(getFirebaseAuthErrorMessage(error));
    }
  },

  /** Update the FCM token in Firestore for the given user (call after login). */
  updateFCMToken: async (uid: string): Promise<void> => {
    try {
      const fcmToken = await getFCMToken();
      if (!fcmToken) { return; }
      const db = getFirestore();
      const userRef = doc(db, 'users', uid);
      await setDoc(userRef, { fcmToken, updatedAt: serverTimestamp() }, { merge: true });
    } catch {
      // Non-critical -- don't block login if token update fails
    }
  },

  logout: async (): Promise<void> => {
    await auth().signOut();
  },

  getLocalProfileImage,
  saveProfileImageLocally,
};
