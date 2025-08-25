import { HomeIcon, SearchIcon } from "lucide-react";
import Link from "next/link";

import UniTrack from "@/components/logos/unitrack";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Glow from "@/components/ui/glow";

export default function NotFound() {
  return (
    <div className="bg-background relative flex min-h-screen items-center justify-center overflow-hidden">
      {/* Content Container */}
      <div className="relative z-10 mx-auto max-w-2xl px-4 py-8 text-center">
        {/* Badge */}
        <Badge
          variant="outline"
          className="animate-in fade-in mb-6 duration-500"
        >
          <UniTrack className="mr-2 size-4" />
          <span className="text-muted-foreground">404 Error</span>
        </Badge>

        {/* Large 404 */}
        <div className="animate-in zoom-in mb-8 delay-100 duration-700">
          <h1 className="from-foreground to-foreground/70 bg-gradient-to-r bg-clip-text text-8xl leading-none font-bold text-transparent sm:text-9xl md:text-[12rem]">
            404
          </h1>
        </div>

        {/* Title */}
        <h2 className="animate-in slide-in-from-bottom from-foreground to-foreground/80 mb-4 bg-gradient-to-r bg-clip-text text-2xl font-semibold text-transparent delay-200 duration-600 sm:text-3xl md:text-4xl">
          Page Not Found
        </h2>

        {/* Description */}
        <p className="animate-in fade-in-up text-muted-foreground mx-auto mb-8 max-w-md text-base leading-relaxed delay-300 duration-500 sm:text-lg">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
          Let&apos;s get you back to UniTrack.
        </p>

        {/* Action Buttons */}
        <div className="animate-in slide-in-from-bottom flex flex-col gap-4 delay-400 duration-500 sm:flex-row sm:justify-center">
          <Button asChild size="lg" className="group">
            <Link href="/">
              <HomeIcon className="mr-2 size-4 transition-transform group-hover:scale-110" />
              Back to Home
            </Link>
          </Button>

          <Button asChild variant="outline" size="lg" className="group">
            <Link href="/#features">
              <SearchIcon className="mr-2 size-4 transition-transform group-hover:scale-110" />
              Explore Features
            </Link>
          </Button>
        </div>

        {/* Additional Navigation */}
        <div className="animate-in fade-in border-border/50 mt-12 border-t pt-8 delay-500 duration-500">
          <p className="text-muted-foreground mb-4 text-sm">
            Or navigate to these sections:
          </p>
          <div className="flex flex-wrap justify-center gap-4 text-sm">
            <Link
              href="/#workflow"
              className="text-muted-foreground hover:text-foreground transition-colors hover:underline"
            >
              How it Works
            </Link>
            <Link
              href="/#technology"
              className="text-muted-foreground hover:text-foreground transition-colors hover:underline"
            >
              Technology
            </Link>
            <Link
              href="/#faq"
              className="text-muted-foreground hover:text-foreground transition-colors hover:underline"
            >
              FAQ
            </Link>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute -top-20 left-1/2 -translate-x-1/2 transform opacity-20">
          <div className="bg-primary/20 h-32 w-32 animate-pulse rounded-full blur-xl"></div>
        </div>
        <div className="absolute -bottom-20 left-1/4 transform opacity-10">
          <div className="bg-primary/30 h-24 w-24 animate-pulse rounded-full blur-lg delay-1000"></div>
        </div>
        <div className="absolute right-1/4 -bottom-20 transform opacity-10">
          <div className="bg-primary/30 h-20 w-20 animate-pulse rounded-full blur-lg delay-500"></div>
        </div>
      </div>

      <Glow variant="top" className="animate-appear-zoom opacity-60" />
    </div>
  );
}
