const previewChips = ['模块扩展', '可调层距', '阳极氧化铝框架', '木纹层板'] as const

export function HeroPreviewPoster() {
  return (
    <div
      data-testid="hero-preview-poster"
      className="absolute inset-0 overflow-hidden rounded-[28px] bg-[linear-gradient(180deg,_#F8FAFC_0%,_#EEF2F7_48%,_#E5E7EB_100%)]"
    >
      <div className="absolute inset-x-[8%] top-[9%] h-[46%] rounded-full bg-[radial-gradient(circle,_rgba(255,255,255,0.95),_rgba(255,255,255,0))] blur-3xl" />
      <div className="absolute inset-x-[16%] bottom-[10%] h-[16%] rounded-full bg-[radial-gradient(circle,_rgba(15,23,42,0.22),_rgba(15,23,42,0))] blur-2xl" />

      <div className="absolute inset-x-[11%] bottom-[14%] top-[17%] rounded-[30px] border border-white/70 bg-[linear-gradient(180deg,_rgba(255,255,255,0.76),_rgba(248,250,252,0.30))] shadow-[inset_0_1px_0_rgba(255,255,255,0.85)]" />
      <div className="absolute inset-x-[18%] bottom-[12%] h-[3.5%] rounded-full bg-[radial-gradient(circle,_rgba(15,23,42,0.22),_rgba(15,23,42,0))] blur-xl" />

      <div className="absolute inset-x-[24%] top-[21%] h-[52%]">
        <div className="absolute inset-y-0 left-[3%] w-[3.5%] rounded-full bg-[linear-gradient(180deg,_#F8FAFC_0%,_#CBD5E1_45%,_#64748B_100%)] shadow-[0_10px_18px_rgba(15,23,42,0.14)]" />
        <div className="absolute inset-y-0 left-[30%] w-[3.5%] rounded-full bg-[linear-gradient(180deg,_#F8FAFC_0%,_#CBD5E1_45%,_#64748B_100%)] shadow-[0_10px_18px_rgba(15,23,42,0.14)]" />
        <div className="absolute inset-y-0 right-[30%] w-[3.5%] rounded-full bg-[linear-gradient(180deg,_#F8FAFC_0%,_#CBD5E1_45%,_#64748B_100%)] shadow-[0_10px_18px_rgba(15,23,42,0.14)]" />
        <div className="absolute inset-y-0 right-[3%] w-[3.5%] rounded-full bg-[linear-gradient(180deg,_#F8FAFC_0%,_#CBD5E1_45%,_#64748B_100%)] shadow-[0_10px_18px_rgba(15,23,42,0.14)]" />

        <div className="absolute left-[1%] right-[1%] top-[3%] h-[7%] rounded-[18px] border border-[#7C5B3B]/20 bg-[linear-gradient(180deg,_#E2C7AA_0%,_#C79A6B_52%,_#9A6A3F_100%)] shadow-[0_12px_18px_rgba(122,78,38,0.18)]" />
        <div className="absolute left-[1%] right-[1%] top-[32%] h-[7%] rounded-[18px] border border-[#7C5B3B]/20 bg-[linear-gradient(180deg,_#E5CCAF_0%,_#C89E73_52%,_#99693F_100%)] shadow-[0_12px_18px_rgba(122,78,38,0.16)]" />
        <div className="absolute left-[1%] right-[1%] top-[61%] h-[7%] rounded-[18px] border border-[#7C5B3B]/20 bg-[linear-gradient(180deg,_#E5CCAF_0%,_#C89E73_52%,_#99693F_100%)] shadow-[0_12px_18px_rgba(122,78,38,0.16)]" />
        <div className="absolute left-[1%] right-[1%] bottom-[3%] h-[7%] rounded-[18px] border border-[#7C5B3B]/20 bg-[linear-gradient(180deg,_#DEC2A4_0%,_#C29266_52%,_#8B5E36_100%)] shadow-[0_12px_18px_rgba(122,78,38,0.18)]" />

        <div className="absolute left-[7%] right-[7%] top-[8%] h-[2%] rounded-full bg-white/40 blur-[2px]" />
        <div className="absolute left-[7%] right-[7%] top-[37%] h-[2%] rounded-full bg-white/35 blur-[2px]" />
        <div className="absolute left-[7%] right-[7%] top-[66%] h-[2%] rounded-full bg-white/35 blur-[2px]" />
      </div>

      <div className="absolute left-[11%] top-[14%] rounded-full border border-white/70 bg-white/72 px-4 py-2 shadow-[0_10px_24px_rgba(15,23,42,0.08)] backdrop-blur max-md:px-3 max-md:py-1.5">
        <p className="text-[11px] font-medium tracking-[0.24em] text-slate-500">STUDIO PREVIEW</p>
      </div>

      <div className="absolute bottom-[8%] right-[6%] w-[38%] rounded-[24px] border border-white/75 bg-white/78 p-4 shadow-[0_18px_36px_rgba(15,23,42,0.10)] backdrop-blur-sm max-md:bottom-[6%] max-md:right-[5%] max-md:w-[54%] max-md:rounded-[20px] max-md:p-3">
        <ul aria-label="产品参数" className="flex flex-wrap justify-end gap-2">
          {previewChips.map((chip) => (
            <li
              key={chip}
              className="list-none rounded-full border border-slate-200 bg-white/92 px-3 py-1.5 text-[11px] font-medium tracking-[0.04em] text-slate-700 shadow-[0_4px_10px_rgba(15,23,42,0.05)] max-md:px-2.5 max-md:py-1 max-md:text-[10px]"
            >
              {chip}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
