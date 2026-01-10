import { NextResponse } from "next/server"
import { adminAuth, adminDb } from "@/lib/firebase/admin"

export async function POST() {
  try {
    console.log("[v0] Starting user deletion process...")

    let deletedAuthUsers = 0
    let deletedFirestoreUsers = 0

    // Delete all users from Firebase Authentication
    const listUsersResult = await adminAuth.listUsers()
    console.log(`[v0] Found ${listUsersResult.users.length} users in Firebase Auth`)

    for (const user of listUsersResult.users) {
      try {
        await adminAuth.deleteUser(user.uid)
        deletedAuthUsers++
        console.log(`[v0] Deleted auth user: ${user.email}`)
      } catch (error) {
        console.error(`[v0] Error deleting auth user ${user.email}:`, error)
      }
    }

    // Delete all user documents from Firestore
    const usersSnapshot = await adminDb.collection("users").get()
    console.log(`[v0] Found ${usersSnapshot.size} users in Firestore`)

    for (const doc of usersSnapshot.docs) {
      try {
        await doc.ref.delete()
        deletedFirestoreUsers++
        console.log(`[v0] Deleted Firestore user: ${doc.id}`)
      } catch (error) {
        console.error(`[v0] Error deleting Firestore user ${doc.id}:`, error)
      }
    }

    const message = `Successfully deleted ${deletedAuthUsers} Firebase Auth users and ${deletedFirestoreUsers} Firestore user documents.`
    console.log(`[v0] ${message}`)

    return NextResponse.json({
      success: true,
      message,
      deletedAuthUsers,
      deletedFirestoreUsers,
    })
  } catch (error) {
    console.error("[v0] Error in delete-all-users:", error)
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Unknown error occurred",
      },
      { status: 500 },
    )
  }
}
