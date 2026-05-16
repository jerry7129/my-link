import { ImageResponse } from "next/og";

export const runtime = "edge";

export const alt = "My Link - 모든 링크를 한 곳에";
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

/**
 * Google Fonts에서 특정 텍스트에 필요한 글리프만 포함된 경량 폰트를 가져옵니다.
 */
async function loadGoogleFont(text: string, weight: number): Promise<ArrayBuffer> {
  const url = `https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@${weight}&text=${encodeURIComponent(text)}`;
  const css = await fetch(url).then((res) => res.text());
  const match = css.match(/src: url\((.+?)\)/);
  if (!match) throw new Error("Could not parse font URL from Google Fonts CSS");
  return fetch(match[1]).then((res) => res.arrayBuffer());
}

export default async function Image() {
  const allText = "My Link모든 링크를 한 곳에";

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
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          background: "linear-gradient(to top right, #6366f1, #a855f7, #ec4899)",
          fontFamily: '"Noto Sans KR"',
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            background: "rgba(255, 255, 255, 0.1)",
            padding: "80px 120px",
            borderRadius: "40px",
            border: "2px solid rgba(255, 255, 255, 0.2)",
            boxShadow: "0 30px 60px rgba(0,0,0,0.2)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "120px",
              height: "120px",
              background: "white",
              borderRadius: "30px",
              marginBottom: "40px",
              boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="64"
              height="64"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#6366f1"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
              <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
            </svg>
          </div>
          <h1
            style={{
              fontSize: 80,
              color: "white",
              fontWeight: 800,
              margin: 0,
              lineHeight: 1.2,
              letterSpacing: "-0.05em",
            }}
          >
            My Link
          </h1>
          <p
            style={{
              fontSize: 40,
              color: "rgba(255,255,255,0.9)",
              marginTop: 20,
              fontWeight: 500,
              letterSpacing: "-0.02em",
            }}
          >
            모든 링크를 한 곳에
          </p>
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
