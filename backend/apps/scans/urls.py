from django.urls import path
from .views import StartSessionView, SubmitMetadataView, FinalizeUploadView

urlpatterns = [
    path('session/', StartSessionView.as_view(), name='start_session'),
    path('<str:session_id>/metadata/', SubmitMetadataView.as_view(), name='submit_metadata'),
    path('<str:session_id>/finalize/', FinalizeUploadView.as_view(), name='finalize_upload'),
]
