"""Report generator module for SGI-OP monitoring system."""
import pandas as pd
import plotly.express as px
import plotly.graph_objects as go
from datetime import datetime
import logging
from typing import Dict, Any
import os

class ReportGenerator:
    def __init__(self, output_dir: str = 'reports'):
        self.output_dir = output_dir
        os.makedirs(output_dir, exist_ok=True)

    def generate_html_report(self, data: Dict[str, Any]) -> str:
        """Generates an HTML report with interactive charts."""
        try:
            df = pd.DataFrame(data['interventions'])
            stats = data['statistics']
            
            # Create charts
            criticality_chart = self._create_criticality_chart(df)
            situation_chart = self._create_situation_chart(df)
            timeline_chart = self._create_timeline_chart(df)
            
            # Generate HTML content
            html_content = f"""
            <!DOCTYPE html>
            <html lang="pt-BR">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Relatório de Intervenções - {datetime.now().strftime('%d/%m/%Y')}</title>
                <script src="https://cdn.plot.ly/plotly-latest.min.js"></script>
                <style>
                    body {{
                        font-family: Arial, sans-serif;
                        margin: 0;
                        padding: 20px;
                        background-color: #f5f5f5;
                    }}
                    .container {{
                        max-width: 1200px;
                        margin: 0 auto;
                        background-color: white;
                        padding: 20px;
                        border-radius: 8px;
                        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                    }}
                    .header {{
                        text-align: center;
                        margin-bottom: 30px;
                    }}
                    .stats-container {{
                        display: grid;
                        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                        gap: 20px;
                        margin-bottom: 30px;
                    }}
                    .stat-card {{
                        background-color: #f8f9fa;
                        padding: 15px;
                        border-radius: 6px;
                        text-align: center;
                    }}
                    .chart-container {{
                        margin-bottom: 30px;
                    }}
                    table {{
                        width: 100%;
                        border-collapse: collapse;
                        margin-top: 20px;
                    }}
                    th, td {{
                        padding: 12px;
                        text-align: left;
                        border-bottom: 1px solid #ddd;
                    }}
                    th {{
                        background-color: #f8f9fa;
                    }}
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>Relatório de Intervenções</h1>
                        <p>Gerado em: {datetime.now().strftime('%d/%m/%Y %H:%M:%S')}</p>
                    </div>
                    
                    <div class="stats-container">
                        <div class="stat-card">
                            <h3>Total de Intervenções</h3>
                            <p>{stats['total_interventions']}</p>
                        </div>
                    </div>
                    
                    <div class="chart-container">
                        <h2>Distribuição por Criticidade</h2>
                        {criticality_chart}
                    </div>
                    
                    <div class="chart-container">
                        <h2>Distribuição por Situação</h2>
                        {situation_chart}
                    </div>
                    
                    <div class="chart-container">
                        <h2>Linha do Tempo de Intervenções</h2>
                        {timeline_chart}
                    </div>
                    
                    <div class="table-container">
                        <h2>Lista de Intervenções</h2>
                        {df.to_html(classes='table', index=False)}
                    </div>
                </div>
            </body>
            </html>
            """
            
            # Save report
            filename = f"relatorio_intervencoes_{datetime.now().strftime('%Y%m%d_%H%M%S')}.html"
            filepath = os.path.join(self.output_dir, filename)
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(html_content)
            
            logging.info(f"Report generated: {filepath}")
            return filepath
            
        except Exception as e:
            logging.error(f"Error generating report: {e}")
            raise

    def _create_criticality_chart(self, df: pd.DataFrame) -> str:
        """Creates a bar chart for criticality distribution."""
        fig = px.bar(
            df['criticidade'].value_counts().reset_index(),
            x='index',
            y='criticidade',
            title='Distribuição por Criticidade',
            labels={'index': 'Criticidade', 'criticidade': 'Quantidade'}
        )
        return fig.to_html(full_html=False)

    def _create_situation_chart(self, df: pd.DataFrame) -> str:
        """Creates a pie chart for situation distribution."""
        fig = px.pie(
            values=df['situacao'].value_counts().values,
            names=df['situacao'].value_counts().index,
            title='Distribuição por Situação'
        )
        return fig.to_html(full_html=False)

    def _create_timeline_chart(self, df: pd.DataFrame) -> str:
        """Creates a timeline chart of interventions."""
        df['dataHoraInicio'] = pd.to_datetime(df['dataHoraInicio'])
        fig = px.scatter(
            df,
            x='dataHoraInicio',
            y='criticidade',
            color='situacao',
            title='Linha do Tempo de Intervenções',
            labels={
                'dataHoraInicio': 'Data de Início',
                'criticidade': 'Criticidade',
                'situacao': 'Situação'
            }
        )
        return fig.to_html(full_html=False)
