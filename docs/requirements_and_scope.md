# Tersus MVP S1 - SiteSupervise Integration
## Requirements & Scope Document (Draft)

**Date**: August 2026
**Phase**: Week 1 (Planning & Architecture)

### 1. Project Overview
This document defines the functional and non-functional requirements for the Tersus MVP S1 – SiteSupervise Integration project. It serves as the formal sign-off artifact following joint requirement validation workshops between Tersus stakeholders and the SiteSupervise team.

### 2. Project Scope
The goal of the project is to establish a robust integration layer where the Tersus S1 Scanner acts as a primary data producer, feeding multimodal sensor data into SiteSupervise (the data consumer).

#### In-Scope:
- Multi-sensor data capture (LiDAR, 48MP RGB, Thermal, RTK GPS).
- Ingestion pipelines for securely uploading scan data to SiteSupervise.
- AI-powered processing workflows (point cloud alignment, deviation analysis).
- Quality Control (QC) validation against design models (BIM).
- Security compliance (RBAC, Encryption, Audit Logging).

#### Out-of-Scope:
- Direct modifications to the internal hardware architecture of the Tersus MVP S1 scanner.
- External systems integrations beyond SiteSupervise core modules.

### 3. Functional Requirements
- **FR1 (Scan Ingestion):** The system shall provide a secure API endpoint for receiving scan data and associated metadata from the edge scanner.
- **FR2 (Data Fusion):** The system shall handle combined outputs of LiDAR, RGB, and Thermal sensors for AI anomaly detection and 3DGS output generation.
- **FR3 (Timeline Tracking):** The system shall track and log lifecycle events for each inspection and scan.
- **FR4 (BIM Comparison):** The platform shall support point cloud alignment and deviation analysis against referenced BIM models.
- **FR5 (Dashboard & Reporting):** The system shall expose automated QA/QC reporting templates and live QC dashboards.

### 4. Non-Functional Requirements
- **NFR1 (Security):** All API communications must be encrypted (HTTPS/TLS 1.3). Data at rest must be encrypted. Role-Based Access Control (RBAC) must restrict access.
- **NFR2 (Performance):** The ingestion API must handle parallel uploads of large point cloud datasets efficiently.
- **NFR3 (Reliability):** The processing pipeline must support retry mechanisms for interrupted edge-cloud transfers.

### 5. Stakeholder Sign-off

| Name | Role | Date | Signature |
|------|------|------|-----------|
|      | Tersus Lead |      |           |
|      | Government Agency - Client | |           |
