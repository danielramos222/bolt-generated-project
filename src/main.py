"""Main module for SGI-OP monitoring system."""
import os
import logging
from datetime import datetime, timedelta
import time
from logging.handlers import RotatingFileHandler
from dotenv import load_dotenv

from database import DatabaseManager
from api_client import APIClient
from data_processing import DataProcessor
from report_generator import ReportGenerator

# Load environment variables
load_dotenv()

# Constants
BASE_URL = "https://integra.ons.org.br/api"
AUTH_URL = f"{BASE_URL}/autenticar"
DB_PATH = 'sgi_op_data.db'
INTERVAL = 300  # 5 minutes
WORKING_HOURS = {'start': 8, 'end': 18}

# Configure logging
def setup_logging():
    """Configures the logging system."""
    log_file = 'sgi_op_monitor.log'
    max_size = 5 * 1024 * 1024  # 5 MB
    handler = RotatingFileHandler(log_file, maxBytes=max_size, backupCount=3)
    logging.basicConfig(
        handlers=[handler],
        level=logging.INFO,
        format='%(asctime)s - %(levelname)s - %(message)s'
    )

def is_working_hours() -> bool:
    """Checks if current time is within working hours."""
    current_hour = datetime.now().hour
    return WORKING_HOURS['start'] <= current_hour < WORKING_HOURS['end']

def main():
    """Main execution function."""
    setup_logging()
    
    # Initialize components
    db_manager = DatabaseManager(DB_PATH)
    api_client = APIClient(BASE_URL, AUTH_URL)
    data_processor = DataProcessor(db_manager)
    report_generator = ReportGenerator()
    
    # Setup database
    db_manager.setup_database()
    
    # Authenticate
    api_client.authenticate(
        os.getenv('ONS_USUARIO'),
        os.getenv('ONS_SENHA')
    )
    
    previous_data = []
    
    while True:
        try:
            if is_working_hours():
                logging.info("Starting monitoring cycle")
                
                # Collect data
                start_date = datetime.now().strftime('%Y-%m-%d')
                end_date = (datetime.now() + timedelta(days=89)).strftime('%Y-%m-%d')
                current_data = api_client.get_interventions(start_date, end_date)
                
                # Process changes
                changes = data_processor.process_interventions(current_data, previous_data)
                previous_data = current_data
                
                # Save to CSV
                data_processor.save_to_csv(current_data, 'intervencoes.csv')
                
                # Generate report if there are changes
                if any(changes.values()):
                    stats = data_processor.get_statistics()
                    report_data = {
                        'interventions': current_data,
                        'statistics': stats
                    }
                    report_generator.generate_html_report(report_data)
                
            else:
                logging.info("Outside working hours")
            
            time.sleep(INTERVAL)
            
        except KeyboardInterrupt:
            logging.info("Monitoring stopped by user")
            break
        except Exception as e:
            logging.error(f"Error in monitoring cycle: {e}")
            time.sleep(INTERVAL)

if __name__ == "__main__":
    main()
