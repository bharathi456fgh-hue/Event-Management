const crypto = require("node:crypto");
const express = require("express");
const mongoose = require("mongoose");

const app = express();
const port = Number(process.env.PORT) || 3000;
const seedEvents = [
  {
    name: "Mysuru Dasara Folk Celebration",
    date: "Oct 10, 2026",
    iso: "2026-10-10",
    venue: "Mysuru Palace Grounds, Karnataka",
    region: "Karnataka · Mysuru",
    guests: 320,
    status: "Confirmed",
    image: "photo-1511795409834-ef04bbd61622",
  },
  {
    name: "Onam Sadhya & Thiruvathira",
    date: "Oct 16, 2026",
    iso: "2026-10-16",
    venue: "Kerala Samajam, Bengaluru",
    region: "Kerala · Bengaluru",
    guests: 450,
    status: "Planning",
    image: "photo-1519167758481-83f550bb49b3",
  },
  {
    name: "Carnatic Music & Bharatanatyam Night",
    date: "Oct 22, 2026",
    iso: "2026-10-22",
    venue: "Kalakshetra Foundation, Chennai",
    region: "Tamil Nadu · Chennai",
    guests: 180,
    status: "Confirmed",
    image: "photo-1517248135467-4c7edcad34c4",
  },
  {
    name: "Telangana Janapada Folk Arts Showcase",
    date: "Nov 03, 2026",
    iso: "2026-11-03",
    venue: "Shilparamam, Hyderabad",
    region: "Telangana · Hyderabad",
    guests: 600,
    status: "Planning",
    image: "photo-1511578314322-379afb476865",
  },
  {
    name: "Yakshagana & Coastal Folk Night",
    date: "Nov 14, 2026",
    iso: "2026-11-14",
    venue: "TMA Pai Convention Centre, Mangaluru",
    region: "Karnataka · Coastal",
    guests: 240,
    status: "Confirmed",
    image: "photo-1464366400600-7168b8af9bc3",
  },
];

const seedGuests = [
  {
    name: "Kavya Krishnamurthy",
    email: "kavya@example.com",
    event: seedEvents[0].name,
    rsvp: "Confirmed",
  },
  {
    name: "Anjali Menon",
    email: "anjali@example.com",
    event: seedEvents[1].name,
    rsvp: "Invited",
  },
  {
    name: "Meera Subramanian",
    email: "meera@example.com",
    event: seedEvents[2].name,
    rsvp: "Confirmed",
  },
  {
    name: "Sai Lakshmi Reddy",
    email: "sai@example.com",
    event: seedEvents[3].name,
    rsvp: "Declined",
  },
];

const seedVendors = [
  {
    name: "Mysuru Mane Caterers",
    category: "Kannada cuisine",
    event: seedEvents[0].name,
    status: "Confirmed",
    email: "hello@mysurumane.example",
  },
  {
    name: "Kerala Sadya Collective",
    category: "Onam sadya",
    event: seedEvents[1].name,
    status: "Awaiting quote",
    email: "events@sadyacollective.example",
  },
  {
    name: "Chennai Raaga Sabha",
    category: "Classical artists",
    event: seedEvents[2].name,
    status: "Confirmed",
    email: "booking@raagasabha.example",
  },
  {
    name: "Telangana Janapada Ensemble",
    category: "Folk performance",
    event: seedEvents[3].name,
    status: "In discussion",
    email: "team@janapada.example",
  },
  {
    name: "Coastal Rangotsava",
    category: "Yakshagana & decor",
    event: seedEvents[4].name,
    status: "Confirmed",
    email: "hello@rangotsava.example",
  },
];

const seedTasks = [
  {
    title: "Confirm folk ensemble arrival",
    event: seedEvents[0].name,
    due: "Oct 7",
    done: false,
  },
  {
    title: "Approve Onam sadhya menu",
    event: seedEvents[1].name,
    due: "Oct 8",
    done: false,
  },
  {
    title: "Share artist green-room plan",
    event: seedEvents[2].name,
    due: "Oct 9",
    done: true,
  },
  {
    title: "Review kolam welcome design",
    event: seedEvents[3].name,
    due: "Oct 12",
    done: false,
  },
  {
    title: "Confirm chenda ensemble",
    event: seedEvents[4].name,
    due: "Oct 13",
    done: false,
  },
];

function createModel(name, fields) {
  return mongoose.model(
    name,
    new mongoose.Schema(
      { id: { type: String, required: true, unique: true }, ...fields },
      { versionKey: false },
    ),
  );
}

const Event = createModel("Event", {
  name: String,
  date: String,
  iso: String,
  venue: String,
  region: String,
  guests: Number,
  status: String,
  image: String,
  rating: { type: Number, min: 1, max: 5 },
});
const Guest = createModel("Guest", {
  name: String,
  email: String,
  event: String,
  rsvp: String,
});
const Vendor = createModel("Vendor", {
  name: String,
  category: String,
  event: String,
  status: String,
  email: String,
});
const Task = createModel("Task", {
  title: String,
  event: String,
  due: String,
  done: Boolean,
});
const Settings = createModel("Settings", {
  workspace: String,
  name: String,
  email: String,
  reminders: Boolean,
  weekly: Boolean,
});

function serialize(record) {
  if (!record) return record;
  const { _id, ...data } = record;
  return data;
}

async function seedCollection(Model, records, keyField) {
  const existing = await Model.find(
    { [keyField]: { $exists: true } },
    { [keyField]: 1 },
  ).lean();
  const existingKeys = new Set(existing.map((record) => record[keyField]));
  const missing = records.filter(
    (record) => !existingKeys.has(record[keyField]),
  );
  if (missing.length > 0) {
    await Model.insertMany(
      missing.map((record) => ({ id: crypto.randomUUID(), ...record })),
    );
  }
}

async function initializeDatabase() {
  await seedCollection(Event, seedEvents, "name");
  await seedCollection(Guest, seedGuests, "name");
  await seedCollection(Vendor, seedVendors, "name");
  await seedCollection(Task, seedTasks, "title");
  await Settings.updateOne(
    { id: "workspace" },
    {
      $setOnInsert: {
        id: "workspace",
        workspace: "Smart Event",
        name: "Alex Morgan",
        email: "alex@artscollective.example",
        reminders: true,
        weekly: true,
      },
    },
    { upsert: true },
  );
}

app.use(express.json({ limit: "100kb" }));

function text(value, field, maxLength = 120) {
  if (typeof value !== "string" || !value.trim() || value.length > maxLength) {
    const error = new Error(
      `${field} is required and must be under ${maxLength} characters.`,
    );
    error.status = 400;
    throw error;
  }
  return value.trim();
}

function sendError(res, error) {
  res
    .status(error.status || 500)
    .json({ error: error.message || "Internal server error" });
}

function formatDate(iso) {
  return new Date(`${iso}T12:00:00`).toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  });
}

app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    database: "mongodb",
    connected: mongoose.connection.readyState === 1,
  });
});

app.get("/api/events", async (_req, res) => {
  res.json(
    (
      await Event.find({ name: { $exists: true } })
        .sort({ iso: 1, name: 1 })
        .lean()
    ).map(serialize),
  );
});

app.post("/api/events", async (req, res) => {
  try {
    const name = text(req.body.name, "Event name", 70);
    const iso = text(req.body.iso || req.body.date, "Event date", 10);
    if (
      !/^\d{4}-\d{2}-\d{2}$/.test(iso) ||
      Number.isNaN(Date.parse(`${iso}T12:00:00`))
    ) {
      return res.status(400).json({ error: "A valid event date is required." });
    }
    const guests = Number(req.body.guests);
    if (!Number.isInteger(guests) || guests < 1 || guests > 99999) {
      return res
        .status(400)
        .json({ error: "Expected guests must be a positive whole number." });
    }
    const status = req.body.status === "Confirmed" ? "Confirmed" : "Planning";
    const record = {
      id: crypto.randomUUID(),
      name,
      date: formatDate(iso),
      iso,
      venue:
        typeof req.body.venue === "string" && req.body.venue.trim()
          ? req.body.venue.trim().slice(0, 100)
          : "Venue to be confirmed",
      region:
        typeof req.body.region === "string" && req.body.region.trim()
          ? req.body.region.trim().slice(0, 60)
          : "South India",
      guests,
      status,
      image:
        typeof req.body.image === "string" &&
        req.body.image.startsWith("https://")
          ? req.body.image
          : "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=300&q=75",
    };
    await Event.create(record);
    res.status(201).json(record);
  } catch (error) {
    sendError(res, error);
  }
});

app.delete("/api/events/:id", async (req, res) => {
  const result = await Event.deleteOne({ id: req.params.id });
  if (result.deletedCount === 0)
    return res.status(404).json({ error: "Event not found." });
  res.status(204).end();
});

app.patch("/api/events/:id/rating", async (req, res) => {
  const rating = Number(req.body.rating);
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return res
      .status(400)
      .json({ error: "Rating must be a whole number from 1 to 5." });
  }
  const result = await Event.updateOne(
    { id: req.params.id, name: { $exists: true } },
    { $set: { rating } },
    { runValidators: true },
  );
  if (result.matchedCount === 0)
    return res.status(404).json({ error: "Event not found." });
  res.json({ id: req.params.id, rating });
});

app.get("/api/guests", async (_req, res) => {
  res.json((await Guest.find().sort({ name: 1 }).lean()).map(serialize));
});

app.post("/api/guests", async (req, res) => {
  try {
    const record = {
      id: crypto.randomUUID(),
      name: text(req.body.name, "Guest name", 70),
      email: text(req.body.email, "Guest email", 100),
      event: text(req.body.event, "Event", 120),
      rsvp: "Invited",
    };
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(record.email)) {
      return res
        .status(400)
        .json({ error: "Enter a valid guest email address." });
    }
    await Guest.create(record);
    res.status(201).json(record);
  } catch (error) {
    sendError(res, error);
  }
});

app.get("/api/vendors", async (_req, res) => {
  res.json((await Vendor.find().sort({ name: 1 }).lean()).map(serialize));
});

app.post("/api/vendors", async (req, res) => {
  try {
    const record = {
      id: crypto.randomUUID(),
      name: text(req.body.name, "Vendor name", 70),
      category: text(req.body.category, "Vendor service", 50),
      event: text(req.body.event, "Event", 120),
      status: "Awaiting quote",
      email: text(req.body.email, "Vendor email", 100),
    };
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(record.email)) {
      return res
        .status(400)
        .json({ error: "Enter a valid vendor email address." });
    }
    await Vendor.create(record);
    res.status(201).json(record);
  } catch (error) {
    sendError(res, error);
  }
});

app.get("/api/tasks", async (_req, res) => {
  res.json((await Task.find().sort({ done: 1, due: 1 }).lean()).map(serialize));
});

app.post("/api/tasks", async (req, res) => {
  try {
    const record = {
      id: crypto.randomUUID(),
      title: text(req.body.title, "Task title", 90),
      event:
        typeof req.body.event === "string" && req.body.event.trim()
          ? req.body.event.trim().slice(0, 120)
          : "General",
      due:
        typeof req.body.due === "string" && req.body.due.trim()
          ? req.body.due.trim().slice(0, 40)
          : "Unscheduled",
      done: false,
    };
    await Task.create(record);
    res.status(201).json(record);
  } catch (error) {
    sendError(res, error);
  }
});

app.patch("/api/tasks/:id", async (req, res) => {
  if (typeof req.body.done !== "boolean") {
    return res
      .status(400)
      .json({ error: "Task completion must be true or false." });
  }
  const result = await Task.updateOne(
    { id: req.params.id },
    { $set: { done: req.body.done } },
  );
  if (result.matchedCount === 0)
    return res.status(404).json({ error: "Task not found." });
  res.json({ id: req.params.id, done: req.body.done });
});

app.get("/api/settings", async (_req, res) => {
  res.json(serialize(await Settings.findOne({ id: "workspace" }).lean()));
});

app.put("/api/settings", async (req, res) => {
  try {
    const current = await Settings.findOne({ id: "workspace" }).lean();
    const settings = {
      workspace:
        req.body.workspace === undefined
          ? current.workspace
          : text(req.body.workspace, "Workspace name", 55),
      name:
        req.body.name === undefined
          ? current.name
          : text(req.body.name, "Name", 55),
      email:
        req.body.email === undefined
          ? current.email
          : text(req.body.email, "Email", 100),
      reminders:
        req.body.reminders === undefined
          ? current.reminders
          : req.body.reminders === true,
      weekly:
        req.body.weekly === undefined
          ? current.weekly
          : req.body.weekly === true,
    };
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(settings.email)) {
      return res
        .status(400)
        .json({ error: "Enter a valid workspace email address." });
    }
    await Settings.updateOne({ id: "workspace" }, { $set: settings });
    res.json(settings);
  } catch (error) {
    sendError(res, error);
  }
});

app.use("/api", (_req, res) =>
  res.status(404).json({ error: "API route not found." }),
);
app.use(express.static(__dirname, { dotfiles: "ignore", index: "index.html" }));
app.use((error, _req, res, _next) => {
  sendError(res, error);
});

async function start() {
  const mongoUri =
    process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/event_management";
  await mongoose.connect(mongoUri);
  await initializeDatabase();
  app.listen(port, () => {
    console.log(`Gather is running at http://localhost:${port}`);
    console.log(`Connected to MongoDB database: ${mongoose.connection.name}`);
  });
}

start().catch((error) => {
  console.error("Could not connect to MongoDB:", error.message);
  process.exitCode = 1;
});
