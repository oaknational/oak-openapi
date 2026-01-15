const isColour = process.stdout.isTTY && process.env.TERM !== 'dumb';
const RED = '\x1b[31m';
const RESET = '\x1b[0m';
const start = Date.now();

function runtime(): string {
  // returns hours, minutes, seconds since start
  const elapsed = Date.now() - start;
  const seconds = Math.floor(elapsed / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);

  // returns in the format of 00:03:00
  return [hours, minutes % 60, seconds % 60]
    .map((num) => num.toString().padStart(2, '0'))
    .join(':');
}

export function log(message: string): void {
  console.log(`[${runtime()}] ${message}`);
}

export function logError(message: string): void {
  let log = `[${runtime()}][ERROR] ${message}`;
  if (isColour) {
    log = `${RED}${log}${RESET}`;
  }
  console.error(log);
}
