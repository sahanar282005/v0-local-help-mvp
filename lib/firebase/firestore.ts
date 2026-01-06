// Firestore database utilities
import { db } from "./config"
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  addDoc,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore"

// Generic Firestore operations
export const createDocument = async (collectionName: string, data: any, customId?: string) => {
  try {
    if (customId) {
      await setDoc(doc(db, collectionName, customId), {
        ...data,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      })
      return { id: customId, error: null }
    } else {
      const docRef = await addDoc(collection(db, collectionName), {
        ...data,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      })
      return { id: docRef.id, error: null }
    }
  } catch (error: any) {
    return { id: null, error: error.message }
  }
}

export const getDocument = async (collectionName: string, documentId: string) => {
  try {
    const docRef = doc(db, collectionName, documentId)
    const docSnap = await getDoc(docRef)
    if (docSnap.exists()) {
      return { data: { id: docSnap.id, ...docSnap.data() }, error: null }
    } else {
      return { data: null, error: "Document not found" }
    }
  } catch (error: any) {
    return { data: null, error: error.message }
  }
}

export const updateDocument = async (collectionName: string, documentId: string, data: any) => {
  try {
    const docRef = doc(db, collectionName, documentId)
    await updateDoc(docRef, {
      ...data,
      updatedAt: serverTimestamp(),
    })
    return { error: null }
  } catch (error: any) {
    return { error: error.message }
  }
}

export const deleteDocument = async (collectionName: string, documentId: string) => {
  try {
    await deleteDoc(doc(db, collectionName, documentId))
    return { error: null }
  } catch (error: any) {
    return { error: error.message }
  }
}

export const queryDocuments = async (collectionName: string, constraints: any[] = []) => {
  try {
    const q = query(collection(db, collectionName), ...constraints)
    const querySnapshot = await getDocs(q)
    const documents = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }))
    return { data: documents, error: null }
  } catch (error: any) {
    return { data: [], error: error.message }
  }
}

// Export Firestore query helpers for use in other files
export { where, orderBy, limit, Timestamp }
