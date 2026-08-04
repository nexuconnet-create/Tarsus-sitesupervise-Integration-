# Data Capture & Fusion Design Note
## Tersus MVP S1 – SiteSupervise Integration

This design note details the approach for handling multi-sensor data from the Tersus MVP S1 scanner and fusing it for use within SiteSupervise.

### 1. Sensor Overview
The Tersus MVP S1 scanner generates the following modalities:
- **LiDAR:** High-density point clouds for spatial geometry.
- **48MP RGB:** High-resolution color imagery for texture mapping and visual inspection.
- **Thermal:** Infrared data for detecting heat anomalies (e.g., HVAC leaks, electrical issues).
- **RTK GPS:** Precision geospatial positioning data.

### 2. Data Fusion Pipeline

#### 2.1 Spatial Alignment
- Base geometric structures are derived from the **LiDAR** point cloud.
- **RTK GPS** data is used to globally anchor the point cloud, ensuring precise alignment when compared against BIM models in SiteSupervise.

#### 2.2 Texture Mapping (RGB & Thermal)
- **RGB Fusion:** The 48MP RGB images are photogrammetrically aligned with the LiDAR point cloud to colorize the points.
- **Thermal Fusion:** Thermal imagery is overlaid onto the 3D geometry as an alternative "heatmap" texture, allowing users to toggle between RGB and Thermal views in the SiteSupervise dashboard.

#### 2.3 3DGS (3D Gaussian Splatting) Output Handling
- Using the aligned RGB images and the sparse LiDAR point cloud as priors, the processing pipeline generates a **3DGS model**.
- 3DGS provides real-time, photorealistic rendering capabilities within the SiteSupervise web dashboard, offering a higher fidelity view than traditional point clouds.

### 3. Processing Architecture
The fusion process requires significant computational resources.
- **Edge:** Raw sensor sync and initial packet compression.
- **Cloud (Integration Layer):** Heavy lifting for LiDAR-RGB alignment and 3DGS training using GPU-accelerated Celery workers.
- **Storage:** Fused artifacts (colored point clouds `.las`/`.ply`, 3DGS splat files) are stored in S3 and referenced via metadata in the database.
