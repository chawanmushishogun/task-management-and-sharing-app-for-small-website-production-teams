// 日付は "YYYY-MM-DD" 文字列で扱う
export function formatDateShort(dateStr: string | null): string {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

export function formatDateRange(startDate: string | null, endDate: string | null): string {
  if (!startDate && !endDate) return "—";
  if (startDate && endDate) return `${formatDateShort(startDate)} 〜 ${formatDateShort(endDate)}`;
  if (endDate) return formatDateShort(endDate);
  return formatDateShort(startDate);
}

export function isOverdue(endDate: string | null): boolean {
  if (!endDate) return false;
  return new Date(endDate) < new Date();
}

export function toDateStr(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

