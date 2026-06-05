import dotenv from "dotenv";
import http from "http";

dotenv.config();

let API_BASE_URL = process.env.API_TEST_URL?.replace(/\/$/, "");
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@bungjackofficial.com";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "StrongPassword123!@#";

let localServer;

if (!API_BASE_URL) {
  const { default: app, dbReady } = await import("../server.js");
  await dbReady;
  localServer = http.createServer(app);
  await new Promise((resolve) => localServer.listen(0, "127.0.0.1", resolve));
  const { port } = localServer.address();
  API_BASE_URL = `http://127.0.0.1:${port}/api`;
}

const cookieJar = new Map();
const results = [];

const rememberCookies = (res) => {
  const setCookie = res.headers.get("set-cookie");
  if (!setCookie) return;

  for (const cookie of setCookie.split(/,(?=\s*[^;,]+=)/)) {
    const [pair] = cookie.trim().split(";");
    const index = pair.indexOf("=");
    if (index > 0) cookieJar.set(pair.slice(0, index), pair.slice(index + 1));
  }
};

const cookieHeader = () =>
  [...cookieJar.entries()].map(([key, value]) => `${key}=${value}`).join("; ");

const parseBody = async (res) => {
  const text = await res.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
};

const request = async (method, path, body, options = {}) => {
  const headers = { ...(options.headers || {}) };
  const init = { method, headers };

  if (options.auth !== false && cookieJar.size) {
    headers.Cookie = cookieHeader();
  }

  if (body !== undefined) {
    if (body instanceof FormData || body instanceof Blob || body instanceof ArrayBuffer) {
      init.body = body;
    } else if (typeof body === "string") {
      init.body = body;
    } else {
      headers["Content-Type"] = "application/json";
      init.body = JSON.stringify(body);
    }
  }

  const res = await fetch(`${API_BASE_URL}${path}`, init);
  rememberCookies(res);
  const data = await parseBody(res);
  return { status: res.status, ok: res.ok, data };
};

const pass = (name, detail = "") => results.push({ name, ok: true, detail });
const fail = (name, detail = "") => results.push({ name, ok: false, detail });

const test = async (name, fn) => {
  try {
    const detail = await fn();
    pass(name, detail);
  } catch (error) {
    fail(name, error.message);
  }
};

const expectStatus = (res, statuses, label = "status") => {
  const allowed = Array.isArray(statuses) ? statuses : [statuses];
  if (!allowed.includes(res.status)) {
    throw new Error(`${label} ${res.status}, expected ${allowed.join(" or ")}: ${JSON.stringify(res.data)}`);
  }
};

const expectObjectId = (data, label) => {
  const id = data?._id || data?.id || data?.item?._id || data?.item?.id;
  if (!id) throw new Error(`${label} did not return an id`);
  return id;
};

const stamp = Date.now();
const created = {
  postId: null,
  videoId: null,
  premiumId: null,
  contactId: null,
};

const payloads = {
  post: {
    title: `API Smoke Post ${stamp}`,
    category: "News",
    excerpt: "Created by the local API smoke test.",
    content: "This temporary post verifies protected post CRUD.",
    image: "",
    featured: false,
    status: "published",
  },
  video: {
    title: `API Smoke Video ${stamp}`,
    category: "Video",
    platform: "YouTube",
    url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    thumbnail: "",
    description: "Created by the local API smoke test.",
    featured: false,
    status: "published",
  },
  premium: {
    title: `API Smoke Premium ${stamp}`,
    type: "link",
    accessPlan: "videos",
    url: "https://example.com/premium-local-test",
    thumbnail: "",
    description: "Temporary premium content for local API verification.",
    status: "published",
  },
  contact: {
    name: "Local API Tester",
    email: "tester@example.com",
    subject: `API Smoke Contact ${stamp}`,
    message: "This is a local API smoke test message.",
  },
};

await test("GET /health", async () => {
  const res = await request("GET", "/health");
  expectStatus(res, 200);
  if (!res.data?.success) throw new Error("Health response missing success=true");
});

await test("GET /settings", async () => {
  const res = await request("GET", "/settings");
  expectStatus(res, 200);
});

await test("GET /posts", async () => {
  const res = await request("GET", "/posts");
  expectStatus(res, 200);
  if (!Array.isArray(res.data?.items)) throw new Error("Posts response missing items array");
});

await test("GET /videos", async () => {
  const res = await request("GET", "/videos");
  expectStatus(res, 200);
  if (!Array.isArray(res.data?.items)) throw new Error("Videos response missing items array");
});

await test("GET /premium-content", async () => {
  const res = await request("GET", "/premium-content");
  expectStatus(res, 200);
  if (!Array.isArray(res.data?.items)) throw new Error("Premium response missing items array");
});

await test("GET /subscriptions/me", async () => {
  const res = await request("GET", "/subscriptions/me");
  expectStatus(res, 200);
  if (typeof res.data?.subscribed !== "boolean") throw new Error("Subscription status missing subscribed boolean");
});

await test("GET /subscriptions/content", async () => {
  const res = await request("GET", "/subscriptions/content");
  expectStatus(res, 200);
  if (!Array.isArray(res.data?.items)) throw new Error("Subscription content missing items array");
});

await test("POST /contact", async () => {
  const res = await request("POST", "/contact", payloads.contact);
  expectStatus(res, 201);
});

await test("POST /donations/create-checkout-session", async () => {
  const res = await request("POST", "/donations/create-checkout-session", {
    amount: 1,
    currency: "USD",
    donorName: "Local Tester",
    donorEmail: "tester@example.com",
  });
  expectStatus(res, [200, 503]);
  if (res.status === 503 && !String(res.data?.error || "").includes("Stripe")) {
    throw new Error(`Unexpected donation placeholder response: ${JSON.stringify(res.data)}`);
  }
});

await test("GET /donations/verify/:sessionId placeholder", async () => {
  const res = await request("GET", "/donations/verify/local-mock-session");
  expectStatus(res, [200, 404]);
});

await test("POST /donations/webhook placeholder", async () => {
  const res = await request("POST", "/donations/webhook", "{}");
  expectStatus(res, [200, 400, 500]);
});

await test("POST /subscriptions/create-checkout-session", async () => {
  const res = await request("POST", "/subscriptions/create-checkout-session", {
    subscriberName: "Local Subscriber",
    subscriberEmail: "subscriber@example.com",
    plan: "images",
  });
  expectStatus(res, 200);
  if (!res.data?.success) throw new Error(`Subscription checkout did not succeed safely: ${JSON.stringify(res.data)}`);
});

await test("GET /subscriptions/verify/:sessionId placeholder", async () => {
  const res = await request("GET", "/subscriptions/verify/local-mock-session");
  expectStatus(res, [200, 404]);
});

await test("POST /auth/login", async () => {
  const res = await request("POST", "/auth/login", {
    email: ADMIN_EMAIL,
    password: ADMIN_PASSWORD,
  });
  expectStatus(res, 200);
  if (!cookieJar.has("admin_token")) throw new Error("Login did not set admin_token cookie");
});

await test("GET /auth/me", async () => {
  const res = await request("GET", "/auth/me");
  expectStatus(res, 200);
  if (!res.data?.admin) throw new Error("Missing admin profile");
});

await test("GET /admin/dashboard", async () => {
  const res = await request("GET", "/admin/dashboard");
  expectStatus(res, 200);
  if (!res.data?.stats) throw new Error("Missing dashboard stats");
});

await test("PUT /settings", async () => {
  const current = await request("GET", "/settings/admin");
  expectStatus(current, 200);
  const res = await request("PUT", "/settings", {
    brandName: current.data?.brandName || "Bung Jack Official",
    tagline: current.data?.tagline || "Independent Media Platform",
    email: current.data?.email || "blackservice27@gmail.com",
    whatsappLink: current.data?.whatsappLink || "https://wa.me/13124590936",
    facebook: current.data?.facebook || "",
    instagram: current.data?.instagram || "",
    youtube: current.data?.youtube || "",
    logo: current.data?.logo || "",
    donationCurrencies: current.data?.donationCurrencies || ["USD", "CAD", "THB"],
  });
  expectStatus(res, 200);
});

await test("POST /posts", async () => {
  const res = await request("POST", "/posts", payloads.post);
  expectStatus(res, 201);
  created.postId = expectObjectId(res.data, "Post");
});

await test("GET /posts/:id", async () => {
  const res = await request("GET", `/posts/${created.postId}`);
  expectStatus(res, 200);
});

await test("PUT /posts/:id", async () => {
  const res = await request("PUT", `/posts/${created.postId}`, {
    ...payloads.post,
    title: `${payloads.post.title} Updated`,
  });
  expectStatus(res, 200);
});

await test("POST /videos", async () => {
  const res = await request("POST", "/videos", payloads.video);
  expectStatus(res, 201);
  created.videoId = expectObjectId(res.data, "Video");
});

await test("GET /videos/:id", async () => {
  const res = await request("GET", `/videos/${created.videoId}`);
  expectStatus(res, 200);
});

await test("PUT /videos/:id", async () => {
  const res = await request("PUT", `/videos/${created.videoId}`, {
    ...payloads.video,
    title: `${payloads.video.title} Updated`,
  });
  expectStatus(res, 200);
});

await test("POST /premium-content", async () => {
  const res = await request("POST", "/premium-content", payloads.premium);
  expectStatus(res, 201);
  created.premiumId = expectObjectId(res.data, "Premium content");
});

await test("GET /premium-content returns saved content", async () => {
  const res = await request("GET", "/premium-content");
  expectStatus(res, 200);
  const found = res.data.items.some((item) => item._id === created.premiumId);
  if (!found) throw new Error("Saved premium content was not returned");
});

await test("PUT /premium-content/:id", async () => {
  const res = await request("PUT", `/premium-content/${created.premiumId}`, {
    ...payloads.premium,
    title: `${payloads.premium.title} Updated`,
  });
  expectStatus(res, 200);
});

await test("GET /contact", async () => {
  const res = await request("GET", "/contact");
  expectStatus(res, 200);
  const found = res.data.items.find((item) => item.subject === payloads.contact.subject);
  if (!found?._id) throw new Error("Created contact message was not found");
  created.contactId = found._id;
});

await test("PATCH /contact/:id/read", async () => {
  const res = await request("PATCH", `/contact/${created.contactId}/read`, {});
  expectStatus(res, 200);
  if (!res.data?.isRead) throw new Error("Contact message was not marked read");
});

await test("GET /donations", async () => {
  const res = await request("GET", "/donations");
  expectStatus(res, 200);
  if (!Array.isArray(res.data?.items)) throw new Error("Donations response missing items array");
});

await test("POST /uploads/image Cloudinary setup", async () => {
  const form = new FormData();
  const bytes = Uint8Array.from(Buffer.from(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/p9sAAAAASUVORK5CYII=",
    "base64"
  ));
  const png = new Blob([bytes], { type: "image/png" });
  form.append("image", png, "local-smoke.png");
  form.append("folder", "bungjackofficial-local-tests");
  const res = await request("POST", "/uploads/image", form);
  expectStatus(res, [201, 503]);
});

await test("DELETE /contact/:id", async () => {
  const res = await request("DELETE", `/contact/${created.contactId}`);
  expectStatus(res, 200);
});

await test("DELETE /premium-content/:id", async () => {
  const res = await request("DELETE", `/premium-content/${created.premiumId}`);
  expectStatus(res, 200);
});

await test("DELETE /videos/:id", async () => {
  const res = await request("DELETE", `/videos/${created.videoId}`);
  expectStatus(res, 200);
});

await test("DELETE /posts/:id", async () => {
  const res = await request("DELETE", `/posts/${created.postId}`);
  expectStatus(res, 200);
});

await test("POST /auth/logout", async () => {
  const res = await request("POST", "/auth/logout", {});
  expectStatus(res, 200);
});

const passed = results.filter((result) => result.ok).length;
const failed = results.length - passed;

for (const result of results) {
  const marker = result.ok ? "PASS" : "FAIL";
  console.log(`${marker} ${result.name}${result.detail ? ` - ${result.detail}` : ""}`);
}

console.log("");
console.log(`Summary: ${passed}/${results.length} passed, ${failed} failed`);

if (failed > 0) {
  process.exitCode = 1;
}

if (localServer) {
  await new Promise((resolve) => localServer.close(resolve));
  const mongoose = await import("mongoose");
  await mongoose.default.connection.close();
}
