import os
from supabase import create_client, Client
from backend.app.config.settings import settings

class SupabaseBackendService:
    _client: Client = None

    @classmethod
    def get_client(cls):
        if cls._client is None:
            if not settings.SUPABASE_URL or not settings.SUPABASE_SERVICE_ROLE_KEY:
                return None
            cls._client = create_client(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_ROLE_KEY)
        return cls._client

    @staticmethod
    def upload_report(file_path: str, file_name: str):
        client = SupabaseBackendService.get_client()
        if not client:
            return None

        try:
            with open(file_path, "rb") as f:
                # Subir al bucket 'reports'
                client.storage.from_("reports").upload(
                    path=file_name,
                    file=f,
                    file_options={"content-type": "application/pdf"}
                )
            
            # Obtener URL pública
            res = client.storage.from_("reports").get_public_url(file_name)
            return res
        except Exception as e:
            print(f"Error uploading to Supabase: {str(e)}")
            return None
