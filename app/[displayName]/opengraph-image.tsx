import { ImageResponse } from "next/og";

export const runtime = "edge";

export const alt = "My Link Profile";
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

/**
 * Google Fonts에서 특정 텍스트에 필요한 글리프만 포함된 경량 폰트를 가져옵니다.
 * text 파라미터를 사용하면 해당 글자만 포함된 서브셋 폰트가 반환되어 용량이 매우 작습니다.
 */
async function loadGoogleFont(text: string, weight: number): Promise<ArrayBuffer> {
  const url = `https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@${weight}&text=${encodeURIComponent(text)}`;
  const css = await fetch(url).then((res) => res.text());
  const match = css.match(/src: url\((.+?)\)/);
  if (!match) throw new Error("Could not parse font URL from Google Fonts CSS");
  return fetch(match[1]).then((res) => res.arrayBuffer());
}

export default async function Image(props: { params: Promise<{ displayName: string }> }) {
  const params = await props.params;
  const displayName = params.displayName;

  // Fetch user data from Firestore using REST API to avoid Edge runtime navigator error
  let user = {
    username: "사용자",
    bio: "환영합니다! 다양한 플랫폼과 포트폴리오를 한 곳에 모았습니다. ✨",
    photoURL: null as string | null,
  };

  try {
    const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
    if (projectId) {
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
          cache: "no-store",
        }
      );

      if (response.ok) {
        const data = await response.json();
        // Check if a document is returned
        if (data && data.length > 0 && data[0].document) {
          const fields = data[0].document.fields;
          user = {
            username: fields.username?.stringValue || fields.displayName?.stringValue || "사용자",
            bio: fields.bio?.stringValue || "환영합니다! 다양한 플랫폼과 포트폴리오를 한 곳에 모았습니다. ✨",
            photoURL: fields.photoURL?.stringValue || null,
          };
        }
      }
    }
  } catch (error) {
    console.error("Error fetching user for OG Image:", error);
  }

  // 렌더링할 모든 한글/영문 텍스트를 수집하여 폰트 서브셋 로드
  const allText = [user.username, user.bio, "Build with", "My Link"].join("");

  const [fontBold, fontMedium] = await Promise.all([
    loadGoogleFont(allText, 800),
    loadGoogleFont(allText, 500),
  ]);

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          height: "100%",
          width: "100%",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "space-between",
          backgroundColor: "#020617",
          backgroundImage: "radial-gradient(circle at 50% -20%, #312e81 0%, #020617 80%)",
          padding: "60px 40px",
          fontFamily: '"Noto Sans KR"',
        }}
      >
        {/* Top spacer to balance the footer */}
        <div style={{ display: "flex", height: "40px" }}></div>

        {/* Main Content */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {/* Profile Image Avatar with Gradient Border */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "200px",
              height: "200px",
              borderRadius: "100px",
              background: "linear-gradient(to right, #6366f1, #a855f7, #ec4899)",
              padding: "6px",
              boxShadow: "0 20px 40px rgba(0,0,0,0.4)",
              marginBottom: "30px",
            }}
          >
            {user.photoURL ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={user.photoURL}
                alt="Profile"
                width={188}
                height={188}
                style={{
                  borderRadius: "94px",
                  objectFit: "cover",
                  backgroundColor: "#fff",
                }}
              />
            ) : (
              <div
                style={{
                  width: "188px",
                  height: "188px",
                  borderRadius: "94px",
                  backgroundColor: "#0f172a",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "80px",
                }}
              >
                🧑‍💻
              </div>
            )}
          </div>

          {/* Username */}
          <h1
            style={{
              fontSize: "64px",
              fontWeight: 800,
              color: "white",
              margin: "0 0 20px 0",
              textAlign: "center",
              letterSpacing: "-0.05em",
            }}
          >
            {user.username}
          </h1>

          {/* Bio */}
          <p
            style={{
              fontSize: "32px",
              color: "#94a3b8",
              margin: 0,
              textAlign: "center",
              maxWidth: "800px",
              lineHeight: 1.5,
              fontWeight: 500,
            }}
          >
            {user.bio}
          </p>
        </div>

        {/* Branding Footer Badge */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "16px 32px",
            background: "rgba(255, 255, 255, 0.05)",
            borderRadius: "100px",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            boxShadow: "0 10px 20px rgba(0,0,0,0.2)",
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#a855f7"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ marginRight: "12px" }}
          >
            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
          </svg>
          <span style={{ fontSize: "24px", color: "#cbd5e1", marginRight: "8px", fontWeight: 500 }}>
            Build with
          </span>
          <span style={{ fontSize: "24px", color: "white", fontWeight: 800 }}>My Link</span>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        {
          name: "Noto Sans KR",
          data: fontBold,
          style: "normal" as const,
          weight: 800 as const,
        },
        {
          name: "Noto Sans KR",
          data: fontMedium,
          style: "normal" as const,
          weight: 500 as const,
        },
      ],
    }
  );
}
