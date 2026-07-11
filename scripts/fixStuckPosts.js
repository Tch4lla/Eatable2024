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

const HEADERS = {
  'Content-Type': 'application/json',
  'X-Appwrite-Project': PROJECT_ID,
  'X-Appwrite-Key': API_KEY,
};

const POSTS = [
  {
    id: '65dbed9297e3a71bacf5',
    imageUrl: 'https://res.cloudinary.com/dk6rh8cgz/image/upload/eatable/65dbed919c3a9461d631',
    imageId:  'eatable/65dbed919c3a9461d631',
  },
  {
    id: '65dd2825540d944e013f',
    imageUrl: 'https://res.cloudinary.com/dk6rh8cgz/image/upload/eatable/65dd2823ed28be98332f',
    imageId:  'eatable/65dd2823ed28be98332f',
  },
  {
    id: '65f51953665f4ca59f21',
    imageUrl: 'https://res.cloudinary.com/dk6rh8cgz/image/upload/eatable/65f51951d5562856d009',
    imageId:  'eatable/65f51951d5562856d009',
  },
  {
    id: '668953b3c32bbe8632b0',
    imageUrl: 'https://res.cloudinary.com/dk6rh8cgz/image/upload/eatable/668953b26d4a9cbcadaf',
    imageId:  'eatable/668953b26d4a9cbcadaf',
  },
];

function docUrl(docId) {
  return `${ENDPOINT}/databases/${DATABASE_ID}/collections/${COLLECTION_ID}/documents/${docId}`;
}

async function getDoc(docId) {
  const res = await fetch(docUrl(docId), { headers: HEADERS });
  if (!res.ok) throw new Error(`GET ${res.status}: ${await res.text()}`);
  return res.json();
}

async function patch(docId, data) {
  const res = await fetch(docUrl(docId), {
    method: 'PATCH',
    headers: HEADERS,
    body: JSON.stringify({ data }),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({ message: res.status }));
    throw new Error(body.message ?? JSON.stringify(body));
  }
  return res.json();
}

async function fix() {
  console.log('Fixing 4 stuck posts with NULL relationship data...\n');

  for (const post of POSTS) {
    process.stdout.write(`[${post.id}] fetching… `);

    let doc;
    try {
      doc = await getDoc(post.id);
    } catch (err) {
      console.log(`✗ fetch failed: ${err.message}`);
      continue;
    }

    // Find fields that are null (relationship fields that should be arrays)
    const nullFields = Object.entries(doc)
      .filter(([k, v]) => v === null && !k.startsWith('$'))
      .map(([k]) => k);

    if (nullFields.length === 0) {
      console.log('no NULL fields found — attempting direct image update');
    } else {
      process.stdout.write(`null fields: [${nullFields.join(', ')}] — patching to []… `);
      try {
        const nullPatch = Object.fromEntries(nullFields.map(k => [k, []]));
        await patch(post.id, nullPatch);
        process.stdout.write('✓  ');
      } catch (err) {
        console.log(`✗ null-field patch failed: ${err.message}`);
        continue;
      }
    }

    // Now update imageUrl and imageId
    process.stdout.write('updating imageUrl/imageId… ');
    try {
      await patch(post.id, { imageUrl: post.imageUrl, imageId: post.imageId });
      console.log(`✓  ${post.imageUrl}`);
    } catch (err) {
      console.log(`✗ image update failed: ${err.message}`);
    }
  }

  console.log('\nDone.');
}

fix().catch(err => { console.error('Fatal:', err); process.exit(1); });
