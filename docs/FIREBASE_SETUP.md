# Firebase setup

## Projects

| Environment | Display name | Project ID | Project number |
|---|---|---|---|
| Dev | `quikpack-tally-dev` | `quikpack-tally-dev-787fd` | `1012616325280` |
| Prod | `quikpack-tally-prod` | `quikpack-tally-prod` | `272753042357` |

The Firebase CLI is logged in as `phuyal.shekhar@gmail.com`.

Aliases in `.firebaserc`:

```text
default = quikpack-tally-dev-787fd
dev     = quikpack-tally-dev-787fd
prod    = quikpack-tally-prod
```

## Console setup (both projects)

1. Authentication → Sign-in method → Email/Password enabled.
2. Authentication → Settings → Authorized domains: keep `localhost`, add `tally.vyomai.cloud`.
3. Firestore Database created in production mode.
4. Web app registered as `quikpack-tally-web`.
5. Set budget alerts before real usage.

Firebase has no Ghana region. Choose a region deliberately and disclose it in the terms if clients ask about data residency.

## Storage decision

Cloud Storage for Firebase requires the Blaze plan. Both projects stay on Spark for now.

- No file uploads are enabled.
- Do not deploy `storage.rules` until a real bucket exists.
- Product images, receipts and attachments are deferred.

## First admin (run once per project)

Download a service account key from Firebase Console → Project settings → Service accounts → Generate new private key. Keep the JSON file private.

```bash
FIREBASE_SERVICE_ACCOUNT_JSON="$(cat path/to/service-account.json)" \
  npm run bootstrap:admin -- phuyal.shekhar@gmail.com
```

This:

- sets the `admin: true` custom claim;
- seeds `companies/quikpack-main` with the QUIKPACK legal details;
- creates the admin's `users/{uid}` and owner membership;
- prints a password setup link.

The admin must sign out and back in after setting a password so the claim is refreshed.

## Server environment variables in Vercel

| Variable | Type | Notes |
|---|---|---|
| `FIREBASE_SERVICE_ACCOUNT_JSON` | Secret | Dev key for Preview/Development, prod key for Production |
| `RESEND_API_KEY` | Secret | Resend API key |
| `EMAIL_FROM` | Config | `QUIKPACK Tally <no-reply@mail.vyomai.cloud>` |
| `NEXT_PUBLIC_APP_URL` | Config | `https://tally.vyomai.cloud` |

Web config variables:

| Firebase config | Vercel variable |
|---|---|
| `apiKey` | `NEXT_PUBLIC_FIREBASE_API_KEY` |
| `authDomain` | `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` |
| `projectId` | `NEXT_PUBLIC_FIREBASE_PROJECT_ID` |
| `storageBucket` | `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` |
| `messagingSenderId` | `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` |
| `appId` | `NEXT_PUBLIC_FIREBASE_APP_ID` |

Use dev values for Preview and Development, prod values for Production. `NEXT_PUBLIC_*` values are build-time inlined, so redeploy after changing them.

## Resend sender

Verify `mail.vyomai.cloud` in Resend → Domains and add the TXT records in Hostinger DNS. Then use:

```text
EMAIL_FROM=QUIKPACK Tally <no-reply@mail.vyomai.cloud>
```

Using a separate `mail.` subdomain avoids a CNAME/TXT conflict with the `tally.vyomai.cloud` Vercel record.

## Firestore rules

Rules are locked to one company:

- `users/{uid}` — read own doc or admin; no client writes.
- `companies/quikpack-main` — read if approved membership or admin; no client writes.
- `companyUsers/quikpack-main/users/{uid}` — read own membership or admin; no client writes.
- All business collections — denied until route-level rules are built.

Admin writes go through `/api/admin/*` using the Admin SDK, which bypasses rules.

Deploy dev rules:

```bash
npx firebase-tools deploy --only firestore:rules,firestore:indexes --project dev
```

Deploy prod rules only after testing the full flow on dev:

```bash
npx firebase-tools deploy --only firestore:rules,firestore:indexes --project prod
```

## Remaining work

- Emulator-based rules tests before production sign-off.
- Audit log writes through Admin SDK only.
- Cloud Storage after upgrading a project to Blaze with budget controls.
