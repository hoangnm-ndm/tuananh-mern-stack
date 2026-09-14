/** Cac ham dinh dang hien thi theo chuan Viet Nam. */

export function formatCurrency(amount, currency = "VND") {
  if (amount == null || Number.isNaN(Number(amount))) return "-";
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency }).format(Number(amount));
}

export function formatNumber(value) {
  if (value == null || Number.isNaN(Number(value))) return "-";
  return new Intl.NumberFormat("vi-VN").format(Number(value));
}

export function formatDate(value, options = {}) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    ...options,
  }).format(date);
}

export function formatDateTime(value) {
  return formatDate(value, { hour: "2-digit", minute: "2-digit" });
}

/** "3 phut truoc", "2 ngay truoc"... */
export function formatRelativeTime(value) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";

  const diffSeconds = Math.round((date.getTime() - Date.now()) / 1000);
  const formatter = new Intl.RelativeTimeFormat("vi", { numeric: "auto" });

  const thresholds = [
    [60, "second", 1],
    [3600, "minute", 60],
    [86_400, "hour", 3600],
    [604_800, "day", 86_400],
    [2_629_800, "week", 604_800],
    [31_557_600, "month", 2_629_800],
    [Infinity, "year", 31_557_600],
  ];

  for (const [limit, unit, divisor] of thresholds) {
    if (Math.abs(diffSeconds) < limit) {
      return formatter.format(Math.round(diffSeconds / divisor), unit);
    }
  }
  return formatDate(value);
}

/** Cat bot chuoi dai va them dau "…". */
export function truncate(text, maxLength = 80) {
  if (!text) return "";
  return text.length <= maxLength ? text : `${text.slice(0, maxLength).trimEnd()}…`;
}
