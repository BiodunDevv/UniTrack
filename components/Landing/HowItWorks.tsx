"use client";

import {
  ArrowRightIcon,
  BarChart3Icon,
  BookOpenIcon,
  CheckCircleIcon,
  MapPinIcon,
  PauseIcon,
  Play,
  PlayIcon,
  UserPlusIcon,
} from "lucide-react";
import { ReactNode, useCallback, useEffect, useRef, useState } from "react";

import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { Section } from "../ui/section";

function WorkflowStep({
  title,
  description,
  details,
  icon,
  isAnimating,
}: {
  step: number;
  title: string;
  description: string;
  details: string;
  icon: ReactNode;
  isAnimating: boolean;
}) {
  return (
    <div className="relative">
      <Card
        className={`border-border/50 bg-primary/5 border-primary/20 shadow-primary/10 p-6 shadow-lg backdrop-blur-sm ${
          isAnimating
            ? "animate-in fade-in slide-in-from-bottom-4 duration-500"
            : ""
        }`}
      >
        <div className="mb-6 flex items-center gap-4">
          <div
            className={`bg-primary/20 text-primary rounded-lg p-3 ${
              isAnimating ? "animate-in zoom-in delay-100 duration-300" : ""
            }`}
          >
            {icon}
          </div>
          <h3 className={`text-primary text-xl font-bold`}>{title}</h3>
        </div>

        <p
          className={`text-foreground text-md mb-6 leading-relaxed ${
            isAnimating ? "animate-in fade-in-up delay-300 duration-400" : ""
          }`}
        >
          {description}
        </p>

        <div
          className={`border-border/50 border-t pt-6 ${
            isAnimating ? "animate-in fade-in delay-400 duration-500" : ""
          }`}
        >
          <h4 className="text-primary text-md mb-3 font-semibold">
            How it works:
          </h4>
          <p className="text-foreground/90 leading-relaxed">{details}</p>
        </div>
      </Card>
    </div>
  );
}

interface HowItWorksProps {
  className?: string;
}

export default function HowItWorks({ className }: HowItWorksProps) {
  const [activeStep, setActiveStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true); // Start playing automatically
  const [isAnimating, setIsAnimating] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const steps = [
    {
      title: "Teacher Registration",
      description:
        "Teachers register with email verification and OTP confirmation. Admin approval ensures proper access control and security.",
      details:
        "The registration process includes email verification, secure password creation, and administrative approval. Teachers receive an OTP code via email to confirm their identity, ensuring only authorized personnel can access the system.",
      icon: <UserPlusIcon className="size-6" />,
    },
    {
      title: "Course Setup",
      description:
        "Create courses, add student details, and configure classroom locations. Bulk import options make setup quick and efficient.",
      details:
        "Teachers can create multiple courses, import student lists via CSV files, and set up classroom GPS coordinates. The system supports bulk operations for managing hundreds of students across multiple courses simultaneously.",
      icon: <BookOpenIcon className="size-6" />,
    },
    {
      title: "Session Creation",
      description:
        "Start attendance sessions with configurable duration, location radius, and unique session codes. QR codes are automatically generated.",
      details:
        "Each session generates a unique 4-digit code and QR code for easy student access. Teachers can configure session duration (15 minutes to 4 hours) and location radius (5-100 meters) based on classroom size and requirements.",
      icon: <PlayIcon className="size-6" />,
    },
    {
      title: "Location Verification",
      description:
        "Students submit attendance with GPS coordinates verified against classroom location. Device fingerprinting prevents duplicate submissions.",
      details:
        "Advanced geolocation technology ensures students are physically present in the designated area. Device fingerprinting and IP tracking prevent attendance fraud and duplicate submissions from the same device.",
      icon: <MapPinIcon className="size-6" />,
    },
    {
      title: "Attendance Tracking",
      description:
        "Real-time monitoring of attendance submissions with instant status updates. Teachers can manually mark attendance if needed.",
      details:
        "Live dashboard shows attendance submissions in real-time. Teachers can see who's present, absent, or has submitted from outside the designated area. Manual override options are available for special circumstances.",
      icon: <CheckCircleIcon className="size-6" />,
    },
    {
      title: "Reports & Analytics",
      description:
        "Generate comprehensive reports in multiple formats. Email delivery and detailed analytics help track attendance patterns and trends.",
      details:
        "Export attendance data in CSV or PDF formats with automatic email delivery. Advanced analytics show attendance trends, patterns, and insights to help improve student engagement and identify at-risk students.",
      icon: <BarChart3Icon className="size-6" />,
    },
  ];

  const handleNextStep = useCallback(() => {
    setActiveStep((prev) => (prev + 1) % steps.length);
  }, [steps.length]);

  // Auto-play functionality
  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = setInterval(() => {
        handleNextStep();
      }, 5000); // Change step every 5 seconds for better sync
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isPlaying, handleNextStep]);

  // Animation trigger
  useEffect(() => {
    setIsAnimating(true);
    const timer = setTimeout(() => {
      setIsAnimating(false);
    }, 800);

    return () => clearTimeout(timer);
  }, [activeStep]);

  // Auto-start animation on component mount
  useEffect(() => {
    setIsAnimating(true);
    const timer = setTimeout(() => {
      setIsAnimating(false);
    }, 800);

    return () => clearTimeout(timer);
  }, []);

  const handleStepClick = (index: number) => {
    if (index !== activeStep) {
      setActiveStep(index);
    }
  };

  const handlePrevStep = () => {
    setActiveStep((prev) => (prev - 1 + steps.length) % steps.length);
  };

  const toggleAutoPlay = () => {
    setIsPlaying(!isPlaying);
  };

  return (
    <Section className={className} id="workflow">
      <div className="container mx-auto max-w-6xl">
        <div className="mb-16 text-center">
          <Badge variant="outline" className="mb-4">
            Interactive Guide
          </Badge>
          <h2 className="from-foreground to-foreground/70 mb-6 bg-gradient-to-r bg-clip-text text-2xl font-bold text-transparent sm:text-4xl">
            How UniTrack Works
          </h2>
          <p className="text-muted-foreground text-md mx-auto max-w-3xl">
            From setup to reporting, UniTrack streamlines the entire attendance
            management process with security and accuracy at every step. Click
            on any step to explore in detail.
          </p>
          <div className="via-primary mx-auto mt-8 mb-8 h-1 w-24 animate-pulse rounded-full bg-gradient-to-r from-transparent to-transparent" />

          <div className="mb-8 flex flex-wrap justify-center gap-2">
            {steps.map((_, index) => (
              <Button
                key={index}
                variant={activeStep === index ? "default" : "outline"}
                size="sm"
                onClick={() => handleStepClick(index)}
                className={`${
                  activeStep === index ? "animate-in zoom-in duration-300" : ""
                }`}
              >
                Step {index + 1}
              </Button>
            ))}
          </div>

          {/* Auto-play controls */}
          <div className="mb-8 flex justify-center">
            <Button
              onClick={toggleAutoPlay}
              variant={isPlaying ? "destructive" : "default"}
              className="group transition-all duration-300 hover:scale-105"
              size="lg"
            >
              {isPlaying ? (
                <>
                  <PauseIcon className="mr-2 size-4" />
                  Pause Auto-play
                </>
              ) : (
                <>
                  <Play className="mr-2 size-4" />
                  Start Auto-play
                </>
              )}
            </Button>
          </div>
        </div>

        <div className="mb-12">
          <div
            className={
              isAnimating
                ? "animate-in fade-in slide-in-from-bottom-4 duration-500"
                : ""
            }
          >
            <WorkflowStep
              step={activeStep + 1}
              title={steps[activeStep].title}
              description={steps[activeStep].description}
              details={steps[activeStep].details}
              icon={steps[activeStep].icon}
              isAnimating={isAnimating}
            />
          </div>
        </div>

        <div className="flex justify-center gap-4">
          <Button
            onClick={handlePrevStep}
            variant="outline"
            className="group"
            size="lg"
            disabled={isPlaying}
          >
            <ArrowRightIcon className="mr-2 size-4 rotate-180" />
            Previous Step
          </Button>
          <Button
            onClick={handleNextStep}
            className="group"
            size="lg"
            disabled={isPlaying}
          >
            Next Step
            <ArrowRightIcon className="ml-2 size-4" />
          </Button>
        </div>
      </div>
    </Section>
  );
}
