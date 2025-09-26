'use client'


const SPONSORS = [
  {
    name: 'IDA International Education Specialties',
    logoSrc: '/sponsors/idp.png',
    url: 'https://www.idp.com/india/',
  },
  {
    name: 'HotWax Systems',
    logoSrc: '/sponsors/hotwax.png',
    url: 'https://www.hotwaxsystems.com/',
  },
  {
    name: 'Shekunj Foundation',
    logoSrc: '/sponsors/shekunj.png',
    url: 'https://shekunj.com/',
  },
  {
    name: 'HDFC Bank',
    logoSrc: '/sponsors/images.png',
    url: 'https://www.hdfcbank.com/',
  },
  // Add more sponsors by appending items to this array
]

export default function SponsorsSection() {
  return (
    <section className="bg-[#141414] text-[#fcf2e8] w-screen min-h-screen flex items-center justify-center px-4 sm:px-6 md:px-8">
      <div className="w-full max-w-6xl py-16 md:py-20">
        {/* Header */}
        <div className="text-center mb-10 md:mb-14">
          <h2 className="text-5xl sm:text-5xl md:text-2xl lg:text-6xl xl:text-7xl 2xl:text-7xl font-black leading-relaxed sm:leading-tight md:leading-tight lg:leading-tight mb-3">
            Sponsors
          </h2>
          <p className="text-[#ccc] text-base md:text-lg max-w-2xl mx-auto">
            Big thanks to our partners who make Hackwave possible.
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
          {SPONSORS.map((sponsor) => (
            <a
              key={sponsor.name}
              href={sponsor.url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={sponsor.name}
              className="group relative overflow-hidden rounded-xl bg-[#fcf2e8] text-[#141414] p-6 md:p-8 h-40 sm:h-48 flex items-center justify-center transition-transform duration-300 ease-out will-change-transform hover:-translate-y-1"
            >
              {/* subtle glow on hover */}
              <div className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="absolute -inset-20 bg-[radial-gradient(ellipse_at_center,rgba(254,170,192,0.25),transparent_55%)]" />
              </div>

              {/* logo */}
              <img
                src={sponsor.logoSrc}
                alt={`${sponsor.name} logo`}
                className="w-auto max-w-[85%] max-h-[70%] object-contain transition-transform duration-300 ease-out group-hover:scale-[1.02]"
                loading="lazy"
              />

              {/* subtle bottom label */}
              <div className="pointer-events-none absolute bottom-3 left-0 right-0 flex justify-center">
                <span className="px-2 py-1 text-[0.7rem] tracking-wide rounded-full bg-[#141414] text-[#fcf2e8]/90 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  {sponsor.name}
                </span>
              </div>
            </a>
          ))}

          {/* Placeholder card to keep grid balanced when adding future sponsors */}
          {SPONSORS.length === 4 && (
            <div className="hidden lg:flex items-center justify-center rounded-xl border border-dashed border-[rgb(60,60,60)] h-40 sm:h-48 text-[#ccc]">
              More coming soon
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
