import tracerLogger from "tracer";

import "colors";

export const logger = tracerLogger.colorConsole({
  format: "({{timestamp}} ~~ in {{file}}:{{line}}) ==> {{message}}".blue,
  dateformat: "HH:MM:ss",
});
