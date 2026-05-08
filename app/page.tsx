"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Link as LinkType } from "@/data/links"
import Link from "next/link"
import { Share2, Link as LinkIcon, Plus, Loader2, Pencil, Trash2, Check, X, LogOut } from "lucide-react"
import { useState, useEffect } from "react"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { db, auth, googleProvider } from "@/lib/firebase"
import { collection, addDoc, getDocs, query, orderBy, serverTimestamp, updateDoc, deleteDoc, doc, setDoc, getDoc } from "firebase/firestore"
import { signInWithPopup, signOut, onAuthStateChanged, User } from "firebase/auth"
import { toast } from "sonner"

function getDomain(url: string) {
  try {
    return new URL(url).hostname;
  } catch {
    return "";
  }
}

const linkSchema = z.object({
  title: z
    .string()
    .min(1, { message: "제목을 입력해주세요." })
    .max(50, { message: "제목은 50자 이내로 입력해주세요." }),
  url: z
    .string()
    .min(1, { message: "URL을 입력해주세요." })
    .url({ message: "올바른 URL 형식을 입력해주세요 (예: https://...)" }),
})

type LinkFormValues = z.infer<typeof linkSchema>

export default function Page() {
  const [links, setLinks] = useState<LinkType[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isDeleting, setIsDeleting] = useState(false)
  const [editingLinkId, setEditingLinkId] = useState<string | null>(null)
  const [deleteLinkId, setDeleteLinkId] = useState<string | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [userData, setUserData] = useState<any>(null)
  const [loadingAuth, setLoadingAuth] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser)
      if (currentUser) {
        const userRef = doc(db, "users", currentUser.uid)
        const userSnap = await getDoc(userRef)
        const emailId = currentUser.email ? currentUser.email.split('@')[0] : currentUser.displayName;
        
        if (!userSnap.exists()) {
          const newData = {
            uid: currentUser.uid,
            displayName: emailId,
            username: currentUser.displayName,
            email: currentUser.email,
            photoURL: currentUser.photoURL,
            createdAt: serverTimestamp()
          };
          await setDoc(userRef, newData)
          setUserData(newData)
        } else {
          // 기존 유저 데이터 업데이트 (username이 없거나 displayName 갱신 필요 시)
          const existingData = userSnap.data();
          const updates: any = {};
          if (!existingData.username) {
            updates.username = currentUser.displayName;
          }
          if (existingData.displayName !== emailId) {
            updates.displayName = emailId;
          }

          if (Object.keys(updates).length > 0) {
            await updateDoc(userRef, updates)
            setUserData({ ...existingData, ...updates })
          } else {
            setUserData(existingData)
          }
        }
      } else {
        setUserData(null)
      }
      setLoadingAuth(false)
    })
    return () => unsubscribe()
  }, [])

  useEffect(() => {
    if (!user) {
      setLinks([])
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    const fetchLinks = async () => {
      try {
        const q = query(
          collection(db, "users", user.uid, "links"),
          orderBy("createdAt", "desc")
        )
        const querySnapshot = await getDocs(q)
        const fetchedLinks: LinkType[] = querySnapshot.docs.map(doc => {
          const data = doc.data()
          return {
            id: doc.id,
            title: data.title,
            url: data.url,
            createdAt: data.createdAt?.toDate?.().toISOString() || new Date().toISOString()
          }
        })
        setLinks(fetchedLinks)
      } catch (error) {
        console.error("Error fetching links:", error)
        toast.error("링크를 불러오는데 실패했습니다.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchLinks()
  }, [user])

  const handleSignIn = async () => {
    try {
      await signInWithPopup(auth, googleProvider)
    } catch (error) {
      console.error("Login failed:", error)
      toast.error("구글 로그인에 실패했습니다.")
    }
  }

  const handleSignOut = async () => {
    try {
      await signOut(auth)
      toast.success("로그아웃 되었습니다.")
    } catch (error) {
      console.error("Logout failed:", error)
      toast.error("로그아웃에 실패했습니다.")
    }
  }

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting: isAdding },
  } = useForm<LinkFormValues>({
    resolver: zodResolver(linkSchema),
    defaultValues: {
      title: "",
      url: "",
    },
  })

  const {
    register: registerEdit,
    handleSubmit: handleEditSubmit,
    reset: resetEdit,
    formState: { errors: editErrors, isSubmitting: isEditing },
  } = useForm<LinkFormValues>({
    resolver: zodResolver(linkSchema),
    defaultValues: {
      title: "",
      url: "",
    },
  })

  const onSubmit = async (data: LinkFormValues) => {
    if (!user) return;
    try {
      const docRef = await addDoc(collection(db, "users", user.uid, "links"), {
        title: data.title,
        url: data.url,
        createdAt: serverTimestamp()
      })

      const newLink: LinkType = {
        id: docRef.id,
        title: data.title,
        url: data.url,
        createdAt: new Date().toISOString()
      }

      setLinks([newLink, ...links])
      setIsDialogOpen(false)
      reset()
      toast.success("새 링크가 추가되었습니다.")
    } catch (error) {
      console.error("Error adding link:", error)
      toast.error("링크 추가에 실패했습니다.")
    }
  }

  const startEditing = (e: React.MouseEvent, link: LinkType) => {
    e.preventDefault();
    e.stopPropagation();
    setEditingLinkId(link.id);
    resetEdit({ title: link.title, url: link.url });
  };

  const cancelEditing = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setEditingLinkId(null);
  };

  const onEditSubmit = async (data: LinkFormValues) => {
    if (!editingLinkId || !user) return;
    try {
      const docRef = doc(db, "users", user.uid, "links", editingLinkId);
      await updateDoc(docRef, {
        title: data.title,
        url: data.url,
      });

      setLinks(links.map(link => 
        link.id === editingLinkId 
          ? { ...link, title: data.title, url: data.url } 
          : link
      ));
      setEditingLinkId(null);
      toast.success("링크가 수정되었습니다.");
    } catch (error) {
      console.error("Error updating link:", error);
      toast.error("링크 수정에 실패했습니다.");
    }
  };

  const handleDeleteClick = (e: React.MouseEvent, linkId: string) => {
    e.preventDefault();
    e.stopPropagation();
    setDeleteLinkId(linkId);
  };

  const confirmDelete = async () => {
    if (!deleteLinkId || !user) return;
    setIsDeleting(true);
    try {
      await deleteDoc(doc(db, "users", user.uid, "links", deleteLinkId));
      setLinks(links.filter(link => link.id !== deleteLinkId));
      setDeleteLinkId(null);
      toast.success("링크가 삭제되었습니다.");
    } catch (error) {
      console.error("Error deleting link:", error);
      toast.error("링크 삭제에 실패했습니다.");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      toast.success("프로필 주소가 클립보드에 복사되었습니다!")
    } catch (err) {
      console.error("복사에 실패했습니다.", err)
      toast.error("복사에 실패했습니다.")
    }
  }

  if (loadingAuth) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500 mb-4" />
        <p className="text-slate-500 font-medium">인증 정보를 불러오는 중입니다...</p>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="relative min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center selection:bg-indigo-100 selection:text-indigo-900 overflow-x-hidden px-6">
        <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
          <div className="absolute -top-[20%] -right-[10%] w-[70vw] h-[70vw] max-w-[600px] max-h-[600px] bg-indigo-300/40 dark:bg-indigo-900/30 rounded-full mix-blend-multiply filter blur-[100px] animate-pulse" />
          <div className="absolute top-[20%] -left-[10%] w-[60vw] h-[60vw] max-w-[500px] max-h-[500px] bg-purple-300/40 dark:bg-purple-900/30 rounded-full mix-blend-multiply filter blur-[100px]" />
        </div>
        <div className="relative z-10 text-center max-w-md">
          <div className="mb-6 inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-tr from-indigo-500 to-purple-500 shadow-lg text-white">
            <LinkIcon className="w-10 h-10" />
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-4">
            My Link
          </h1>
          <p className="text-base text-slate-600 dark:text-slate-400 mb-10 leading-relaxed">
            로그인하여 나만의 링크 트리를 만들어보세요!<br/>다양한 플랫폼과 포트폴리오를 한 곳에 모을 수 있습니다.
          </p>
          <Button onClick={handleSignIn} className="w-full bg-white hover:bg-slate-50 text-slate-900 border border-slate-200 shadow-md h-14 rounded-2xl flex items-center justify-center font-semibold transition-all dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-white dark:border-slate-700 text-base">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="https://www.google.com/favicon.ico" alt="Google Logo" className="w-5 h-5 mr-3" />
            Google 계정으로 계속하기
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="relative min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center selection:bg-indigo-100 selection:text-indigo-900 overflow-x-hidden">
      
      {/* Background Gradients (Dynamic Vibe) */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-[20%] -right-[10%] w-[70vw] h-[70vw] max-w-[600px] max-h-[600px] bg-indigo-300/40 dark:bg-indigo-900/30 rounded-full mix-blend-multiply filter blur-[100px] animate-pulse" />
        <div className="absolute top-[20%] -left-[10%] w-[60vw] h-[60vw] max-w-[500px] max-h-[500px] bg-purple-300/40 dark:bg-purple-900/30 rounded-full mix-blend-multiply filter blur-[100px]" />
      </div>

      <main className="relative z-10 flex w-full max-w-lg flex-col items-center py-10 px-6 sm:px-8 min-h-screen">
        
        {/* Top bar */}
        <div className="w-full flex justify-between mb-2">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleSignOut}
            className="text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
          >
            <LogOut className="w-4 h-4 mr-2" />
            로그아웃
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={handleShare}
            className="rounded-full bg-white/40 dark:bg-slate-900/40 backdrop-blur-md hover:bg-white/80 dark:hover:bg-slate-800 transition-all border border-white/50 dark:border-white/10 shadow-sm"
            aria-label="공유하기"
            title="공유하기"
          >
            <Share2 className="w-4 h-4 text-slate-700 dark:text-slate-300" />
          </Button>
        </div>

        {/* Profile Section */}
        <div className="flex flex-col items-center mb-10 w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* Profile Image (Avatar) */}
          <div className="relative w-28 h-28 mb-5 group">
            <div className="w-full h-full rounded-full bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 p-[3px] shadow-lg transform transition-transform group-hover:scale-105 duration-300">
              <div className="w-full h-full rounded-full border-4 border-white dark:border-slate-950 overflow-hidden bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                {user.photoURL ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img src={user.photoURL} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-4xl">🧑‍💻</span>
                )}
              </div>
            </div>
          </div>
          
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-1">
            {userData?.username || user.displayName || "사용자"}
          </h1>
          {userData?.displayName && (
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-3">
              @{userData.displayName}
            </p>
          )}
          <p className="text-base text-slate-600 dark:text-slate-400 text-center max-w-[280px] leading-relaxed font-medium">
            환영합니다! 다양한 플랫폼과 포트폴리오를 한 곳에 모았습니다. ✨
          </p>
        </div>

        {/* Links List Section */}
        <div className="flex w-full flex-col gap-4">
          {/* Add Link Button & Dialog */}
          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open)
            if (!open) {
              reset()
            }
          }}>
            <DialogTrigger asChild>
              <Button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-500/20 h-14 rounded-2xl mb-2 flex items-center justify-center font-semibold transition-all dark:bg-indigo-500 dark:hover:bg-indigo-600">
                <Plus className="w-5 h-5 mr-2" />
                새 링크 추가
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>새로운 링크 추가</DialogTitle>
                <DialogDescription>
                  추가할 링크의 제목과 목적지 URL을 입력해주세요.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit(onSubmit)}>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-start gap-4">
                    <Label htmlFor="title" className="text-right mt-3">
                      제목
                    </Label>
                    <div className="col-span-3">
                      <Input
                        id="title"
                        {...register("title")}
                        placeholder="예: 내 인스타그램"
                        autoComplete="off"
                        className={errors.title ? "border-red-500 focus-visible:ring-red-500" : ""}
                      />
                      {errors.title && <p className="text-sm text-red-500 mt-1 font-medium">{errors.title.message}</p>}
                    </div>
                  </div>
                  <div className="grid grid-cols-4 items-start gap-4">
                    <Label htmlFor="url" className="text-right mt-3">
                      URL
                    </Label>
                    <div className="col-span-3">
                      <Input
                        id="url"
                        {...register("url")}
                        placeholder="https://instagram.com/..."
                        type="url"
                        autoComplete="off"
                        className={errors.url ? "border-red-500 focus-visible:ring-red-500" : ""}
                      />
                      {errors.url && <p className="text-sm text-red-500 mt-1 font-medium">{errors.url.message}</p>}
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit" disabled={isAdding}>
                    {isAdding ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                    새 링크 추가하기
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-10 opacity-70">
              <Loader2 className="w-8 h-8 animate-spin text-indigo-500 mb-4" />
              <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">링크를 불러오는 중입니다...</p>
            </div>
          ) : links.length === 0 ? (
            <div className="text-center py-10 px-4 bg-white/50 dark:bg-slate-900/50 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700">
              <p className="text-slate-500 dark:text-slate-400 font-medium">아직 추가된 링크가 없습니다.</p>
              <p className="text-slate-400 dark:text-slate-500 text-sm mt-1">새 링크 추가 버튼을 눌러 첫 링크를 만들어보세요!</p>
            </div>
          ) : links.map((link, index) => {
            if (editingLinkId === link.id) {
              return (
                <Card key={`edit-${link.id}`} className="relative overflow-hidden border border-indigo-200 dark:border-indigo-900 bg-white/90 dark:bg-slate-900/90 shadow-lg rounded-2xl p-4 animate-in fade-in zoom-in-95 duration-200">
                  <form onSubmit={handleEditSubmit(onEditSubmit)} className="flex flex-col gap-3">
                    <div className="flex flex-col gap-1">
                      <Input
                        {...registerEdit("title")}
                        placeholder="제목"
                        autoComplete="off"
                        autoFocus
                        className={editErrors.title ? "border-red-500 focus-visible:ring-red-500" : ""}
                        onKeyDown={(e) => {
                          if (e.key === 'Escape') cancelEditing();
                        }}
                      />
                      {editErrors.title && <p className="text-xs text-red-500 font-medium">{editErrors.title.message}</p>}
                    </div>
                    <div className="flex flex-col gap-1">
                      <Input
                        {...registerEdit("url")}
                        placeholder="https://..."
                        type="url"
                        autoComplete="off"
                        className={editErrors.url ? "border-red-500 focus-visible:ring-red-500" : ""}
                        onKeyDown={(e) => {
                          if (e.key === 'Escape') cancelEditing();
                        }}
                      />
                      {editErrors.url && <p className="text-xs text-red-500 font-medium">{editErrors.url.message}</p>}
                    </div>
                    <div className="flex justify-end gap-2 mt-2">
                      <Button type="button" variant="ghost" size="sm" onClick={cancelEditing} disabled={isEditing}>
                        <X className="w-4 h-4 mr-1" /> 취소
                      </Button>
                      <Button type="submit" size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-white dark:bg-indigo-500 dark:hover:bg-indigo-600" disabled={isEditing}>
                        {isEditing ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Check className="w-4 h-4 mr-1" />}
                        저장
                      </Button>
                    </div>
                  </form>
                </Card>
              );
            }

            const domain = getDomain(link.url);
            const faviconUrl = domain ? `https://www.google.com/s2/favicons?domain=${domain}&sz=64` : "";
            
            return (
              <Link 
                key={link.id} 
                href={link.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="group w-full outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded-2xl animate-in fade-in slide-in-from-bottom-4"
                style={{ animationFillMode: "both", animationDelay: `${(index + 1) * 100}ms` }}
              >
                <Card className="relative overflow-hidden border border-white/60 dark:border-white/10 bg-white/70 dark:bg-slate-900/70 backdrop-blur-md shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] dark:hover:shadow-[0_8px_30px_rgb(255,255,255,0.04)] transition-all duration-300 transform group-hover:-translate-y-1 rounded-2xl">
                  
                  {/* Subtle hover gradient */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent dark:via-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 translate-x-[-100%] group-hover:translate-x-[100%]" />
                  
                  <CardContent className="p-2">
                    <div className="flex items-center p-2 relative z-10">
                      {/* Favicon Icon */}
                      <div className="flex-shrink-0 flex items-center justify-center w-12 h-12 rounded-full bg-white dark:bg-slate-800 shadow-sm border border-slate-100 dark:border-slate-700">
                        {faviconUrl ? (
                          /* eslint-disable-next-line @next/next/no-img-element */
                          <img 
                            src={faviconUrl} 
                            alt={`${link.title} 아이콘`} 
                            className="w-6 h-6 object-contain group-hover:scale-110 transition-transform duration-300"
                            loading="lazy"
                          />
                        ) : (
                          <LinkIcon className="w-5 h-5 text-slate-400 group-hover:scale-110 transition-transform duration-300" />
                        )}
                      </div>
                      
                      {/* Title */}
                      <div className="flex-grow text-center px-4">
                        <h2 className="font-semibold text-slate-800 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors text-base">
                          {link.title}
                        </h2>
                      </div>
                      
                      {/* Action Buttons */}
                      <div className="flex-shrink-0 flex items-center gap-1 pr-2 relative z-20">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 dark:hover:text-indigo-400 rounded-full transition-colors"
                          onClick={(e) => startEditing(e, link)}
                          title="수정"
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 dark:hover:text-red-400 rounded-full transition-colors"
                          onClick={(e) => handleDeleteClick(e, link.id)}
                          title="삭제"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            )
          })}
        </div>
        
        {/* Delete Alert Dialog */}
        <AlertDialog open={!!deleteLinkId} onOpenChange={(open) => !open && setDeleteLinkId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>정말 삭제하시겠습니까?</AlertDialogTitle>
              <AlertDialogDescription>
                선택하신 링크(<span className="font-semibold text-slate-700 dark:text-slate-300">{links.find(l => l.id === deleteLinkId)?.title}</span>)를 삭제합니다.<br/>
                <span className="text-red-500 font-semibold mt-2 inline-block">이 작업은 되돌릴 수 없습니다.</span>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isDeleting}>취소</AlertDialogCancel>
              <AlertDialogAction 
                onClick={(e) => {
                  e.preventDefault();
                  confirmDelete();
                }} 
                className="bg-red-600 text-white hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-700 focus:ring-red-500"
                disabled={isDeleting}
              >
                {isDeleting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                삭제하기
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        
        {/* Footer */}
        <footer className="mt-16 text-center animate-in fade-in duration-1000 delay-700">
          <p className="text-sm font-medium text-slate-400 dark:text-slate-500 flex items-center justify-center gap-1">
            Build with <span className="text-slate-900 dark:text-white font-bold ml-1">My Link</span>
          </p>
        </footer>
      </main>
    </div>
  )
}
