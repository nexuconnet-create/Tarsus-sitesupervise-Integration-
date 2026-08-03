from django.db import models
import uuid

class ScanSession(models.Model):
    """
    Represents a single scanning session initiated by the edge scanner.
    Tracks status, project association, and sensory payloads.
    """
    STATUS_CHOICES = [
        ('initialized', 'Initialized'),
        ('uploading', 'Uploading'),
        ('processing', 'Processing'),
        ('completed', 'Completed'),
        ('failed', 'Failed'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    project_id = models.UUIDField(null=True, blank=True)
    scanner_id = models.CharField(max_length=100)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='initialized')
    expected_size_mb = models.FloatField(null=True, blank=True)
    timestamp = models.DateTimeField(null=True, blank=True)
    sensors_used = models.JSONField(default=list, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

class ScanMetadata(models.Model):
    """
    Stores additional metadata associated with a ScanSession,
    such as GPS location and operator notes.
    """
    session = models.OneToOneField(ScanSession, on_delete=models.CASCADE, related_name='metadata')
    latitude = models.FloatField(null=True, blank=True)
    longitude = models.FloatField(null=True, blank=True)
    elevation = models.FloatField(null=True, blank=True)
    operator_id = models.CharField(max_length=100, blank=True)
    notes = models.TextField(blank=True)
