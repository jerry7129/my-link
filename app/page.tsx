"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { demoLinks } from "@/data/links"
import Link from "next/link"
import { Share2, Link as LinkIcon, ExternalLink, Plus } from "lucide-react"
import { useState } from "react"
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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

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
  const [links, setLinks] = useState(demoLinks)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<LinkFormValues>({
    resolver: zodResolver(linkSchema),
    defaultValues: {
      title: "",
      url: "",
    },
  })

  const onSubmit = (data: LinkFormValues) => {
    const newLink = {
      id: Date.now().toString(),
      title: data.title,
      url: data.url,
      createdAt: new Date().toISOString()
    }

    setLinks([newLink, ...links])
    setIsDialogOpen(false)
    reset()
  }

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      alert("프로필 주소가 클립보드에 복사되었습니다!")
    } catch (err) {
      console.error("복사에 실패했습니다.", err)
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
        
        {/* Top bar */}
        <div className="w-full flex justify-end mb-2">
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
                <span className="text-4xl">🧑‍💻</span>
              </div>
            </div>
          </div>
          
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-2">
            홍길동 (Hong Gil-Dong)
          </h1>
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
                  <Button type="submit">새 링크 추가하기</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>

          {links.map((link, index) => {
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
                      
                      {/* Secondary Icon */}
                      <div className="w-12 flex-shrink-0 flex justify-end items-center pr-2">
                        <div className="w-8 h-8 rounded-full bg-slate-50 dark:bg-slate-800/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <ExternalLink className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            )
          })}
        </div>
        
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
