import ExpressJS from "../logos/express";
import JWT from "../logos/jwt";
import MongoDB from "../logos/mongodb";
import NodeJS from "../logos/nodejs";
import TypeScript from "../logos/typescript";
import { Badge } from "../ui/badge";
import Logo from "../ui/logo";
import { Section } from "../ui/section";

interface TechnologiesProps {
  className?: string;
}

export default function Technologies({ className }: TechnologiesProps) {
  const title = "Powered by Modern Technology Stack";

  const badge = (
    <Badge variant="outline" className="border-primary/30 text-primary">
      Enterprise-grade backend system
    </Badge>
  );

  const logos = [
    <Logo key="nodejs" image={NodeJS} name="Node.js" version="18+" />,
    <Logo key="express" image={ExpressJS} name="Express.js" version="4.x" />,
    <Logo key="mongodb" image={MongoDB} name="MongoDB" version="6.x" />,
    <Logo
      key="typescript"
      image={TypeScript}
      name="TypeScript"
      version="5.x"
    />,
    <Logo key="jwt" image={JWT} name="JWT Auth" badge="Secure" />,
  ];

  return (
    <Section className={className}>
      <div className="max-w-container mx-auto flex flex-col items-center gap-8 text-center">
        <div className="flex flex-col items-center gap-6">
          {badge}
          <h2 className="text-md font-semibold sm:text-2xl">{title}</h2>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-8">
          {logos}
        </div>
      </div>
    </Section>
  );
}
