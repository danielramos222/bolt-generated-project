"""API client module for SGI-OP monitoring system."""
import requests
import logging
from typing import Dict, Any, Optional

class APIClient:
    def __init__(self, base_url: str, auth_url: str):
        self.base_url = base_url
        self.auth_url = auth_url
        self.token: Optional[str] = None

    def authenticate(self, username: str, password: str) -> None:
        """Authenticates with the API and stores the token."""
        try:
            payload = {'usuario': username, 'senha': password}
            response = requests.post(self.auth_url, json=payload)
            response.raise_for_status()
            self.token = response.json().get('access_token')
            if not self.token:
                raise ValueError("Token not found in API response")
            logging.info("Authentication successful")
        except requests.RequestException as e:
            logging.error(f"Authentication error: {e}")
            raise

    def get_interventions(self, start_date: str, end_date: str) -> list:
        """Retrieves interventions from the API."""
        if not self.token:
            raise ValueError("Not authenticated")

        try:
            headers = {'Authorization': f'Bearer {self.token}'}
            params = {
                'filtro.dataInicio': start_date,
                'filtro.dataFim': end_date
            }
            response = requests.get(
                f"{self.base_url}/sgi/intervencoes",
                headers=headers,
                params=params
            )
            response.raise_for_status()
            data = response.json().get('intervencoes', [])
            logging.info(f"Retrieved {len(data)} interventions")
            return data
        except requests.RequestException as e:
            logging.error(f"Error retrieving interventions: {e}")
            raise
