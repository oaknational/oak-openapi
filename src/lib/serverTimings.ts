type TimingsRecord = Record<
  string,
  { start: [number, number]; end?: [number, number]; delta?: string }
>;

export default class Timing {
  timings: TimingsRecord = {};

  start(key: string) {
    this.timings[key] = {
      start: process.hrtime(),
    };

    return this.timings[key].start;
  }

  end(key: string) {
    if (!this.timings[key] || !this.timings[key].start) {
      return;
    }

    this.timings[key].end = process.hrtime(this.timings[key].start);
    this.timings[key].delta = (this.timings[key].end[1] / 1000000).toFixed(2);

    return this.timings[key].delta;
  }

  toHeader(headers: Headers) {
    let existingHeaders = [headers.get('Server-Timing')];

    if (!existingHeaders) {
      existingHeaders = [];
    }

    return Array.from(existingHeaders as string[]).concat(
      Object.keys(this.timings)
        .map((key, i) => {
          const delta = this.timings[key].delta || this.end(key);
          return `${i}; dur=${delta}; desc="${key}"`;
        })
        .join(', '),
    );
  }
}
