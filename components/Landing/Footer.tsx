import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";

import UniTrack from "../logos/unitrack";
import {
  Footer,
  FooterBottom,
  FooterColumn,
  FooterContent,
} from "../ui/footer";
import { ModeToggle } from "../ui/mode-toggle";

interface FooterLink {
  text: string;
  href: string;
}

interface FooterColumnProps {
  title: string;
  links: FooterLink[];
}

interface FooterProps {
  className?: string;
}

export default function FooterSection({ className }: FooterProps) {
  const columns: FooterColumnProps[] = [
    {
      title: "Product",
      links: [
        { text: "Features", href: "#features" },
        { text: "How it Works", href: "#workflow" },
        { text: "Technology", href: "#technology" },
      ],
    },
    {
      title: "Resources",
      links: [
        { text: "Documentation", href: "#faq" },
        { text: "API Reference", href: "#technology" },
        { text: "Support", href: "#faq" },
      ],
    },
    {
      title: "Connect",
      links: [
        { text: "GitHub", href: siteConfig.links.github },
        { text: "Contact", href: siteConfig.links.email },
        { text: "Get Started", href: "#cta" },
      ],
    },
  ];

  const policies: FooterLink[] = [
    { text: "Privacy Policy", href: "#" },
    { text: "Terms of Service", href: "#" },
  ];

  return (
    <footer className={cn("bg-background w-full px-4", className)}>
      <div className="max-w-container mx-auto">
        <Footer>
          <FooterContent>
            <FooterColumn className="col-span-2 sm:col-span-3 md:col-span-1">
              <div className="flex items-center gap-2">
                <UniTrack />
                <h3 className="text-xl font-bold">UniTrack</h3>
              </div>
              <p className="text-muted-foreground mt-2 max-w-xs text-sm">
                Comprehensive attendance management system with geolocation
                verification and real-time monitoring.
              </p>
            </FooterColumn>
            {columns.map((column, index) => (
              <FooterColumn key={index}>
                <h3 className="text-md pt-1 font-semibold">{column.title}</h3>
                {column.links.map((link, linkIndex) => (
                  <a
                    key={linkIndex}
                    href={link.href}
                    className="text-muted-foreground hover:text-foreground text-sm transition-colors"
                  >
                    {link.text}
                  </a>
                ))}
              </FooterColumn>
            ))}
          </FooterContent>
          <FooterBottom>
            <div>© 2025 UniTrack. All rights reserved</div>
            <div className="flex items-center gap-4">
              {policies.map((policy, index) => (
                <a
                  key={index}
                  href={policy.href}
                  className="text-muted-foreground hover:text-foreground text-sm transition-colors"
                >
                  {policy.text}
                </a>
              ))}
              <ModeToggle />
            </div>
          </FooterBottom>
        </Footer>
      </div>
    </footer>
  );
}
