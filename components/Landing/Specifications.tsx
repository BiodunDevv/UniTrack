import {
  CloudIcon,
  CodeIcon,
  DatabaseIcon,
  MonitorIcon,
  ServerIcon,
  ShieldIcon,
} from "lucide-react";
import { ReactNode } from "react";

import { Card } from "../ui/card";
import { Section } from "../ui/section";

interface TechSpecProps {
  title: string;
  items: string[];
  icon: ReactNode;
  className?: string;
}

function TechSpec({ title, items, icon, className = "" }: TechSpecProps) {
  return (
    <Card
      className={`border-border/50 bg-card/30 h-full p-6 backdrop-blur-sm ${className}`}
    >
      <div className="mb-4 flex items-center gap-3">
        <div className="bg-primary/10 text-primary rounded-lg p-2">{icon}</div>
        <h3 className="text-lg font-semibold">{title}</h3>
      </div>
      <ul className="space-y-2">
        {items.map((item, index) => (
          <li
            key={index}
            className="text-muted-foreground flex items-center gap-2 text-sm"
          >
            <div className="bg-primary/60 h-1.5 w-1.5 flex-shrink-0 rounded-full" />
            {item}
          </li>
        ))}
      </ul>
    </Card>
  );
}

interface SpecificationsProps {
  className?: string;
}

export default function Specifications({ className }: SpecificationsProps) {
  const specs = [
    {
      title: "Backend Architecture",
      icon: <ServerIcon className="size-5" />,
      items: [
        "Node.js with Express.js framework",
        "RESTful API design",
        "JWT-based authentication",
        "Comprehensive error handling",
        "Rate limiting & security middleware",
      ],
    },
    {
      title: "Database & Storage",
      icon: <DatabaseIcon className="size-5" />,
      items: [
        "MongoDB with Mongoose ODM",
        "Optimized schemas & indexing",
        "Audit logging system",
        "Automated backups",
        "Replica set support",
      ],
    },
    {
      title: "Security Features",
      icon: <ShieldIcon className="size-5" />,
      items: [
        "bcrypt password hashing",
        "Device fingerprinting",
        "Input validation & sanitization",
        "CORS & Helmet.js protection",
        "Cryptographic receipts",
      ],
    },
    {
      title: "Email & Notifications",
      icon: <CloudIcon className="size-5" />,
      items: [
        "SMTP integration (Gmail, etc.)",
        "Handlebars email templates",
        "OTP verification system",
        "Automated report delivery",
        "Session notifications",
      ],
    },
    {
      title: "API Endpoints",
      icon: <CodeIcon className="size-5" />,
      items: [
        "Authentication & authorization",
        "Course & student management",
        "Session control & monitoring",
        "Attendance submission & tracking",
        "Admin dashboard & analytics",
      ],
    },
    {
      title: "Monitoring & Analytics",
      icon: <MonitorIcon className="size-5" />,
      items: [
        "Health check endpoints",
        "Performance monitoring",
        "Usage statistics tracking",
        "Error rate monitoring",
        "Real-time dashboard metrics",
      ],
    },
  ];

  return (
    <Section className={className} id="technical">
      <div className="container mx-auto max-w-7xl">
        <div className="mb-16 text-center">
          <h2 className="mb-6 text-2xl font-bold sm:text-4xl">
            Technical Specifications
          </h2>
          <p className="text-muted-foreground mx-auto max-w-3xl text-md">
            Built with modern technologies and best practices for scalability,
            security, and performance.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {specs.map((spec, index) => (
            <TechSpec
              key={index}
              title={spec.title}
              items={spec.items}
              icon={spec.icon}
            />
          ))}
        </div>
      </div>
    </Section>
  );
}
