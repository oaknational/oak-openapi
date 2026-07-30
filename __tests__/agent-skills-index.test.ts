import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { describe, it, expect } from 'vitest';

const index = JSON.parse(
  readFileSync(
    new URL('../public/.well-known/agent-skills/index.json', import.meta.url),
    'utf-8',
  ),
) as {
  $schema: string;
  skills: {
    name: string;
    type: string;
    description: string;
    url: string;
    digest: string;
  }[];
};

describe('agent skills discovery index', () => {
  it('declares the RFC v0.2.0 schema and a non-empty skills array', () => {
    expect(index.$schema).toBe(
      'https://schemas.agentskills.io/discovery/0.2.0/schema.json',
    );
    expect(index.skills.length).toBeGreaterThan(0);
  });

  it('has a valid, well-formed entry for every skill', () => {
    for (const skill of index.skills) {
      expect(skill.name).toMatch(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
      expect(['skill-md', 'archive']).toContain(skill.type);
      expect(skill.description).toBeTruthy();
      expect(skill.description.length).toBeLessThanOrEqual(1024);
      expect(skill.url).toMatch(/^\/\.well-known\/agent-skills\//);
      expect(skill.digest).toMatch(/^sha256:[0-9a-f]{64}$/);
    }
  });

  it('publishes a digest that matches the served SKILL.md bytes', () => {
    for (const skill of index.skills) {
      const bytes = readFileSync(
        new URL(`../public${skill.url}`, import.meta.url),
      );
      const digest = `sha256:${createHash('sha256')
        .update(bytes)
        .digest('hex')}`;

      expect(digest).toBe(skill.digest);
    }
  });
});
