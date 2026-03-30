import { HeroPreviewPoster } from './HeroPreviewPoster'

export function HeroPreview() {
  return (
    <section
      data-testid="hero-preview"
      data-preview-mode="static"
      aria-label="货架产品预览"
      className="relative aspect-[5/3] overflow-hidden rounded-[32px] border border-slate-200/90 bg-[#E5E7EB] shadow-[0_30px_90px_rgba(15,23,42,0.10)]"
    >
      <HeroPreviewPoster />
    </section>
  )
}
