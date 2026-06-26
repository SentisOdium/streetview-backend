import express from "express";
import hotspotRouter from "./routes/nodeRoutes/HotspotRoute.js";
import adminRouter from "./routes/admin/adminRouter.js";
import adminAuthRoutes from "./routes/adminAuthRoutes.js";
import usabilityRoutes from "./routes/usabilityRoutes.js";
import cors from "cors";
import helmet from "helmet";
import path from "path";
import { fileURLToPath } from "url";
import cookieParser from "cookie-parser";
import { publicApiLimiter } from "./middleware/rateLimiter.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();

// Secure CORS - allow credentials only for configured origins
const allowedOrigins = [
  "http://localhost:5173",
  process.env.CORS_ORIGIN
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow non-browser requests (like mobile or curl)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1 || allowedOrigins.includes("*")) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true
}));

app.use(express.json());
app.use(cookieParser());
app.use(helmet({ crossOriginResourcePolicy: false }));

// Attach specific rate limiters BEFORE route logic
app.use("/api/admin-auth", adminAuthRoutes);
app.use("/api/admin", adminRouter);
app.use("/api/usability", usabilityRoutes);
app.use("/api", publicApiLimiter, hotspotRouter);
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Global JSON Error Handler
app.use((err, req, res, _next) => {
  const statusCode = err.statusCode || err.status || 500;
  const isProduction = process.env.NODE_ENV === "production";

  if (statusCode === 500) {
    console.error("CRITICAL UNHANDLED ERROR:", err);
  } else {
    console.warn(`[API Error ${statusCode}]:`, err.message);
  }

  res.status(statusCode).json({
    success: false,
    message: isProduction && !err.isOperational && statusCode === 500
      ? "An internal server error occurred."
      : err.message,
    data: null,
    ...(isProduction ? {} : { stack: err.stack }),
  });
});

export default app;

