# Kimbia API Specification

This document outlines the complete RESTful API endpoints for Kimbia Platform.

---

## 1. Authentication & Users

### 1.1 Register User / Organizer (Local)
Creates a new user profile. Race Organizers are created with `PENDING_VETTING` status.
- **Method:** `POST`
- **Endpoint:** `/api/auth/register`
- **Request Payload:**
  ```json
  {
    "name": "John Doe",
    "email": "john@example.com",
    "password": "securepassword123",
    "role": "RUNNER", // RUNNER, RACE_ADMIN
    "age_group": "25-29",
    "gender": "M",
    "mobile_number": "+254700000000"
  }
  ```
- **Success Response (201 Created):** Returns user object.

### 1.2 Login (Local)
Authenticates a user via email/password and returns a JWT.
- **Method:** `POST`
- **Endpoint:** `/api/auth/login`
- **Success Response (200 OK):** Returns JWT token and user context.

### 1.3 OAuth Login / Registration (Google)
Handles Google OAuth sign-in. Registers the user if they don't exist.
- **Method:** `POST`
- **Endpoint:** `/api/auth/oauth`
- **Success Response (200 OK):** Returns JWT token and user context.

### 1.4 Get Current User Profile
Retrieves the profile data of the authenticated user.
- **Method:** `GET`
- **Endpoint:** `/api/users/me`
- **Headers:** `Authorization: Bearer <token>`
- **Success Response (200 OK):**
  ```json
  {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "role": "RUNNER",
    "age_group": "25-29",
    "gender": "M",
    "mobile_number": "+254700000000",
    "status": "ACTIVE"
  }
  ```

### 1.5 Update Current User Profile
Allows runners to update their details.
- **Method:** `PUT`
- **Endpoint:** `/api/users/me`
- **Headers:** `Authorization: Bearer <token>`
- **Request Payload:** (Partial user object)
- **Success Response (200 OK):** Returns updated user object.

---

## 2. File Uploads (Media)

### 2.1 Upload File
A generic endpoint to handle image uploads for Bib Templates (Admin) and Proof of Run (Runners).
- **Method:** `POST`
- **Endpoint:** `/api/uploads`
- **Headers:** `Authorization: Bearer <token>`, `Content-Type: multipart/form-data`
- **Request Payload:** `file` (binary image data)
- **Success Response (201 Created):**
  ```json
  {
    "file_url": "https://s3.bucket/uploads/image_abc123.png"
  }
  ```

---

## 3. Race Management (Public & Admin)

### 3.1 List Available Races (Public/Runner)
Retrieves a list of published virtual races for runners.
- **Method:** `GET`
- **Endpoint:** `/api/races`
- **Query Params:** `?status=PUBLISHED`
- **Success Response (200 OK):** Array of Race objects.

### 3.2 Get Specific Race Details
Retrieves detailed information for a specific race.
- **Method:** `GET`
- **Endpoint:** `/api/races/{raceId}`
- **Success Response (200 OK):** Returns full Race object.

### 3.3 List Organizer's Races (Admin Dashboard)
Retrieves all races created by the authenticated Race Admin.
- **Method:** `GET`
- **Endpoint:** `/api/admin/races`
- **Headers:** `Authorization: Bearer <token> (RACE_ADMIN)`
- **Success Response (200 OK):** Array of Race objects (DRAFT, PUBLISHED, CLOSED).

### 3.4 Create Race Draft (Admin)
Allows an approved `RACE_ADMIN` to create a new draft race.
- **Method:** `POST`
- **Endpoint:** `/api/races`
- **Headers:** `Authorization: Bearer <token> (RACE_ADMIN)`
- **Request Payload:**
  ```json
  {
    "name": "Nairobi Marathon Virtual 5K",
    "distance": "5K",
    "race_date": "2026-09-01T08:00:00Z",
    "fee": 500.00,
    "submission_deadline": "2026-09-02T23:59:59Z",
    "bib_template_url": "https://s3.bucket/template.png"
  }
  ```
- **Success Response (201 Created):** Returns race with `status: DRAFT`.

### 3.5 Edit Race Draft (Admin)
Allows an Admin to update race details before publishing.
- **Method:** `PUT`
- **Endpoint:** `/api/races/{raceId}`
- **Headers:** `Authorization: Bearer <token> (RACE_ADMIN)`
- **Request Payload:** (Partial race object updates)
- **Success Response (200 OK):** Returns updated race object.

### 3.6 Publish / Close Race (Admin)
Transitions a race state (e.g., DRAFT to PUBLISHED, or PUBLISHED to CLOSED).
- **Method:** `PUT`
- **Endpoint:** `/api/races/{raceId}/status`
- **Headers:** `Authorization: Bearer <token> (RACE_ADMIN)`
- **Request Payload:**
  ```json
  {
    "status": "PUBLISHED" // or "CLOSED"
  }
  ```
- **Success Response (200 OK):** Returns updated race object.

---

## 4. Payments, Registrations & History

### 4.1 Initiate Express Checkout (Runner)
Generates a `PENDING` registration and returns a Tingg hosted checkout redirect URL.
- **Method:** `POST`
- **Endpoint:** `/api/payments/checkout`
- **Headers:** `Authorization: Bearer <token> (RUNNER)`
- **Request Payload:** `{"race_id": 101}`
- **Success Response (200 OK):** Returns `redirect_url` and `registration_id`.

### 4.2 Poll Registration Status (Runner)
Called by the mobile app periodically to check if payment succeeded and fetch the generated digital bib.
- **Method:** `GET`
- **Endpoint:** `/api/registrations/{registrationId}/status`
- **Headers:** `Authorization: Bearer <token> (RUNNER)`
- **Success Response (200 OK):**
  ```json
  {
    "payment_status": "COMPLETED",
    "bib_number": "KMB-101-505",
    "bib_img_url": "https://s3.bucket/bibs/KMB-101-505.png"
  }
  ```

### 4.3 Get My Registrations (Runner)
Allows a runner to view all races they have registered for, to download past bibs or check status.
- **Method:** `GET`
- **Endpoint:** `/api/users/me/registrations`
- **Headers:** `Authorization: Bearer <token> (RUNNER)`
- **Success Response (200 OK):** Array of registration objects joined with race details.

### 4.4 View Race Financials & Registrations (Admin)
Allows Race Admins to track payment success rates and view all registered users for a specific race.
- **Method:** `GET`
- **Endpoint:** `/api/admin/races/{raceId}/registrations`
- **Headers:** `Authorization: Bearer <token> (RACE_ADMIN)`
- **Query Params:** `?payment_status=COMPLETED`
- **Success Response (200 OK):** Array of registration objects (includes Runner names and Payment data).

### 4.5 Tingg Collection Webhook (Asynchronous)
Receives payment confirmation from Tingg, checks idempotency, updates payment/registration state to SUCCESS/COMPLETED, and triggers dynamic bib generation.
- **Method:** `POST`
- **Endpoint:** `/api/webhooks/tingg`
- **Headers:** `X-Tingg-Signature: <hmac_signature>`
- **Request Payload:** *(Standard Tingg webhook payload)*
- **Success Response (200 OK):** Empty body (Acknowledgment)

---

## 5. Leaderboard & Results Moderation

### 5.1 Submit Race Time (Runner)
Runners submit their final finishing times.
- **Method:** `POST`
- **Endpoint:** `/api/results`
- **Headers:** `Authorization: Bearer <token> (RUNNER)`
- **Request Payload:**
  ```json
  {
    "registration_id": 505,
    "finishing_time": "00:24:15",
    "proof_image_url": "https://s3.bucket/proofs/user_1.png",
    "is_dnf": false
  }
  ```
- **Success Response (201 Created):** Result defaults to `moderation_status: PENDING`.

### 5.2 Get Pending Results for Moderation (Admin)
Admin dashboard fetches a queue of submitted times that require review.
- **Method:** `GET`
- **Endpoint:** `/api/admin/races/{raceId}/results`
- **Headers:** `Authorization: Bearer <token> (RACE_ADMIN)`
- **Query Params:** `?moderation_status=PENDING`
- **Success Response (200 OK):** Array of Result objects (includes `proof_image_url`).

### 5.3 Moderate Race Result (Admin)
Admin approves or rejects a submitted race result based on the proof image.
- **Method:** `PUT`
- **Endpoint:** `/api/admin/results/{resultId}/moderate`
- **Headers:** `Authorization: Bearer <token> (RACE_ADMIN)`
- **Request Payload:** `{"moderation_status": "APPROVED"}`
- **Success Response (200 OK):** Updates the result status.

### 5.4 Get Leaderboard (Public/Runner)
Retrieves the real-time ranked leaderboard for a specific race (only `APPROVED` results).
- **Method:** `GET`
- **Endpoint:** `/api/races/{raceId}/leaderboard`
- **Query Params:** `?category=Overall` (or `Age Group`, `Gender`)
- **Success Response (200 OK):** Array of ranked Runner Result objects.

---

## 6. Award Distribution (Postpayment)

### 6.1 Initiate Award Payout (Admin)
Admin disburses prizes directly to a winner's mobile money or airtime wallet via Tingg Postpayment API.
- **Method:** `POST`
- **Endpoint:** `/api/awards/payout`
- **Headers:** `Authorization: Bearer <token> (RACE_ADMIN)`
- **Request Payload:**
  ```json
  {
    "winner_id": 1,
    "registration_id": 505,
    "award_type": "MONEY", // or "AIRTIME"
    "destination_account": "+254700000000",
    "amount": 5000.00
  }
  ```
- **Success Response (200 OK):** Payout Initiated (`status: PENDING`).

### 6.2 Tingg Payout Callback Webhook
Async callback from Tingg to confirm postpayment transaction success/failure.
- **Method:** `POST`
- **Endpoint:** `/api/webhooks/tingg/payout-callback`
- **Headers:** `X-Tingg-Signature: <hmac_signature>`
- **Request Payload:** *(Standard Tingg callback payload)*
- **Success Response (200 OK):** Empty body (Acknowledgment)

---

## 7. Super Admin Operations

### 7.1 List Pending Organizers
Retrieves a list of newly registered Organizers waiting for KYC vetting.
- **Method:** `GET`
- **Endpoint:** `/api/admin/organizers`
- **Query Params:** `?status=PENDING_VETTING`
- **Headers:** `Authorization: Bearer <token> (SUPER_ADMIN)`
- **Success Response (200 OK):** Array of User objects.

### 7.2 Approve Organizer
Super Admin approves an organizer and attaches their Tingg sub-merchant routing code.
- **Method:** `PUT`
- **Endpoint:** `/api/admin/organizers/{organizerId}/approve`
- **Headers:** `Authorization: Bearer <token> (SUPER_ADMIN)`
- **Request Payload:** `{"tingg_service_code": "SRV-TINGG-KMB-101"}`
- **Success Response (200 OK):** Updates organizer status to `APPROVED`.
