import { Reveal } from "@/components/motion/Reveal";

export interface CoreValueContent {
  title: string;
  description: string;
}

// Numbered list (01–04) of the admin-set values; entries without a title are skipped.
export function CoreValues({ values }: { values: CoreValueContent[] }) {
  const items = values.filter((value) => value?.title).slice(0, 4);
  if (items.length === 0) return null;

  return (
    <section className="px-4 pb-16">
      <div className="mx-auto max-w-6xl">
        <Reveal>
          <h2 className="mb-6 text-2xl font-bold text-white sm:text-3xl">Our Core Values</h2>
        </Reveal>

        <ol className="glass-panel divide-y divide-white/10 px-6 sm:px-10">
          {items.map((value, index) => (
            <li key={value.title}>
              <Reveal delay={index * 0.06} className="grid gap-2 py-6 sm:grid-cols-[5rem_12rem_1fr] sm:items-baseline sm:gap-6">
                <span className="font-display text-3xl font-semibold text-blue-400">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <h3 className="text-lg font-bold text-white">{value.title}</h3>
                <p className="text-slate-400">{value.description}</p>
              </Reveal>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
