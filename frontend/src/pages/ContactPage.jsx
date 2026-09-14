export default function ContactPage() {
  return (
    <article className="max-w-2xl">
      <h1 className="text-3xl font-bold text-slate-900">Lien he</h1>
      <p className="mt-3 text-slate-700">Moi thac mac xin gui ve hop thu ben duoi.</p>
      <dl className="mt-6 grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 text-sm">
        <dt className="font-medium text-slate-500">Email</dt>
        <dd className="text-slate-900">support@example.com</dd>
        <dt className="font-medium text-slate-500">Dien thoai</dt>
        <dd className="text-slate-900">1900 0000</dd>
      </dl>
    </article>
  );
}
