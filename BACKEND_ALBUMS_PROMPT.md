# Backend task prompt — Albums with photos and videos

Use this prompt in the existing backend repository. Do not rewrite or replace any existing API.

---

I have an existing production backend whose base URL is `https://mera-love.onrender.com/api`. Add an album and album-media module using the backend's current framework, database, storage strategy, naming conventions, and error format.

## Non-negotiable compatibility rules

1. Do not change, rename, refactor, or remove any existing endpoint, especially:
   - `POST /api/admin/verify`
   - `GET /api/frustrations`
   - `POST /api/frustrations`
   - `GET /api/photos`
   - `POST /api/photos/upload`
   - `GET /api/photos/:id/image`
   - `DELETE /api/photos/:id`
2. Reuse the same server-side admin protection currently used by photo upload/delete for every album mutation endpoint.
3. Reuse the existing database and binary/media storage approach. Do not return photo or video bytes/base64 inside album JSON.
4. Keep the existing frontend CORS origins working.

## Required data model

### Album

- `id`: backend-generated stable ID
- `name`: trimmed string, 1–80 characters
- `createdAt`: server-generated ISO-8601 timestamp
- relationship to zero or more album media items

### AlbumMedia

- `id`: backend-generated stable ID
- `albumId`: owning album ID
- `type`: exactly `image` or `video`
- `mimeType`: verified MIME type
- `originalName`: sanitized original filename
- `size`: byte length
- `uploadedAt`: server-generated ISO-8601 timestamp at successful upload time
- storage reference/blob using the project's existing storage approach

Never accept `createdAt` or `uploadedAt` from the client. The server/database must create both automatically.

## Exact REST contract required by the frontend

### `GET /api/albums`

Return HTTP 200 and a JSON array, newest album first. Each album must include its media metadata, oldest media first:

```json
[
  {
    "id": "album-id",
    "name": "Our NIT Memories",
    "createdAt": "2026-08-24T12:00:00.000Z",
    "media": [
      {
        "id": "media-id",
        "albumId": "album-id",
        "type": "image",
        "mimeType": "image/jpeg",
        "originalName": "hug.jpg",
        "size": 124567,
        "uploadedAt": "2026-08-24T12:05:00.000Z"
      }
    ]
  }
]
```

### `POST /api/albums`

- Header: `Content-Type: application/json`
- Body: `{ "name": "Our NIT Memories" }`
- Return HTTP 201 with the created album object and `media: []`.
- Reject blank/over-80-character names with HTTP 400.

### `POST /api/albums/:albumId/media`

- Request: `multipart/form-data`
- File field name: `file`
- One file per request. The frontend may send several requests sequentially.
- Accept common browser-safe image types (`image/jpeg`, `image/png`, `image/webp`, `image/gif`) and video types (`video/mp4`, `video/webm`, `video/quicktime`).
- Verify file signatures/content; do not trust only the extension or request MIME.
- Suggested limits: 25 MB per image, 200 MB per video.
- Generate `uploadedAt` on the server only.
- Return HTTP 201 with the created media metadata.
- Return 404 if the album does not exist, 400/413/415 for invalid, too-large, or unsupported files.

### `GET /api/albums/:albumId/media/:mediaId/file`

- Stream the original media bytes with the correct `Content-Type`.
- Return 404 if the album/media pair is invalid.
- Support `Range` requests and HTTP 206 for videos so mobile playback and seeking work.
- Add safe cache headers and `Content-Length` where supported.

### `DELETE /api/albums/:albumId/media/:mediaId`

- Delete only that media item and its stored binary.
- Return HTTP 204.
- Return 404 for an invalid album/media pair.

### `DELETE /api/albums/:albumId`

- Delete the album, all its media database rows, and all associated stored binaries transactionally/best-effort with cleanup.
- Return HTTP 204.
- Return 404 when missing.

## Reliability and security

- Sanitize filenames and never use the user filename directly as a filesystem path.
- Prevent path traversal and IDOR; verify every media item belongs to the album in the URL.
- Mutations must use the existing admin authorization mechanism rather than trusting a frontend `isAdmin` flag.
- Database indexes should support album ordering and media lookup by album.
- If storage/database cleanup partially fails, log it without exposing internal paths or secrets to the client.

## Required tests

- Create albums with valid/invalid names.
- Upload one image and one video; verify server-generated dates.
- Reject unsupported and oversized files.
- List albums in the required JSON shape/order.
- Stream images and videos, including a video `Range` request.
- Delete one media item without affecting others.
- Delete an album and verify its stored media is removed.
- Confirm every pre-existing endpoint still passes its current tests unchanged.

After implementation, provide the migration/schema changes, environment variables (if any), and sample curl commands for all new endpoints.
