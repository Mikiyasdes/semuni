// Smooth scroll helper (still used on any page that calls it)
function scrollToSection(id) {
  const el = document.getElementById(id);
  if (!el) return;
  el.scrollIntoView({ behavior: "smooth", block: "start" });
}

// Mobile nav
const mobileToggle = document.getElementById("mobileToggle");
const navLinks = document.getElementById("navLinks");

if (mobileToggle && navLinks) {
  mobileToggle.addEventListener("click", () => {
    mobileToggle.classList.toggle("active");
    navLinks.classList.toggle("open");
  });

  navLinks.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      mobileToggle.classList.remove("active");
      navLinks.classList.remove("open");
    });
  });
}

// Pricing tabs (only on pages that have them)
const pricingTabs = document.querySelectorAll(".pricing-tab");
const pricingGroups = document.querySelectorAll(".pricing-group");

if (pricingTabs.length && pricingGroups.length) {
  pricingTabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      const target = tab.getAttribute("data-target");

      pricingTabs.forEach((t) => t.classList.remove("active"));
      pricingGroups.forEach((group) => (group.style.display = "none"));

      tab.classList.add("active");
      const targetGroup = document.getElementById("pricing-" + target);
      if (targetGroup) targetGroup.style.display = "grid";
    });
  });
}

// Price calculator (only on pricing page)
const planWeb = document.getElementById("planWeb");
const planSocial = document.getElementById("planSocial");
const planDesign = document.getElementById("planDesign");
const monthsInput = document.getElementById("monthsInput");
const calcTotal = document.getElementById("calcTotal");
const calcNote = document.getElementById("calcNote");

if (planWeb && planSocial && planDesign && monthsInput && calcTotal && calcNote) {
  const planPricing = {
    "web-basic": { price: 10000, type: "one-time" },
    "web-standard": { price: 20000, type: "one-time" },
    "web-premium": { price: 50000, type: "one-time", from: true },
    "social-starter": { price: 10000, type: "monthly" },
    "social-growth": { price: 10000, type: "monthly" },
    "social-performance": { price: 10000, type: "monthly", from: true },
    "design-logo": { price: 5000, type: "one-time" },
    "design-brandkit": { price: 15000, type: "one-time" },
    "design-retainer": { price: 10000, type: "monthly", from: true },
  };

  function formatETB(value) {
    return "ETB " + value.toLocaleString("en-ET");
  }

  function planTotalFor(selectEl, months, flags) {
    const key = selectEl.value;
    const config = planPricing[key];
    if (!config) return 0;

    if (config.from) flags.hasFrom = true;
    if (config.type === "monthly") {
      flags.hasMonthly = true;
      return config.price * months;
    }

    flags.hasOnetime = true;
    return config.price;
  }

  function updateCalculator() {
    let months = parseInt(monthsInput.value, 10);
    if (isNaN(months) || months < 1) months = 1;

    const flags = { hasMonthly: false, hasOnetime: false, hasFrom: false };

    const total =
      planTotalFor(planWeb, months, flags) +
      planTotalFor(planSocial, months, flags) +
      planTotalFor(planDesign, months, flags);

    if (!total) {
      calcTotal.textContent = "ETB 0";
      calcNote.textContent = "Select one or more options to see an estimate.";
      return;
    }

    calcTotal.textContent = formatETB(total) + (flags.hasFrom ? "+" : "");

    if (flags.hasMonthly && flags.hasOnetime) {
      calcNote.textContent =
        "Includes one-time project work and monthly services. Monthly parts are estimated for the selected months.";
    } else if (flags.hasMonthly) {
      calcNote.textContent =
        "Monthly retainers are billed per month. This is a rough estimate based on your selected duration.";
    } else {
      calcNote.textContent = "One-time project estimate based on the selected packages.";
    }
  }

  planWeb.addEventListener("change", updateCalculator);
  planSocial.addEventListener("change", updateCalculator);
  planDesign.addEventListener("change", updateCalculator);
  monthsInput.addEventListener("input", updateCalculator);
}

// Reveal on scroll
const revealEls = document.querySelectorAll(".reveal");

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.15 }
);

revealEls.forEach((el) => observer.observe(el));

// Contact form (basic UX only) – only on pages that have the form
const contactForm = document.getElementById("contactForm");
const formNote = document.getElementById("formNote");

if (contactForm && formNote) {
  contactForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = contactForm.name.value.trim();
    const email = contactForm.email.value.trim();
    const message = contactForm.message.value.trim();

    if (!name || !email || !message) {
      formNote.textContent = "Please fill in your name, email, and goals so we can respond properly.";
      formNote.style.color = "#f97316";
      return;
    }

    const company = (contactForm.company && contactForm.company.value
      ? contactForm.company.value.trim()
      : "");
    const budget = (contactForm.budget && contactForm.budget.value
      ? contactForm.budget.value.trim()
      : "");
    const services = (contactForm.services && contactForm.services.value
      ? contactForm.services.value.trim()
      : "");

    const submitBtn = contactForm.querySelector("button[type='submit']");
    if (submitBtn) submitBtn.disabled = true;

    formNote.textContent = "Sending your message...";
    formNote.style.color = "#e5e7eb";

    fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        email,
        message,
        company,
        budget,
        services,
      }),
    })
      .then(async (res) => {
        const data = await res.json().catch(() => ({}));
        if (!res.ok || !data.ok) {
          throw new Error(data.error || "Failed to send.");
        }
        contactForm.reset();
        formNote.textContent = "Thanks! Your message has been sent. We’ll get back to you within one business day.";
        formNote.style.color = "#22c55e";
      })
      .catch(() => {
        formNote.textContent = "Sorry — we couldn't send your message right now. Please try again or email smunidigitals@gmail.com.";
        formNote.style.color = "#f97316";
      })
      .finally(() => {
        if (submitBtn) submitBtn.disabled = false;
      });
  });
}

// Dynamic year
const yearEl = document.getElementById("year");
if (yearEl) {
  yearEl.textContent = new Date().getFullYear();
}