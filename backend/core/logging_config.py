import logging
from logging.handlers import RotatingFileHandler
from pathlib import Path
from core.config import settings

def setup_logging():
    # Make sure logs directory exists
    logs_dir = Path(__file__).parent.parent / "logs"
    logs_dir.mkdir(parents=True, exist_ok=True)
    log_file = logs_dir / "healthiai.log"

    # Define standard format
    formatter = logging.Formatter(settings.LOG_FORMAT)

    # Get root logger
    root_logger = logging.getLogger()
    
    # Set the logging level from settings
    level_str = settings.LOG_LEVEL.upper()
    level = getattr(logging, level_str, logging.INFO)
    root_logger.setLevel(level)

    # Clear existing handlers to prevent duplicate logs
    if root_logger.hasHandlers():
        root_logger.handlers.clear()

    # Stream (Console) Handler
    console_handler = logging.StreamHandler()
    console_handler.setFormatter(formatter)
    console_handler.setLevel(level)
    root_logger.addHandler(console_handler)

    # Rotating File Handler
    file_handler = RotatingFileHandler(
        log_file,
        maxBytes=10 * 1024 * 1024,  # 10 MB per file
        backupCount=5,               # Keep up to 5 old log files
        encoding="utf-8"
    )
    file_handler.setFormatter(formatter)
    file_handler.setLevel(level)
    root_logger.addHandler(file_handler)

    # Specific logger settings to reduce third-party library noise (e.g., urllib3, botocore, etc.)
    logging.getLogger("uvicorn").setLevel(logging.WARNING)
    logging.getLogger("uvicorn.access").setLevel(logging.WARNING)
    
    # Log initialization message
    root_logger.info(f"Logging configured successfully. Level: {level_str}. Log file path: {log_file}")
