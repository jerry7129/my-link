import { useQuery } from "@tanstack/react-query"
import { db } from "@/lib/firebase"
import { collection, query, where, getDocs, orderBy } from "firebase/firestore"
import { Link as LinkType } from "@/data/links"
import { UserData } from "./useAuthUser"

export function usePublicProfile(displayName: string) {
  return useQuery({
    queryKey: ["publicProfile", displayName],
    queryFn: async () => {
      // 1. displayName으로 유저 검색
      const usersRef = collection(db, "users")
      const q = query(usersRef, where("displayName", "==", displayName))
      const querySnapshot = await getDocs(q)

      if (querySnapshot.empty) {
        return null // 404 처리를 위해 null 반환
      }

      const userDoc = querySnapshot.docs[0]
      const userData = { uid: userDoc.id, ...userDoc.data() } as UserData

      // 2. 해당 유저의 링크 목록 조회
      const linksRef = collection(db, "users", userData.uid, "links")
      const linksQuery = query(linksRef, orderBy("createdAt", "desc"))
      const linksSnapshot = await getDocs(linksQuery)

      const links = linksSnapshot.docs.map((doc) => {
        const data = doc.data()
        return {
          id: doc.id,
          title: data.title,
          url: data.url,
          createdAt: data.createdAt?.toDate?.().toISOString() || new Date().toISOString(),
        } as LinkType
      })

      return {
        user: userData,
        links,
      }
    },
    enabled: !!displayName,
  })
}
