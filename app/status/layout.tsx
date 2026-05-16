import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "링크 통계",
  description: "내 링크의 클릭 수와 인기 링크를 한눈에 확인하세요. My Link 분석 대시보드에서 링크 성과를 추적합니다.",
  robots: {
    index: false,
    follow: false,
  },
}

export default function StatusLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
