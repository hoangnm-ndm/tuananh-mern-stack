import { Link } from "react-router";
import { Button } from "@/core/components/ui/Button.jsx";
import { PATHS } from "@/core/router/paths.js";
import { env } from "@/core/config/env.js";

export default function HomePage() {
  const features = [
    { title: "Xac thuc 3 phuong thuc", description: "Email/mat khau, Google OAuth va magic link." },
    {
      title: "Phan quyen RBAC",
      description: "3 vai tro member / admin / superAdmin theo quyen chi tiet.",
    },
    {
      title: "Kien truc module",
      description: "Them module moi chi bang cach sao chep khuon mau co san.",
    },
    { title: "Validate hai lop", description: "Zod dung chung o ca frontend va backend." },
  ];

  return (
    <div className="flex flex-col gap-10">
      <section className="rounded-2xl bg-white p-8 shadow-sm sm:p-12">
        <h1 className="text-3xl font-bold text-slate-900 sm:text-4xl">{env.APP_NAME}</h1>
        <p className="mt-3 max-w-2xl text-slate-600">
          Source base fullstack dung chung cho nhieu du an: Express 5 + MongoDB o backend, React 19
          + TanStack Query o frontend.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link to={PATHS.PRODUCTS}>
            <Button size="lg">Xem san pham</Button>
          </Link>
          <Link to={PATHS.ABOUT}>
            <Button size="lg" variant="outline">
              Tim hieu them
            </Button>
          </Link>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2">
        {features.map((feature) => (
          <article key={feature.title} className="rounded-xl border border-slate-200 bg-white p-5">
            <h2 className="font-semibold text-slate-900">{feature.title}</h2>
            <p className="mt-1 text-sm text-slate-600">{feature.description}</p>
          </article>
        ))}
      </section>
    </div>
  );
}
