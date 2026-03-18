import Link from 'next/link';

export default function ProfilePage() {
  return (
    <div className="min-h-screen bg-[#FFF0E5] text-black font-sans selection:bg-[#FF3366] selection:text-white pb-32">
      {/* Navigation */}
      <nav className="p-6 md:p-10 flex justify-between items-center border-b-4 border-black bg-white sticky top-0 z-50">
        <div className="text-3xl font-black uppercase tracking-tighter">
          지은<span className="text-[#FF3366]">.DEV</span>
        </div>
        <a 
          href="#contact" 
          className="bg-[#00E5FF] px-6 py-3 border-4 border-black font-black uppercase tracking-wider shadow-[4px_4px_0px_#000] transition-all hover:translate-x-1 hover:translate-y-1 hover:shadow-none sm:block hidden"
        >
          Contact Me
        </a>
      </nav>

      <main className="max-w-7xl mx-auto px-6 md:px-12 mt-16 md:mt-24">
        
        {/* Hero Section */}
        <section className="mb-24">
          <div className="inline-block bg-[#FFD700] px-4 py-2 border-4 border-black font-bold mb-6 shadow-[4px_4px_0px_#000] rotate-[-2deg]">
            Frontend Developer ✨
          </div>
          <h1 className="text-6xl md:text-8xl lg:text-9xl font-black tracking-tighter leading-[0.9] uppercase break-words">
            Building 
            <br />
            <span className="text-[#FF3366] stroke-black drop-shadow-[4px_4px_0px_#000]">Experiences</span>
            <br />
            With Code
          </h1>
          <p className="mt-8 text-xl md:text-2xl font-bold max-w-2xl border-l-8 border-black pl-6 py-2 bg-white/50">
            사용자 경험을 최우선으로 생각하며, 트렌디하고 견고한 웹 에플리케이션을 만듭니다. 데스크탑, 태블릿, 모바일을 가리지 않는 완벽한 반응형 설계를 지향합니다.
          </p>
        </section>

        {/* Info & Skills Grid */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12 mb-24">
          
          {/* About Intro */}
          <div className="lg:col-span-5 bg-[#DFFF00] p-8 md:p-12 border-4 border-black shadow-[8px_8px_0px_#000]">
            <h2 className="text-4xl md:text-5xl font-black uppercase mb-6 decoration-4 underline underline-offset-8">
              About Me
            </h2>
            <p className="text-lg md:text-xl font-medium leading-relaxed mb-6">
              저는 문제를 해결하는 과정을 즐기는 프론트엔드 개발자입니다. 복잡한 로직을 단순하게 풀고, 시각적으로 매력적인 UI/UX를 구현하는 데 열정을 쏟고 있습니다.
            </p>
            <p className="text-lg md:text-xl font-medium leading-relaxed">
              최신 기술 트렌드를 항상 주시하며, 코드의 품질과 협업의 가치를 중요하게 생각합니다.
            </p>
          </div>

          {/* Core Tech Stack */}
          <div className="lg:col-span-7 bg-white p-8 md:p-12 border-4 border-black shadow-[8px_8px_0px_#000] flex flex-col justify-center">
            <h2 className="text-4xl md:text-5xl font-black uppercase mb-8">
              Tech Stack
            </h2>
            <div className="flex flex-wrap gap-4">
              {['React.js', 'Next.js 15+', 'TypeScript', 'Tailwind CSS', 'Zustand', 'React Query', 'Node.js', 'Figma'].map((skill) => (
                <div 
                  key={skill}
                  className="bg-[#FF99FF] px-6 py-3 border-4 border-black font-bold text-lg md:text-xl shadow-[4px_4px_0px_#000] hover:-translate-y-2 hover:-rotate-3 transition-transform cursor-default"
                >
                  {skill}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Selected Projects */}
        <section className="mb-24">
          <h2 className="text-5xl md:text-7xl font-black uppercase mb-12 flex items-center gap-4">
            <span className="bg-black text-white px-4 py-2 rotate-2 inline-block">Featured</span> Projects
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
            {/* Project 1 */}
            <article className="bg-[#00E5FF] border-4 border-black group cursor-pointer relative top-0 hover:-top-2 transition-all duration-200">
              <div className="h-48 md:h-64 bg-white border-b-4 border-black p-6 flex items-center justify-center overflow-hidden">
                <span className="text-3xl md:text-5xl font-black text-black/20 uppercase tracking-widest">Project 1</span>
              </div>
              <div className="p-6 md:p-8 bg-[#00E5FF]">
                <h3 className="text-3xl font-black mb-4 group-hover:underline decoration-4 underline-offset-4">E-Commerce Platform</h3>
                <p className="text-lg font-medium mb-6">
                  Next.js와 TypeScript로 개발된 고성능 쇼핑몰 플랫폼입니다. 빠르고 매끄러운 결제 경험을 제공합니다.
                </p>
                <div className="flex gap-4">
                  <span className="border-2 border-black bg-white px-3 py-1 font-bold text-sm">Next.js</span>
                  <span className="border-2 border-black bg-white px-3 py-1 font-bold text-sm">Prisma</span>
                </div>
              </div>
              {/* Fake Shadow to keep elements static relative to parent on hover */}
              <div className="absolute top-0 left-0 w-full h-full border-4 border-black shadow-[8px_8px_0px_#000] pointer-events-none -z-10 bg-black group-hover:translate-x-2 group-hover:translate-y-2 group-hover:shadow-[0px_0px_0px_#000] transition-all duration-200"></div>
            </article>

            {/* Project 2 */}
            <article className="bg-[#FF3366] border-4 border-black text-white group cursor-pointer relative top-0 hover:-top-2 transition-all duration-200">
              <div className="h-48 md:h-64 bg-black border-b-4 border-black p-6 flex items-center justify-center overflow-hidden">
                <span className="text-3xl md:text-5xl font-black text-white/20 uppercase tracking-widest">Project 2</span>
              </div>
              <div className="p-6 md:p-8">
                <h3 className="text-3xl font-black mb-4 group-hover:underline decoration-4 underline-offset-4 text-white">Social Analytics Tool</h3>
                <p className="text-lg font-medium leading-relaxed mb-6">
                  소셜 미디어 데이터를 실시간으로 시각화하는 대시보드 리액트 애플리케이션입니다. 
                </p>
                <div className="flex gap-4">
                  <span className="border-2 border-black bg-black text-white px-3 py-1 font-bold text-sm">React</span>
                  <span className="border-2 border-black bg-black text-white px-3 py-1 font-bold text-sm">GraphQL</span>
                </div>
              </div>
              <div className="absolute top-0 left-0 w-full h-full border-4 border-black shadow-[8px_8px_0px_#000] pointer-events-none -z-10 bg-black group-hover:translate-x-2 group-hover:translate-y-2 group-hover:shadow-[0px_0px_0px_#000] transition-all duration-200"></div>
            </article>
          </div>
        </section>

        {/* Workflow / Experience */}
        <section className="mb-24 bg-white border-4 border-black shadow-[12px_12px_0px_#000] p-8 md:p-16">
          <h2 className="text-4xl md:text-6xl font-black uppercase mb-12 text-center decoration-wavy decoration-[#FF3366] underline underline-offset-[16px]">
            Work Experience
          </h2>
          <div className="space-y-8 md:space-y-12 max-w-4xl mx-auto border-l-8 border-black pl-8 relative">
            <div className="relative">
              <div className="absolute -left-[45px] top-0 w-6 h-6 bg-[#00E5FF] border-4 border-black rounded-full" />
              <div className="mb-2 flex flex-col md:flex-row md:items-center gap-2 md:gap-6">
                <h3 className="text-2xl md:text-3xl font-black uppercase">Kakao Corp</h3>
                <span className="bg-black text-white px-3 py-1 font-bold inline-block w-max">2023 - Present</span>
              </div>
              <p className="text-lg font-bold text-gray-700 mb-2">프론트엔드 엔지니어</p>
              <ul className="list-disc pl-5 font-medium text-lg leading-relaxed flex flex-col gap-2">
                <li>카카오톡 웹 서비스 신규 기능 개발 및 유지보수</li>
                <li>레거시 코드 리팩토링 및 렌더링 최적화 40% 향상</li>
                <li>사내 UI 디자인 시스템 고도화 참여</li>
              </ul>
            </div>
            
            <div className="relative">
              <div className="absolute -left-[45px] top-0 w-6 h-6 bg-[#FFD700] border-4 border-black rounded-full" />
              <div className="mb-2 flex flex-col md:flex-row md:items-center gap-2 md:gap-6">
                <h3 className="text-2xl md:text-3xl font-black uppercase">Startup ABC</h3>
                <span className="bg-black text-white px-3 py-1 font-bold inline-block w-max">2021 - 2023</span>
              </div>
              <p className="text-lg font-bold text-gray-700 mb-2">웹 퍼블리셔 / 주니어 개발자</p>
              <ul className="list-disc pl-5 font-medium text-lg leading-relaxed flex flex-col gap-2">
                <li>랜딩 페이지 30여 개 제작 및 반응형 디자인 적용</li>
                <li>CMS 어드민 페이지 프론트엔드 뷰 설계</li>
                <li>검색 엔진 최적화(SEO)를 통한 트래픽 2배 증가</li>
              </ul>
            </div>
          </div>
        </section>
      </main>

      {/* Footer / Contact */}
      <footer id="contact" className="border-t-8 border-black bg-[#FF3366] text-white pt-24 pb-12 px-6">
        <div className="max-w-5xl mx-auto flex flex-col items-center text-center">
          <h2 className="text-6xl md:text-8xl font-black uppercase mb-8 leading-none">
            Let's Make <br/> Something <span className="text-[#FFD700] underline decoration-8 underline-offset-8">Cool</span>
          </h2>
          <p className="text-2xl font-bold mb-12 max-w-2xl bg-black px-6 py-4">
            협업 제안이나 흥미로운 프로젝트 제안을 환영합니다.
          </p>
          <a 
            href="mailto:hello@example.com" 
            className="bg-white text-black text-3xl md:text-4xl font-black uppercase px-12 py-6 border-8 border-black shadow-[12px_12px_0px_#000] hover:translate-x-2 hover:translate-y-2 hover:shadow-none transition-all block w-full md:w-auto"
          >
            Send Email
          </a>
          
          <div className="mt-24 w-full flex flex-col md:flex-row justify-between items-center gap-6 border-t-4 border-black/50 pt-8">
            <p className="font-bold text-lg">© 2026 Jieun.DEV</p>
            <div className="flex gap-6 font-black text-xl">
              <a href="#" className="hover:underline hover:text-[#FFD700]">Github</a>
              <a href="#" className="hover:underline hover:text-[#00E5FF]">LinkedIn</a>
              <a href="#" className="hover:underline hover:text-[#DFFF00]">Twitter</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
