require("dotenv").config();
const path = require("path");
const express = require("express");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const cors = require("cors");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const connectDB = require("./utils/db");
const errorHandler = require("./middleware/errorHandler");
const authRoutes = require("./routes/authRoutes");
const adminRoutes = require("./routes/adminRoutes");
const electionRoutes = require("./routes/electionRoutes");
const candidateRoutes = require("./routes/candidateRoutes");
const voterRoutes = require("./routes/voterRoutes");
const voteRoutes = require("./routes/voteRoutes");
const { refreshElectionStatuses } = require("./utils/status");

const app = express();
const PORT = process.env.PORT || 5000;
// const PORT = process.env.PORT || 5800;
const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";
// const CLIENT_URL = process.env.CLIENT_URL || "https://election.albasrawie.com";
const NODE_ENV = process.env.NODE_ENV || "development";
const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/election_management";

connectDB();

app.use(
  cors({
    origin: CLIENT_URL,
    credentials: true
  })
);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan("dev"));
app.use(
  session({
    name: "ems.sid",
    secret: process.env.SESSION_SECRET || "change-me",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000,
      sameSite: "lax",
      secure: NODE_ENV === "production"
    },
    store: MongoStore.create({
      mongoUrl: MONGO_URI,
      collectionName: "sessions"
    })
  })
);

app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.get("/api/health", (_req, res) => res.json({ ok: true }));

app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/elections", electionRoutes);
app.use("/api/candidates", candidateRoutes);
app.use("/api/voter", voterRoutes);
app.use("/api/votes", voteRoutes);

app.use(errorHandler);

app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);
  await refreshElectionStatuses();
  setInterval(refreshElectionStatuses, 30 * 1000);
});
