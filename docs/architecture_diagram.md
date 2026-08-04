# System Architecture Diagram (Integration Layer)

This document outlines the architecture for the Tersus MVP S1 – SiteSupervise Integration.

## Integration Architecture (Scanner as Data Producer, SiteSupervise as Consumer)

```mermaid
graph TD
    %% Entities
    subgraph Tersus_MVP_S1 [Tersus MVP S1 Scanner (Edge)]
        S_Sensors[Sensors: LiDAR, 48MP RGB, Thermal, RTK GPS]
        S_Agent[Edge Processing & Mock Scanner Agent]
        S_Sensors --> S_Agent
    end

    subgraph SiteSupervise_Cloud [SiteSupervise Cloud Backend]
        API_Gateway[Secure HTTPS API Gateway / Load Balancer]
        Auth_Service[RBAC & Token Authentication]
        Scan_Ingestion_API[Scan Ingestion API]
        S3_Storage[(Structured S3 Data Storage)]
        DB[(PostgreSQL Database)]
        Processing_Pipeline[Scan Processing & Data Fusion Pipeline]
        AI_QC_Module[AI Anomaly Detection & QC]
        BIM_Module[BIM Comparison Module]
        Timeline[Timeline Tracking]
    end

    subgraph Users [End Users / Stakeholders]
        QC_Dashboard[SiteSupervise QC Dashboard]
    end

    %% Flow
    S_Agent -- "1. Start Session & Auth (HTTPS)" --> API_Gateway
    API_Gateway --> Auth_Service
    Auth_Service --> Scan_Ingestion_API
    Scan_Ingestion_API -- "Save Metadata" --> DB
    
    S_Agent -- "2. Direct Encrypted Upload (HTTPS)" --> S3_Storage
    S_Agent -- "3. Finalize Upload (HTTPS)" --> API_Gateway
    
    API_Gateway --> Scan_Ingestion_API
    Scan_Ingestion_API -- "Trigger Workflow" --> Processing_Pipeline
    
    Processing_Pipeline -- "Fetch Data" --> S3_Storage
    Processing_Pipeline --> AI_QC_Module
    Processing_Pipeline --> BIM_Module
    
    Processing_Pipeline -- "Update Status" --> Timeline
    Timeline -- "Persist State" --> DB
    
    QC_Dashboard -- "Query Data" --> DB
    QC_Dashboard -- "View Scans" --> S3_Storage
```

### Key Components:
1. **Edge Processing**: The Tersus S1 Scanner acts as the data producer, gathering multi-sensor data and preparing it for upload.
2. **API Gateway & Auth**: Secures the ingestion API via HTTPS and Token-based authentication (RBAC).
3. **Scan Ingestion API**: Handles session creation, metadata submission, and finalization callbacks.
4. **Processing Pipeline**: Coordinates AI processing, BIM comparison, and data fusion after the data is successfully uploaded.
