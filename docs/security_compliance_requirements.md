# Security & Compliance Requirements Sheet

**System:** Tersus MVP S1 – SiteSupervise Integration
**Focus Area:** RBAC, Encryption, and Audit Logging

## 1. Role-Based Access Control (RBAC)

To ensure that only authorized edge scanners and operators can upload data to SiteSupervise:

- **Token Authentication:** The integration API utilizes Django Rest Framework's Token Authentication.
- **Device Provisioning:** Each Tersus scanner receives a unique Service Account token bound to its hardware ID.
- **Operator Tracking:** While scanners use device tokens, metadata submissions include an `operator_id` to attribute scans to specific users.
- **Authorization Scopes:** 
  - Edge scanners have **Write-Only** access to their designated project buckets.
  - Project Managers / Site Supervisors have **Read/Write** access via the dashboard.

## 2. Encryption Standards

### 2.1 Data in Transit
- **Protocol:** All communication between the edge scanner and the cloud backend must occur over HTTPS using TLS 1.3.
- **Certificate Management:** API Gateways must enforce strict SSL/TLS certificates; non-HTTPS connections will be rejected immediately.

### 2.2 Data at Rest
- **Database:** PostgreSQL databases storing metadata and timelines must have volume-level encryption (e.g., AWS KMS for RDS).
- **Blob Storage:** S3 buckets storing raw point clouds, images, and BIM models must have Server-Side Encryption (SSE-S3 or SSE-KMS) enabled by default.

## 3. Audit Logging

To maintain a secure chain of custody for QA/QC data:
- **API Access Logs:** All requests to the Scan Ingestion API are logged with timestamp, IP address, device ID, and endpoint accessed.
- **Session Lifecycle Events:** Transitions between `initialized`, `uploading`, `processing`, and `completed` are immutably logged in the `ScanSession` timeline.
- **Metadata Modifications:** Once submitted, metadata (like location and operator ID) cannot be modified. Any subsequent processing errors are logged in an audit table for traceability.
