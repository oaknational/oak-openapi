import { NodeHtmlMarkdown } from 'node-html-markdown';

const markdownConverter = new NodeHtmlMarkdown({
  bulletMarker: '-',
  codeFence: '```',
});

function normaliseWhitespace(input: string): string {
  return input
    .replace(/\r\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n[ \t]+/g, '\n')
    .trim();
}

function extractTitle(html: string): string | null {
  const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  if (!titleMatch) {
    return null;
  }

  return titleMatch[1].replace(/\s+/g, ' ').trim() || null;
}

export function htmlToMarkdown(html: string): string {
  const title = extractTitle(html);
  const markdown = normaliseWhitespace(markdownConverter.translate(html));

  if (!markdown && title) {
    return `# ${title}`;
  }

  if (title && markdown && !markdown.startsWith('# ')) {
    return `# ${title}\n\n${markdown}`;
  }

  return markdown;
}

export function estimateMarkdownTokens(markdown: string): number {
  const trimmed = markdown.trim();
  if (!trimmed) {
    return 0;
  }

  return Math.ceil(trimmed.length / 4);
}
