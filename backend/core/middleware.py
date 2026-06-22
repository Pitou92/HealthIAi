import time
import logging
import traceback
from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware

logger = logging.getLogger("healthiai.api.requests")

class RequestLoggingMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next) -> Response:
        start_time = time.time()
        
        # Get request details
        client_host = request.client.host if request.client else "unknown"
        method = request.method
        path = request.url.path
        query_params = str(request.query_params)
        query_string = f"?{query_params}" if query_params else ""
        
        logger.info(f"Incoming request: {method} {path}{query_string} from {client_host}")
        
        try:
            response = await call_next(request)
            
            # Calculate duration in milliseconds
            duration_ms = (time.time() - start_time) * 1000
            
            logger.info(
                f"Completed request: {method} {path}{query_string} | "
                f"Status: {response.status_code} | "
                f"Duration: {duration_ms:.2f}ms"
            )
            return response
            
        except Exception as e:
            duration_ms = (time.time() - start_time) * 1000
            tb_str = traceback.format_exc()
            logger.error(
                f"Exception processing request: {method} {path}{query_string} | "
                f"Error: {str(e)} | "
                f"Duration: {duration_ms:.2f}ms\n"
                f"Traceback:\n{tb_str}"
            )
            raise e
