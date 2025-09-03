"use client";

import { ArrowLeft, Upload,Users } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { DashboardLayout } from "@/components/layouts/dashboard-layout";
import {
  AddSingleLecturerSection,
  BulkLecturerUploadSection,
} from "@/components/LecturerCreation";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function CreateLecturerPage() {
  const router = useRouter();
  const [refreshKey, setRefreshKey] = useState(0);

  const handleCreationComplete = () => {
    // Trigger a refresh or redirect
    setRefreshKey((prev) => prev + 1);
    // Optionally redirect after a delay
    setTimeout(() => {
      router.push("/lecturers");
    }, 2000);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 p-4 lg:p-6">
        {/* Breadcrumb */}
        <div className="animate-appear opacity-0">
          <Breadcrumb
            items={[
              { label: "Lecturers", href: "/lecturers" },
              { label: "Create New Lecturer", current: true },
            ]}
          />
        </div>

        {/* Header Section */}
        <div className="animate-appear flex flex-col gap-4 opacity-0 delay-100 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <Button
                size="sm"
                variant="outline"
                href="/lecturers"
                className="hover:bg-accent hover:text-accent-foreground transition-all duration-300"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Lecturers
              </Button>
            </div>
            <h1 className="from-foreground to-muted-foreground bg-gradient-to-r bg-clip-text text-3xl font-bold text-transparent lg:text-4xl">
              Create New Lecturer
            </h1>
            <p className="text-muted-foreground text-sm lg:text-base">
              Add new lecturers to the system individually or in bulk
            </p>
          </div>
        </div>

        {/* Main Content */}
        <div className="animate-appear space-y-6 opacity-0 delay-200">
          <Tabs defaultValue="single" className="w-full">
            <TabsList className="grid w-fit grid-cols-2">
              <TabsTrigger value="single" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Single Lecturer
              </TabsTrigger>
              <TabsTrigger value="bulk" className="flex items-center gap-2">
                <Upload className="h-4 w-4" />
                Bulk Upload
              </TabsTrigger>
            </TabsList>

            {/* Single Lecturer Creation */}
            <TabsContent value="single" className="space-y-6">
              <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Add Single Lecturer
                  </CardTitle>
                  <CardDescription>
                    Create a new lecturer account with auto-generated temporary
                    password
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <AddSingleLecturerSection
                    onAddComplete={handleCreationComplete}
                    key={`single-${refreshKey}`}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            {/* Bulk Lecturer Upload */}
            <TabsContent value="bulk" className="space-y-6">
              <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Upload className="h-5 w-5" />
                    Bulk Lecturer Upload
                  </CardTitle>
                  <CardDescription>
                    Upload multiple lecturers at once using a CSV file
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <BulkLecturerUploadSection
                    onUploadComplete={handleCreationComplete}
                    key={`bulk-${refreshKey}`}
                  />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </DashboardLayout>
  );
}
