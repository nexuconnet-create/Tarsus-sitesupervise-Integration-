from rest_framework import serializers
from .models import ScanSession, ScanMetadata

class StartSessionSerializer(serializers.ModelSerializer):
    """
    Serializer for validating incoming data when starting a scan session.
    """
    class Meta:
        model = ScanSession
        fields = ['project_id', 'scanner_id', 'timestamp', 'sensors_used', 'expected_size_mb']

class SessionResponseSerializer(serializers.ModelSerializer):
    """
    Serializer for the response payload of starting a scan session,
    including the generated S3 upload URL.
    """
    upload_url = serializers.SerializerMethodField()
    session_id = serializers.UUIDField(source='id', read_only=True)

    class Meta:
        model = ScanSession
        fields = ['session_id', 'upload_url', 'status']

    def get_upload_url(self, obj) -> str:
        return f"https://mock-s3-bucket/upload/{obj.id}"

class LocationSerializer(serializers.Serializer):
    latitude = serializers.FloatField(required=False, allow_null=True)
    longitude = serializers.FloatField(required=False, allow_null=True)
    elevation = serializers.FloatField(required=False, allow_null=True)

class ScanMetadataSerializer(serializers.ModelSerializer):
    """
    Serializer for validating and processing incoming scan metadata.
    Extracts nested location dictionary into flattened model fields.
    """
    location = LocationSerializer(required=False)

    class Meta:
        model = ScanMetadata
        fields = ['location', 'operator_id', 'notes']

    def create(self, validated_data):
        location_data = validated_data.pop('location', {})
        if location_data:
            validated_data['latitude'] = location_data.get('latitude')
            validated_data['longitude'] = location_data.get('longitude')
            validated_data['elevation'] = location_data.get('elevation')
        return super().create(validated_data)
