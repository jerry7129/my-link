import { useMutation, useQueryClient } from "@tanstack/react-query"
import { db } from "@/lib/firebase"
import { doc, updateDoc, collection, query, where, getDocs } from "firebase/firestore"
import { toast } from "sonner"
import { UserData } from "./useAuthUser"

interface UpdateProfileParams {
  uid: string
  field: "username" | "displayName" | "bio"
  value: string
}

export function useProfile() {
  const queryClient = useQueryClient()

  const updateProfileMutation = useMutation({
    mutationFn: async ({ uid, field, value }: UpdateProfileParams) => {
      // 고유 URL 중복 검사
      if (field === "displayName") {
        const usersRef = collection(db, "users")
        const q = query(usersRef, where("displayName", "==", value))
        const querySnapshot = await getDocs(q)

        const duplicateExists = querySnapshot.docs.some((d) => d.id !== uid)
        if (duplicateExists) {
          throw new Error("이미 사용 중인 고유 URL입니다. 다른 URL을 입력해주세요.")
        }
      }

      // Firestore 업데이트
      const userRef = doc(db, "users", uid)
      await updateDoc(userRef, {
        [field]: value,
      })

      return { field, value }
    },
    // 낙관적 업데이트 (Optimistic Update)
    onMutate: async ({ uid, field, value }) => {
      // 1. 진행 중인 refetch 취소
      await queryClient.cancelQueries({ queryKey: ["userData", uid] })

      // 2. 이전 데이터 스냅샷 저장
      const previousUserData = queryClient.getQueryData<UserData>(["userData", uid])

      // 3. 낙관적으로 새 데이터로 캐시 업데이트
      if (previousUserData) {
        queryClient.setQueryData<UserData>(["userData", uid], {
          ...previousUserData,
          [field]: value,
        })
      }

      // 4. 에러 발생 시 롤백을 위해 이전 데이터 반환
      return { previousUserData }
    },
    onError: (err, { uid }, context) => {
      // 에러 발생 시 이전 데이터로 롤백
      if (context?.previousUserData) {
        queryClient.setQueryData(["userData", uid], context.previousUserData)
      }
      toast.error(err instanceof Error ? err.message : "프로필 수정에 실패했습니다.")
    },
    onSuccess: () => {
      toast.success("프로필이 성공적으로 수정되었습니다.")
    },
    onSettled: (data, error, { uid }) => {
      // 성공이든 에러든 쿼리 무효화로 항상 최신 데이터 보장
      queryClient.invalidateQueries({ queryKey: ["userData", uid] })
    },
  })

  return {
    updateProfile: updateProfileMutation.mutateAsync,
    isUpdating: updateProfileMutation.isPending,
  }
}
