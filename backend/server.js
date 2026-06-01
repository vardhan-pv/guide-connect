import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

// In-memory "database"
const clients = new Map(); // socket.id -> { name, email, role, guideId }
const messages = []; // Array of message objects
const bookings = [
  { id: "GC-001", guideId: 1, touristEmail: "emma@example.com", touristName: "Emma Wilson", date: "2026-06-15", time: "09:00", service: "heritage", status: "upcoming", price: 1200, currency: "₹", city: "Jaipur" },
  { id: "GC-002", guideId: 3, touristEmail: "emma@example.com", touristName: "Emma Wilson", date: "2026-07-02", time: "10:00", service: "stays", status: "upcoming", price: 1400, currency: "₹", city: "Kochi" },
  { id: "GC-003", guideId: 2, touristEmail: "emma@example.com", touristName: "Emma Wilson", date: "2026-05-10", time: "08:00", service: "spiritual", status: "completed", price: 1000, currency: "₹", city: "Varanasi" },
];

// Guide availability overrides: guideId -> boolean
const guidesAvailability = new Map([
  [1, true],
  [2, true],
  [3, false],
  [4, true],
  [5, true],
  [6, true],
]);

// HTTP basic endpoint
app.get("/health", (req, res) => {
  res.json({ status: "healthy", activeConnections: clients.size });
});


// ============================================================
// SAAS PLATFORM ROUTES
// ============================================================

// In-memory SaaS data
const saasPlans = {
  starter: { name: "Starter", price: 999, guides: 10, bookings: 50, ai: false },
  professional: { name: "Professional", price: 2999, guides: 50, bookings: 500, ai: true },
  enterprise: { name: "Enterprise", price: 7999, guides: -1, bookings: -1, ai: true }
};

const tenants = [
  { id: "T001", name: "Rajasthan Royal Tours", plan: "professional", guides: 12, bookings: 341, mrr: 2999, status: "active", joined: "2026-01-15", state: "Rajasthan" },
  { id: "T002", name: "Kerala Backwater Escapes", plan: "starter", guides: 6, bookings: 87, mrr: 999, status: "active", joined: "2026-02-20", state: "Kerala" },
  { id: "T003", name: "Himalayan Trek Co.", plan: "enterprise", guides: 34, bookings: 1204, mrr: 7999, status: "active", joined: "2025-11-10", state: "Ladakh" },
  { id: "T004", name: "Heritage India Travel", plan: "professional", guides: 22, bookings: 467, mrr: 2999, status: "active", joined: "2026-03-05", state: "Uttar Pradesh" },
  { id: "T005", name: "Goa Sunshine Tours", plan: "starter", guides: 8, bookings: 43, mrr: 999, status: "trial", joined: "2026-05-28", state: "Goa" },
];

const invoices = [
  { id: "INV-2026-05", date: "2026-05-01", amount: 2999, plan: "Professional", status: "paid" },
  { id: "INV-2026-04", date: "2026-04-01", amount: 2999, plan: "Professional", status: "paid" },
  { id: "INV-2026-03", date: "2026-03-01", amount: 999, plan: "Starter", status: "paid" },
  { id: "INV-2026-02", date: "2026-02-01", amount: 999, plan: "Starter", status: "paid" },
];

// Platform Stats
app.get("/api/saas/stats", (req, res) => {
  const mrr = tenants.reduce((sum, t) => sum + t.mrr, 0);
  const totalBookings = tenants.reduce((sum, t) => sum + t.bookings, 0);
  const totalGuides = tenants.reduce((sum, t) => sum + t.guides, 0);
  res.json({
    mrr,
    arr: mrr * 12,
    tenants: tenants.length,
    activeTenants: tenants.filter(t => t.status === "active").length,
    totalBookings,
    totalGuides,
    avgRevenuePerTenant: Math.round(mrr / tenants.length),
    churnRate: 2.3,
    nps: 74
  });
});

// All Tenants
app.get("/api/saas/tenants", (req, res) => {
  res.json(tenants);
});

// Single Tenant
app.get("/api/saas/tenant/:id", (req, res) => {
  const tenant = tenants.find(t => t.id === req.params.id);
  if (!tenant) return res.status(404).json({ error: "Tenant not found" });
  res.json({ ...tenant, plan: saasPlans[tenant.plan] });
});

// Register New Tenant
app.post("/api/saas/tenant", (req, res) => {
  const { name, plan, state } = req.body;
  const newTenant = {
    id: `T${String(tenants.length + 1).padStart(3, "0")}`,
    name, plan: plan || "starter", guides: 0, bookings: 0,
    mrr: saasPlans[plan || "starter"]?.price || 999,
    status: "trial", joined: new Date().toISOString().split("T")[0], state: state || "India"
  };
  tenants.push(newTenant);
  console.log(`[SAAS] New tenant registered: ${name} (${plan})`);
  res.json(newTenant);
});

// Booking Analytics (monthly trend)
app.get("/api/analytics/bookings", (req, res) => {
  const trend = [
    { month: "Jan", bookings: 234, revenue: 187200 },
    { month: "Feb", bookings: 312, revenue: 249600 },
    { month: "Mar", bookings: 445, revenue: 356000 },
    { month: "Apr", bookings: 521, revenue: 416800 },
    { month: "May", bookings: 698, revenue: 558400 },
    { month: "Jun", bookings: 743, revenue: 594400 },
  ];
  res.json({ trend, totalBookings: bookings.length + 2142, states: 28 });
});

// Guide Leaderboard
app.get("/api/analytics/guides", (req, res) => {
  const leaderboard = [
    { name: "Priya Sharma", city: "Jaipur", bookings: 241, revenue: 144600, rating: 4.9, tier: "Platinum" },
    { name: "Ananya Sen", city: "Kolkata", bookings: 198, revenue: 158400, rating: 4.8, tier: "Gold" },
    { name: "Amit Mishra", city: "Varanasi", bookings: 187, revenue: 93500, rating: 4.95, tier: "Platinum" },
    { name: "Rajesh Pillai", city: "Kochi", bookings: 162, revenue: 113400, rating: 4.8, tier: "Gold" },
    { name: "Vikram Rathore", city: "Agra", bookings: 143, revenue: 92950, rating: 4.7, tier: "Silver" },
  ];
  res.json(leaderboard);
});

// Billing — Plan Upgrade
app.post("/api/billing/upgrade", (req, res) => {
  const { tenantId, newPlan } = req.body;
  const tenant = tenants.find(t => t.id === tenantId);
  if (tenant) {
    tenant.plan = newPlan;
    tenant.mrr = saasPlans[newPlan]?.price || 999;
  }
  console.log(`[BILLING] Tenant ${tenantId} upgraded to ${newPlan}`);
  res.json({ success: true, plan: saasPlans[newPlan], invoice: `INV-${Date.now()}` });
});

// Billing — Invoice List
app.get("/api/billing/invoices", (req, res) => {
  res.json(invoices);
});

// Usage Metrics
app.get("/api/analytics/usage", (req, res) => {
  res.json({
    aiRequests: 14892,
    socketConnections: clients.size,
    avgResponseTime: 142,
    uptime: 99.97,
    bookingsToday: Math.floor(Math.random() * 30) + 10
  });
});


const httpServer = createServer(app);
const io = new Server(httpServer, {

  cors: {
    origin: "*", // Allow all origins for local dev
    methods: ["GET", "POST"]
  }
});


// Helper: Find socket IDs by email or guideId
function getSocketsByEmail(email) {
  const ids = [];
  for (const [socketId, user] of clients.entries()) {
    if (user.email === email) {
      ids.push(socketId);
    }
  }
  return ids;
}

function getSocketsByGuideId(guideId) {
  const ids = [];
  for (const [socketId, user] of clients.entries()) {
    if (user.role === "guide" && Number(user.guideId) === Number(guideId)) {
      ids.push(socketId);
    }
  }
  return ids;
}

io.on("connection", (socket) => {
  console.log(`\n[SOCKET] New client connection: ${socket.id}`);

  // 1. REGISTER USER
  socket.on("register", (user) => {
    if (!user) return;

    // Store user data mapped to this socket
    clients.set(socket.id, user);
    console.log(`[AUTH] Registered ${user.name} (${user.role}) on socket ${socket.id}`);

    // If guide, register their availability if not present
    if (user.role === "guide" && user.guideId) {
      if (!guidesAvailability.has(Number(user.guideId))) {
        guidesAvailability.set(Number(user.guideId), true);
      }
      // Broadcast update
      io.emit("guide_availability_changed", {
        guideId: Number(user.guideId),
        available: guidesAvailability.get(Number(user.guideId))
      });
    }

    // Send the current global availability state & bookings to the newly connected user
    socket.emit("initial_state", {
      availabilities: Array.from(guidesAvailability.entries()),
      bookings: bookings
    });
  });

  // 2. TOGGLE GUIDE AVAILABILITY
  socket.on("toggle_availability", ({ guideId, available }) => {
    const parsedId = Number(guideId);
    guidesAvailability.set(parsedId, available);
    console.log(`[STATUS] Guide ID ${parsedId} toggled availability to: ${available ? "AVAILABLE" : "OFFLINE"}`);

    // Broadcast to everyone (Tourists will see the status update in real-time!)
    io.emit("guide_availability_changed", { guideId: parsedId, available });
  });

  // 3. FETCH MESSAGES HISTORY
  socket.on("get_messages", ({ guideId, touristEmail }) => {
    const parsedGuideId = Number(guideId);
    const history = messages.filter(
      (m) => Number(m.guideId) === parsedGuideId && m.touristEmail === touristEmail
    );
    socket.emit("messages_history", history);
  });

  // 4. SEND MESSAGE
  socket.on("send_message", (msg) => {
    // msg format: { sender: "user" | "guide", text, guideId, touristEmail, time }
    const formattedMsg = {
      ...msg,
      id: Date.now(),
      guideId: Number(msg.guideId),
      time: msg.time || new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    };

    messages.push(formattedMsg);
    console.log(`[CHAT] [${formattedMsg.sender}] Msg: "${formattedMsg.text.substring(0, 30)}" (Guide: ${formattedMsg.guideId}, Tourist: ${formattedMsg.touristEmail})`);

    // Broadcast to all sockets matching either guide or tourist
    const guideSockets = getSocketsByGuideId(formattedMsg.guideId);
    const touristSockets = getSocketsByEmail(formattedMsg.touristEmail);

    const allRecipients = new Set([...guideSockets, ...touristSockets]);

    allRecipients.forEach(socketId => {
      // Send message to both parties in real-time
      io.to(socketId).emit("receive_message", formattedMsg);
    });
  });

  // 5. TYPING INDICATOR
  socket.on("typing", ({ guideId, touristEmail, sender, isTyping }) => {
    const parsedGuideId = Number(guideId);
    const recipientSockets = sender === "user"
      ? getSocketsByGuideId(parsedGuideId)
      : getSocketsByEmail(touristEmail);

    recipientSockets.forEach(socketId => {
      io.to(socketId).emit("typing_indicator", { guideId: parsedGuideId, touristEmail, sender, isTyping });
    });
  });

  // 6. CREATE BOOKING
  socket.on("create_booking", (bookingData) => {
    // bookingData: { guideId, touristEmail, touristName, date, time, duration, service, price, currency, city }
    const newBooking = {
      ...bookingData,
      id: `GC-${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
      guideId: Number(bookingData.guideId),
      status: "pending"
    };

    bookings.push(newBooking);
    console.log(`[BOOKING] Created: ${newBooking.id} for Guide ID ${newBooking.guideId} from ${newBooking.touristName}`);

    // Notify all instances of the specific Guide in real-time
    const guideSockets = getSocketsByGuideId(newBooking.guideId);
    guideSockets.forEach(socketId => {
      io.to(socketId).emit("booking_received", newBooking);
    });

    // Send confirmation of creation back to Tourist
    const touristSockets = getSocketsByEmail(newBooking.touristEmail);
    touristSockets.forEach(socketId => {
      io.to(socketId).emit("booking_created_success", newBooking);
    });

    // Notify Admins
    for (const [socketId, user] of clients.entries()) {
      if (user.role === "admin") {
        io.to(socketId).emit("admin_new_booking", newBooking);
      }
    }
  });

  // 7. ACCEPT / DECLINE BOOKING
  socket.on("update_booking_status", ({ bookingId, status }) => {
    const booking = bookings.find(b => b.id === bookingId);
    if (!booking) {
      console.log(`[BOOKING] [ERROR] Booking ID ${bookingId} not found`);
      return;
    }

    booking.status = status;
    console.log(`[BOOKING] Status update: ${bookingId} -> ${status.toUpperCase()}`);

    // Notify both Tourist and Guide (and Admin)
    const guideSockets = getSocketsByGuideId(booking.guideId);
    const touristSockets = getSocketsByEmail(booking.touristEmail);

    const allInvolved = new Set([...guideSockets, ...touristSockets]);

    for (const [socketId, user] of clients.entries()) {
      if (user.role === "admin") {
        allInvolved.add(socketId);
      }
    }

    allInvolved.forEach(socketId => {
      io.to(socketId).emit("booking_status_updated", { bookingId, status });
    });
  });

  // 8. DISCONNECT
  socket.on("disconnect", () => {
    const user = clients.get(socket.id);
    if (user) {
      console.log(`[DISCONNECT] User offline: ${user.name} (${user.role}) on ${socket.id}`);
      clients.delete(socket.id);
    } else {
      console.log(`[DISCONNECT] Socket offline: ${socket.id}`);
    }
  });
});

const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
  console.log(`=================================================`);
  console.log(`🚀 GuideConnect Real-Time Backend Booted Successfully`);
  console.log(`📡 WebSocket server listening on port ${PORT}`);
  console.log(`🏥 Health check endpoint: http://localhost:${PORT}/health`);
  console.log(`=================================================`);
});
