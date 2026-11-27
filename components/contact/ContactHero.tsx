// Compact, left-aligned page opening so the contact options appear quickly.
export function ContactHero() {
  return (
    <header className="mx-auto max-w-[1280px] px-6 pb-8 pt-8 lg:px-8 lg:pb-10 lg:pt-12">
      <p className="text-[13px] font-semibold uppercase tracking-[0.16em] text-[#3fcfca]/80">Contact</p>
      <h1 className="mt-2 text-5xl !font-extrabold uppercase leading-[0.92] text-[#f5f1e8] sm:text-[64px]">Talk to the panel</h1>
      <p className="mt-4 max-w-2xl text-[17px] leading-relaxed text-[#f5f1e8]/75">
        Ask the club panel about squad trials, upcoming events or partnering with NSU SC.
      </p>
    </header>
  );
}
