// Maps legacy free-text post tags to the canonical dietary tags defined in
// src/constants/index.ts. Note: Appwrite cannot index array attributes, so
// dietary-filtered search runs unindexed via Query.contains — fine at current
// scale, revisit if the posts collection grows past ~10k documents.
//
// Dry-run by default (prints what would change). Pass --apply to write.
//
//   node backfillDietaryTags.js           # report only
//   node backfillDietaryTags.js --apply   # write changes

import dotenv from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: resolve(__dirname, '../.env') });

const ENDPOINT      = process.env.VITE_APPWRITE_URL;
const PROJECT_ID    = process.env.VITE_APPWRITE_PROJECT_ID;
const API_KEY       = process.env.APPWRITE_API_KEY;
const DATABASE_ID   = process.env.VITE_APPWRITE_DATABASE_ID;
const COLLECTION_ID = process.env.VITE_APPWRITE_POST_COLLECTION_ID;

const required = { ENDPOINT, PROJECT_ID, API_KEY, DATABASE_ID, COLLECTION_ID };
const missing = Object.entries(required).filter(([, v]) => !v).map(([k]) => k);
if (missing.length) { console.error('Missing env vars:', missing.join(', ')); process.exit(1); }

const APPLY = process.argv.includes('--apply');

const HEADERS = {
  'Content-Type': 'application/json',
  'X-Appwrite-Project': PROJECT_ID,
  'X-Appwrite-Key': API_KEY,
};

// Must mirror DIETARY_TAGS in src/constants/index.ts
const DIETARY_TAGS = [
  'Vegan', 'Vegetarian', 'Pescatarian', 'Gluten-Free', 'Dairy-Free',
  'Nut-Free', 'Egg-Free', 'Soy-Free', 'Shellfish-Free', 'Kosher',
  'Halal', 'Keto', 'Paleo', 'Low-FODMAP',
];

// normalized form (lowercase, alphanumerics only) -> canonical tag
const SYNONYMS = {
  vegan: 'Vegan',
  vegetarian: 'Vegetarian', veggie: 'Vegetarian',
  pescatarian: 'Pescatarian', pescetarian: 'Pescatarian',
  glutenfree: 'Gluten-Free', gf: 'Gluten-Free', nogluten: 'Gluten-Free',
  celiac: 'Gluten-Free', coeliac: 'Gluten-Free', celiacsafe: 'Gluten-Free',
  dairyfree: 'Dairy-Free', nondairy: 'Dairy-Free', nodairy: 'Dairy-Free',
  lactosefree: 'Dairy-Free',
  nutfree: 'Nut-Free', nonuts: 'Nut-Free', peanutfree: 'Nut-Free',
  treenutfree: 'Nut-Free', allergyfriendly: 'Nut-Free',
  eggfree: 'Egg-Free', noegg: 'Egg-Free', noeggs: 'Egg-Free',
  soyfree: 'Soy-Free', nosoy: 'Soy-Free',
  shellfishfree: 'Shellfish-Free', noshellfish: 'Shellfish-Free',
  kosher: 'Kosher',
  halal: 'Halal',
  keto: 'Keto', ketogenic: 'Keto', lowcarb: 'Keto',
  paleo: 'Paleo',
  lowfodmap: 'Low-FODMAP', fodmap: 'Low-FODMAP',
};
for (const tag of DIETARY_TAGS) {
  SYNONYMS[tag.toLowerCase().replace(/[^a-z0-9]/g, '')] = tag;
}

function mapTag(tag) {
  const normalized = String(tag).toLowerCase().replace(/[^a-z0-9]/g, '');
  return SYNONYMS[normalized] ?? null;
}

async function listPosts(cursor) {
  const queries = [JSON.stringify({ method: 'limit', values: [100] })];
  if (cursor) queries.push(JSON.stringify({ method: 'cursorAfter', values: [cursor] }));
  const params = queries.map((q) => `queries[]=${encodeURIComponent(q)}`).join('&');
  const res = await fetch(
    `${ENDPOINT}/databases/${DATABASE_ID}/collections/${COLLECTION_ID}/documents?${params}`,
    { headers: HEADERS }
  );
  if (!res.ok) throw new Error(`List failed (${res.status}): ${await res.text()}`);
  return res.json();
}

async function patchTags(docId, tags) {
  const res = await fetch(
    `${ENDPOINT}/databases/${DATABASE_ID}/collections/${COLLECTION_ID}/documents/${docId}`,
    { method: 'PATCH', headers: HEADERS, body: JSON.stringify({ data: { tags } }) }
  );
  if (!res.ok) {
    const body = await res.json().catch(() => ({ message: res.status }));
    throw new Error(body.message ?? JSON.stringify(body));
  }
}

async function run() {
  console.log(`Mode: ${APPLY ? 'APPLY — writing changes' : 'DRY RUN — report only (pass --apply to write)'}\n`);

  let cursor = null;
  let total = 0;
  let changed = 0;
  let failed = 0;
  const unknownTags = new Map(); // tag -> occurrence count

  for (;;) {
    const page = await listPosts(cursor);
    if (page.documents.length === 0) break;

    for (const doc of page.documents) {
      total++;
      const oldTags = (doc.tags || []).filter(Boolean);
      const newTags = [];
      for (const tag of oldTags) {
        const canonical = mapTag(tag);
        if (canonical) {
          if (!newTags.includes(canonical)) newTags.push(canonical);
        } else {
          // Unknown tags are preserved, not destroyed
          if (!newTags.includes(tag)) newTags.push(tag);
          unknownTags.set(tag, (unknownTags.get(tag) ?? 0) + 1);
        }
      }

      const isChanged = JSON.stringify(oldTags) !== JSON.stringify(newTags);
      if (!isChanged) continue;
      changed++;
      console.log(`[${doc.$id}] ${JSON.stringify(oldTags)} -> ${JSON.stringify(newTags)}`);

      if (APPLY) {
        try {
          await patchTags(doc.$id, newTags);
        } catch (err) {
          failed++;
          console.log(`  ✗ write failed: ${err.message}`);
        }
      }
    }

    if (page.documents.length < 100) break;
    cursor = page.documents[page.documents.length - 1].$id;
  }

  console.log(`\n${total} posts scanned, ${changed} ${APPLY ? 'updated' : 'would change'}${failed ? `, ${failed} failed` : ''}.`);
  if (unknownTags.size) {
    console.log('\nTags with no canonical mapping (preserved as-is):');
    for (const [tag, count] of [...unknownTags.entries()].sort((a, b) => b[1] - a[1])) {
      console.log(`  ${count}x ${JSON.stringify(tag)}`);
    }
    console.log('Add synonyms to SYNONYMS above and re-run if any of these should map.');
  }
}

run().catch((err) => { console.error('Fatal:', err); process.exit(1); });
