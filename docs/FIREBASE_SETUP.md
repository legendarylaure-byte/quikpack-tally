# Firebase setup

## Projects

| Environment | Display name | Project ID | Project number |
|---|---|---|---|
| Dev | `quikpack-tally-dev` | `quikpack-tally-dev-787fd` | `1012616325280` |
| Prod | `quikpack-tally-prod` | `quikpack-tally-prod` | `272753042357` |

The Firebase CLI is logged in as `phuyal.shekhar@gmail.com`.

Project aliases are stored in `.firebaserc`:

```text
default = quikpack-tally-dev-787fd
dev     = quikpack-tally-dev-787fd
prod    = quikpack-tally-prod
```

## Enabled services

In both projects:

1. Authentication → Email/Password enabled.
2. Authorized domains include `localhost` and `quikpack-tally-glr7.vercel.app`.
3. Firestore Database created in production mode.
4. Web app registered as `quikpack-tally-web`.
5. Budget alerts should be set before real usage.

Firebase has no Ghana region. Choose a region deliberately and disclose it in the terms if clients ask about data residency.

## Storage decision

Cloud Storage for Firebase requires the Blaze plan. The projects are staying on Spark for now.

For the MVP:

- company logos are stored as small data URLs in the company Firestore document;
- file uploads larger than 150KB are rejected;
- attachments, product photos and receipt uploads are deferred;
- the Storage emulator can be used locally after Java is installed.

Do not deploy `storage.rules` until a real Storage bucket exists.

## Deploy rules

Deploy dev rules only:

```bash
npx firebase-tools deploy --only firestore:rules,firestore:indexes --project dev
```

Do not deploy prod rules until emulator/rules tests are added.

## Web app config mapping

Map the Firebase web config to Vercel variables as follows:

| Firebase config | Vercel variable |
|---|---|
| `apiKey` | `NEXT_PUBLIC_FIREBASE_API_KEY` |
| `authDomain` | `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` |
| `projectId` | `NEXT_PUBLIC_FIREBASE_PROJECT_ID` |
| `storageBucket` | `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` |
| `messagingSenderId` | `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` |
| `appId` | `NEXT_PUBLIC_FIREBASE_APP_ID` |

Use dev values for Preview and Development, prod values for Production.

`NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` is currently a placeholder. It is safe for browser config but no upload functions should use it yet.

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
- Enable Cloud Storage after upgrading dev to Blaze with budget controls.
