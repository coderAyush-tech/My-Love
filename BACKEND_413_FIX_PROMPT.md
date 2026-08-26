# Backend 413 Upload Fix — Ready-to-send Prompt

Existing API endpoints, request bodies, authentication contract, storage model, and successful upload behavior must remain unchanged.

API base URL: `https://mera-love.onrender.com/api`

## E2E failure reproduced

- Endpoint: `POST /api/albums/:albumId/media`
- Request: authenticated multipart upload with the exact `file` field
- Test file: valid PNG, 30.7 MB
- Expected: HTTP `413 Payload Too Large` with a JSON `message`
- Actual browser result after about 60 seconds: `TypeError: Failed to fetch`
- The browser received no HTTP status and no response body.
- Normal CORS preflight, authenticated uploads up to the allowed size, and all supported media formats work.

## Required backend/proxy fix

1. Keep the maximum album media size at exactly 25 MiB (`25 * 1024 * 1024` bytes), unless an existing production constant already defines the same effective limit.
2. Reject larger files with HTTP `413`, without resetting/aborting the connection and without waiting for an application timeout.
3. Return JSON using the existing error format, including a useful message. Example:

   ```json
   {
     "status": 413,
     "error": "Payload Too Large",
     "message": "File size exceeds the 25 MB limit",
     "path": "/api/albums/:albumId/media"
   }
   ```

4. Ensure the `413` response includes the same CORS headers as normal API responses for every allowed frontend origin, including:
   - `http://127.0.0.1:4177`
   - `http://localhost:4177`
   - `https://muchhar.netlify.app`
5. Preserve `Access-Control-Allow-Headers: Authorization, Content-Type` and `Access-Control-Expose-Headers: X-Admin-Token, Content-Range`.
6. If Render or another reverse proxy rejects the request before the application, configure the proxy/body-size limit and timeout so the client still receives the JSON `413` response with CORS headers.
7. If this is Spring Boot:
   - align `spring.servlet.multipart.max-file-size` and `spring.servlet.multipart.max-request-size` with the 25 MiB contract;
   - handle `MaxUploadSizeExceededException` and relevant multipart exceptions in the global exception handler;
   - make sure CORS also runs for exception/error dispatches.
8. Do not expose the PIN, bearer token, signing secret, filesystem paths, stack traces, or internal configuration in the response or logs.
9. Do not rename or remove any legacy photo, frustration, admin, album, or media endpoint.

## Required verification

- A file at or below 25 MiB uploads successfully.
- A file above 25 MiB returns `413` and the JSON backend `message` is readable by browser JavaScript.
- The same oversized test from an allowed browser origin has no CORS error and no `Failed to fetch`.
- Missing/expired bearer tokens still return `401` before protected mutations are accepted.
- JPEG, PNG, WebP, GIF, MP4, WebM, and MOV uploads remain working.
