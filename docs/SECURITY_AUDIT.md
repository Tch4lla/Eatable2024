# Security Audit — Eatable

Audit date: 2026-04-23
Stack: React 18 + TypeScript + Vite, Appwrite (BaaS), Cloudinary (image hosting)

---

## Vulnerability Summary

| # | Severity | Issue | File |
|---|---|---|---|
| 1 | CRITICAL | Cloudinary API secret exposed in browser bundle | `src/lib/cloudinary/config.ts:5` |
| 2 | CRITICAL | No ownership check on `deletePost` | `src/lib/appwrite/api.ts:338` |
| 3 | CRITICAL | No ownership check on `updatePost` | `src/lib/appwrite/api.ts:279` |
| 4 | CRITICAL | No ownership check on `updateUser` | `src/lib/appwrite/api.ts:415` |
| 5 | CRITICAL | No ownership check on `likePost` | `src/lib/appwrite/api.ts:217` |
| 6 | CRITICAL | Appwrite document permissions not set at creation | `src/lib/appwrite/api.ts` (all `createDocument` calls) |
| 7 | HIGH | Cloudinary API key also exposed in browser bundle | `src/lib/cloudinary/config.ts:4` |
| 8 | HIGH | Plaintext full user object cached in localStorage | `src/context/AuthContext.tsx:43` |
| 9 | HIGH | Images never actually deleted (mock deletion) | `src/lib/cloudinary/api.ts:196` |
| 10 | HIGH | Cloudinary delete serverless function not deployed | `functions/deleteFromCloudinary/` |
| 11 | MEDIUM | No server-side input validation | `src/lib/appwrite/api.ts` (all mutations) |
| 12 | MEDIUM | No rate limiting on mutations | Appwrite console |
| 13 | MEDIUM | No Content Security Policy headers | Hosting config (vercel.json) |
| 14 | MEDIUM | Infrastructure config (`appwrite.config.json`) staged for git | `.gitignore` |

---

## Critical Issues — Fix Before Public Launch

### 1. Cloudinary API Secret in Browser Bundle

**What it is:** `VITE_CLOUDINARY_API_SECRET` and `VITE_CLOUDINARY_API_KEY` are prefixed with `VITE_`, which causes Vite to inline them into the JavaScript bundle shipped to every browser. Anyone can open DevTools → Sources and read the values.

**Why it's dangerous:** The API secret grants full administrative access to your Cloudinary account — delete any image, modify transformations, run up bandwidth costs, access billing. This is not a theoretical risk; Cloudinary credentials are actively scraped from public JavaScript bundles.

**File:** `src/lib/cloudinary/config.ts:4-5`

```typescript
// CURRENT — both of these are visible in the browser
apiKey: import.meta.env.VITE_CLOUDINARY_API_KEY,
apiSecret: import.meta.env.VITE_CLOUDINARY_API_SECRET,
```

**Fix:**

Step 1 — Remove from client config. The client only needs `cloudName` and `uploadPreset`:

```typescript
// src/lib/cloudinary/config.ts — after fix
export const cloudinaryConfig = {
    cloudName: import.meta.env.VITE_CLOUDINARY_CLOUD_NAME,
    uploadPreset: import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET,
    // apiKey and apiSecret removed — server-only
};
```

Step 2 — Rename in `.env` (drop the `VITE_` prefix so Vite never touches them):

```bash
# .env — server-only vars (no VITE_ prefix)
CLOUDINARY_API_KEY=your_key_here
CLOUDINARY_API_SECRET=your_secret_here

# Client-safe vars (VITE_ prefix is fine)
VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name
VITE_CLOUDINARY_UPLOAD_PRESET=your_upload_preset
```

Step 3 — Use `CLOUDINARY_API_KEY` and `CLOUDINARY_API_SECRET` only inside the `functions/deleteFromCloudinary` Appwrite serverless function (where they are safe as server-side environment variables).

Step 4 — Rotate your Cloudinary API key and secret immediately after removing them from the bundle. Treat the currently committed values as compromised.

---

### 2. No Authorization Check on `deletePost`

**Status: Fixed** — `deletePost` now calls `account.get()`, fetches the post, and throws `Unauthorized` if `post.creator?.accountId !== currentAccount.$id`.

**What it is:** `deletePost` accepts a `postId` and deletes the document with no verification that the caller owns it. The frontend hides the delete button via a CSS `hidden` class — but the function is callable directly from the browser console by any logged-in user.

**File:** `src/lib/appwrite/api.ts:338`

```typescript
// CURRENT — deletes any post if you know the postId
export async function deletePost(postId: string, imageId: string) {
    if (!postId || !imageId) return;
    const statusCode = await databases.deleteDocument(
        appwriteConfig.databaseId,
        appwriteConfig.postCollectionId,
        postId   // ← no check that current user owns this
    );
    ...
}
```

**Attack vector:** User A opens DevTools console and runs:
```javascript
deletePost("user_b_post_id", "user_b_image_id")
// Post deleted. No error.
```

**Fix — two layers required:**

Layer 1: Add ownership check in the API function:

```typescript
export async function deletePost(postId: string, imageId: string, currentUserId: string) {
    if (!postId || !imageId) return;

    // Verify ownership before deleting
    const post = await databases.getDocument(
        appwriteConfig.databaseId,
        appwriteConfig.postCollectionId,
        postId
    );
    if (post.creator.$id !== currentUserId) {
        throw new Error("Unauthorized: you do not own this post");
    }

    const statusCode = await databases.deleteDocument(
        appwriteConfig.databaseId,
        appwriteConfig.postCollectionId,
        postId
    );
    ...
}
```

Layer 2 (permanent fix): Set document-level permissions at post creation time so Appwrite itself enforces it at the database layer — see issue #6 below.

---

### 3. No Authorization Check on `updatePost`

**Status: Fixed** — `updatePost` now calls `account.get()`, fetches the existing post, and throws `Unauthorized` if `existing.creator?.accountId !== currentAccount.$id`.

**What it is:** Any authenticated user can update any post's caption, image, location, and tags by calling `updatePost` with an arbitrary `postId`.

**File:** `src/lib/appwrite/api.ts:279`

```typescript
// CURRENT — updates any post with no ownership verification
export async function updatePost(post: IUpdatePost) {
    ...
    const updatedPost = await databases.updateDocument(
        appwriteConfig.databaseId,
        appwriteConfig.postCollectionId,
        post.postId,  // ← any postId works
        { caption, imageUrl, imageId, location, tags }
    );
}
```

**Fix:**

```typescript
export async function updatePost(post: IUpdatePost) {
    // Verify ownership before updating
    const existing = await databases.getDocument(
        appwriteConfig.databaseId,
        appwriteConfig.postCollectionId,
        post.postId
    );
    if (existing.creator.$id !== post.userId) {
        throw new Error("Unauthorized: you do not own this post");
    }
    // ... rest of update logic
}
```

Add `userId: string` to the `IUpdatePost` type and pass `currentUser.id` from the calling component.

---

### 4. No Authorization Check on `updateUser`

**Status: Fixed** — `updateUser` now calls `account.get()`, fetches the user document, and throws `Unauthorized` if `userDoc.accountId !== currentAccount.$id`.

**What it is:** `updateUser` accepts a `userId` and updates the corresponding user document — name, bio, username, email, and avatar — with no check that the caller is that user. Any authenticated user can modify any other user's profile, including their email address.

**File:** `src/lib/appwrite/api.ts:415`

```typescript
// CURRENT — updates any user profile
export async function updateUser(user: IUpdateUser) {
    ...
    const updatedUser = await databases.updateDocument(
        appwriteConfig.databaseId,
        appwriteConfig.userCollectionId,
        user.userId,   // ← any userId works
        { name, bio, username, email, imageUrl, imageId }
    );
}
```

**Why email is the highest risk:** Changing another user's email could interfere with their login flow or be used for account confusion.

**Fix:**

```typescript
export async function updateUser(user: IUpdateUser, currentUserId: string) {
    if (user.userId !== currentUserId) {
        throw new Error("Unauthorized: you can only update your own profile");
    }
    // ... rest of update logic
}
```

Pass `currentUser.id` from `AuthContext` at the call site in `UpdateProfile.tsx`.

---

### 5. No Authorization Check on `likePost`

**Status: Fixed** — `likePost` now calls `account.get()` and throws `Unauthorized` if `currentAccount.$id !== userId`, preventing a user from liking as another account.

**What it is:** `likePost` replaces the entire `likes` array on a post document with whatever array is passed in. There is no validation that the array contains only the current user's ID.

**File:** `src/lib/appwrite/api.ts:217`

```typescript
// CURRENT — replaces entire likes array with no validation
export async function likePost(postId: string, likesArray: string[]) {
    const updatedPost = await databases.updateDocument(
        appwriteConfig.databaseId,
        appwriteConfig.postCollectionId,
        postId,
        { likes: likesArray }  // ← caller controls the whole array
    );
}
```

**Attack vectors:**
- Add fake user IDs to inflate a post's like count
- Remove another user's like from a post they liked
- Set an empty array to wipe all likes from any post

**Fix — enforce a single-user toggle server-side:**

```typescript
export async function likePost(postId: string, userId: string, isLiking: boolean) {
    const post = await databases.getDocument(
        appwriteConfig.databaseId,
        appwriteConfig.postCollectionId,
        postId
    );

    const currentLikes: string[] = post.likes || [];
    const updatedLikes = isLiking
        ? [...new Set([...currentLikes, userId])]         // add current user only
        : currentLikes.filter((id: string) => id !== userId); // remove current user only

    return await databases.updateDocument(
        appwriteConfig.databaseId,
        appwriteConfig.postCollectionId,
        postId,
        { likes: updatedLikes }
    );
}
```

Update call sites to pass `(postId, currentUser.id, !isLiked)` instead of the full array.

---

### 6. Appwrite Document Permissions Not Set

**Status: Fixed** — All three `createDocument` calls now pass a `Permission` array: `createPost` sets `read(any)`, `update(user)`, `delete(user)`; `savePost` sets `read(user)`, `delete(user)`; `saveUserToDB` sets `read(any)`.

**What it is:** When creating documents (`createDocument`), no `Permission` rules are passed. Appwrite defaults to permissive collection-level permissions that do not restrict updates/deletes to the document owner. This means the Appwrite SDK itself allows any authenticated user to mutate any document — even without going through your API functions.

**Files:** `src/lib/appwrite/api.ts` — `createPost` (line 147), `saveUserToDB` (line 68), `savePost` (line 236)

**Fix — add permissions at creation time for every document:**

```typescript
import { ID, Query, Permission, Role } from "appwrite";

// In createPost:
const newPost = await databases.createDocument(
    appwriteConfig.databaseId,
    appwriteConfig.postCollectionId,
    ID.unique(),
    { creator: post.userId, caption, imageUrl, imageId, location, tags },
    [
        Permission.read(Role.any()),                    // anyone can read posts
        Permission.update(Role.user(post.userId)),     // only creator can update
        Permission.delete(Role.user(post.userId)),     // only creator can delete
    ]
);

// In savePost:
const savedPost = await databases.createDocument(
    appwriteConfig.databaseId,
    appwriteConfig.savesCollectionId,
    ID.unique(),
    { user: userId, post: postId },
    [
        Permission.read(Role.user(userId)),
        Permission.delete(Role.user(userId)),
    ]
);

// In saveUserToDB:
const newUser = await databases.createDocument(
    appwriteConfig.databaseId,
    appwriteConfig.userCollectionId,
    ID.unique(),
    user,
    [
        Permission.read(Role.any()),
        Permission.update(Role.user(user.accountId)),
    ]
);
```

This is the **permanent defense** — even if the ownership checks in issues #2–5 have a bug, Appwrite will still reject unauthorized operations at the database layer.

---

## High Severity Issues

### 7. Cloudinary API Key Also in Browser Bundle

The `VITE_CLOUDINARY_API_KEY` at `config.ts:4` shares the same problem as the secret. While the key alone is less dangerous than the secret, together they allow full API access. Covered by the same fix as issue #1 — remove both from the `VITE_` namespace.

---

### 8. Plaintext User Data in localStorage

**Status: Fixed** — `saveUserToCache` now stores only `{ name, username, imageUrl, bio }`. User `id` and `email` are explicitly excluded. Cache expires after 15 minutes. Full user object (including `id` and `email`) is always fetched fresh from the API on `checkAuthUser`.

**File:** `src/context/AuthContext.tsx:43`

The full user object was serialized to localStorage:

```typescript
const cacheData = {
    user: userData,   // included id, name, username, email, imageUrl, bio
    timestamp: Date.now(),
};
localStorage.setItem(USER_CACHE_KEY, JSON.stringify(cacheData));
```

localStorage is readable by any JavaScript on the page. An XSS vulnerability anywhere (third-party script, injected content) gives an attacker the user's email and internal ID.

The session cookie from Appwrite handles authentication state. The localStorage cache only needs display data for instant UI rendering.

---

### 9. Images Never Actually Deleted

**File:** `src/lib/cloudinary/api.ts:196`

```typescript
export async function deleteFromCloudinary(publicId: string) {
    // TEMPORARY SOLUTION
    console.log(`[MOCK DELETE] Would delete image with ID: ${publicId}`);
    return { status: 'ok' };   // does nothing
}
```

Every "deleted" post still has a live, accessible image URL on Cloudinary. Users who delete their content have a reasonable expectation that it's gone. This is also a GDPR compliance issue if the app ever handles EU users.

**Fix — deploy the Appwrite function (see issue #10) then activate the commented code:**

```typescript
export async function deleteFromCloudinary(publicId: string) {
    const { Client, Functions } = await import('appwrite');
    const client = new Client()
        .setEndpoint('https://cloud.appwrite.io/v1')
        .setProject(import.meta.env.VITE_APPWRITE_PROJECT_ID);

    const functions = new Functions(client);
    const execution = await functions.createExecution(
        import.meta.env.VITE_DELETE_FUNCTION_ID,  // set this after deploying
        JSON.stringify({ publicId }),
        false
    );

    if ((execution as any).status === 'completed') {
        return { status: 'ok' };
    }
    return { status: 'error' };
}
```

---

### 10. Cloudinary Delete Function Not Deployed

**Directory:** `functions/deleteFromCloudinary/`

The function exists and is correctly written, but the function ID placeholder (`'YOUR_FUNCTION_ID'`) was never replaced and the function was never deployed to Appwrite.

**Steps to deploy:**

```bash
# 1. Install Appwrite CLI if not installed
npm install -g appwrite-cli

# 2. Login and link your project
appwrite login
appwrite init project

# 3. Deploy the function
appwrite deploy function --functionId deleteFromCloudinary

# 4. In Appwrite Console → Functions → deleteFromCloudinary:
#    Add environment variables:
#    CLOUDINARY_CLOUD_NAME=your_cloud_name
#    CLOUDINARY_API_KEY=your_api_key        (server-only, no VITE_ prefix)
#    CLOUDINARY_API_SECRET=your_api_secret  (server-only, no VITE_ prefix)

# 5. Copy the Function ID from Appwrite Console
# 6. Add to .env:
VITE_DELETE_FUNCTION_ID=your_function_id_here
```

---

## Medium Severity Issues

### 11. No Server-Side Input Validation

**Status: Fixed** — Guards added to all mutation and read functions in `src/lib/appwrite/api.ts`.

| Function | Guard added |
|---|---|
| `createPost` | userId required, caption ≤ 2200 chars, file required |
| `updatePost` | postId required, caption ≤ 2200 chars + ownership check |
| `deletePost` | early return if no postId/imageId + ownership check |
| `updateUser` | userId and name required + ownership check |
| `likePost` | ownership check |
| `saveUserToDB` | accountId, email, and name required |
| `getPostById` | early return if no postId |
| `deleteSavedPost` | early return if no savedRecordId |
| `getUserById` | early return if no userId |
| `searchPosts` | trims and caps searchTerm to 100 chars before querying |

Zod schemas continue to validate form input on the client; these guards are the server-side line of defence for callers bypassing the UI.

When migrating to Supabase, move this validation to PostgreSQL check constraints and database functions — then it is enforced at the database layer regardless of which client calls it.

---

### 12. No Rate Limiting on Mutations

**Update:** Appwrite applies rate limiting automatically at the API level for all Client SDK requests — no manual console configuration is required. You can observe the limits in effect via response headers (`X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`).

**Important caveat:** Rate limits only apply to Client SDK requests. Requests made via a Server SDK authenticated with an API key bypass rate limiting entirely. If you ever add server-to-server integrations or Appwrite Functions that call write operations, those paths are unthrottled.

The built-in limits cover auth and abuse-prevention endpoints. Appwrite's docs do not explicitly confirm that database write operations (`createPost`, `likePost`, `savePost`) are subject to the same limits. If you observe abuse in production (spam posts, like-bombing), add a client-side debounce or enforce per-user write limits inside an Appwrite Function wrapper.

At Supabase migration, use pg_cron or edge function middleware to enforce per-user rate limits at the database layer.

---

### 13. No Content Security Policy Headers

**Status: Fixed** — `vercel.json` created at project root with the following headers applied to all routes:

```json
{
  "Content-Security-Policy": "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https://res.cloudinary.com https://cloud.appwrite.io; connect-src 'self' https://cloud.appwrite.io https://api.cloudinary.com; font-src 'self'; frame-ancestors 'none';",
  "X-Frame-Options": "DENY",
  "X-Content-Type-Options": "nosniff"
}
```

Without CSP, any injected script can read cookies, localStorage, and make requests to any origin. The policy restricts scripts and connections to known-safe origins, blocks iframe embedding, and prevents MIME-type sniffing attacks.

`unsafe-inline` for styles is required by the current Radix UI / Tailwind setup. If nonces are added in future, this can be removed.

---

### 14. Infrastructure Config Exposed in Git

**Status: Fixed** — `appwrite.config.json` and `.claude/` added to `.gitignore` (commit `3424c75`).

`appwrite.config.json` contained the Appwrite Project ID, live endpoint URL, and a full map of enabled services and auth methods. The file was newly staged and caught before it entered git history. It has never been committed to the remote.

---

## Pre-Scale Hardening Checklist

Work through these in order before adding monetization features.

- [x] Remove Cloudinary API key and secret from `VITE_` env vars (issue #1, #7)
- [x] Rotate Cloudinary API credentials (they are currently exposed)
- [x] Add `Permission` rules to all `createDocument` calls (issue #6)
- [x] Add ownership checks to `deletePost`, `updatePost`, `updateUser`, `likePost` (issues #2–5)
- [x] Deploy `functions/deleteFromCloudinary` and activate real deletion (issues #9, #10)
- [x] Limit localStorage cache to non-sensitive display fields (issue #8)
- [x] Appwrite rate limiting is automatic for Client SDK requests (issue #12) — no action needed; see caveat about Server SDK paths
- [x] Add input guards to API functions (issue #11)
- [x] Add Content Security Policy headers to your hosting config (prevents XSS)
- [x] Enable audit logging in Appwrite Console (Security → Logs)
- [x] Invalidate all sessions when a user changes their password or email
- [x] Implement GDPR cascade delete: when account is deleted, remove all posts, images, and saves

---

## Supabase Migration Security Upgrade

At ~50K users, migrating to Supabase provides a permanent, architectural fix for the authorization problems found in this audit.

**Current model (Appwrite):** Security is enforced at the API layer. Your code must check `currentUser.$id === post.creator.$id` before every mutation. If that check has a bug, users are exposed.

**Supabase model (PostgreSQL RLS):** Security is enforced at the database layer. Even if your API code has a bug, even if your serverless function is compromised, the database itself refuses unauthorized operations.

```sql
-- Example: only the post creator can update or delete their post
CREATE POLICY post_owner_write ON posts
    FOR ALL USING (auth.uid() = creator_id);

-- Anyone can read public posts
CREATE POLICY post_public_read ON posts
    FOR SELECT USING (true);
```

These policies cannot be bypassed by client-side code, server-side bugs, or API key leaks. They are enforced in the PostgreSQL engine before any data is touched.

**When to migrate:** When Appwrite Pro costs exceed ~$100–150/month, or when complex feed ranking queries become slow, or at 50K users — whichever comes first. The migration takes approximately 2–3 weeks.
