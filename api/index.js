import "dotenv/config";
import express from "express";
import cors from "cors";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";

const app = express();
const prisma = new PrismaClient();
const port = Number(process.env.PORT) || 3000;
const host = "0.0.0.0";
const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-change-me";

app.use(cors());
app.use(express.json());

const signToken = (user) =>
  jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: "12h" }
  );

const authenticate = (req, res, next) => {
  const header = req.headers.authorization;
  if (!header) return res.status(401).json({ message: "Missing token" });
  const [, token] = header.split(" ");
  if (!token) return res.status(401).json({ message: "Missing token" });
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    return next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }
};

const requireAdmin = (req, res, next) => {
  if (req.user?.role !== "ADMIN") {
    return res.status(403).json({ message: "Admin only" });
  }
  return next();
};

app.get("/health", (_req, res) => {
  res.json({ status: "healthy" });
});

app.post("/api/auth/register", async (req, res) => {
  const { email, password, name, role, adminCode } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }
  try {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(409).json({ message: "Email already registered" });
    }
    let finalRole = "USER";
    if (role === "ADMIN") {
      const expectedCode = process.env.ADMIN_CODE;
      if (expectedCode && adminCode === expectedCode) {
        finalRole = "ADMIN";
      } else {
        return res
          .status(403)
          .json({ message: "Invalid admin code for ADMIN registration" });
      }
    }
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { email, name, passwordHash, role: finalRole },
      select: { id: true, email: true, name: true, role: true },
    });
    const token = signToken(user);
    return res.status(201).json({ user, token });
  } catch (err) {
    console.error("register error", err);
    return res.status(500).json({ message: "Failed to register" });
  }
});

app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(401).json({ message: "Invalid credentials" });
    const token = signToken(user);
    const safeUser = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    };
    return res.json({ user: safeUser, token });
  } catch (err) {
    console.error("login error", err);
    return res.status(500).json({ message: "Failed to login" });
  }
});

app.get("/api/categories", async (_req, res) => {
  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
  });
  res.json(categories);
});

app.post("/api/categories", authenticate, requireAdmin, async (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ message: "Name is required" });
  try {
    const category = await prisma.category.create({ data: { name } });
    return res.status(201).json(category);
  } catch (err) {
    console.error("create category error", err);
    return res.status(500).json({ message: "Failed to create category" });
  }
});

const buildEventFilters = (query) => {
  const filters = {};
  if (query.search) {
    filters.OR = [
      { title: { contains: query.search, mode: "insensitive" } },
      { description: { contains: query.search, mode: "insensitive" } },
      { location: { contains: query.search, mode: "insensitive" } },
    ];
  }
  if (query.categoryId) {
    filters.categoryId = Number(query.categoryId);
  }
  if (query.dateFrom || query.dateTo) {
    filters.startAt = {};
    if (query.dateFrom) filters.startAt.gte = new Date(query.dateFrom);
    if (query.dateTo) filters.startAt.lte = new Date(query.dateTo);
  }
  return filters;
};

app.get("/api/events", async (req, res) => {
  const { includeUnpublished, includeBlocked } = req.query;
  const filters = buildEventFilters(req.query);
  if (!includeUnpublished) filters.published = true;
  if (!includeBlocked) filters.blocked = false;
  try {
    const events = await prisma.event.findMany({
      where: filters,
      include: {
        category: true,
        ratings: { select: { stars: true } },
        createdBy: { select: { id: true, name: true, email: true } },
      },
      orderBy: { startAt: "asc" },
    });
    const withAverages = events.map((e) => {
      const total = e.ratings.reduce((sum, r) => sum + r.stars, 0);
      const avg = e.ratings.length ? total / e.ratings.length : null;
      return { ...e, averageRating: avg, ratingsCount: e.ratings.length };
    });
    return res.json(withAverages);
  } catch (err) {
    console.error("list events error", err);
    return res.status(500).json({ message: "Failed to fetch events" });
  }
});

app.get("/api/events/:id", async (req, res) => {
  const id = Number(req.params.id);
  const event = await prisma.event.findUnique({
    where: { id },
    include: {
      category: true,
      createdBy: { select: { id: true, name: true, email: true } },
      ratings: {
        include: { user: { select: { id: true, name: true, email: true } } },
        orderBy: { createdAt: "desc" },
      },
    },
  });
  if (!event) return res.status(404).json({ message: "Event not found" });
  const total = event.ratings.reduce((sum, r) => sum + r.stars, 0);
  const avg = event.ratings.length ? total / event.ratings.length : null;
  return res.json({ ...event, averageRating: avg, ratingsCount: event.ratings.length });
});

app.post("/api/events", authenticate, async (req, res) => {
  const {
    title,
    description,
    location,
    imageUrl,
    startAt,
    endAt,
    categoryId,
    published = true,
  } = req.body;
  if (!title || !startAt) {
    return res.status(400).json({ message: "Title and startAt are required" });
  }
  try {
    const event = await prisma.event.create({
      data: {
        title,
        description,
        location,
        imageUrl,
        startAt: new Date(startAt),
        endAt: endAt ? new Date(endAt) : null,
        published,
        blocked: false,
        category: categoryId ? { connect: { id: Number(categoryId) } } : undefined,
        createdBy: { connect: { id: req.user.id } },
      },
      include: { category: true },
    });
    return res.status(201).json(event);
  } catch (err) {
    console.error("create event error", err);
    return res.status(500).json({ message: "Failed to create event" });
  }
});

app.put("/api/events/:id", authenticate, async (req, res) => {
  const id = Number(req.params.id);
  const existing = await prisma.event.findUnique({ where: { id } });
  if (!existing) return res.status(404).json({ message: "Event not found" });
  if (req.user.role !== "ADMIN" && existing.createdById !== req.user.id) {
    return res.status(403).json({ message: "Not allowed" });
  }
  const {
    title,
    description,
    location,
    imageUrl,
    startAt,
    endAt,
    categoryId,
    published,
    blocked,
  } = req.body;
  try {
    const event = await prisma.event.update({
      where: { id },
      data: {
        title,
        description,
        location,
        imageUrl,
        startAt: startAt ? new Date(startAt) : undefined,
        endAt: endAt ? new Date(endAt) : undefined,
        published,
        blocked,
        category: categoryId
          ? { connect: { id: Number(categoryId) } }
          : categoryId === null
          ? { disconnect: true }
          : undefined,
      },
      include: { category: true },
    });
    return res.json(event);
  } catch (err) {
    console.error("update event error", err);
    return res.status(500).json({ message: "Failed to update event" });
  }
});

app.delete("/api/events/:id", authenticate, async (req, res) => {
  const id = Number(req.params.id);
  const existing = await prisma.event.findUnique({ where: { id } });
  if (!existing) return res.status(404).json({ message: "Event not found" });
  if (req.user.role !== "ADMIN" && existing.createdById !== req.user.id) {
    return res.status(403).json({ message: "Not allowed" });
  }
  try {
    await prisma.event.delete({ where: { id } });
    return res.json({ message: "Deleted" });
  } catch (err) {
    console.error("delete event error", err);
    return res.status(500).json({ message: "Failed to delete event" });
  }
});

app.post("/api/events/:id/rate", authenticate, async (req, res) => {
  const eventId = Number(req.params.id);
  const { stars, comment } = req.body;
  if (!stars || stars < 1 || stars > 5) {
    return res.status(400).json({ message: "Stars must be 1-5" });
  }
  const event = await prisma.event.findUnique({ where: { id: eventId } });
  if (!event) return res.status(404).json({ message: "Event not found" });
  if (!event.published || event.blocked) {
    return res.status(400).json({ message: "Event not available for rating" });
  }
  try {
    const rating = await prisma.rating.upsert({
      where: {
        eventId_userId: { eventId, userId: req.user.id },
      },
      update: { stars, comment },
      create: {
        stars,
        comment,
        event: { connect: { id: eventId } },
        user: { connect: { id: req.user.id } },
      },
      include: { user: { select: { id: true, name: true, email: true } } },
    });
    return res.status(201).json(rating);
  } catch (err) {
    console.error("rate event error", err);
    return res.status(500).json({ message: "Failed to rate event" });
  }
});

app.listen(port, host, () => {
  console.log(`API server listening on http://${host}:${port}`);
});
