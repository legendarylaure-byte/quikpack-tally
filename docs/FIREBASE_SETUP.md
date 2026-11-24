# Firebase setup

Firebase projects are not created yet. Create two:

- `quikpack-tally-dev`
- `quikpack-tally-prod`

## Enable services

In each project:

1. Authentication → Sign-in method → enable Email/Password.
2. Firestore Database → create database in production mode.
3. Storage → create default bucket.
4. Add a web app and copy its config into `.env.local`.
5. Set budget alerts.

Firebase has no Ghana region. Choose a region deliberately and disclose it in the terms if clients ask about data residency.

## Deploy rules

After installing the Firebase CLI and selecting a project:

```bash
firebase deploy --only firestore:rules,firestore:indexes,storage
```

Never deploy untested rules to production.

## Custom claims

`storage.rules` expects:

- `companyIds`: array of company IDs the user belongs to.
- `admin: true` for QUIKPACK operators.

Firestore rules read roles from:

```text
companyUsers/{companyId}/users/{uid}.role
```

Allowed roles:

- owner
- accountant
- cashier
- viewer
- auditor

## Remaining work

- Add emulator-based rules tests before production.
- Add Cloud Functions to set claims when company membership changes.
- Add audit log writes through Admin SDK only.
