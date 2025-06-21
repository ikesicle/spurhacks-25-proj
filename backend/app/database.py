import os
from motor.motor_asyncio import AsyncIOMotorClient
from pymongo.errors import ConfigurationError
import logging
from dotenv import load_dotenv

# Load the appropriate .env file based on environment
load_dotenv()

MONGODB_URI = os.getenv("MONGODB_URI")

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

logger.info(f"MONGODB_URI: {MONGODB_URI}")

if not MONGODB_URI:
    raise ConfigurationError("MONGODB_URI environment variable is not set")

try:
    client = AsyncIOMotorClient(MONGODB_URI)
    db = client.get_database()
except ConfigurationError as e:
    raise ConfigurationError(f"Invalid MongoDB URI: {str(e)}")

def get_database():
    return db