import rateLimit from "express-rate-limit";

// Rate limit public navigation API routes
export const publicApiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per window
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: {
    success: false,
    message: "Too many navigation requests from this IP. Please try again after 15 minutes.",
  },
});

// Rate limit administrator login attempts to prevent brute-force attacks
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 failed login attempts per window
  skipSuccessfulRequests: true, // Do not penalize valid administrators logging in
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many failed login attempts from this IP. Please try again after a few minutes.",
  },
});
