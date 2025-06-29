export default function AboutPage() {
  return (
    <div className="min-h-screen w-full px-4 py-8 flex items-center justify-center">
      <div className="flex flex-col items-center max-w-4xl w-full">
        <h1 className="text-3xl md:text-6xl font-bold text-center">About this site</h1>
        <p className="text-base md:text-lg mt-4 mb-8 md:mb-12 text-center max-w-2xl">
          This is the website of Clint Wang. I am currently an undergraduate studying computer science at
          the University of Texas at Austin. I write about software, mathematics, and art.
        </p>
        <div className="w-full px-2 md:px-0">
          <h2 className="text-2xl md:text-4xl font-bold">Architecture</h2>
          <p className="text-base md:text-lg mt-4 text-left">
            The animation featured on the home page is a path tracer rendered using WebGL ES 3.0 shaders
            compiled directly to the GPU. The site is built using Next.js and styled using TailwindCSS.
            My goal is for this website to be as low maintenance for me as possible, not necessarily most
            optimized or best designed.
          </p>
        </div>
      </div>
    </div>
  );
}
