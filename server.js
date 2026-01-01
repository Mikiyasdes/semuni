import express from "express";
import nodemailer from "nodemailer";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

dotenv.config();

const app = express();

app.use(express.json({ limit: "200kb" }));
app.use(express.urlencoded({ extended: false }));

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.static(__dirname));

app.post("/api/contact", async (req, res) => {
  try {
    const name = (req.body?.name || "").toString().trim();
    const email = (req.body?.email || "").toString().trim();
    const message = (req.body?.message || "").toString().trim();
    const company = (req.body?.company || "").toString().trim();
    const budget = (req.body?.budget || "").toString().trim();
    const services = (req.body?.services || "").toString().trim();

    if (!name || !email || !message) {
      return res.status(400).json({ ok: false, error: "Missing required fields." });
    }

    const gmailUser = process.env.GMAIL_USER;
    const gmailAppPassword = process.env.GMAIL_APP_PASSWORD;
    const toEmail = process.env.CONTACT_TO || "smunidigitals@gmail.com";

    if (!gmailUser || !gmailAppPassword) {
      return res.status(500).json({ ok: false, error: "Server email is not configured." });
    }

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: gmailUser,
        pass: gmailAppPassword,
      },
    });

    const subject = `New website inquiry from ${name}`;
    const text =
      `Name: ${name}\n` +
      `Email: ${email}\n` +
      (company ? `Company/Brand: ${company}\n` : "") +
      (budget ? `Budget: ${budget}\n` : "") +
      (services ? `Interested in: ${services}\n` : "") +
      `\nMessage:\n${message}`;

    await transporter.sendMail({
      from: gmailUser,
      to: toEmail,
      replyTo: email,
      subject,
      text,
    });

    return res.json({ ok: true });
  } catch (err) {
    return res.status(500).json({ ok: false, error: "Failed to send email." });
  }
});

const port = Number(process.env.PORT || 3000);
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
