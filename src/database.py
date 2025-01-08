"""Database operations module for SGI-OP monitoring system."""
import sqlite3
import logging
from datetime import datetime
from typing import Dict, Any

class DatabaseManager:
    def __init__(self, db_path: str):
        self.db_path = db_path

    def setup_database(self) -> None:
        """Creates or updates the database schema."""
        try:
            with sqlite3.connect(self.db_path) as conn:
                cursor = conn.cursor()
                cursor.execute('''
                    CREATE TABLE IF NOT EXISTS intervencoes (
                        numeroONS TEXT PRIMARY KEY,
                        numeroAgente TEXT,
                        dataHoraInicio TEXT,
                        dataHoraFim TEXT,
                        situacao TEXT,
                        possuiRecomendacao TEXT,
                        descricao TEXT,
                        criticidade TEXT DEFAULT 'Média',
                        ultimaAtualizacao TEXT,
                        responsavel TEXT,
                        tipoAlteracao TEXT
                    )
                ''')
                logging.info("Database configured successfully.")
                self._add_last_update_column(cursor)
        except sqlite3.Error as e:
            logging.error(f"Database setup error: {e}")
            raise

    def _add_last_update_column(self, cursor: sqlite3.Cursor) -> None:
        """Adds ultimaAtualizacao column if it doesn't exist."""
        cursor.execute("PRAGMA table_info(intervencoes);")
        columns = [column[1] for column in cursor.fetchall()]
        if 'ultimaAtualizacao' not in columns:
            cursor.execute('ALTER TABLE intervencoes ADD COLUMN ultimaAtualizacao TEXT')
            logging.info("Added ultimaAtualizacao column.")

    def update_intervention(self, intervention: Dict[str, Any], change_type: str) -> None:
        """Updates or inserts an intervention record."""
        try:
            with sqlite3.connect(self.db_path) as conn:
                cursor = conn.cursor()
                cursor.execute('''
                    INSERT OR REPLACE INTO intervencoes (
                        numeroONS, numeroAgente, dataHoraInicio, dataHoraFim,
                        situacao, possuiRecomendacao, descricao, criticidade,
                        ultimaAtualizacao, responsavel, tipoAlteracao
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ''', (
                    intervention.get('numeroONS'),
                    intervention.get('numeroAgente', ''),
                    intervention.get('dataHoraInicio', ''),
                    intervention.get('dataHoraFim', ''),
                    intervention.get('situacao', ''),
                    intervention.get('possuiRecomendacao', ''),
                    intervention.get('descricao', ''),
                    intervention.get('criticidade', 'Média'),
                    datetime.now().isoformat(),
                    intervention.get('responsavel', ''),
                    change_type
                ))
        except sqlite3.Error as e:
            logging.error(f"Error updating intervention: {e}")
            raise

    def delete_intervention(self, numero_ons: str) -> None:
        """Deletes an intervention record."""
        try:
            with sqlite3.connect(self.db_path) as conn:
                cursor = conn.cursor()
                cursor.execute("DELETE FROM intervencoes WHERE numeroONS = ?", (numero_ons,))
        except sqlite3.Error as e:
            logging.error(f"Error deleting intervention: {e}")
            raise

    def get_all_interventions(self) -> list:
        """Retrieves all interventions from the database."""
        try:
            with sqlite3.connect(self.db_path) as conn:
                conn.row_factory = sqlite3.Row
                cursor = conn.cursor()
                cursor.execute("SELECT * FROM intervencoes")
                return [dict(row) for row in cursor.fetchall()]
        except sqlite3.Error as e:
            logging.error(f"Error retrieving interventions: {e}")
            raise
