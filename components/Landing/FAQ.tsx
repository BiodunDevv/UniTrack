import { siteConfig } from "@/config/site";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../ui/accordion";
import { Section } from "../ui/section";

interface FAQProps {
  className?: string;
}

export default function FAQ({ className }: FAQProps) {
  const title = "Frequently Asked Questions";

  const items = [
    {
      question: "How accurate is the geolocation verification?",
      answer: (
        <>
          <p className="text-muted-foreground mb-4 max-w-[640px] text-balance">
            UniTrack achieves 99.8% accuracy in location verification using
            advanced GPS tracking with configurable radius settings. The system
            accounts for GPS signal variations and provides reliable attendance
            tracking even in challenging environments.
          </p>
          <p className="text-muted-foreground mb-4 max-w-[640px] text-balance">
            Teachers can adjust the radius from 10 to 100 meters based on
            classroom size and building layout requirements.
          </p>
        </>
      ),
    },
    {
      question: "What security measures are in place to prevent fraud?",
      answer: (
        <>
          <p className="text-muted-foreground mb-4 max-w-[600px]">
            UniTrack implements multiple security layers including device
            fingerprinting, JWT-based authentication, rate limiting, and
            cryptographic receipts for each attendance submission.
          </p>
          <p className="text-muted-foreground mb-4 max-w-[600px]">
            Device fingerprinting prevents students from submitting attendance
            multiple times from the same device, while location verification
            ensures physical presence.
          </p>
          <p className="text-muted-foreground mb-4 max-w-[600px]">
            All actions are logged in a comprehensive audit trail for security
            monitoring and compliance purposes.
          </p>
        </>
      ),
    },
    {
      question: "Can the system handle large numbers of concurrent users?",
      answer: (
        <>
          <p className="text-muted-foreground mb-4 max-w-[580px]">
            Yes! UniTrack is built with scalability in mind, using MongoDB for
            efficient data storage and Express.js for high-performance API
            handling.
          </p>
          <p className="text-muted-foreground mb-4 max-w-[580px]">
            The system has been tested with thousands of concurrent users and
            includes optimized database queries, proper indexing, and efficient
            caching mechanisms.
          </p>
          <p className="text-muted-foreground mb-4 max-w-[640px] text-balance">
            Rate limiting ensures system stability during peak usage periods
            while maintaining responsive performance for all users.
          </p>
        </>
      ),
    },
    {
      question: "What attendance submission methods are supported?",
      answer: (
        <>
          <p className="text-muted-foreground mb-4 max-w-[580px]">
            UniTrack supports multiple attendance submission methods for maximum
            flexibility:
          </p>
          <ul className="text-muted-foreground mb-4 max-w-[580px] list-inside list-disc space-y-2">
            <li>QR code scanning for quick attendance</li>
            <li>4-digit session codes for manual entry</li>
            <li>Manual marking by teachers when needed</li>
            <li>Bulk attendance operations for large classes</li>
          </ul>
          <p className="text-muted-foreground mb-4 max-w-[580px]">
            All methods include the same security verification and location
            checking.
          </p>
        </>
      ),
    },
    {
      question: "How are attendance reports generated and delivered?",
      answer: (
        <>
          <p className="text-muted-foreground mb-4 max-w-[580px]">
            UniTrack automatically generates comprehensive attendance reports in
            both CSV and PDF formats. Reports can be downloaded instantly or
            delivered via email to teachers and administrators.
          </p>
          <p className="text-muted-foreground mb-4 max-w-[580px]">
            The system includes detailed analytics showing attendance patterns,
            trends, and statistics to help improve student engagement and
            identify attendance issues early.
          </p>
        </>
      ),
    },
    {
      question: "Is technical support and documentation available?",
      answer: (
        <>
          <p className="text-muted-foreground mb-4 max-w-[580px]">
            Yes! UniTrack comes with comprehensive documentation covering
            installation, configuration, API reference, and best practices for
            deployment.
          </p>
          <p className="text-muted-foreground mb-4 max-w-[580px]">
            For additional support, you can reach out via{" "}
            <a
              href={siteConfig.links.email}
              className="underline underline-offset-2"
            >
              email
            </a>{" "}
            or check our{" "}
            <a
              href={siteConfig.links.github}
              className="underline underline-offset-2"
            >
              GitHub repository
            </a>{" "}
            for community support and issue tracking.
          </p>
        </>
      ),
    },
  ];

  return (
    <Section className={className}>
      <div className="max-w-container mx-auto flex flex-col items-center gap-8">
        <h2 className="text-center text-2xl font-semibold sm:text-4xl">
          {title}
        </h2>
        <Accordion type="single" collapsible className="w-full max-w-[800px]">
          {items.map((item, index) => (
            <AccordionItem key={index} value={`item-${index + 1}`}>
              <AccordionTrigger>{item.question}</AccordionTrigger>
              <AccordionContent>{item.answer}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </Section>
  );
}
