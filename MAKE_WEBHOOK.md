# Make (Integromat) Webhook Setup

## Endpoint
```
POST http://your-domain.com/api/jobs/from-email
Content-Type: application/json
```

## Request Body
```json
{
  "subject": "משרת מפתח React - תל אביב",
  "body": "שלום,\n\nאנו מחפשים מפתח React מנוסה.\n\nמיקום: תל אביב\nשכר: 25,000 ₪\nחברה: TechCorp\n\nדרישות:\n- 3+ שנות ניסיון\n- React, TypeScript\n- Node.js",
  "fromEmail": "hr@company.com"
}
```

## Security
Set `WEBHOOK_SECRET` in `backend/.env`. Make must send it as a header:
```
x-webhook-secret: your_webhook_secret
```
If `WEBHOOK_SECRET` is empty, the check is skipped (dev mode).

## Make Scenario Steps
1. **Trigger**: Watch Emails (Gmail / Outlook)
2. **Filter**: (optional) filter by subject keywords like "משרה", "דרוש", "נדרש"
3. **HTTP Module**: Make an HTTP request
   - URL: `http://your-server:5000/api/jobs/from-email`
   - Method: POST
   - Headers:
     - `Content-Type: application/json`
     - `x-webhook-secret: your_webhook_secret`
   - Body (JSON):
     ```json
     {
       "subject": "{{subject}}",
       "body": "{{body}}",
       "fromEmail": "{{from.email}}"
     }
     ```

## Response
```json
{
  "job": {
    "_id": "...",
    "title": "מפתח React",
    "location": "תל אביב",
    "salary": "25,000 ₪",
    ...
  },
  "message": "Job created successfully"
}
```

## Testing with curl
```bash
curl -X POST http://localhost:5000/api/jobs/from-email \
  -H "Content-Type: application/json" \
  -H "x-webhook-secret: your_webhook_secret" \
  -d '{
    "subject": "משרת מנהל פיתוח - ירושלים",
    "body": "דרוש מנהל פיתוח עם ניסיון של 5+ שנים.\nמיקום: ירושלים\nשכר: 35,000 ₪\nחברה: BigCorp\nדרישות: Python, AWS, Docker"
  }'
```
