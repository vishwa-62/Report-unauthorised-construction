# CityGuard AI - REST API Documentation

This API supports JSON request/response payloads, rate-limiting headers, and role-based JWT auth validation.

## base URL
All requests must be prefixed with:
`http://localhost:5000/api`

---

## 1. Authentication Module

### Citizen Registration
* **Endpoint**: `POST /auth/register`
* **Access**: Public
* **Body (JSON)**:
  ```json
  {
    "email": "citizen@cityguard.gov",
    "password": "password123",
    "full_name": "John Doe",
    "phone_number": "+91 99999 88888"
  }
  ```
* **Response (201 Created)**:
  ```json
  {
    "message": "Registration successful. Verification code sent.",
    "token": "eyJhbGciOi...",
    "user": {
      "id": 8,
      "email": "citizen@cityguard.gov",
      "full_name": "John Doe",
      "role": "citizen"
    },
    "simulatedOTP": "489231"
  }
  ```

### User Login
* **Endpoint**: `POST /auth/login`
* **Access**: Public
* **Body (JSON)**:
  ```json
  {
    "email": "citizen@cityguard.gov",
    "password": "password123"
  }
  ```
* **Response (200 OK)**:
  ```json
  {
    "token": "eyJhbGciOi...",
    "user": {
      "id": 8,
      "email": "citizen@cityguard.gov",
      "full_name": "John Doe",
      "role": "citizen",
      "email_verified": true
    }
  }
  ```

### Verify OTP Code
* **Endpoint**: `POST /auth/verify-otp`
* **Access**: Public (Uses local token or body email verification)
* **Body (JSON)**:
  ```json
  {
    "email": "citizen@cityguard.gov",
    "otp": "489231"
  }
  ```

---

## 2. Complaints Module

### Register a New Complaint
* **Endpoint**: `POST /complaints`
* **Access**: Auth (Citizen)
* **Body**: `multipart/form-data`
  * `description` (String, required): Detailed violation findings.
  * `address` (String, required): Street location text.
  * `latitude` (Float, required): e.g. `18.5204`.
  * `longitude` (Float, required): e.g. `73.8567`.
  * `ward_id` (Int, required): Target ward primary key.
  * `category_id` (Int, optional): Predefined violation category ID.
  * `custom_category` (String, optional): Custom title if other category chosen.
  * `nearby_landmark` (String, optional): Landmark text.
  * `image` (File, optional): PNG, JPEG or WEBP image attachment.
* **Response (211 Created)**:
  ```json
  {
    "message": "Complaint submitted successfully and analyzed by AI.",
    "complaint": {
      "id": 12,
      "complaint_number": "CG-2026-8941",
      "status": "pending",
      "severity": "medium",
      "latitude": 18.5204,
      "longitude": 73.8567
    },
    "aiAnalysis": {
      "prediction_label": "Road Encroachment",
      "confidence_score": 92.5,
      "recommendation": "Wall boundary extends onto public grid. Request measurements."
    }
  }
  ```

### List Complaints (with filters)
* **Endpoint**: `GET /complaints`
* **Access**: Auth (All)
* **Query Parameters (Optional)**:
  * `status`: Filters by `pending`, `under_review`, `assigned`, `inspected`, `verified`, `resolved`, `rejected`.
  * `category_id`: Primary key of category.
  * `ward_id`: Primary key of ward.
  * `zone_id`: Primary key of zone.
  * `severity`: `low`, `medium`, `high`, `critical`.
  * `search`: Keyword string (matches description, address, citizen name).

---

## 3. Executive Auditing & Officer Workload

### Assign Field Officer
* **Endpoint**: `POST /officers/assign`
* **Access**: Auth (Engineer, Admin)
* **Body (JSON)**:
  ```json
  {
    "complaint_id": 4,
    "officer_id": 2,
    "remarks": "Check if boundary wall crosses the footpath edge."
  }
  ```

### Submit Site Inspection Report
* **Endpoint**: `POST /officers/report`
* **Access**: Auth (Officer only)
* **Body (JSON)**:
  ```json
  {
    "assignment_id": 8,
    "findings": "Boundary wall verified. Extends 4.2 feet onto municipal footpath.",
    "recommendation": "Demolish encroachment part of wall to clear pathway.",
    "status_update": "verified",
    "latitude": 18.496515,
    "longitude": 73.818305
  }
  ```

---

## 4. Reports Exporter Module

### Generate PDF Audit File
* **Endpoint**: `GET /reports/pdf`
* **Access**: Auth (Engineer, Admin)
* **Response**: Serves `application/pdf` binary download.

### Generate Excel Grid File
* **Endpoint**: `GET /reports/excel`
* **Access**: Auth (Engineer, Admin)
* **Response**: Serves `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet` spreadsheet download.
