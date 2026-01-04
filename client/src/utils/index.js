import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

dayjs.extend(utc);
dayjs.extend(timezone);

export const formatDate = (date) => {
  // const input = dayjs.utc(date).local();
  const input = dayjs(date).tz(dayjs.tz.guess());
  let format;
  const today = dayjs().startOf("day");
  const yesterday = dayjs().subtract(1, "day").startOf("day");
  const amOrPm = input.hour() >= 12 ? "HH" : "hh";

  if (input.isSame(today, "day")) {
    format = input.format(`${amOrPm}:mm`);
  } else if (input.isSame(yesterday, "day")) {
    format = `Yesterday at ${input.format(`${amOrPm}:mm`)}`;
  } else {
    format = input.format("D/MM/YYYY, hh:mm");
  }
  return format;
};
export const returnLocalNow = () =>
  dayjs().tz(dayjs.tz.guess()).format("YYYY-MM-DD HH:mm:ss");
export const isURL = (str) => {
  const urlRegex = /^(https?:\/\/)?([a-z0-9-]+\.)+[a-z]{2,}(:\d+)?(\/\S*)?$/i;
  return urlRegex.test(str.trim());
};
export const normaliseURL = (str) => {
  const trimmed = str.trim();

  if (/^https?:\/\//i.test(trimmed)) return trimmed;

  return `https://${trimmed}`;
};
export const concatName = (name) => {
  return name?.length > 15 ? name.slice(15).concat("...") : name;
};
