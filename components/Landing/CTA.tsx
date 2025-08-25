import { ArrowRightIcon } from "lucide-react";

import { cn } from "@/lib/utils";

import Github from "../logos/github";
import { Button } from "../ui/button";
import Glow from "../ui/glow";
import { Section } from "../ui/section";

interface CTAProps {
  className?: string;
}

export default function CTA({ className }: CTAProps) {
  const title = "Ready to Transform Your Attendance Management?";

  const buttons = [
    {
      href: "/auth/signup",
      text: "Get Started with UniTrack",
      variant: "default" as const,
      icon: <Github className="mr-2 size-4" />,
      iconRight: <ArrowRightIcon className="ml-2 size-4" />,
    },
  ];

  return (
    <Section className={cn("group relative overflow-hidden", className)}>
      <div className="max-w-container relative z-10 mx-auto flex flex-col items-center gap-6 text-center sm:gap-8">
        <div className="max-w-[640px]">
          <h2 className="mb-4 text-2xl leading-tight font-semibold sm:text-4xl sm:leading-tight">
            {title}
          </h2>
          <p className="text-muted-foreground text-md mx-auto max-w-2xl">
            Join educational institutions worldwide using UniTrack for secure,
            accurate, and efficient attendance management with real-time
            monitoring and comprehensive reporting.
          </p>
        </div>
        <div className="flex flex-col justify-center gap-4 sm:flex-row">
          {buttons.map((button, index) => (
            <Button
              key={index}
              variant={button.variant || "default"}
              size="lg"
              asChild
            >
              <a href={button.href}>
                {button.icon}
                {button.text}
                {button.iconRight}
              </a>
            </Button>
          ))}
        </div>
        <div className="text-muted-foreground mt-4 text-sm">
          Open source • Enterprise ready • Free to use
        </div>
      </div>
      <div className="absolute top-0 left-0 h-full w-full translate-y-[1rem] opacity-80 transition-all duration-500 ease-in-out group-hover:translate-y-[-2rem] group-hover:opacity-100">
        <Glow variant="bottom" />
      </div>
    </Section>
  );
}
