# Security & Compliance Requirements Sheet
## Tersus MVP S1 – SiteSupervise Integration

This document outlines the security, encryption, and compliance requirements for the integration layer.

### 1. Encryption
#### 1.1 In Transit
- All communication between the Tersus scanner and the Ingestion API must use **HTTPS** encrypted with **TLS 1.3**.
- Webhook callbacks to SiteSupervise must also be sent over HTTPS.

#### 1.2 At Rest
- All sensor data (point clouds, images, 3DGS files) stored in Object Storage (e.g., AWS S3) must use **AES-256 server-side encryption**.
- The metadata database (e.g., PostgreSQL) must have encryption at rest enabled for the underlying volumes.

### 2. Role-Based Access Control (RBAC)
Access to the integration API and SiteSupervise dashboards is governed by RBAC.

| Role | Permissions |
|------|-------------|
| **Scanner Device** | Write-only access to `/session` and `/metadata` endpoints. Cannot read other project data. |
| **Site Admin** | Full access to manage scanners, view all scans, and configure project settings. |
| **Inspector** | Read access to view processed point clouds, 3DGS, and thermal anomaly reports. Can create QA/QC issues. |
| **System API** | Internal role for backend services (Celery workers, Webhooks) to read/write state and process data. |

### 3. Audit Logging
To maintain compliance and track accountability, the system must log:
- **Authentication Events:** Successful/failed logins, token issuance for scanners.
- **Data Lifecycle Events:** When a scan was uploaded, who/what uploaded it, and when processing completed.
- **Access Logs:** All read operations on the API must be logged with the user ID, timestamp, and requested resource.
- **Immutability:** Audit logs should be written to a secure, append-only datastore or CloudWatch/Datadog to prevent tampering.
