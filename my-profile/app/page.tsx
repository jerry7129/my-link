export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground p-4 sm:p-8 md:p-12 lg:p-16 flex flex-col items-center justify-center selection:bg-[#ff6b6b] selection:text-white transition-colors duration-300">
      <main className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
        
        {/* Header / Hero Section */}
        <div className="lg:col-span-12 flex flex-col gap-4">
          <header className="border-4 border-black dark:border-white bg-[#feca57] dark:bg-zinc-800 p-8 sm:p-12 shadow-[8px_8px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_rgba(255,255,255,1)] rounded-none transform transition-transform hover:-translate-y-1 hover:shadow-[12px_12px_0px_rgba(0,0,0,1)] dark:hover:shadow-[12px_12px_0px_rgba(255,255,255,1)]">
            <h1 className="text-6xl sm:text-7xl lg:text-8xl font-black uppercase tracking-tighter mb-4 text-black dark:text-white">
              김승관
            </h1>
            <p className="text-xl sm:text-2xl lg:text-3xl font-bold bg-white dark:bg-zinc-900 text-black dark:text-white px-4 py-2 inline-block border-2 border-black dark:border-white w-fit shadow-[4px_4px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_rgba(255,255,255,1)]">
              VIBE CODING STUDENT
            </p>
          </header>
        </div>

        {/* About Section */}
        <div className="lg:col-span-8 flex flex-col gap-4">
          <section className="h-full border-4 border-black dark:border-white bg-[#1dd1a1] dark:bg-zinc-800 p-8 shadow-[8px_8px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_rgba(255,255,255,1)] rounded-none">
            <h2 className="text-3xl sm:text-4xl font-extrabold mb-6 border-b-4 border-black dark:border-white pb-2 text-black dark:text-white">
              ABOUT ME
            </h2>
            <p className="text-lg sm:text-xl font-medium leading-relaxed text-black dark:text-zinc-100">
              안녕하세요! 바이브 코딩을 전문적으로 배우고 탐구하는 대학생 김승관입니다.
              <br /><br />
              정형화된 디자인과 코드를 넘어, 개성 있고 강렬한 시각적 경험을 웹에 구현하는 것을 목표로 합니다. 
              최신 기술 스택을 활용하여 창의적인 프로젝트를 만들어가고 있습니다.
            </p>
          </section>
        </div>

        {/* Contact/Links Section */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <a
            href="https://github.com/jerry7129"
            target="_blank"
            rel="noopener noreferrer"
            className="block border-4 border-black dark:border-white bg-[#4d94ff] dark:bg-zinc-800 p-6 shadow-[8px_8px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_rgba(255,255,255,1)] transition-all hover:translate-x-1 hover:translate-y-1 hover:shadow-[4px_4px_0px_rgba(0,0,0,1)] dark:hover:shadow-[4px_4px_0px_rgba(255,255,255,1)] text-black dark:text-white decoration-transparent"
          >
            <h3 className="text-2xl font-black uppercase mb-2">GitHub</h3>
            <p className="font-bold text-lg">@jerry7129</p>
          </a>

          <a
            href="mailto:example@example.com"
            className="block border-4 border-black dark:border-white bg-[#ff6b6b] dark:bg-zinc-800 p-6 shadow-[8px_8px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_rgba(255,255,255,1)] transition-all hover:translate-x-1 hover:translate-y-1 hover:shadow-[4px_4px_0px_rgba(0,0,0,1)] dark:hover:shadow-[4px_4px_0px_rgba(255,255,255,1)] text-black dark:text-white decoration-transparent"
          >
            <h3 className="text-2xl font-black uppercase mb-2">Email</h3>
            <p className="font-bold text-lg">Contact Me</p>
          </a>
        </div>

      </main>
    </div>
  );
}
