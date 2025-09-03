import {
  ChartBarIcon,
  EyeIcon,
  FileTextIcon,
  MailIcon,
  MapPinIcon,
  QrCodeIcon,
  ShieldCheckIcon,
  UsersIcon,
} from "lucide-react";
import { ReactNode } from "react";

import { Card } from "../ui/card";
import { Section } from "../ui/section";

interface FeatureCardProps {
  title: string;
  description: string;
  icon: ReactNode;
  className?: string;
}

function FeatureCard({
  title,
  description,
  icon,
  className = "",
}: FeatureCardProps) {
  return (
    <Card
      className={`group border-border/50 bg-card/50 hover:border-border hover:bg-card/80 hover:shadow-primary/5 relative h-full p-6 backdrop-blur-sm transition-all duration-500 hover:-translate-y-1 hover:scale-[1.02] hover:shadow-lg ${className}`}
    >
      <div className="flex items-start gap-4">
        <div className="bg-primary/10 text-primary group-hover:bg-primary/20 rounded-lg p-2 transition-all duration-500 group-hover:scale-110 group-hover:rotate-3">
          <div className="group-hover:animate-pulse">{icon}</div>
        </div>
        <div className="flex-1">
          <h3 className="group-hover:text-primary mb-2 text-lg font-semibold transition-colors duration-300">
            {title}
          </h3>
          <p className="text-muted-foreground group-hover:text-foreground/80 text-sm leading-relaxed transition-colors duration-300">
            {description}
          </p>
        </div>
      </div>
    </Card>
  );
}

interface FeaturesProps {
  className?: string;
}

export default function Features({ className }: FeaturesProps) {
  const features = [
    {
      title: "Geolocation Verification",
      description:
        "Ensure students are physically present in the classroom with precise GPS tracking and configurable radius settings.",
      icon: <MapPinIcon className="size-6" />,
      className: "md:col-span-2",
    },
    {
      title: "Real-time Monitoring",
      description:
        "Live attendance dashboard with instant updates and session progress tracking.",
      icon: <EyeIcon className="size-6" />,
    },
    {
      title: "QR Code & Session Codes",
      description:
        "Multiple attendance submission methods including QR codes and unique session codes for flexibility.",
      icon: <QrCodeIcon className="size-6" />,
      className: "md:col-span-2",
    },
    {
      title: "Advanced Security",
      description:
        "Device fingerprinting, rate limiting, and cryptographic receipts prevent fraud and duplicate submissions.",
      icon: <ShieldCheckIcon className="size-6" />,
    },
    {
      title: "Automated Reports",
      description:
        "Generate comprehensive attendance reports in CSV and PDF formats with email delivery.",
      icon: <FileTextIcon className="size-6" />,
    },
    {
      title: "Analytics Dashboard",
      description:
        "Detailed statistics, trends, and insights to help improve attendance patterns and course management.",
      icon: <ChartBarIcon className="size-6" />,
      className: "md:col-span-2",
    },
    {
      title: "Email System",
      description:
        "Automated notifications, OTP delivery, and session alerts keep everyone informed.",
      icon: <MailIcon className="size-6" />,
    },
    {
      title: "Bulk Management",
      description:
        "Efficiently manage multiple students, courses, and sessions with bulk operations.",
      icon: <UsersIcon className="size-6" />,
    },
  ];

  return (
    <Section className={className}>
      <div className="max-w-9xl container mx-auto">
        <div className="mb-16 text-center">
          <div className="relative inline-block">
            <h2 className="from-foreground to-foreground/70 mb-6 animate-pulse bg-gradient-to-r bg-clip-text text-2xl font-bold text-transparent sm:text-4xl">
              Comprehensive Attendance Management
            </h2>
            <div className="from-primary/20 to-primary/10 absolute -inset-1 animate-pulse bg-gradient-to-r opacity-30 blur-xl"></div>
          </div>
          <p className="text-muted-foreground animate-fade-in text-md mx-auto max-w-3xl">
            Everything you need to streamline attendance tracking with advanced
            security, real-time monitoring, and intelligent analytics.
          </p>
          <div className="via-primary mx-auto mt-8 h-1 w-24 animate-pulse rounded-full bg-gradient-to-r from-transparent to-transparent" />
        </div>

        <div className="grid auto-rows-fr grid-cols-1 gap-6 md:grid-cols-3 lg:grid-cols-4">
          {features.map((feature, index) => (
            <div
              key={index}
              className="animate-fade-in-up animate-stagger"
              style={{ "--stagger-delay": index * 2 } as React.CSSProperties} // 2x for 100ms instead of 50ms
            >
              <FeatureCard
                title={feature.title}
                description={feature.description}
                icon={feature.icon}
                className={feature.className}
              />
            </div>
          ))}
        </div>
      </div>
    </Section>
  );
}
