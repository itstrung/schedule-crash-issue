export const isSameDate = (date1: Date, date2: Date): boolean => {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
};

export const getCurrentHHMMTimeString = (): `${string}:${string}` => {
  const now = new Date();
  const hours = now.getHours().toString().padStart(2, "0");
  const minutes = now.getMinutes().toString().padStart(2, "0");
  return `${hours}:${minutes}`;
};

export const getCurrentMinutesOfDay = () => {
  const now = new Date();
  return now.getHours() * 60 + now.getMinutes();
};

export const getMinutesOfDay = (date: Date): number => {
  return date.getHours() * 60 + date.getMinutes();
};

export const convertHourToHHMM = (hour: number): `${string}:00` => {
  return `${hour.toString().padStart(2, "0")}:00`;
};

export const convertMinuteOfDayTo12H = (
  minutesOfDay: number
): `${string}:${string} AM` | `${string}:${string} PM` => {
  const hours = Math.floor(minutesOfDay / 60);
  const minutes = minutesOfDay % 60;

  const period = hours < 12 ? "AM" : "PM";

  let hours12 = hours % 12;
  // Handle 12 AM/PM case (0 should be displayed as 12)
  hours12 = hours12 === 0 ? 12 : hours12;

  const minutesStr = minutes.toString().padStart(2, "0");

  return `${hours12}:${minutesStr} ${period}`;
};

export const convertHHMMTo12H = (
  hhmm: string
): `${string}:${string} AM` | `${string}:${string} PM` => {
  const [hours, minutes] = hhmm.split(":").map(Number);
  const formattedHour = hours % 24;
  const period = formattedHour < 12 ? "AM" : "PM";

  let hour12 = formattedHour % 12;
  // Handle 12 AM/PM case (0 should be displayed as 12)
  hour12 = hour12 === 0 ? 12 : hour12;

  const minutesStr = minutes.toString().padStart(2, "0");

  return `${hour12}:${minutesStr} ${period}`;
};

export const convert24HTo12H = (
  hour: number
): `${string} AM` | `${string} PM` => {
  const formattedHour = hour % 24;

  const period = formattedHour < 12 ? "AM" : "PM";

  let hour12 = formattedHour % 12;

  // Handle 12 AM/PM case (0 should be displayed as 12)
  hour12 = hour12 === 0 ? 12 : hour12;

  return `${hour12} ${period}`;
};

/**
 * Convert YYYY-MM-DD to Date object
 * @param dateStr - YYYY-MM-DD format
 * @returns Date object
 */
export const getDateFromString = (dateStr: string): Date | null => {
  // validate yyyymmdd format
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    return null;
  }

  const [year, month, day] = dateStr.split("-").map(Number);
  return new Date(year, month - 1, day);
};

/**
 * Convert HH:MM to Date object
 * @param timeStr - HH:MM format
 * @param dateStr - YYYY-MM-DD format
 * @returns Date object
 */
export const getDateTimeFromString = ({
  dateStr,
  timeStr,
}: {
  dateStr: string;
  timeStr: string;
}): Date | null => {
  // validate hhmm format
  const date = getDateFromString(dateStr);
  if (!date) {
    return null;
  }

  if (!/^\d{2}:\d{2}$/.test(timeStr)) {
    return null;
  }

  const [hours, minutes] = timeStr.split(":").map(Number);

  date.setHours(hours);
  date.setMinutes(minutes);
  return date;
};

export const getTimeFromString = (
  timeStr: string
): {
  hours: number;
  minutes: number;
} | null => {
  // validate hhmm format
  if (!/^\d{2}:\d{2}$/.test(timeStr)) {
    return null;
  }

  const [hours, minutes] = timeStr.split(":").map(Number);
  return { hours, minutes };
};

export const getHeightOfOneMinute = ({
  minHour,
  maxHour,
}: {
  minHour: number;
  maxHour: number;
}): number => {
  const numHoursDisplayed = maxHour - minHour;

  /**
   * In Rive, the vertical timeline is 1440 units tall (24 hours * 60 minutes).
   * To calculate the height of one minute in the timeline, we divide the total height by the total number of minutes DISPLAYED.
   * For example:
   * If we are displaying 24 hours, the height of one minute is 1440 / 1440 = 1. 1 minute is exactly 1 unit tall.
   * If we are displaying 12 hours, the height of one minute is 1440 / (12 * 60) = 2. 1 minute is 2 units tall.
   */

  const heightOfOneHour = 1440 / numHoursDisplayed;
  const heightOfOneMinute = heightOfOneHour / 60;

  return heightOfOneMinute;
};

// a key to group sets by displayDate and stageName
export const createSetListKey = ({
  displayDate,
  stageName,
}: {
  displayDate: string;
  stageName: string;
}) => {
  return `${displayDate}-${stageName}`;
};

export const isDayClickEvent = (
  stateName: string
): stateName is `DAY${number}` => {
  return /^DAY\d+$/.test(stateName);
};

export const isSetClickEvent = (stateName: string) => {
  return stateName.trim().includes("displayDrawer");
};
