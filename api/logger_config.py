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
    "<white>{time:YYYY-MM-DD HH:mm:ss}</white> | "
    "<level>{level: <8}</level> | "
    "<cyan>{name}</cyan>:<cyan>{function}</cyan>:<cyan>{line}</cyan> | "
    "<bold>{level.icon} <level>{message}</level></bold>"
)

FILE_FORMAT = (
    "<white>{time:YYYY-MM-DD HH:mm:ss}</white> | "
    "<level>{level: <8}</level> | "
    "<cyan>{name}</cyan>:<cyan>{function}</cyan>:<cyan>{line}</cyan> | "
    "<bold>{level.icon} <level>{message}</level></bold> | "
    "<white>{extra}</white>"
)

# Add handlers for different log levels with enhanced colors
logger.add(
    sys.stderr,
    format=CONSOLE_FORMAT,
    level="DEBUG",
    colorize=True,
    enqueue=True
)

logger.add(
    "logs/debug.log",
    format=FILE_FORMAT,
    level="DEBUG",
    rotation="50 MB",
    retention="10 days",
    colorize=True,
    enqueue=True
)

logger.add(
    "logs/error.log",
    format=FILE_FORMAT,
    level="ERROR",
    rotation="5 MB",
    retention="30 days",
    colorize=True,
    enqueue=True,
    backtrace=True,
    diagnose=True
)

# Configure custom color levels and icons
logger.level("INFO", color="<green>", icon="ℹ️")
logger.level("SUCCESS", color="<green>", icon="✅")
logger.level("WARNING", color="<yellow>", icon="⚠️")
logger.level("ERROR", color="<red>", icon="❌")
logger.level("CRITICAL", color="<red><bold>", icon="🚨")
logger.level("DEBUG", color="<blue>", icon="🔍")

# Export logger
def get_logger():
    return logger 