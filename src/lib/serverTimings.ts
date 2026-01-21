type TimingsRecord = Record<
  string,
  { start: [number, number]; end?: [number, number]; delta?: string }
>;

export default class Timing {
  timings: TimingsRecord = {};

  start(key: string): [number, number] {
    this.timings[key] = {
      start: process.hrtime(),
    };

    return this.timings[key].start;
  }

  end(key: string): void {
    if (!this.timings[key] || !this.timings[key].start) {
      return;
    }

    this.timings[key].end = process.hrtime(this.timings[key].start);
    this.timings[key].delta = (this.timings[key].end[1] / 1000000).toFixed(2);
  }

  toHeader(headers: Headers): string[] {
    const existingHeader = headers.get('Server-Timing');
    const existingHeaders: (string | null)[] = existingHeader
      ? [existingHeader]
      : [];

    return existingHeaders
      .filter((h): h is string => h !== null)
      .concat(
        Object.keys(this.timings)
          .map((key, i) => {
            const delta = this.timings[key].delta;
            return `${i}; dur=${delta}; desc="${key}"`;
          })
          .join(', '),
      );
  }
}
