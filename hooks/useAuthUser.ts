import { useState, useEffect } from "react"
import { auth, db } from "@/lib/firebase"
import { onAuthStateChanged, User } from "firebase/auth"
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from "firebase/firestore"
import { useQuery, useQueryClient } from "@tanstack/react-query"

export interface UserData {
  uid: string
  displayName: string | null
  username: string | null
  email: string | null
  photoURL: string | null
  bio?: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  createdAt?: any
}

export function useAuthUser() {
  const queryClient = useQueryClient()
  const [user, setUser] = useState<User | null>(null)
  const [loadingAuth, setLoadingAuth] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser)
      setLoadingAuth(false)
      
      // 사용자 인증 상태가 바뀌면 캐시 무효화
      if (currentUser) {
        queryClient.invalidateQueries({ queryKey: ["userData", currentUser.uid] })
      } else {
        queryClient.removeQueries({ queryKey: ["userData"] })
      }
    })
    return () => unsubscribe()
  }, [queryClient])

  const fetchUserData = async (currentUser: User): Promise<UserData> => {
    const userRef = doc(db, "users", currentUser.uid)
    const userSnap = await getDoc(userRef)
    const emailId = currentUser.email ? currentUser.email.split("@")[0] : currentUser.displayName

    if (!userSnap.exists()) {
      const newData: UserData = {
        uid: currentUser.uid,
        displayName: emailId || null,
        username: currentUser.displayName,
        email: currentUser.email,
        photoURL: currentUser.photoURL,
        createdAt: serverTimestamp(),
      }
      await setDoc(userRef, newData)
      return newData
    } else {
      const existingData = userSnap.data() as UserData
      const updates: Partial<UserData> = {}
      if (!existingData.username) {
        updates.username = currentUser.displayName
      }
      if (!existingData.displayName) {
        updates.displayName = emailId || null
      }

      if (Object.keys(updates).length > 0) {
        await updateDoc(userRef, updates)
        return { ...existingData, ...updates }
      }
      return existingData
    }
  }

  const { data: userData, isLoading: isUserDataLoading } = useQuery({
    queryKey: ["userData", user?.uid],
    queryFn: () => fetchUserData(user!),
    enabled: !!user,
  })

  return {
    user,
    userData,
    loadingAuth: loadingAuth || (!!user && isUserDataLoading),
  }
}
