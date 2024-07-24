import { DateTime, Interval } from "luxon";

export default function (
  file: File,
  options: { type: string; keyTemplate: string; prefix: string },
) {
  const type = options.type;
  let keyTemplate = options.keyTemplate;

  if (keyTemplate === undefined || keyTemplate.trim().length === 0) {
    keyTemplate = defaultKeyTemplate;
  }

  const now = DateTime.now();
  const interval = Interval.fromDateTimes(now.startOf("day"), now);

  const data: Record<string, string> = {
    prefix: options.prefix,
    random: `${interval.length("milliseconds").toString(36)}-${Math.random()
      .toString(36)
      .substring(2, 4)}`,
    filename: file.name,
    ext: type === "none" ? file.name.split(".").pop() || "" : type,
  };

  return keyTemplate.replace(/{{(.*?)}}/g, (match, key) => data[key] || match);
}
