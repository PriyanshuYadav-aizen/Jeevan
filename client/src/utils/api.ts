/// <reference types="vite/client" />
// Centralized API definitions

export const development = "http://localhost:5000" as const;
export const deployment = "https://jeevan-dphd.onrender.com";

// Auto-detect environment: if running on localhost, use development, otherwise use deployment
// Or use environment variables: VITE_API_BASE_URL or VITE_ENVIRONMENT
function detectEnvironment() {
  // Check if VITE_API_BASE_URL is explicitly set
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL;
  }
  
  // Check if VITE_ENVIRONMENT is set
  const env = import.meta.env.VITE_ENVIRONMENT;
  if (env === "deployment" || env === "production") {
    return deployment;
  }
  if (env === "development") {
    return development;
  }
  
  // Auto-detect: if window.location.hostname is localhost or 127.0.0.1, use development
  // Otherwise, use relative URLs (empty string) when deployed on same domain,
  // or use deployment URL if backend is on different domain
  if (typeof window !== "undefined") {
    const hostname = window.location.hostname;
    if (hostname === "localhost" || hostname === "127.0.0.1" || hostname === "") {
      return development;
    }
    // When deployed, check if we're on the deployment domain
    if (hostname.includes("render.com") || hostname.includes("jeevan")) {
      // If frontend and backend are on same domain, use relative URLs
      // Otherwise use the full deployment URL
      return ""; // Empty string means relative URLs (same domain)
    }
  }
  
  // Default to development for SSR/build time
  return development;
}

export const API_BASE = detectEnvironment();

export const API_PATHS = {
  root: "/",
  auth: {
    base: "/api/auth",
    register: "/api/auth/register",
    login: "/api/auth/login",
    me: "/api/auth/me",
  },
  staff: {
    base: "/api/staff",
    byId: (id: string | number) => `/api/staff/${id}`,
  },
  applications: {
    base: "/api/applications",
    statusById: (id: string | number) => `/api/applications/${id}/status`,
  },
  adminApplications: {
    base: "/api/admin/applications",
    byId: (id: string | number) => `/api/admin/applications/${id}`,
    approve: (id: string | number) => `/api/admin/applications/${id}/approve`,
    reject: (id: string | number) => `/api/admin/applications/${id}/reject`,
  },
  adminUsers: {
    base: "/api/admin/users",
    byRole: (role: string) => `/api/admin/users/${role}`,
    byRoleAndId: (role: string, id: string | number) => `/api/admin/users/${role}/${id}`,
  },
  payments: {
    base: "/api/payments",
    createOrder: "/api/payments/create-order",
    verify: "/api/payments/verify",
  },
  publicWorkers: {
    base: "/api/workers",
    byRole: (role: string) => `/api/workers/${role}`,
    byRoleAndId: (role: string, id: string | number) => `/api/workers/${role}/${id}`,
  },
  chatbot: {
    base: "/api/chatbot",
    chat: "/api/chatbot/chat",
    recommendWorkers: "/api/chatbot/recommend-workers",
  },
  bookings: {
    base: "/api/bookings",
    create: "/api/bookings",
    patientBookings: "/api/bookings/patient/me",
    workerBookings: "/api/bookings/worker/me",
    byId: (id: string) => `/api/bookings/${id}`,
    updateStatus: (id: string) => `/api/bookings/${id}/status`,
    cancel: (id: string) => `/api/bookings/${id}`,
    all: "/api/bookings",
  },
  reviews: {
    base: "/api/reviews",
    submit: (bookingId: string) => `/api/reviews/booking/${bookingId}`,
    getBookingReview: (bookingId: string) => `/api/reviews/booking/${bookingId}`,
    getWorkerReviews: (workerId: string) => `/api/reviews/worker/${workerId}`,
    update: (reviewId: string) => `/api/reviews/${reviewId}`,
  },
} as const;

export function apiUrl(path: string): string {
  return `${API_BASE}${path}`;
}

export const API_URLS = {
  developmentBase: development,
  deploymentBase: deployment,
  base: API_BASE,
  auth: {
    register: () => apiUrl(API_PATHS.auth.register),
    login: () => apiUrl(API_PATHS.auth.login),
    me: () => apiUrl(API_PATHS.auth.me),
  },
  staff: {
    list: () => apiUrl(API_PATHS.staff.base),
    create: () => apiUrl(API_PATHS.staff.base),
    getById: (id: string | number) => apiUrl(API_PATHS.staff.byId(id)),
    updateById: (id: string | number) => apiUrl(API_PATHS.staff.byId(id)),
    deleteById: (id: string | number) => apiUrl(API_PATHS.staff.byId(id)),
  },
  applications: {
    submit: () => apiUrl(API_PATHS.applications.base),
    statusById: (id: string | number) => apiUrl(API_PATHS.applications.statusById(id)),
  },
  adminApplications: {
    list: () => apiUrl(API_PATHS.adminApplications.base),
    getById: (id: string | number) => apiUrl(API_PATHS.adminApplications.byId(id)),
    approve: (id: string | number) => apiUrl(API_PATHS.adminApplications.approve(id)),
    reject: (id: string | number) => apiUrl(API_PATHS.adminApplications.reject(id)),
  },
  adminUsers: {
    listByRole: (role: string) => apiUrl(API_PATHS.adminUsers.byRole(role)),
    getByRoleAndId: (role: string, id: string | number) => apiUrl(API_PATHS.adminUsers.byRoleAndId(role, id)),
    updateByRoleAndId: (role: string, id: string | number) => apiUrl(API_PATHS.adminUsers.byRoleAndId(role, id)),
    deleteByRoleAndId: (role: string, id: string | number) => apiUrl(API_PATHS.adminUsers.byRoleAndId(role, id)),
  },
  payments: {
    createOrder: () => apiUrl(API_PATHS.payments.createOrder),
    verify: () => apiUrl(API_PATHS.payments.verify),
  },
  chatbot: {
    chat: () => apiUrl(API_PATHS.chatbot.chat),
    recommendWorkers: () => apiUrl(API_PATHS.chatbot.recommendWorkers),
  },
  publicWorkers: {
    listAll: () => apiUrl(API_PATHS.publicWorkers.base),
    listByRole: (role: string) => apiUrl(API_PATHS.publicWorkers.byRole(role)),
    getById: (role: string, id: string | number) => apiUrl(API_PATHS.publicWorkers.byRoleAndId(role, id)),
  },
  bookings: {
    create: () => apiUrl(API_PATHS.bookings.create),
    getPatientBookings: () => apiUrl(API_PATHS.bookings.patientBookings),
    getWorkerBookings: () => apiUrl(API_PATHS.bookings.workerBookings),
    getById: (id: string) => apiUrl(API_PATHS.bookings.byId(id)),
    updateStatus: (id: string) => apiUrl(API_PATHS.bookings.updateStatus(id)),
    cancel: (id: string) => apiUrl(API_PATHS.bookings.cancel(id)),
    getAll: () => apiUrl(API_PATHS.bookings.all),
  },
  reviews: {
    submit: (bookingId: string) => apiUrl(API_PATHS.reviews.submit(bookingId)),
    getBookingReview: (bookingId: string) => apiUrl(API_PATHS.reviews.getBookingReview(bookingId)),
    getWorkerReviews: (workerId: string) => apiUrl(API_PATHS.reviews.getWorkerReviews(workerId)),
    update: (reviewId: string) => apiUrl(API_PATHS.reviews.update(reviewId)),
  },
} as const;


