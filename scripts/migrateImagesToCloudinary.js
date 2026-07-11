import { Client, Databases, Query } from 'node-appwrite';
import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: resolve(__dirname, '../.env') });

// ── Config ──────────────────────────────────────────────────────────────────
const ENDPOINT        = process.env.VITE_APPWRITE_URL;
const PROJECT_ID      = process.env.VITE_APPWRITE_PROJECT_ID;
const API_KEY         = process.env.APPWRITE_API_KEY;
const DATABASE_ID     = process.env.VITE_APPWRITE_DATABASE_ID;
const COLLECTION_ID   = process.env.VITE_APPWRITE_POST_COLLECTION_ID;
const BUCKET_ID       = process.env.VITE_APPWRITE_STORAGE_ID;

const required = { ENDPOINT, PROJECT_ID, API_KEY, DATABASE_ID, COLLECTION_ID, BUCKET_ID };
const missing = Object.entries(required).filter(([, v]) => !v).map(([k]) => k);
if (missing.length) {
  console.error('Missing env vars:', missing.join(', '));
  process.exit(1);
}

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME ?? process.env.VITE_CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure:     true,
});

const client = new Client().setEndpoint(ENDPOINT).setProject(PROJECT_ID).setKey(API_KEY);
const databases = new Databases(client);

// ── Helpers ──────────────────────────────────────────────────────────────────
function extractFileId(imageUrl) {
  const m = imageUrl.match(/\/files\/([^/?]+)\//);
  return m ? m[1] : null;
}

async function fetchFromAppwrite(fileId) {
  // Use /view (raw file) with admin credentials instead of /preview
  const url = `${ENDPOINT}/storage/buckets/${BUCKET_ID}/files/${fileId}/view?project=${PROJECT_ID}`;
  const res = await fetch(url, {
    headers: {
      'X-Appwrite-Project': PROJECT_ID,
      'X-Appwrite-Key': API_KEY,
    },
  });
  if (!res.ok) throw new Error(`Appwrite fetch ${res.status} for fileId ${fileId}`);
  return Buffer.from(await res.arrayBuffer());
}

function uploadToCloudinary(buffer, publicId) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: 'eatable',
        public_id: publicId,   // use fileId so re-runs are idempotent
        overwrite: false,      // skip if already uploaded
        resource_type: 'image',
        quality: 'auto',
        fetch_format: 'auto',
      },
      (err, result) => (err ? reject(err) : resolve(result))
    );
    stream.end(buffer);
  });
}

// ── Migration ─────────────────────────────────────────────────────────────────
async function migrate() {
  console.log('Starting Appwrite → Cloudinary image migration...\n');

  let cursor = null;
  let total = 0, succeeded = 0, failed = 0;
  const failures = [];

  while (true) {
    const queries = [
      Query.contains('imageUrl', 'appwrite.io'),
      Query.limit(25),
    ];
    if (cursor) queries.push(Query.cursorAfter(cursor));

    const batch = await databases.listDocuments(DATABASE_ID, COLLECTION_ID, queries);
    if (batch.documents.length === 0) break;

    for (const post of batch.documents) {
      total++;
      const fileId = extractFileId(post.imageUrl);

      if (!fileId) {
        console.log(`[SKIP]  ${post.$id} — cannot parse fileId from: ${post.imageUrl}`);
        failures.push({ id: post.$id, reason: 'unparseable URL' });
        failed++;
        continue;
      }

      process.stdout.write(`[${total}] ${post.$id}  fileId=${fileId} … `);

      try {
        const buffer = await fetchFromAppwrite(fileId);
        const uploaded = await uploadToCloudinary(buffer, fileId);

        let updateOk = false;

        // Try SDK first (both fields)
        try {
          await databases.updateDocument(DATABASE_ID, COLLECTION_ID, post.$id, {
            imageUrl: uploaded.secure_url,
            imageId:  uploaded.public_id,
          });
          updateOk = true;
        } catch { /* fall through */ }

        // Fallback: raw REST PATCH — bypasses SDK relationship validation
        if (!updateOk) {
          const patchRes = await fetch(
            `${ENDPOINT}/databases/${DATABASE_ID}/collections/${COLLECTION_ID}/documents/${post.$id}`,
            {
              method: 'PATCH',
              headers: {
                'Content-Type': 'application/json',
                'X-Appwrite-Project': PROJECT_ID,
                'X-Appwrite-Key': API_KEY,
              },
              body: JSON.stringify({ data: { imageUrl: uploaded.secure_url, imageId: uploaded.public_id } }),
            }
          );
          if (!patchRes.ok) {
            const err = await patchRes.json().catch(() => ({ message: patchRes.status }));
            throw new Error(err.message ?? JSON.stringify(err));
          }
          updateOk = true;
        }

        console.log(`✓  ${uploaded.public_id}`);
        succeeded++;
      } catch (err) {
        // If Cloudinary upload already succeeded but DB update failed,
        // compute what the URL would be so user can update manually
        const expectedUrl = `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME ?? process.env.VITE_CLOUDINARY_CLOUD_NAME}/image/upload/eatable/${fileId}`;
        console.log(`✗  DB update blocked — update manually in Appwrite Console:`);
        console.log(`     imageUrl = ${expectedUrl}`);
        console.log(`     imageId  = eatable/${fileId}`);
        failures.push({ id: post.$id, fileId, reason: err.message, manualUrl: expectedUrl });
        failed++;
      }
    }

    cursor = batch.documents.at(-1).$id;
    if (batch.documents.length < 25) break;
  }

  console.log(`\n─────────────────────────────────`);
  console.log(`Done:  ${succeeded} migrated,  ${failed} failed,  ${total} total`);
  if (failures.length) {
    console.log('\nFailed posts:');
    failures.forEach(f => console.log(`  ${f.id}  fileId=${f.fileId ?? '?'}  reason: ${f.reason}`));
  }
}

migrate().catch(err => {
  console.error('Fatal:', err);
  process.exit(1);
});
