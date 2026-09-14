export default function AboutPage() {
  return (
    <article className="prose max-w-3xl">
      <h1 className="text-3xl font-bold text-slate-900">Ve source base nay</h1>
      <p className="mt-4 leading-relaxed text-slate-700">
        Day la bo khung (source base) duoc thiet ke de dung lai cho nhieu du an khac nhau. Nhung
        phan dung chung — xac thuc, phan quyen, xu ly loi, phan trang, goi API — deu nam trong thu
        muc <code className="rounded bg-slate-100 px-1.5 py-0.5">core/</code>.
      </p>
      <p className="mt-3 leading-relaxed text-slate-700">
        Nghiep vu rieng cua tung du an nam trong{" "}
        <code className="rounded bg-slate-100 px-1.5 py-0.5">modules/</code> (backend) va{" "}
        <code className="rounded bg-slate-100 px-1.5 py-0.5">features/</code> (frontend). Bat dau du
        an moi: xoa module mau, giu nguyen core.
      </p>
    </article>
  );
}
