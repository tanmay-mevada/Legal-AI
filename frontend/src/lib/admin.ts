// Admin configuration
export const ADMIN_EMAILS = [
  "admin@legalai.com",
  "tanma@example.com", // Add more admin emails as needed
];

export const isUserAdmin = (email: string | null): boolean => {
  return email ? ADMIN_EMAILS.includes(email) : false;
};