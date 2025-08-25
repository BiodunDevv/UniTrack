export const siteConfig = {
  name: "UniTrack",
  url: "https://UniTrack.edu",
  getStartedUrl: "https://github.com/UniTrack/UniTrack-backend",
  ogImage: "https://UniTrack.edu/og.jpg",
  description:
    "A comprehensive attendance management system with geolocation verification, real-time monitoring, and automated reporting for educational institutions.",
  links: {
    twitter: "https://twitter.com/UniTrack",
    github: "https://github.com/UniTrack/UniTrack-backend",
    email: "mailto:contact@UniTrack.edu",
  },
  pricing: {
    pro: "#contact",
    team: "#contact",
  },
  stats: {
    institutions: 150,
    students: 25000,
    sessions: 50000,
    total: "75k+",
    updated: "25 Aug 2025",
    features: 12,
    locations: 300,
    accuracy: 99.8,
    courses: 2500,
    teachers: 800,
  },
};

export type SiteConfig = typeof siteConfig;
