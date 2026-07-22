import { initializeApp, getApps, type FirebaseApp } from "firebase/app"
import { getAuth, GoogleAuthProvider, type Auth } from "firebase/auth"

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

let app: FirebaseApp | null = null
let auth: Auth | null = null
let googleProvider: GoogleAuthProvider | null = null

/**
 * Lazily initialize Firebase only in the browser and only when credentials exist.
 * Returns null if Firebase is not configured or we're on the server.
 */
export function getFirebaseAuth(): { auth: Auth; googleProvider: GoogleAuthProvider } | null {
  if (typeof window === "undefined") return null
  if (!firebaseConfig.apiKey || firebaseConfig.apiKey === "your_api_key_here") return null

  if (!app) {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0]
  }
  if (!auth) {
    auth = getAuth(app)
  }
  if (!googleProvider) {
    googleProvider = new GoogleAuthProvider()
  }

  return { auth, googleProvider }
}
