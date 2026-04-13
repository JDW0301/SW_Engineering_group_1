# 05. Shared Naming Registry

## 1. Purpose

This document records shared names used across frontend, backend, AI, and database work.

The purpose is to prevent:

- different names for the same meaning
- duplicated structures with different labels
- merge conflicts caused by undocumented naming decisions

This is not a full dictionary. It is a practical registry for names that affect multiple developers.

---

## 2. When to Update This File

Update this file when a new shared name is introduced or changed, including:

- API field names
- DB column names
- status / enum values
- AI input/output field names
- shared class names
- shared component names
- shared domain terms

---

## 3. Registry Rules

1. If the name is shared across more than one area, record it here.
2. If an old name is replaced, keep the old name in the note column.
3. If the meaning is unclear, do not merge until it is clarified.
4. When possible, match names across frontend, backend, and docs.

---

## 4. Naming Registry Table

| Category | Name | Meaning | Used In | Owner | Date | Note |
|---|---|---|---|---|---|---|
| API field | `loginId` | Login identifier used for sign in | FE / BE / Auth API | Backend | 2026-04-13 | Shared with signup/login flow |
| API field | `email` | User email address | FE / BE / Auth API / DB | Backend | 2026-04-13 | Required for signup |
| API field | `refreshToken` | Token used for session refresh | FE / BE / Auth API | Backend | 2026-04-13 | Used in refresh/logout |
| DB table | `app_user` | Local application user account table | DB / BE | PM / Backend | 2026-04-13 | Replaced generic `user` name |
| DB column | `login_id` | Stored login identifier | DB / BE | Backend | 2026-04-13 | Maps to API `loginId` |
| DB column | `password_hash` | Stored hashed password | DB / BE | Backend | 2026-04-13 | Never exposed to frontend |
| DB column | `business_hours` | Store operating time text | DB / BE | Backend | 2026-04-13 | Used for operator store setup |
| Auth role | `CUSTOMER` | Customer user role | FE / BE / DB | Backend | 2026-04-13 | Shared auth role |
| Auth role | `OPERATOR` | Operator user role | FE / BE / DB | Backend | 2026-04-13 | Shared auth role |
| Account status | `ACTIVE` | Active account state | FE / BE / DB | Backend | 2026-04-13 | Default active user |
| Account status | `INACTIVE` | Inactive account state | FE / BE / DB | Backend | 2026-04-13 | Disabled user state |

---

## 5. Candidate Shared Names for Future Features

These should be confirmed before implementation if they become shared:

| Category | Candidate Name | Intended Meaning | Related Area | Status | Note |
|---|---|---|---|---|---|
| Inquiry status | `OPEN` | New inquiry waiting for handling | FE / BE / DB | Proposed | Confirm before inquiry feature merge |
| Inquiry status | `ANSWERED` | Inquiry has received operator response | FE / BE / DB | Proposed | Confirm before inquiry feature merge |
| Inquiry status | `CLOSED` | Inquiry is closed | FE / BE / DB | Proposed | Confirm before inquiry feature merge |
| Support status | `IN_PROGRESS` | Ongoing support session | FE / BE / DB | Proposed | Confirm before chat support feature merge |
| Support status | `RESOLVED` | Support completed | FE / BE / DB | Proposed | Confirm before support merge |
| AI field | `summary` | Summarized message or inquiry text | AI / BE / FE | Proposed | Must stay consistent across AI API |
| AI field | `classification` | Inquiry category predicted by AI | AI / BE / FE | Proposed | Must be aligned with backend contract |

---

## 6. Suggested Entry Format

When adding a new name, use this process:

1. identify whether the name is shared
2. write the exact spelling
3. write the meaning in one sentence
4. record where it is used
5. record the owner and date
6. add a short note if replacing another name

---

## 7. Example Update Cases

### Case 1: New API field

- New field added: `customerSnapshotId`
- Action: add row to the registry before or with the PR

### Case 2: New enum value

- New support state added: `ON_HOLD`
- Action: add row and update relevant spec docs

### Case 3: Renaming

- Old name: `userName`
- New shared name: `loginId`
- Action: record the final name and mention the replaced term in the note

---

## 8. Final Rule

If a new name affects more than one team member, record it here.

If not sure, record it first and discuss later.
