# Data Capture & Fusion Design Note

**Topic:** Multi-sensor data fusion approach and 3DGS output handling
**Phase:** MVP S1

## 1. Multi-Sensor Data Capture

The Tersus MVP S1 scanner generates multiple data streams simultaneously. The edge processing agent ensures data is timestamped and synchronized before upload.

### 1.1 LiDAR (Point Cloud)
- **Primary Use:** Geometry capture, dimensional accuracy, structural measurements.
- **Handling:** Raw LiDAR packets are pre-processed on the edge to reduce noise, then uploaded as `.las` or `.e57` formats.

### 1.2 48MP RGB Camera
- **Primary Use:** Visual documentation, photogrammetry texturing, 3DGS (3D Gaussian Splatting) generation.
- **Handling:** Captured at fixed intervals; time-synced with the LiDAR trajectory.

### 1.3 Thermal Sensor
- **Primary Use:** Anomaly detection (e.g., moisture, insulation gaps, overheating equipment).
- **Handling:** Mapped against the 3D RGB and LiDAR data for multi-modal defect visualization.

### 1.4 RTK GPS
- **Primary Use:** Global positioning and drift correction.
- **Handling:** Provides absolute positioning for the point clouds, essential for BIM alignment in global coordinate systems.

## 2. Multi-Sensor Data Fusion Approach

Once uploaded to SiteSupervise, the processing pipeline takes over:
1. **Alignment:** LiDAR point clouds are trajectory-corrected using RTK GPS and IMU data.
2. **Colorization:** 48MP RGB images are projected onto the LiDAR point cloud using the calibrated extrinsic camera parameters.
3. **Thermal Mapping:** Thermal data is overlaid as a scalar field on the point cloud, allowing users to switch between RGB and Thermal views in the SiteSupervise 3D Viewer.
4. **BIM Registration:** The fused point cloud is registered against the federated BIM model (using ICP or targeted registration) for deviation analysis.

## 3. 3DGS (3D Gaussian Splatting) Output Handling

To provide photorealistic rendering in the web dashboard without massive point cloud overhead:
- The 48MP RGB images and LiDAR-derived camera poses are fed into a 3DGS training pipeline on the cloud.
- The output `.ply` (splat file) is highly compressed and streamed to the SiteSupervise QC Dashboard.
- Users can navigate the photorealistic 3DGS environment while querying underlying LiDAR data for exact measurements.
