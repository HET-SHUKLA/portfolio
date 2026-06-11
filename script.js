const RESPONSES = {
  me: {
    success: true,
    data: {
      name: "Het Shukla",
      title: "Backend Engineer",
      focus: "Real-time Systems & Distributed Architecture",
      location: "Gandhinagar, Gujarat, India",
      email: "contact@hetshukla.com",
      available_for_work: true,
    },
  },
  projects: {
    success: true,
    data: [
      {
        id: "authentication-service",
        name: "Authentication Service",
        type: "microservice",
        tech: ["TypeScript", "Fastify", "PostgreSQL", "Redis", "BullMQ"],
        github: "https://github.com/HET-SHUKLA/authentication-service",
      },
      {
        id: "connect",
        name: "Connect",
        type: "real-time",
        tech: ["TypeScript", "WebRTC", "mediasoup", "AES-256-GCM"],
        github: "https://github.com/HET-SHUKLA/Connect-Backend",
      },
    ],
  },
  experience: {
    success: true,
    data: [
      {
        company: "Tata Consultancy Services",
        role: "Full Stack Engineer",
        period: "Apr 2025 – present",
        scale: "46M+ users",
      },
      {
        company: "CMPICA",
        role: "Undergraduate Research Fellow",
        period: "Nov 2022 – Mar 2024",
        type: "part-time",
      },
    ],
  },
  skills: {
    success: true,
    data: {
      core: ["TypeScript", "Node.js", "WebRTC", "PostgreSQL", "Redis"],
      tools: ["Fastify", "BullMQ", "Prisma", "Docker", "mediasoup"],
      infrastructure: ["Linux", "Nginx", "Concourse CI/CD"],
    },
  },
};

function highlight(obj) {
  const raw = JSON.stringify(obj, null, 2)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  return raw.replace(
    /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g,
    (match) => {
      if (/^"/.test(match))
        return /:$/.test(match)
          ? `<span class="jk">${match}</span>`
          : `<span class="js">${match}</span>`;
      if (/true|false/.test(match)) return `<span class="jb">${match}</span>`;
      if (/null/.test(match)) return `<span class="jz">${match}</span>`;
      return `<span class="jn">${match}</span>`;
    },
  );
}

function selectEndpoint(e, name) {
  document.querySelectorAll(".api-endpoint-btn").forEach((btn) => {
    btn.classList.remove("active");
    btn.setAttribute("aria-pressed", "false");
  });
  e.currentTarget.classList.add("active");
  e.currentTarget.setAttribute("aria-pressed", "true");

  const el = document.getElementById("api-response-body");
  el.style.opacity = "0";
  setTimeout(() => {
    el.innerHTML = highlight(RESPONSES[name]);
    el.style.opacity = "1";
  }, 120);
}

// Initialise with /me response
document.getElementById("api-response-body").innerHTML = highlight(
  RESPONSES.me,
);

// ── Background API hydration ──────────────────────────────────────────────
// Fetches live data from your running Fastify backend.
// Falls back silently to static HTML if the API is unreachable.
// Replace this URL with your actual backend URL once deployed.
const API_BASE = "https://api.hetshukla.com";

async function hydrate() {
  try {
    const res = await fetch(`${API_BASE}/portfolio`, {
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const { data } = await res.json();
    if (!data) return;

    // Update [data-api] elements with values from the API response
    // Supports dot-notation paths: data-api="meta.name" → data.meta.name
    document.querySelectorAll("[data-api]").forEach((el) => {
      const path = el.getAttribute("data-api").split(".");
      let value = data;
      for (const key of path) value = value?.[key];
      if (
        value &&
        typeof value === "string" &&
        value !== el.textContent.trim()
      ) {
        el.textContent = value;
      }
    });
  } catch {
    // API unreachable - static content stays, status dot turns red
    const dot = document.getElementById("status-dot");
    const text = document.getElementById("status-text");
    if (dot) {
      dot.classList.add("offline");
    }
    if (text) {
      text.textContent = "API offline";
    }
  }
}

hydrate();

function toggleNav() {
  const nav = document.querySelector(".nav-links");
  const toggle = document.querySelector(".nav-toggle");
  if (nav && toggle) {
    const expanded = toggle.getAttribute("aria-expanded") === "true";
    toggle.setAttribute("aria-expanded", String(!expanded));
    nav.style.display = expanded ? "none" : "flex";
  }
}

function closeNavOnOutsideClick(e) {
  if (window.innerWidth > 538) return; // Only apply on mobile widths
  const nav = document.querySelector(".nav-links");
  const toggle = document.querySelector(".nav-toggle");
  if (
    nav &&
    toggle &&
    !nav.contains(e.target) &&
    !toggle.contains(e.target)
  ) {
    toggle.setAttribute("aria-expanded", "false");
    nav.style.display = "none";
  }
}
 
// Close navigation when clicking/tapping outside the nav or toggle
document.addEventListener("pointerdown", closeNavOnOutsideClick);

window.addEventListener("resize", (e) => {
    const nav = document.querySelector(".nav-links");
    if (window.innerWidth > 538) {
        if (nav) {
            nav.style.display = "flex";
        }
    } else {
        if (nav) {
            nav.style.display = "none";
        }
    }
});

// Hide navigation when a nav link is clicked (mobile behavior)
const navLinks = document.querySelector(".nav-links");
if (navLinks) {
  navLinks.addEventListener("click", (e) => {
    const clickedAnchor = !!e.target.closest("a");
    const clickedThemeBtn = !!e.target.closest(".nav-theme-toggle");
    if (!clickedAnchor && !clickedThemeBtn) return;
    const nav = document.querySelector(".nav-links");
    const toggle = document.querySelector(".nav-toggle");
    if (nav && toggle && window.innerWidth <= 538) {
      toggle.setAttribute("aria-expanded", "false");
      nav.style.display = "none";
    }
  });
}

// Nav theme
function applyThemeIcon() {
  const theme = document.documentElement.getAttribute("data-theme") || "dark";
  const icon = document.getElementById("theme-icon");
  if (!icon) return;
  icon.src = theme === "light" ? "images/moon-outlined.svg" : "images/sun-outlined.svg";
  icon.alt = `Switch to ${theme === "light" ? "dark" : "light"} theme`;
}

document.documentElement.setAttribute("data-theme", localStorage.getItem("theme") || "dark");
applyThemeIcon();

const themeToggle = document.querySelector(".nav-theme-toggle");
if (themeToggle) {
  themeToggle.addEventListener("click", () => {
    const theme = document.documentElement.getAttribute("data-theme") || "dark";
    const newTheme = theme === "light" ? "dark" : "light";
    document.documentElement.setAttribute("data-theme", newTheme);
    try {
      localStorage.setItem("theme", newTheme);
    } catch (e) {}
    applyThemeIcon();
  });
}
