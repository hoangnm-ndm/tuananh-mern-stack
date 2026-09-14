import { env } from "../../config/env.js";
import { logger } from "../../core/utils/logger.js";

/**
 * Dich vu gui mail - thiet ke theo mau "driver" de doi nha cung cap ma khong sua noi goi.
 *
 * Phase 1 (hien tai): driver "console" - in noi dung mail ra log, du de phat trien magic link.
 * Phase 2: bo sung driver "smtp" (nodemailer) va "resend" trong cung file nay,
 *          code nghiep vu KHONG phai thay doi.
 *
 * @typedef {{ to: string, subject: string, html: string, text?: string }} MailPayload
 */

/** Driver in ra console - huu ich khi dev/test, khong can cau hinh gi. */
const consoleDriver = {
  name: "console",
  async send(payload) {
    logger.info("[MAIL:console] Gia lap gui mail", {
      to: payload.to,
      subject: payload.subject,
      preview: payload.text ?? stripHtml(payload.html).slice(0, 200),
    });
    return { accepted: [payload.to], driver: "console" };
  },
};

/** Placeholder cho Phase 2 - nem loi ro rang thay vi that bai am tham. */
function createUnimplementedDriver(name) {
  return {
    name,
    async send() {
      throw new Error(
        `MAIL_DRIVER="${name}" chua duoc trien khai (du kien Phase 2). ` +
          `Tam thoi dat MAIL_DRIVER=console trong .env`,
      );
    },
  };
}

const DRIVERS = {
  console: consoleDriver,
  smtp: createUnimplementedDriver("smtp"),
  resend: createUnimplementedDriver("resend"),
};

export class MailService {
  constructor(driverName = env.MAIL_DRIVER, from = env.MAIL_FROM) {
    this.driver = DRIVERS[driverName] ?? consoleDriver;
    this.from = from;
  }

  /** @param {MailPayload} payload */
  async send(payload) {
    return this.driver.send({ from: this.from, ...payload });
  }

  /** Mail chua magic link dang nhap. */
  async sendMagicLink({ to, link, expiresInText = "15 phut" }) {
    return this.send({
      to,
      subject: `[${env.APP_NAME}] Lien ket dang nhap cua ban`,
      text: `Nhan vao lien ket de dang nhap (het han sau ${expiresInText}): ${link}`,
      html: `
        <div style="font-family:system-ui,sans-serif;max-width:480px">
          <h2>Dang nhap vao ${env.APP_NAME}</h2>
          <p>Nhan vao nut ben duoi de dang nhap. Lien ket het han sau <strong>${expiresInText}</strong>
             va chi su dung duoc <strong>mot lan</strong>.</p>
          <p><a href="${link}" style="display:inline-block;padding:12px 20px;background:#4f46e5;color:#fff;border-radius:8px;text-decoration:none">Dang nhap</a></p>
          <p style="color:#666;font-size:13px">Neu ban khong yeu cau, hay bo qua email nay.</p>
        </div>`,
    });
  }

  async sendWelcome({ to, name }) {
    return this.send({
      to,
      subject: `Chao mung ban den voi ${env.APP_NAME}`,
      text: `Xin chao ${name}, tai khoan cua ban da duoc tao thanh cong.`,
      html: `<p>Xin chao <strong>${name}</strong>, tai khoan cua ban da duoc tao thanh cong.</p>`,
    });
  }
}

function stripHtml(html = "") {
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export const mailService = new MailService();
