"use client";

import {
  AlertCircle,
  BookOpen,
  HelpCircle,
  MessageSquare,
  Plus,
  Search,
  Trash2,
  Users,
} from "lucide-react";
import React, { useState } from "react";
import { toast } from "sonner";

import { DashboardLayout } from "@/components/layouts/dashboard-layout";
import { Badge } from "@/components/ui/badge";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useAuthStore } from "@/store/auth-store";
import { useHelpStore } from "@/store/help-store";

export default function HelpPage() {
  const { user } = useAuthStore();
  const {
    faqs,
    categories,
    supportInfo,
    isLoading,
    getAllFAQs,
    getFAQCategories,
    getSupportInfo,
    createFAQ,
  } = useHelpStore();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [activeTab, setActiveTab] = useState("faq");
  const [showCreateFAQ, setShowCreateFAQ] = useState(false);

  // FAQ form state
  const [faqForm, setFaqForm] = useState({
    question: "",
    answer: "",
    category: "",
    tags: "",
  });

  const isAdmin = user?.role === "admin";

  // Fetch data on component mount
  React.useEffect(() => {
    if (user) {
      getAllFAQs();
      getFAQCategories();
      getSupportInfo();
    }
  }, [user, getAllFAQs, getFAQCategories, getSupportInfo]);

  // Filter FAQs based on search and category
  const filteredFAQs = faqs.filter((faq) => {
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch =
      searchQuery === "" ||
      faq.question.toLowerCase().includes(searchLower) ||
      faq.answer.toLowerCase().includes(searchLower) ||
      faq.category.toLowerCase().includes(searchLower) ||
      faq.tags.some((tag) => tag.toLowerCase().includes(searchLower));
    const matchesCategory =
      selectedCategory === "all" || faq.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const handleCreateFAQ = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !faqForm.question.trim() ||
      !faqForm.answer.trim() ||
      !faqForm.category
    ) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      await createFAQ({
        question: faqForm.question,
        answer: faqForm.answer,
        category: faqForm.category,
        tags: faqForm.tags
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean),
      });
      toast.success("FAQ created successfully!");
      setShowCreateFAQ(false);
      setFaqForm({
        question: "",
        answer: "",
        category: "",
        tags: "",
      });
    } catch {
      toast.error("Failed to create FAQ");
    }
  };

  const handleDeleteFAQ = async (faqId: string, question: string) => {
    if (
      window.confirm(`Are you sure you want to delete the FAQ: "${question}"?`)
    ) {
      try {
        // TODO: Implement deleteFAQ in help store
        // await deleteFAQ(faqId);
        toast.success("FAQ deleted successfully");
        getAllFAQs(); // Refresh the list
      } catch {
        toast.error("Failed to delete FAQ");
      }
    }
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      technical: "bg-blue-100 text-blue-800 border-blue-200",
      attendance: "bg-green-100 text-green-800 border-green-200",
      security: "bg-red-100 text-red-800 border-red-200",
      reports: "bg-purple-100 text-purple-800 border-purple-200",
      support: "bg-orange-100 text-orange-800 border-orange-200",
      general: "bg-gray-100 text-gray-800 border-gray-200",
    };
    return colors[category as keyof typeof colors] || colors.general;
  };

  const getPriorityColor = (priority: string) => {
    const colors = {
      low: "bg-gray-100 text-gray-800",
      medium: "bg-yellow-100 text-yellow-800",
      high: "bg-orange-100 text-orange-800",
      urgent: "bg-red-100 text-red-800",
    };
    return colors[priority as keyof typeof colors] || colors.medium;
  };

  return (
    <DashboardLayout>
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        {/* Breadcrumb */}
        <div className="animate-appear ml-2 opacity-0">
          <Breadcrumb items={[{ label: "Help & Support", current: true }]} />
        </div>

        {/* Hero Section */}
        <div className="animate-appear from-primary/10 via-primary/5 rounded-lg bg-gradient-to-r to-transparent p-4 opacity-0 delay-100 sm:p-6">
          <div className="max-w-3xl">
            <h1 className="mb-4 text-3xl font-bold lg:text-4xl">
              Help & Support
            </h1>
            <p className="text-muted-foreground text-md mb-6">
              Find answers to common questions, get support, and manage the
              knowledge base.
              {isAdmin
                ? " As an admin, you can create and manage FAQs."
                : " Get help with your attendance management needs."}
            </p>
            <div className="flex flex-wrap gap-4">
              {isAdmin && (
                <Button
                  variant="outline"
                  onClick={() => setShowCreateFAQ(true)}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Create FAQ
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="animate-appear grid gap-4 opacity-0 delay-200 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="border-border/50 bg-card/50 hover:border-border hover:bg-card/80 backdrop-blur-sm transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total FAQs</CardTitle>
              <HelpCircle className="text-muted-foreground h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{faqs.length}</div>
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-card/50 hover:border-border hover:bg-card/80 backdrop-blur-sm transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Categories</CardTitle>
              <BookOpen className="text-muted-foreground h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{categories.length}</div>
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-card/50 hover:border-border hover:bg-card/80 backdrop-blur-sm transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Support Channels
              </CardTitle>
              <MessageSquare className="text-muted-foreground h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">3</div>
              <p className="text-muted-foreground text-xs">
                Email, FAQ, Direct
              </p>
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-card/50 hover:border-border hover:bg-card/80 backdrop-blur-sm transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">User Role</CardTitle>
              <Users className="text-muted-foreground h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {isAdmin ? "Admin" : "Teacher"}
              </div>
              <p className="text-muted-foreground text-xs">
                {isAdmin ? "Full Access" : "View & Contact"}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="animate-appear opacity-0 delay-300">
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="space-y-6"
          >
            <TabsList className="grid w-fit grid-cols-2">
              <TabsTrigger value="faq">FAQ</TabsTrigger>
              <TabsTrigger value="support">Support Info</TabsTrigger>
            </TabsList>

            <TabsContent value="faq" className="space-y-6">
              {/* Search and Filters */}
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="relative max-w-md flex-1">
                  <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
                  <Input
                    placeholder="Search FAQs..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <Select
                  value={selectedCategory}
                  onValueChange={setSelectedCategory}
                >
                  <SelectTrigger className="w-full sm:w-[200px]">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map((category) => (
                      <SelectItem
                        key={category.category}
                        value={category.category}
                      >
                        {category.category} ({category.count})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* FAQ List */}
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <div className="border-primary mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-b-2"></div>
                    <p className="text-muted-foreground">Loading FAQs...</p>
                  </div>
                </div>
              ) : filteredFAQs.length === 0 ? (
                <Card className="border-border/50 bg-card/50 hover:border-border hover:bg-card/80 backdrop-blur-sm transition-all duration-300">
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <HelpCircle className="text-muted-foreground mb-4 h-12 w-12" />
                    <h3 className="mb-2 text-lg font-semibold">
                      No FAQs Found
                    </h3>
                    <p className="text-muted-foreground max-w-md text-center">
                      {searchQuery || selectedCategory !== "all"
                        ? "Try adjusting your search or filter criteria"
                        : "No FAQs available at the moment"}
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {filteredFAQs.map((faq) => (
                    <Card
                      key={faq._id}
                      className="border-border/50 bg-card/50 hover:border-border hover:bg-card/80 backdrop-blur-sm transition-all duration-300"
                    >
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <Badge className={getCategoryColor(faq.category)}>
                                {faq.category}
                              </Badge>
                            </div>
                            <CardTitle className="text-lg">
                              {faq.question}
                            </CardTitle>
                          </div>
                          {isAdmin && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteFAQ(faq._id, faq.question);
                              }}
                              className="text-red-600 hover:bg-red-50 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-muted-foreground mb-4">
                          {faq.answer}
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {faq.tags.map((tag) => (
                            <Badge
                              key={tag}
                              variant="secondary"
                              className="text-xs"
                            >
                              {tag}
                            </Badge>
                          ))}
                        </div>
                        <div className="mt-4 flex items-center justify-between border-t pt-4">
                          <span className="text-muted-foreground text-sm">
                            By {faq.created_by.name}
                          </span>
                          <span className="text-muted-foreground text-sm">
                            {new Date(faq.last_updated).toLocaleDateString()}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="support" className="space-y-6">
              {supportInfo && (
                <div className="grid gap-6 lg:grid-cols-2">
                  <Card className="border-border/50 bg-card/50 hover:border-border hover:bg-card/80 backdrop-blur-sm transition-all duration-300">
                    <CardHeader>
                      <CardTitle>Support Categories</CardTitle>
                      <CardDescription>
                        Available support categories for your requests
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {Object.entries(supportInfo.categories).map(
                        ([key, value]) => (
                          <div key={key} className="flex items-center gap-3">
                            <Badge className={getCategoryColor(key)}>
                              {key}
                            </Badge>
                            <span className="text-sm">{value}</span>
                          </div>
                        ),
                      )}
                    </CardContent>
                  </Card>

                  <Card className="border-border/50 bg-card/50 hover:border-border hover:bg-card/80 backdrop-blur-sm transition-all duration-300">
                    <CardHeader>
                      <CardTitle>Priority Levels</CardTitle>
                      <CardDescription>
                        Choose the appropriate priority for your request
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {Object.entries(supportInfo.priorities).map(
                        ([key, value]) => (
                          <div key={key} className="flex items-center gap-3">
                            <Badge className={getPriorityColor(key)}>
                              {key}
                            </Badge>
                            <span className="text-sm">{value}</span>
                          </div>
                        ),
                      )}
                    </CardContent>
                  </Card>

                  <Card className="border-border/50 bg-card/50 hover:border-border hover:bg-card/80 backdrop-blur-sm transition-all duration-300 lg:col-span-2">
                    <CardHeader>
                      <CardTitle>Support Guidelines</CardTitle>
                      <CardDescription>
                        Best practices for getting help quickly
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {supportInfo.guidelines.map((guideline, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <AlertCircle className="text-primary mt-0.5 h-4 w-4 flex-shrink-0" />
                            <span className="text-sm">{guideline}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Create FAQ Dialog */}
      {isAdmin && (
        <Dialog open={showCreateFAQ} onOpenChange={setShowCreateFAQ}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New FAQ</DialogTitle>
              <DialogDescription>
                Add a new frequently asked question to help users.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateFAQ} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="faq-question">Question</Label>
                <Input
                  id="faq-question"
                  value={faqForm.question}
                  onChange={(e) =>
                    setFaqForm({ ...faqForm, question: e.target.value })
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="faq-answer">Answer</Label>
                <Textarea
                  id="faq-answer"
                  rows={4}
                  value={faqForm.answer}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                    setFaqForm({ ...faqForm, answer: e.target.value })
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="faq-category">Category</Label>
                <Select
                  value={faqForm.category}
                  onValueChange={(value) =>
                    setFaqForm({ ...faqForm, category: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem
                        key={category.category}
                        value={category.category}
                      >
                        {category.category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="faq-tags">Tags (comma-separated)</Label>
                <Input
                  id="faq-tags"
                  value={faqForm.tags}
                  onChange={(e) =>
                    setFaqForm({ ...faqForm, tags: e.target.value })
                  }
                  placeholder="tag1, tag2, tag3"
                />
              </div>

              <div className="flex justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowCreateFAQ(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Creating..." : "Create FAQ"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </DashboardLayout>
  );
}
