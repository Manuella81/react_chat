import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

//Ce code initialise et configure l'application Firebase pour une application React, en préparant les services d'authentification, de base de données Firestore, et de stockage Firebase. 
const firebaseConfig = {
  apiKey: import.meta.env.VITE_API_KEY,
  authDomain: "reactchat-d1760.firebaseapp.com",
  projectId: "reactchat-d1760",
  storageBucket: "reactchat-d1760.appspot.com",
  messagingSenderId: "659685678762",
  appId: "1:659685678762:web:5cdda5cc8f61478b28fad3"
};


const app = initializeApp(firebaseConfig);

export const auth = getAuth()
export const db = getFirestore()
export const storage = getStorage()