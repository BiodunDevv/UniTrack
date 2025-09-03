// Utility function to detect mobile devices
export const isMobileDevice = (): boolean => {
  if (typeof window === "undefined") return false;

  // Check user agent
  const userAgent =
    navigator.userAgent ||
    navigator.vendor ||
    (window as Window & { opera?: string }).opera ||
    "";

  // Mobile user agents
  const mobileRegex =
    /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i;

  // Check screen size as well
  const isMobileSize = window.innerWidth <= 768;

  // Check touch capability
  const isTouchDevice =
    "ontouchstart" in window || navigator.maxTouchPoints > 0;

  return mobileRegex.test(userAgent) || (isMobileSize && isTouchDevice);
};

// Utility function to detect tablet devices specifically
export const isTabletDevice = (): boolean => {
  if (typeof window === "undefined") return false;

  const userAgent =
    navigator.userAgent ||
    navigator.vendor ||
    (window as Window & { opera?: string }).opera ||
    "";

  // Tablet user agents
  const tabletRegex =
    /ipad|android(?!.*mobile)|tablet|kindle|silk|playbook|rim tablet/i;

  // Check screen size for tablets (usually between 768px and 1024px)
  const isTabletSize = window.innerWidth >= 768 && window.innerWidth <= 1024;

  return tabletRegex.test(userAgent) || isTabletSize;
};

// Combined check for mobile or tablet
export const isMobileOrTablet = (): boolean => {
  return isMobileDevice() || isTabletDevice();
};

// Format numbers with commas
export const formatNumber = (num: number): string => {
  return num.toLocaleString();
};

// Format currency
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
};

// Format date
export const formatDate = (date: string | Date): string => {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

// Format time
export const formatTime = (date: string | Date): string => {
  return new Date(date).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

// Get time-based greeting
export const getTimeBasedGreeting = (): string => {
  const hour = new Date().getHours();
  if (hour < 12) return "Good Morning";
  if (hour < 17) return "Good Afternoon";
  return "Good Evening";
};

// Calculate attendance rate
export const calculateAttendanceRate = (
  present: number,
  total: number,
): number => {
  if (total === 0) return 0;
  return Math.round((present / total) * 100);
};

// Get status color
export const getStatusColor = (status: string): string => {
  switch (status.toLowerCase()) {
    case "present":
      return "text-green-600";
    case "absent":
      return "text-red-600";
    case "late":
      return "text-orange-600";
    default:
      return "text-gray-600";
  }
};

// Get status badge variant
export const getStatusBadgeVariant = (
  status: string,
): "default" | "secondary" | "destructive" | "outline" => {
  switch (status.toLowerCase()) {
    case "present":
      return "default";
    case "absent":
      return "destructive";
    case "late":
      return "secondary";
    default:
      return "outline";
  }
};
