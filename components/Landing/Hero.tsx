import {
  ArrowRightIcon,
  ClockIcon,
  MapPinIcon,
  ShieldCheckIcon,
} from "lucide-react";

import { cn } from "@/lib/utils";

import { Button } from "../ui/button";
import Glow from "../ui/glow";
import { Mockup, MockupFrame } from "../ui/mockup";
import Screenshot from "../ui/screenshot";
import { Section } from "../ui/section";

interface HeroProps {
  className?: string;
}

export default function Hero({ className }: HeroProps) {

  const buttons = [
    {
      href: "/auth/signup",
      text: "Sign Up",
      variant: "glow" as const,
      iconRight: <ArrowRightIcon className="ml-2 size-4" />,
    },
    {
      href: "/auth/signin",
      text: "Sign In",
      variant: "default" as const,
      iconRight: <ArrowRightIcon className="ml-2 size-4" />,
    },
  ];

  const mockup = (
    <Screenshot
      srcLight="/dashboard-light.png"
      srcDark="/dashboard-dark.png"
      alt="UniTrack Attendance Dashboard"
      width={1248}
      height={765}
      className="w-full"
    />
  );

  return (
    <Section
      className={cn(
        "fade-bottom overflow-hidden pb-0 sm:pb-0 md:pb-0",
        className,
      )}
    >
      <div className="max-w-container mx-auto flex flex-col gap-12 pt-36 sm:gap-24 sm:pt-24">
        <div className="flex flex-col items-center gap-6 text-center sm:gap-12">
          {/* {badge} */}
          <h1 className="animate-appear from-foreground to-foreground dark:to-muted-foreground relative z-10 inline-block bg-linear-to-r bg-clip-text text-3xl leading-tight font-semibold text-balance text-transparent drop-shadow-2xl sm:text-6xl sm:leading-tight md:leading-tight">
            UniTrack Attendance
            <div className="via-primary mx-auto mt-2 h-1 w-24 animate-pulse rounded-full bg-gradient-to-r from-transparent to-transparent" />
          </h1>

          <p className="sm:text-md animate-appear text-muted-foreground relative z-10 max-w-[740px] text-sm font-medium text-balance opacity-0 delay-100">
            A comprehensive system for managing classroom attendance with
            geolocation verification, real-time monitoring, and automated
            reporting for educational institutions.
          </p>

          {/* Feature highlights */}
          <div className="animate-appear relative z-10 flex max-w-2xl flex-wrap justify-center gap-6 opacity-0 delay-200">
            <div className="text-muted-foreground flex items-center gap-2 text-sm">
              <MapPinIcon className="text-primary size-4" />
              GPS Verification
            </div>
            <div className="text-muted-foreground flex items-center gap-2 text-sm">
              <ShieldCheckIcon className="text-primary size-4" />
              Advanced Security
            </div>
            <div className="text-muted-foreground flex items-center gap-2 text-sm">
              <ClockIcon className="text-primary size-4" />
              Real-time Monitoring
            </div>
          </div>

          <div className="animate-appear relative z-10 flex justify-center gap-4 opacity-0 delay-300">
            {buttons.map((button, index) => (
              <Button
                key={index}
                variant={button.variant || "default"}
                size="lg"
                asChild
              >
                <a href={button.href}>
                  {button.text}
                  {button.iconRight}
                </a>
              </Button>
            ))}
          </div>

          <div className="relative w-full pt-12">
            <MockupFrame
              className="animate-appear opacity-0 delay-700"
              size="small"
            >
              <Mockup
                type="responsive"
                className="bg-background/90 w-full rounded-xl border-0"
              >
                {mockup}
              </Mockup>
            </MockupFrame>
            <Glow
              variant="top"
              className="animate-appear-zoom opacity-0 delay-1000"
            />
          </div>
        </div>
      </div>
    </Section>
  );
}
