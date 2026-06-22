from fastapi import APIRouter, status
from pydantic import BaseModel
from typing import List, Optional
import logging
from pathlib import Path
from logging.handlers import RotatingFileHandler

router = APIRouter()
logger = logging.getLogger(__name__)

# Configure a dedicated logger and file handler for frontend logs
logs_dir = Path(__file__).parent.parent.parent / "logs"
logs_dir.mkdir(parents=True, exist_ok=True)
frontend_log_file = logs_dir / "frontend.log"

frontend_logger = logging.getLogger("healthiai.frontend")
frontend_logger.setLevel(logging.INFO)

# Set up the file handler if not already present
if not frontend_logger.handlers:
    formatter = logging.Formatter("%(asctime)s - %(levelname)s - %(message)s")
    file_handler = RotatingFileHandler(
        frontend_log_file,
        maxBytes=5 * 1024 * 1024,  # 5 MB
        backupCount=3,
        encoding="utf-8"
    )
    file_handler.setFormatter(formatter)
    frontend_logger.addHandler(file_handler)
    # Prevent propagation to the root logger so frontend logs only go to frontend.log
    frontend_logger.propagate = False

class LogEntry(BaseModel):
    timestamp: str
    level: str
    tag: Optional[str] = None
    message: str

class ClientLogsPayload(BaseModel):
    user_id: int
    device: str
    logs: List[LogEntry]

@router.post("/client", status_code=status.HTTP_200_OK)
async def receive_client_logs(payload: ClientLogsPayload):
    """
    Receives logs from the mobile client and stores them in frontend.log.
    """
    logger.info(f"Received {len(payload.logs)} log entries from client ({payload.device}) for user_id: {payload.user_id}")
    
    for entry in payload.logs:
        tag_str = f" [{entry.tag}]" if entry.tag else ""
        formatted_message = f"ClientTime: {entry.timestamp} - User: {payload.user_id}{tag_str} - {entry.message}"
        
        level = entry.level.upper()
        if level == "DEBUG":
            frontend_logger.debug(formatted_message)
        elif level == "INFO":
            frontend_logger.info(formatted_message)
        elif level == "WARN" or level == "WARNING":
            frontend_logger.warning(formatted_message)
        elif level == "ERROR":
            frontend_logger.error(formatted_message)
        else:
            frontend_logger.info(f"[{level}] {formatted_message}")
            
    return {"status": "success", "processed_logs": len(payload.logs)}
