# API Specification Document

**Version:** 1.0
**Target Environment:** Staging & Production

## 1. Overview
The Tersus MVP S1 – SiteSupervise Integration API is designed to handle scan ingestion, metadata collection, and status callbacks from the Tersus edge scanner to the SiteSupervise backend.

**Base URL:** `https://api.sitesupervise.com/api/v1/scans/`
**Authentication:** Token-based (Header: `Authorization: Token <your_token>`)
**Protocol:** HTTPS (TLS 1.3 required)

## 2. API Contracts & Data Schemas

### 2.1 Start Scan Session
Initializes a new scan session and returns a target URL for data upload.

- **Endpoint:** `POST /session/`
- **Request Body (JSON):**
  ```json
  {
    "project_id": "uuid",
    "scanner_id": "string",
    "timestamp": "iso8601-datetime",
    "sensors_used": ["lidar", "rgb", "thermal", "rtk_gps"],
    "expected_size_mb": "float"
  }
  ```
- **Response (201 Created):**
  ```json
  {
    "session_id": "uuid",
    "upload_url": "url (S3 Pre-signed URL)",
    "status": "initialized"
  }
  ```

### 2.2 Submit Scan Metadata
Submits metadata related to a specific scan session.

- **Endpoint:** `POST /<session_id>/metadata/`
- **Request Body (JSON):**
  ```json
  {
    "location": {
      "latitude": "float",
      "longitude": "float",
      "elevation": "float"
    },
    "operator_id": "string",
    "notes": "string"
  }
  ```
- **Response (201 Created):**
  ```json
  {
    "location": {
      "latitude": "float",
      "longitude": "float",
      "elevation": "float"
    },
    "operator_id": "string",
    "notes": "string"
  }
  ```

### 2.3 Finalize Upload
Signals that the direct-to-S3 upload is complete, queuing the processing workflow.

- **Endpoint:** `POST /<session_id>/finalize/`
- **Response (202 Accepted):**
  ```json
  {
    "status": "processing",
    "message": "Scan data queued for processing."
  }
  ```

## 3. Status Callbacks & Timeline Tracking
Once finalized, the scan session enters `processing`. Webhooks or long-polling will be used by the frontend to track the `completed` or `failed` statuses as the AI Anomaly Detection and BIM Comparison modules finish their workloads.
