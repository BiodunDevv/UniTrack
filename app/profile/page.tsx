"use client";

import {
  ArrowLeft,
  Calendar,
  Clock,
  Eye,
  EyeOff,
  Lock,
  Mail,
  Save,
  Shield,
  User,
  UserCheck,
} from "lucide-react";
import React, { useEffect, useState } from "react";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuthStore } from "@/store/auth-store";
import { useProfileStore } from "@/store/profile-store";

const ProfilePage = () => {
  const { user, updateUser } = useAuthStore();
  const {
    profile,
    isLoading,
    error,
    updateSuccess,
    getProfile,
    updateProfile,
    clearError,
    clearSuccess,
  } = useProfileStore();

  // Form states
  const [profileForm, setProfileForm] = useState({
    name: "",
  });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  // Loading states
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  // Load profile on mount
  useEffect(() => {
    getProfile();
  }, [getProfile]);

  // Update form when profile loads
  useEffect(() => {
    if (profile) {
      setProfileForm({
        name: profile.name,
      });
    }
  }, [profile]);

  // Handle success notifications
  useEffect(() => {
    if (updateSuccess) {
      toast.success("Profile updated successfully!", {
        description:
          "Your changes have been saved and applied across the application.",
      });
      clearSuccess();
      // Clear password form on successful update
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    }
  }, [updateSuccess, clearSuccess]);

  // Handle error notifications
  useEffect(() => {
    if (error) {
      toast.error(error);
      clearError();
    }
  }, [error, clearError]);

  // Handle profile update (name only)
  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileForm.name.trim()) {
      toast.error("Name is required");
      return;
    }

    setIsUpdatingProfile(true);

    // Optimistically update the auth store immediately for better UX
    updateUser({ name: profileForm.name });

    try {
      await updateProfile({ name: profileForm.name });
    } catch {
      // If update fails, revert the optimistic update
      if (profile?.name) {
        updateUser({ name: profile.name });
      }
      // Error is handled by the store and useEffect
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  // Password validation function
  const validatePassword = (password: string) => {
    const minLength = 6;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasNumber = /\d/.test(password);

    if (password.length < minLength) {
      return "Password must be at least 6 characters long";
    }
    if (!hasUpperCase) {
      return "Password must contain at least one uppercase letter";
    }
    if (!hasNumber) {
      return "Password must contain at least one number";
    }
    return null;
  };

  // Handle password update
  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!passwordForm.currentPassword) {
      toast.error("Current password is required");
      return;
    }
    if (!passwordForm.newPassword) {
      toast.error("New password is required");
      return;
    }

    // Validate new password format
    const passwordError = validatePassword(passwordForm.newPassword);
    if (passwordError) {
      toast.error(passwordError);
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }

    setIsUpdatingPassword(true);
    try {
      await updateProfile({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
        confirmPassword: passwordForm.confirmPassword,
      });
    } catch {
      // Error is handled by the store and useEffect
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  // Handle combined update (name and password)
  const handleCombinedUpdate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!profileForm.name.trim()) {
      toast.error("Name is required");
      return;
    }
    if (!passwordForm.currentPassword) {
      toast.error("Current password is required");
      return;
    }
    if (!passwordForm.newPassword) {
      toast.error("New password is required");
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      toast.error("New password must be at least 6 characters");
      return;
    }

    setIsUpdatingProfile(true);
    setIsUpdatingPassword(true);

    // Optimistically update the auth store immediately for better UX
    updateUser({ name: profileForm.name });

    try {
      await updateProfile({
        name: profileForm.name,
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
        confirmPassword: passwordForm.confirmPassword,
      });
    } catch {
      // If update fails, revert the optimistic update
      if (profile?.name) {
        updateUser({ name: profile.name });
      }
      // Error is handled by the store and useEffect
    } finally {
      setIsUpdatingProfile(false);
      setIsUpdatingPassword(false);
    }
  };

  const togglePasswordVisibility = (field: keyof typeof showPasswords) => {
    setShowPasswords((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (isLoading && !profile) {
    return (
      <DashboardLayout>
        <div className="flex min-h-screen flex-1 items-center justify-center">
          <div className="text-center">
            <div className="border-primary mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-b-2"></div>
            <p className="text-muted-foreground">Loading profile...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        {/* Breadcrumb */}
        <div className="animate-appear ml-2 opacity-0">
          <Breadcrumb items={[{ label: "Profile Settings", current: true }]} />
        </div>

        <Button variant="outline" className="mr-auto md:hidden">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>

        {/* Hero Section */}
        <div className="animate-appear from-primary/10 via-primary/5 rounded-lg bg-gradient-to-r to-transparent p-4 opacity-0 delay-100 sm:p-6">
          <div className="max-w-3xl">
            <h1 className="mb-4 text-2xl font-bold lg:text-4xl">
              Profile Settings
            </h1>
            <p className="text-muted-foreground text-md mb-6">
              Manage your account information, security settings, and personal
              preferences.
              {profile?.role === "admin"
                ? " As an administrator, you have advanced privileges."
                : " Keep your teaching profile up to date."}
            </p>
          </div>
        </div>

        {/* Profile Overview Card */}
        <div className="animate-appear opacity-0 delay-200">
          <Card className="border-border/50 bg-card/50 hover:border-border hover:bg-card/80 backdrop-blur-sm transition-all duration-300">
            <CardHeader>
              <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:space-y-0 sm:space-x-4">
                <div className="bg-primary/10 w-fit rounded-full p-4">
                  <User className="text-primary h-8 w-8" />
                </div>
                <div className="min-w-0 flex-1">
                  <CardTitle
                    className={`text-xl break-words transition-all duration-300 ${
                      isUpdatingProfile ? "text-primary/70" : ""
                    }`}
                  >
                    {user?.name || profile?.name}
                  </CardTitle>
                  <CardDescription className="text-base break-words">
                    {profile?.email || user?.email}
                  </CardDescription>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <Badge
                      variant="outline"
                      className="bg-primary/5 text-primary border-primary/20"
                    >
                      <UserCheck className="mr-1 h-3 w-3" />
                      {profile?.role === "admin" ? "Administrator" : "Teacher"}
                    </Badge>
                    {profile?.email_verified && (
                      <Badge
                        variant="outline"
                        className="border-green-200 bg-green-50 text-green-700"
                      >
                        <Mail className="mr-1 h-3 w-3" />
                        Verified
                      </Badge>
                    )}
                    {profile?.role === "admin" && profile?.is_super_admin && (
                      <Badge
                        variant="outline"
                        className="border-orange-200 bg-orange-50 text-orange-700"
                      >
                        <Shield className="mr-1 h-3 w-3" />
                        Super Admin
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </CardHeader>
            {profile && (
              <CardContent className="pt-0">
                <div className="text-muted-foreground grid grid-cols-1 gap-4 text-sm md:grid-cols-2">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>Joined: {formatDate(profile.created_at)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <span>Last login: {formatDate(profile.last_login)}</span>
                  </div>
                  {profile.role === "admin" && profile.status && (
                    <div className="flex items-center gap-2">
                      <span
                        className={`h-2 w-2 rounded-full ${
                          profile.status === "active"
                            ? "bg-green-500"
                            : "bg-gray-400"
                        }`}
                      />
                      <span>Status: {profile.status}</span>
                    </div>
                  )}
                  {profile.role === "admin" && profile.permissions && (
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4" />
                      <span>Permissions: {profile.permissions.length}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            )}
          </Card>
        </div>

        <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
          {/* Update Name */}
          <div className="animate-appear opacity-0 delay-300">
            <Card className="border-border/50 bg-card/50 hover:border-border hover:bg-card/80 backdrop-blur-sm transition-all duration-300">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Personal Information
                </CardTitle>
                <CardDescription>
                  Update your display name and personal details
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleProfileUpdate} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      type="text"
                      value={profileForm.name}
                      onChange={(e) =>
                        setProfileForm({ ...profileForm, name: e.target.value })
                      }
                      placeholder="Enter your full name"
                      disabled={isUpdatingProfile}
                      className={`transition-all duration-300 ${
                        isUpdatingProfile
                          ? "border-primary/50 bg-primary/5"
                          : updateSuccess
                            ? "border-green-500/50 bg-green-50/50 dark:bg-green-900/10"
                            : ""
                      }`}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={profile?.email || user?.email || ""}
                      disabled
                      className="bg-muted"
                    />
                    <p className="text-muted-foreground text-xs">
                      Email address cannot be changed
                    </p>
                  </div>
                  <Button
                    type="submit"
                    disabled={isUpdatingProfile || !profileForm.name.trim()}
                    className="w-full"
                  >
                    {isUpdatingProfile ? (
                      "Updating..."
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Update Profile
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Update Password */}
          <div className="animate-appear opacity-0 delay-400">
            <Card className="border-border/50 bg-card/50 hover:border-border hover:bg-card/80 backdrop-blur-sm transition-all duration-300">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="h-5 w-5" />
                  Security Settings
                </CardTitle>
                <CardDescription>
                  Change your password to keep your account secure
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handlePasswordUpdate} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="current-password">Current Password</Label>
                    <div className="relative">
                      <Input
                        id="current-password"
                        type={showPasswords.current ? "text" : "password"}
                        value={passwordForm.currentPassword}
                        onChange={(e) =>
                          setPasswordForm({
                            ...passwordForm,
                            currentPassword: e.target.value,
                          })
                        }
                        placeholder="Enter current password"
                        disabled={isUpdatingPassword}
                        className="pr-10"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute top-0 right-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => togglePasswordVisibility("current")}
                      >
                        {showPasswords.current ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="new-password">New Password</Label>
                    <div className="relative">
                      <Input
                        id="new-password"
                        type={showPasswords.new ? "text" : "password"}
                        value={passwordForm.newPassword}
                        onChange={(e) =>
                          setPasswordForm({
                            ...passwordForm,
                            newPassword: e.target.value,
                          })
                        }
                        placeholder="Enter new password"
                        disabled={isUpdatingPassword}
                        className="pr-10"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute top-0 right-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => togglePasswordVisibility("new")}
                      >
                        {showPasswords.new ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">
                      Confirm New Password
                    </Label>
                    <div className="relative">
                      <Input
                        id="confirm-password"
                        type={showPasswords.confirm ? "text" : "password"}
                        value={passwordForm.confirmPassword}
                        onChange={(e) =>
                          setPasswordForm({
                            ...passwordForm,
                            confirmPassword: e.target.value,
                          })
                        }
                        placeholder="Confirm new password"
                        disabled={isUpdatingPassword}
                        className="pr-10"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute top-0 right-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => togglePasswordVisibility("confirm")}
                      >
                        {showPasswords.confirm ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                  <Button
                    type="submit"
                    disabled={
                      isUpdatingPassword ||
                      !passwordForm.currentPassword ||
                      !passwordForm.newPassword ||
                      !passwordForm.confirmPassword ||
                      passwordForm.newPassword !== passwordForm.confirmPassword
                    }
                    className="w-full"
                  >
                    {isUpdatingPassword ? (
                      "Updating..."
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Update Password
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Combined Update Card */}
        <div className="animate-appear opacity-0 delay-500">
          <Card className="border-border/50 bg-card/50 hover:border-border hover:bg-card/80 backdrop-blur-sm transition-all duration-300">
            <CardHeader>
              <CardTitle>Update Both Name and Password</CardTitle>
              <CardDescription>
                Update your name and password simultaneously in one action
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCombinedUpdate}>
                <Button
                  type="submit"
                  disabled={
                    isUpdatingProfile ||
                    isUpdatingPassword ||
                    !profileForm.name.trim() ||
                    !passwordForm.currentPassword ||
                    !passwordForm.newPassword ||
                    !passwordForm.confirmPassword ||
                    passwordForm.newPassword !== passwordForm.confirmPassword
                  }
                  className="w-full"
                  size="lg"
                >
                  {isUpdatingProfile || isUpdatingPassword ? (
                    "Updating..."
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Update Name & Password
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Admin Permissions Card */}
        {profile?.role === "admin" && profile.permissions && (
          <div className="animate-appear opacity-0 delay-600">
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Administrator Permissions
                </CardTitle>
                <CardDescription>
                  Your current administrative privileges and access levels
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {profile.permissions.map((permission, index) => (
                    <Badge
                      key={index}
                      variant="outline"
                      className="justify-center border-blue-200 bg-blue-50 py-2 text-blue-700"
                    >
                      {permission
                        .replace(/_/g, " ")
                        .replace(/\b\w/g, (l) => l.toUpperCase())}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default ProfilePage;
