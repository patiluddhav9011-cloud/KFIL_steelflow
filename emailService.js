/**
 * Email Service
 * --------------
 * Sends alert emails for low stock and high supplier risk.
 *
 * If SMTP settings aren't configured in .env (which is fine for a demo),
 * this falls back to just logging the alert to the terminal instead of
 * crashing - so you can see the platform "working" without needing a real
 * email account set up.
 */

import nodemailer from "nodemailer";

function isEmailConfigured() {
  return Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);
}

function getTransporter() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });
}

async function sendAlertEmail(subject, text) {
  const to = process.env.ALERT_EMAIL_TO || "supplychain-team@yourcompany.com";

  if (!isEmailConfigured()) {
    console.log("\n[KFILSteelFlow] Email alerts are not configured (see backend/.env).");
    console.log(`[KFILSteelFlow] Would send email -> To: ${to}`);
    console.log(`[KFILSteelFlow] Subject: ${subject}`);
    console.log(`[KFILSteelFlow] Body: ${text}\n`);
    return { sent: false, simulated: true, to, subject };
  }

  const transporter = getTransporter();
  await transporter.sendMail({
    from: process.env.ALERT_EMAIL_FROM || "alerts@KFILsteelflow.demo",
    to,
    subject,
    text
  });

  return { sent: true, simulated: false, to, subject };
}

export function sendLowStockAlert(item) {
  const subject = `[KFILSteelFlow] Low stock alert: ${item.itemName}`;
  const text =
    `${item.itemName} is at ${item.currentStock} ${item.unit || "MT"}, ` +
    `below its reorder point of ${item.reorderPoint}. ` +
    `Estimated days of cover remaining: ${item.daysOfCover}. Recommended action: ${item.recommendedAction}.`;
  return sendAlertEmail(subject, text);
}

export function sendSupplierRiskAlert(supplier) {
  const subject = `[KFILSteelFlow] Supplier risk alert: ${supplier.supplierName || supplier.name}`;
  const text =
    `${supplier.supplierName || supplier.name} now has a risk score of ${supplier.riskScore} ` +
    `(${supplier.riskLevel} risk). Review sourcing plan for this supplier.`;
  return sendAlertEmail(subject, text);
}
