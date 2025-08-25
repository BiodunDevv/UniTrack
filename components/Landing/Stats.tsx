import { siteConfig } from "@/config/site";

import { Section } from "../ui/section";

interface StatsProps {
  className?: string;
}

export default function Stats({ className }: StatsProps) {
  const items = [
    {
      label: "trusted by",
      value: siteConfig.stats.institutions,
      description: "educational institutions worldwide",
    },
    {
      label: "tracking",
      value: Math.round(siteConfig.stats.students / 1000),
      suffix: "k",
      description: "students across multiple campuses",
    },
    {
      label: "over",
      value: Math.round(siteConfig.stats.sessions / 1000),
      suffix: "k",
      description: "attendance sessions completed successfully",
    },
    {
      label: "with",
      value: siteConfig.stats.accuracy,
      suffix: "%",
      description: "location verification accuracy rate",
    },
  ];

  return (
    <Section className={className}>
      <div className="container mx-auto max-w-[960px]">
        <div className="mb-12 text-center">
          <h2 className="mb-4 text-2xl font-bold sm:text-4xl">
            Trusted by Educational Institutions
          </h2>
          <p className="text-muted-foreground mx-auto max-w-3xl text-md">
            UniTrack has revolutionized attendance management across
            universities and schools globally
          </p>
        </div>
        <div className="grid grid-cols-2 gap-12 sm:grid-cols-4">
          {items.map((item, index) => (
            <div
              key={index}
              className="flex flex-col items-start gap-3 text-left"
            >
              {item.label && (
                <div className="text-muted-foreground text-sm font-semibold">
                  {item.label}
                </div>
              )}
              <div className="flex items-baseline gap-2">
                <div className="from-foreground to-foreground dark:to-brand bg-linear-to-r bg-clip-text text-4xl font-medium text-transparent drop-shadow-[2px_1px_24px_var(--brand-foreground)] transition-all duration-300 sm:text-5xl md:text-6xl">
                  {item.value}
                </div>
                {item.suffix && (
                  <div className="text-brand text-2xl font-semibold">
                    {item.suffix}
                  </div>
                )}
              </div>
              {item.description && (
                <div className="text-muted-foreground text-sm font-semibold text-pretty">
                  {item.description}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </Section>
  );
}
