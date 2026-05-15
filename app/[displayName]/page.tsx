"use client"

import { usePublicProfile } from "@/hooks/usePublicProfile"
import { notFound } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Link as LinkIcon, Loader2, Share, Eye } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"
import { use } from "react"
import { db } from "@/lib/firebase"
import { doc, updateDoc, increment } from "firebase/firestore"

function getDomain(url: string) {
  try {
    return new URL(url).hostname;
  } catch {
    return "";
  }
}

export default function PublicProfilePage(props: { params: Promise<{ displayName: string }> }) {
  // Next.js 15 requires awaiting params
  const params = use(props.params)
  const displayName = params.displayName
  const { data, isLoading, error } = usePublicProfile(displayName)
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500 mb-4" />
        <p className="text-slate-500 font-medium">프로필을 불러오는 중입니다...</p>
      </div>
    )
  }

  if (error || data === null) {
    notFound()
  }

  const { user, links } = data!

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast.success("프로필 주소가 클립보드에 복사되었습니다!");
    } catch (_) {
      toast.error("링크 복사에 실패했습니다.");
    }
  }

  const handleLinkClick = (linkId: string) => {
    try {
      const docRef = doc(db, "users", user.uid, "links", linkId)
      updateDoc(docRef, { clickCount: increment(1) })
    } catch (error) {
      console.error("Error incrementing click count:", error)
    }
  }

  return (
    <div className="relative min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center selection:bg-indigo-100 selection:text-indigo-900 overflow-x-hidden">
      
      {/* Background Gradients (Dynamic Vibe) */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-[20%] -right-[10%] w-[70vw] h-[70vw] max-w-[600px] max-h-[600px] bg-indigo-300/40 dark:bg-indigo-900/30 rounded-full mix-blend-multiply filter blur-[100px] animate-pulse" />
        <div className="absolute top-[20%] -left-[10%] w-[60vw] h-[60vw] max-w-[500px] max-h-[500px] bg-purple-300/40 dark:bg-purple-900/30 rounded-full mix-blend-multiply filter blur-[100px]" />
      </div>

      <main className="relative z-10 flex w-full max-w-lg flex-col items-center py-10 px-6 sm:px-8 min-h-screen">
        
        {/* Header */}
        <div className="w-full flex justify-between items-center mb-6">
          <Link href="/" className="flex items-center gap-2 outline-none group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center shadow-sm group-hover:shadow-md transition-all group-hover:scale-105">
              <LinkIcon className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">My Link</span>
          </Link>
          <button
            onClick={handleShare}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all text-sm font-medium text-slate-700 dark:text-slate-300 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <Share className="w-4 h-4" />
            공유하기
          </button>
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
          
          {/* Username (이름) */}
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-1 px-3 py-1 text-center">
            {user.username || user.displayName || "사용자"}
          </h1>

          {/* Display Name (고유 URL 핸들) */}
          {user.displayName && (
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-3 px-3 py-1 text-center">
              @{user.displayName}
            </p>
          )}

          {/* Bio (소개) */}
          <p className="text-base text-slate-600 dark:text-slate-400 text-center max-w-[280px] leading-relaxed font-medium px-4 py-2">
            {user.bio || "환영합니다! 다양한 플랫폼과 포트폴리오를 한 곳에 모았습니다. ✨"}
          </p>
        </div>

        {/* Links List Section */}
        <div className="flex w-full flex-col gap-4">
          {links.length === 0 ? (
            <div className="text-center py-10 px-4 bg-white/50 dark:bg-slate-900/50 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700">
              <p className="text-slate-500 dark:text-slate-400 font-medium">아직 등록된 링크가 없습니다.</p>
            </div>
          ) : links.map((link, index) => {
            const domain = getDomain(link.url);
            const faviconUrl = domain ? `https://www.google.com/s2/favicons?domain=${domain}&sz=64` : "";
            
            return (
              <Link 
                key={link.id} 
                href={link.url} 
                target="_blank" 
                rel="noopener noreferrer"
                onClick={() => handleLinkClick(link.id)}
                className="group w-full outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded-2xl animate-in fade-in slide-in-from-bottom-4"
                style={{ animationFillMode: "both", animationDelay: `${(index + 1) * 100}ms` }}
              >
                <Card className="relative overflow-hidden border border-white/60 dark:border-white/10 bg-white/70 dark:bg-slate-900/70 backdrop-blur-md shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] dark:hover:shadow-[0_8px_30px_rgb(255,255,255,0.04)] transition-all duration-300 transform group-hover:-translate-y-1 rounded-2xl">
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
                      
                      {/* Title & Click Count */}
                      <div className="flex-grow text-center px-4">
                        <h2 className="font-semibold text-slate-800 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors text-base">
                          {link.title}
                        </h2>
                        {link.clickCount > 0 && (
                          <div className="flex items-center justify-center gap-1 mt-0.5">
                            <Eye className="w-3 h-3 text-slate-400" />
                            <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">
                              {link.clickCount.toLocaleString()}
                            </span>
                          </div>
                        )}
                      </div>
                      
                      {/* Empty div for balancing */}
                      <div className="flex-shrink-0 w-12 h-12" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            )
          })}
        </div>
        
        {/* Footer */}
        <footer className="mt-16 text-center animate-in fade-in duration-1000 delay-700">
          <Link href="/" className="text-sm font-medium text-slate-400 dark:text-slate-500 flex items-center justify-center gap-1 hover:text-indigo-500 transition-colors">
            Build with <span className="text-slate-900 dark:text-white font-bold ml-1">My Link</span>
          </Link>
        </footer>
      </main>
    </div>
  )
}
