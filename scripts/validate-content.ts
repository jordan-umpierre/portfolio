/**
 * Content registry invariants. Run with `pnpm validate-content`
 * (plain `node` — relies on Node's built-in TypeScript type stripping).
 */
import { board } from "../src/content/board.ts";
import { projects, projectBySlug } from "../src/content/projects.ts";

const errors: string[] = [];
const assert = (cond: boolean, msg: string) => {
  if (!cond) errors.push(msg);
};

assert(board.length === 28, `board has ${board.length} spaces, expected 28`);

board.forEach((space, i) => {
  assert(space.index === i, `space ${space.slug} index ${space.index} !== position ${i}`);
});

for (const i of [0, 7, 14, 21]) {
  assert(board[i]?.kind === "corner", `space ${i} must be a corner, got ${board[i]?.kind}`);
}
assert(
  board.filter((s) => s.kind === "corner").length === 4,
  "exactly 4 corners required",
);

const slugs = board.map((s) => s.slug);
assert(new Set(slugs).size === slugs.length, "board slugs must be unique");

const projectSlugs = projects.map((p) => p.slug);
assert(
  new Set(projectSlugs).size === projectSlugs.length,
  "project slugs must be unique",
);

const referenced = new Set<string>();
for (const space of board) {
  if (space.kind === "project" || space.kind === "client") {
    referenced.add(space.projectSlug);
    assert(
      projectBySlug.has(space.projectSlug),
      `space ${space.slug} references unknown project ${space.projectSlug}`,
    );
  }
}
for (const p of projects) {
  assert(referenced.has(p.slug), `project ${p.slug} has no board space`);
  assert(p.build.length > 0, `project ${p.slug} has no build bullets`);
  assert(p.stack.length > 0, `project ${p.slug} has no stack`);
  if (p.status !== "live") {
    assert(!!p.statusLabel, `non-live project ${p.slug} needs a statusLabel`);
  }
  for (const url of Object.values(p.links)) {
    assert(/^https:\/\//.test(url), `project ${p.slug} link not https: ${url}`);
  }
}

if (errors.length) {
  console.error(`validate-content: ${errors.length} error(s)`);
  for (const e of errors) console.error(`  ✗ ${e}`);
  process.exit(1);
}
console.log(`validate-content: OK (28 spaces, ${projects.length} projects)`);
