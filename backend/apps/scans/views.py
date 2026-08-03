from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, serializers
from django.shortcuts import get_object_or_404
from .models import ScanSession, ScanMetadata
from .serializers import StartSessionSerializer, SessionResponseSerializer, ScanMetadataSerializer
from drf_spectacular.utils import extend_schema, inline_serializer

class StartSessionView(APIView):
    """
    API View to initialize a new scan session.
    Expects project ID, scanner ID, and scan metadata.
    Returns the session ID and a target upload URL.
    """
    @extend_schema(request=StartSessionSerializer, responses={201: SessionResponseSerializer})
    def post(self, request):
        """Handle POST request to create a scan session."""
        serializer = StartSessionSerializer(data=request.data)
        if serializer.is_valid():
            session = serializer.save(status='initialized')
            response_serializer = SessionResponseSerializer(session)
            return Response(response_serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class SubmitMetadataView(APIView):
    """
    API View to submit metadata (location, operator notes) for a specific scan session.
    """
    @extend_schema(request=ScanMetadataSerializer, responses={201: ScanMetadataSerializer})
    def post(self, request, session_id):
        """Handle POST request to attach metadata to an existing scan session."""
        session = get_object_or_404(ScanSession, id=session_id)
        # Check if metadata already exists
        if hasattr(session, 'metadata'):
            return Response({"error": "Metadata already exists for this session"}, status=status.HTTP_400_BAD_REQUEST)
        
        serializer = ScanMetadataSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(session=session)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class FinalizeUploadView(APIView):
    """
    API View to finalize the direct-to-S3 upload process.
    Updates the session status to 'processing', queueing it for AI and BIM pipelines.
    """
    @extend_schema(request=None, responses={202: inline_serializer(
        name='FinalizeUploadResponse',
        fields={
            'status': serializers.CharField(default='processing'),
            'message': serializers.CharField(default='Scan data queued for processing.')
        }
    )})
    def post(self, request, session_id):
        """Handle POST request to mark the scan upload as complete."""
        session = get_object_or_404(ScanSession, id=session_id)
        if session.status != 'initialized':
             return Response({"error": f"Cannot finalize upload. Current status is {session.status}"}, status=status.HTTP_400_BAD_REQUEST)
             
        session.status = 'processing'
        session.save()
        return Response({"status": "processing", "message": "Scan data queued for processing."}, status=status.HTTP_202_ACCEPTED)

