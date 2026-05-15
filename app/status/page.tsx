"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { Button } from "@/components/ui/button"
import { useAuthUser } from "@/hooks/useAuthUser"
import { useLinks } from "@/hooks/useLinks"
import {
  Link as LinkIcon,
  ArrowLeft,
  Loader2,
  MousePointerClick,
  TrendingUp,
  BarChart3,
} from "lucide-react"

const chartConfig = {
  clickCount: {
    label: "클릭 수",
    color: "oklch(0.585 0.233 277.117)",
  },
} satisfies ChartConfig

export default function StatusPage() {
  const router = useRouter()
  const { user, userData, loadingAuth } = useAuthUser()
  const { links, isLoadingLinks } = useLinks(user?.uid)

  // 비로그인 시 메인 페이지로 리다이렉트
  useEffect(() => {
    if (!loadingAuth && !user) {
      router.replace("/")
    }
  }, [loadingAuth, user, router])

  // 로딩 중
  if (loadingAuth || (!user && !loadingAuth)) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500 mb-4" />
        <p className="text-slate-500 font-medium">불러오는 중...</p>
      </div>
    )
  }

  const totalClicks = links.reduce((sum, link) => sum + link.clickCount, 0)
  const topLink = links.length > 0
    ? links.reduce((top, link) => (link.clickCount > top.clickCount ? link : top), links[0])
    : null

  // 차트 데이터: 링크별 클릭 수 (클릭 수 내림차순)
  const chartData = [...links]
    .sort((a, b) => b.clickCount - a.clickCount)
    .map((link) => ({
      name: link.title.length > 10 ? link.title.slice(0, 10) + "…" : link.title,
      fullName: link.title,
      clickCount: link.clickCount,
    }))

  return (
    <div className="relative min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center selection:bg-indigo-100 selection:text-indigo-900 overflow-x-hidden">
      {/* Background Gradients */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-[20%] -right-[10%] w-[70vw] h-[70vw] max-w-[600px] max-h-[600px] bg-indigo-300/40 dark:bg-indigo-900/30 rounded-full mix-blend-multiply filter blur-[100px] animate-pulse" />
        <div className="absolute top-[20%] -left-[10%] w-[60vw] h-[60vw] max-w-[500px] max-h-[500px] bg-purple-300/40 dark:bg-purple-900/30 rounded-full mix-blend-multiply filter blur-[100px]" />
      </div>

      <main className="relative z-10 flex w-full max-w-2xl flex-col items-center py-10 px-6 sm:px-8 min-h-screen">
        {/* Header */}
        <div className="w-full flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push("/")}
              className="h-10 w-10 rounded-full text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 dark:text-slate-300 dark:hover:text-indigo-400 dark:hover:bg-indigo-900/30 transition-colors"
              title="관리자 페이지로 돌아가기"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center shadow-sm">
                <LinkIcon className="w-4 h-4 text-white" />
              </div>
              <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">통계</span>
            </div>
          </div>
          {userData && (
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
              @{userData.displayName}
            </p>
          )}
        </div>

        {/* Stats Cards */}
        <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* 총 클릭 수 카드 */}
          <Card className="relative overflow-hidden border border-white/60 dark:border-white/10 bg-white/70 dark:bg-slate-900/70 backdrop-blur-md shadow-lg rounded-2xl">
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-indigo-500/10 to-transparent rounded-bl-full" />
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                <MousePointerClick className="w-4 h-4" />
                총 클릭 수
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingLinks ? (
                <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
              ) : (
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                    {totalClicks.toLocaleString()}
                  </span>
                  <span className="text-sm text-slate-400 font-medium">회</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* 인기 링크 카드 */}
          <Card className="relative overflow-hidden border border-white/60 dark:border-white/10 bg-white/70 dark:bg-slate-900/70 backdrop-blur-md shadow-lg rounded-2xl">
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-purple-500/10 to-transparent rounded-bl-full" />
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                <TrendingUp className="w-4 h-4" />
                인기 링크
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingLinks ? (
                <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
              ) : topLink && topLink.clickCount > 0 ? (
                <div>
                  <p className="text-lg font-bold text-slate-900 dark:text-white truncate" title={topLink.title}>
                    {topLink.title}
                  </p>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                    {topLink.clickCount.toLocaleString()}회 클릭
                  </p>
                </div>
              ) : (
                <p className="text-sm text-slate-400 dark:text-slate-500">아직 클릭 데이터가 없습니다</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Bar Chart */}
        <Card className="w-full border border-white/60 dark:border-white/10 bg-white/70 dark:bg-slate-900/70 backdrop-blur-md shadow-lg rounded-2xl animate-in fade-in slide-in-from-bottom-6 duration-700 delay-200" style={{ animationFillMode: "both" }}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-slate-900 dark:text-white">
              <BarChart3 className="w-5 h-5 text-indigo-500" />
              링크별 클릭 수
            </CardTitle>
            <CardDescription className="text-slate-500 dark:text-slate-400">
              각 링크의 클릭 수를 비교합니다
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingLinks ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
              </div>
            ) : links.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <LinkIcon className="w-10 h-10 text-slate-300 dark:text-slate-600 mb-3" />
                <p className="text-slate-500 dark:text-slate-400 font-medium">등록된 링크가 없습니다</p>
                <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">링크를 추가하면 통계가 표시됩니다</p>
              </div>
            ) : (
              <ChartContainer config={chartConfig} className="h-[300px] w-full">
                <BarChart
                  data={chartData}
                  layout="vertical"
                  margin={{ left: 0, right: 16, top: 8, bottom: 8 }}
                >
                  <CartesianGrid horizontal={false} strokeDasharray="3 3" />
                  <YAxis
                    dataKey="name"
                    type="category"
                    tickLine={false}
                    axisLine={false}
                    width={90}
                    tick={{ fontSize: 12 }}
                  />
                  <XAxis
                    type="number"
                    tickLine={false}
                    axisLine={false}
                    allowDecimals={false}
                  />
                  <ChartTooltip
                    content={
                      <ChartTooltipContent
                        labelKey="fullName"
                        labelFormatter={(_value, payload) => {
                          const item = payload?.[0]?.payload
                          return item?.fullName || String(_value)
                        }}
                      />
                    }
                  />
                  <Bar
                    dataKey="clickCount"
                    fill="var(--color-clickCount)"
                    radius={[0, 6, 6, 0]}
                    maxBarSize={40}
                  />
                </BarChart>
              </ChartContainer>
            )}
          </CardContent>
        </Card>

        {/* 개별 링크 순위 리스트 */}
        {!isLoadingLinks && links.length > 0 && (
          <div className="w-full mt-6 space-y-3 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-400" style={{ animationFillMode: "both" }}>
            <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider px-1">
              상세 순위
            </h3>
            {[...links]
              .sort((a, b) => b.clickCount - a.clickCount)
              .map((link, index) => {
                const percentage = totalClicks > 0 ? ((link.clickCount / totalClicks) * 100).toFixed(1) : "0.0"
                return (
                  <div
                    key={link.id}
                    className="flex items-center gap-3 p-3 bg-white/50 dark:bg-slate-900/50 rounded-xl border border-white/60 dark:border-white/10 backdrop-blur-sm transition-colors hover:bg-white/80 dark:hover:bg-slate-900/80"
                  >
                    {/* 순위 */}
                    <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                      index === 0
                        ? "bg-gradient-to-tr from-amber-400 to-yellow-300 text-amber-900 shadow-sm"
                        : index === 1
                          ? "bg-gradient-to-tr from-slate-300 to-slate-200 text-slate-700 shadow-sm"
                          : index === 2
                            ? "bg-gradient-to-tr from-orange-300 to-amber-200 text-orange-800 shadow-sm"
                            : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400"
                    }`}>
                      {index + 1}
                    </div>

                    {/* 링크 정보 */}
                    <div className="flex-grow min-w-0">
                      <p className="font-semibold text-slate-800 dark:text-slate-100 truncate text-sm">
                        {link.title}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        {/* 비율 바 */}
                        <div className="flex-grow h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-700"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <span className="flex-shrink-0 text-xs text-slate-400 dark:text-slate-500 font-medium tabular-nums w-12 text-right">
                          {percentage}%
                        </span>
                      </div>
                    </div>

                    {/* 클릭 수 */}
                    <div className="flex-shrink-0 text-right">
                      <span className="text-lg font-bold text-slate-900 dark:text-white tabular-nums">
                        {link.clickCount.toLocaleString()}
                      </span>
                      <span className="text-xs text-slate-400 ml-0.5">회</span>
                    </div>
                  </div>
                )
              })}
          </div>
        )}

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
