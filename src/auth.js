import {createUserWithEmailAndPassword,signInWithEmailAndPassword,signOut,updateProfile,onAuthStateChanged} from "firebase/auth";
import {auth} from "./firebase";
export function observeAuth(cb){if(!auth){cb(null);return()=>{};}return onAuthStateChanged(auth,cb);}
export async function registerUser(name,email,password){if(!auth)throw new Error("Firebase Auth no está configurado.");const r=await createUserWithEmailAndPassword(auth,email,password);if(name.trim())await updateProfile(r.user,{displayName:name.trim()});return r.user;}
export async function loginUser(email,password){if(!auth)throw new Error("Firebase Auth no está configurado.");return (await signInWithEmailAndPassword(auth,email,password)).user;}
export async function logoutUser(){if(auth)await signOut(auth);}