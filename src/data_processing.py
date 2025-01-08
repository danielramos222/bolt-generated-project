"""Data processing module for SGI-OP monitoring system."""
import pandas as pd
import logging
from typing import Dict, List, Any
from datetime import datetime

class DataProcessor:
    def __init__(self, db_manager):
        self.db_manager = db_manager

    def process_interventions(self, new_data: List[Dict[str, Any]], previous_data: List[Dict[str, Any]]) -> Dict[str, list]:
        """Processes interventions and detects changes."""
        changes = {'novo': [], 'alterado': [], 'removido': []}
        previous_data_dict = {i['numeroONS']: i for i in previous_data}

        for intervention in new_data:
            numero_ons = intervention['numeroONS']
            if numero_ons not in previous_data_dict:
                changes['novo'].append(intervention)
                self.db_manager.update_intervention(intervention, 'Novo')
            elif intervention != previous_data_dict[numero_ons]:
                changes['alterado'].append(intervention)
                self.db_manager.update_intervention(intervention, 'Alterado')

        removed = set(previous_data_dict) - {i['numeroONS'] for i in new_data}
        for numero_ons in removed:
            changes['removido'].append(previous_data_dict[numero_ons])
            self.db_manager.delete_intervention(numero_ons)

        logging.info(f"Processed changes: {len(changes['novo'])} new, "
                    f"{len(changes['alterado'])} modified, "
                    f"{len(changes['removido'])} removed")
        return changes

    def save_to_csv(self, data: List[Dict[str, Any]], filename: str) -> None:
        """Saves intervention data to CSV."""
        try:
            df = pd.DataFrame(data)
            df.to_csv(filename, index=False, encoding='utf-8')
            logging.info(f"Data saved to {filename}")
        except Exception as e:
            logging.error(f"Error saving CSV: {e}")
            raise

    def get_statistics(self) -> Dict[str, Any]:
        """Calculates statistics for reporting."""
        interventions = self.db_manager.get_all_interventions()
        df = pd.DataFrame(interventions)
        
        return {
            'total_interventions': len(df),
            'by_criticality': df['criticidade'].value_counts().to_dict(),
            'by_situation': df['situacao'].value_counts().to_dict(),
            'latest_update': datetime.now().isoformat()
        }
