import {addDoc,collection,deleteDoc,doc,getDocs,orderBy,query,serverTimestamp,updateDoc} from "firebase/firestore";
import {db} from "./firebase";
function req(){if(!db)throw new Error("Firebase Firestore no está configurado.");}
const products=()=>collection(db,"productos");
const movements=()=>collection(db,"movimientos");
export async function getProducts(){req();const s=await getDocs(products());return s.docs.map(d=>({id:d.id,...d.data()}));}
export async function addProduct(p,u){req();const r=await addDoc(products(),{nombre:p.nombre,sku:p.sku||"",categoria:p.categoria,stock:Number(p.stock||0),createdAt:serverTimestamp(),updatedAt:serverTimestamp(),createdBy:u?.uid||null});return r.id;}
export async function updateProduct(id,p){req();await updateDoc(doc(db,"productos",id),{nombre:p.nombre,sku:p.sku||"",categoria:p.categoria,stock:Number(p.stock||0),updatedAt:serverTimestamp()});}
export async function deleteProduct(id){req();await deleteDoc(doc(db,"productos",id));}
export async function addMovement(m,u){req();await addDoc(movements(),{...m,quantity:Number(m.quantity||0),createdAt:serverTimestamp(),createdBy:u?.uid||null,createdByName:u?.displayName||u?.email||"Usuario"});}
export async function getMovements(){req();const s=await getDocs(query(movements(),orderBy("createdAt","desc")));return s.docs.map(d=>({id:d.id,...d.data()}));}