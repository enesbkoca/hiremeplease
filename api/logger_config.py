import sys
from pathlib import Path
from loguru import logger

# Remove default logger
logger.remove()

# Create logs directory if it doesn't exist
log_dir = Path("logs")
log_dir.mkdir(exist_ok=True)

# Color configurations for different log levels
CONSOLE_FORMAT = (
    "<green>{time:YYYY-MM-DD HH:mm:ss}</green> | "
    "<level>{level: <8}</level> | "
    "<cyan>{name}</cyan>:<cyan>{function}</cyan>:<cyan>{line}</cyan> | "
    "<bold><level>{message}</level></bold>"
)

FILE_FORMAT = (
    "<green>{time:YYYY-MM-DD HH:mm:ss}</green> | "
    "<level>{level: <8}</level> | "
    "<cyan>{name}</cyan>:<cyan>{function}</cyan>:<cyan>{line}</cyan> | "
    "<bold><level>{message}</level></bold> | "
    "<white>{extra}</white>"
)

# Add handlers for different log levels with enhanced colors
logger.add(
    sys.stderr,
    format=CONSOLE_FORMAT,
    level="INFO",
    colorize=True,
    enqueue=True
)

logger.add(
    "logs/debug.log",
    format=FILE_FORMAT,
    level="DEBUG",
    rotation="500 MB",
    retention="10 days",
    colorize=True,
    enqueue=True
)

logger.add(
    "logs/error.log",
    format=FILE_FORMAT,
    level="ERROR",
    rotation="100 MB",
    retention="30 days",
    colorize=True,
    enqueue=True,
    backtrace=True,
    diagnose=True
)

# Configure custom color levels
logger.level("INFO", color="<green>")
logger.level("SUCCESS", color="<green>")
logger.level("WARNING", color="<yellow>")
logger.level("ERROR", color="<red>")
logger.level("CRITICAL", color="<red><bold>")
logger.level("DEBUG", color="<blue>")

# Export logger
def get_logger():
    return logger 