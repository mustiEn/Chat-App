import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

dayjs.extend(utc);
dayjs.extend(timezone);

export const formatDate = (date) => {
  const input = dayjs.utc(date).local();
  let format;
  const today = dayjs().startOf("day");
  const yesterday = dayjs().subtract(1, "day").startOf("day");

  if (input.isSame(today, "day")) {
    format = input.format("hh:mm");
  } else if (input.isSame(yesterday, "day")) {
    format = `Yesterday at ${input.format("hh:mm")}`;
  } else {
    format = input.format("D/MM/YYYY, hh:mm");
  }
  return format;
};
