import type { Metadata } from "next"

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://my-link-eight-livid.vercel.app"

/**
 * Firestore REST API를 사용하여 displayName으로 사용자 정보를 가져옵니다.
 * Edge runtime / Server Component에서 Firebase SDK 없이 직접 조회합니다.
 */
async function fetchUserByDisplayName(displayName: string) {
  try {
    const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
    if (!projectId) return null

    const response = await fetch(
      `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents:runQuery`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          structuredQuery: {
            from: [{ collectionId: "users" }],
            where: {
              fieldFilter: {
                field: { fieldPath: "displayName" },
                op: "EQUAL",
                value: { stringValue: displayName },
              },
            },
            limit: 1,
          },
        }),
        next: { revalidate: 60 },
      }
    )

    if (!response.ok) return null

    const data = await response.json()
    if (!data || data.length === 0 || !data[0].document) return null

    const fields = data[0].document.fields
    return {
      username: fields.username?.stringValue || fields.displayName?.stringValue || "사용자",
      bio: fields.bio?.stringValue || "",
      displayName: fields.displayName?.stringValue || displayName,
    }
  } catch {
    return null
  }
}

export async function generateMetadata(
  props: { params: Promise<{ displayName: string }> }
): Promise<Metadata> {
  const params = await props.params
  const displayName = params.displayName
  const user = await fetchUserByDisplayName(displayName)

  const title = user ? `${user.username} (@${user.displayName})` : `@${displayName}`
  const description = user?.bio
    ? `${user.bio} - ${user.username}님의 모든 링크를 한 곳에서 확인하세요.`
    : `${displayName}님의 프로필 - 소셜 미디어, 포트폴리오, 웹사이트 링크를 한 곳에서 확인하세요.`
  const profileUrl = `${SITE_URL}/${displayName}`

  return {
    title,
    description,
    openGraph: {
      type: "profile",
      title,
      description,
      url: profileUrl,
      siteName: "My Link",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
    alternates: {
      canonical: profileUrl,
    },
  }
}

export default function DisplayNameLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
