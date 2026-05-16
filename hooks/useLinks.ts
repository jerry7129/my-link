import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { db } from "@/lib/firebase"
import { collection, query, orderBy, getDocs, addDoc, updateDoc, deleteDoc, doc, serverTimestamp, increment } from "firebase/firestore"
import { Link as LinkType } from "@/data/links"
import { toast } from "sonner"

export function useLinks(uid?: string) {
  const queryClient = useQueryClient()

  // 1. 링크 리스트 가져오기 (Query)
  const { data: links = [], isLoading: isLoadingLinks } = useQuery({
    queryKey: ["links", uid],
    queryFn: async () => {
      if (!uid) return []
      const q = query(collection(db, "users", uid, "links"), orderBy("createdAt", "desc"))
      const querySnapshot = await getDocs(q)
      return querySnapshot.docs.map((doc) => {
        const data = doc.data()
        return {
          id: doc.id,
          title: data.title,
          url: data.url,
          createdAt: data.createdAt?.toDate?.().toISOString() || new Date().toISOString(),
          clickCount: data.clickCount || 0,
        } as LinkType
      })
    },
    enabled: !!uid,
  })

  // 2. 링크 추가하기 (Mutation)
  const addLinkMutation = useMutation({
    mutationFn: async ({ title, url }: { title: string; url: string }) => {
      if (!uid) throw new Error("로그인이 필요합니다.")
      const docRef = await addDoc(collection(db, "users", uid, "links"), {
        title,
        url,
        createdAt: serverTimestamp(),
        clickCount: 0,
      })
      return {
        id: docRef.id,
        title,
        url,
        createdAt: new Date().toISOString(),
        clickCount: 0,
      } as LinkType
    },
    onSuccess: (newLink) => {
      // 캐시 수동 업데이트 (또는 queryClient.invalidateQueries 사용 가능)
      queryClient.setQueryData(["links", uid], (old: LinkType[] | undefined) => {
        return old ? [newLink, ...old] : [newLink]
      })
      toast.success("새 링크가 추가되었습니다.")
    },
    onError: (error) => {
      console.error("Error adding link:", error)
      toast.error("링크 추가에 실패했습니다.")
    },
  })

  // 3. 링크 수정하기 (Mutation)
  const editLinkMutation = useMutation({
    mutationFn: async ({ linkId, title, url }: { linkId: string; title: string; url: string }) => {
      if (!uid) throw new Error("로그인이 필요합니다.")
      const docRef = doc(db, "users", uid, "links", linkId)
      await updateDoc(docRef, { title, url })
      return { linkId, title, url }
    },
    onSuccess: ({ linkId, title, url }) => {
      queryClient.setQueryData(["links", uid], (old: LinkType[] | undefined) => {
        return old ? old.map((l) => (l.id === linkId ? { ...l, title, url } : l)) : []
      })
      toast.success("링크가 수정되었습니다.")
    },
    onError: (error) => {
      console.error("Error updating link:", error)
      toast.error("링크 수정에 실패했습니다.")
    },
  })

  // 4. 링크 삭제하기 (Mutation)
  const deleteLinkMutation = useMutation({
    mutationFn: async (linkId: string) => {
      if (!uid) throw new Error("로그인이 필요합니다.")
      await deleteDoc(doc(db, "users", uid, "links", linkId))
      return linkId
    },
    onSuccess: (deletedId) => {
      queryClient.setQueryData(["links", uid], (old: LinkType[] | undefined) => {
        return old ? old.filter((l) => l.id !== deletedId) : []
      })
      toast.success("링크가 삭제되었습니다.")
    },
    onError: (error) => {
      console.error("Error deleting link:", error)
      toast.error("링크 삭제에 실패했습니다.")
    },
  })

  // 5. 링크 클릭 카운트 증가 (Mutation)
  const incrementClickMutation = useMutation({
    mutationFn: async ({ ownerUid, linkId }: { ownerUid: string; linkId: string }) => {
      const docRef = doc(db, "users", ownerUid, "links", linkId)
      await updateDoc(docRef, { clickCount: increment(1) })
      return { linkId }
    },
    onSuccess: ({ linkId }) => {
      // 캐시에서 클릭 수 낙관적 업데이트
      queryClient.setQueryData(["links", uid], (old: LinkType[] | undefined) => {
        return old ? old.map((l) => (l.id === linkId ? { ...l, clickCount: l.clickCount + 1 } : l)) : []
      })
    },
    onError: (error) => {
      console.error("Error incrementing click count:", error)
    },
  })

  return {
    links,
    isLoadingLinks,
    addLink: addLinkMutation.mutateAsync,
    isAdding: addLinkMutation.isPending,
    editLink: editLinkMutation.mutateAsync,
    isEditing: editLinkMutation.isPending,
    deleteLink: deleteLinkMutation.mutateAsync,
    isDeleting: deleteLinkMutation.isPending,
    incrementClickCount: incrementClickMutation.mutate,
  }
}
