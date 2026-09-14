"use client";

import { useState } from "react";
import { useI18n } from "@/lib/i18n";
import { CATEGORIES, productsByCategory, type Product } from "@/lib/catalog";
import ProductCard from "@/components/ProductCard";
import ProductModal from "@/components/ProductModal";

export default function ProductsPage() {
  const { t, pick } = useI18n();
  const [selected, setSelected] = useState<Product | null>(null);

  return (
    <div className="container-page py-16 md:py-20">
      <header className="max-w-2xl fade-up">
        <p className="eyebrow">{t("nav.products")}</p>
        <h1 className="display mt-4 text-4xl md:text-5xl">{t("products.title")}</h1>
        <p className="mt-5 text-lg leading-relaxed text-ink-soft">
          {t("products.lede")}
        </p>
      </header>

      <div className="mt-14 space-y-16">
        {CATEGORIES.map((cat) => {
          const products = productsByCategory(cat.id);
          return (
            <section key={cat.id} id={cat.id} className="scroll-mt-24">
              <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2 border-b border-line pb-4">
                <h2 className="display text-2xl md:text-3xl">{pick(cat.name)}</h2>
                <p className="text-sm text-muted">
                  {products.length > 0
                    ? `${products.length} ${
                        products.length === 1
                          ? t("products.count_one")
                          : t("products.count_other")
                      }`
                    : t("products.soon")}
                </p>
              </div>
              <p className="mt-3 max-w-2xl text-sm text-muted">
                {pick(cat.blurb)}
              </p>

              {products.length > 0 ? (
                <ul className="mt-7 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {products.map((p) => (
                    <li key={p.id}>
                      <ProductCard product={p} onOpen={() => setSelected(p)} />
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="mt-7 rounded-lg border border-dashed border-line p-10 text-center">
                  <p className="text-sm font-semibold text-ink-soft">
                    {t("products.soon")}
                  </p>
                  <p className="mt-1 text-sm text-muted">
                    {t("products.soonBody")}
                  </p>
                </div>
              )}
            </section>
          );
        })}
      </div>

      <ProductModal product={selected} onClose={() => setSelected(null)} />
    </div>
  );
}
