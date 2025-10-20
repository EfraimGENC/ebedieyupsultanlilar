/**
 * Partial date objesi alan ve formatlanmış string döndüren fonksiyon
 * @param date - year, month, day içeren partial date objesi
 * @returns Formatlanmış tarih string'i veya boş string
 *
 * Örnekler:
 * - { day: 31, month: 12, year: 1900 } => "31/12/1900"
 * - { month: 12, year: 1900 } => "12/1900"
 * - { day: 31, year: 1900 } => "31/?/1900"
 * - { year: 1900 } => "1900"
 * - { circa: true, year: 1900 } => "~1900"
 */
export function formatPartialDate(date?: {
  year?: number;
  month?: number;
  day?: number;
  circa?: boolean;
}): string {
  if (!date || !date.year) {
    return "";
  }

  const prefix = date.circa ? "~" : "";

  // Sadece yıl varsa
  if (!date.month && !date.day) {
    return `${prefix}${date.year}`;
  }

  // Ay ve yıl varsa ama gün yoksa
  if (date.month && !date.day) {
    return `${prefix}${date.month}/${date.year}`;
  }

  // Gün ve yıl varsa ama ay yoksa
  if (date.day && !date.month) {
    return `${prefix}${date.day}/?/${date.year}`;
  }

  // Hepsi varsa (gün, ay, yıl)
  return `${prefix}${date.day}/${date.month}/${date.year}`;
}
