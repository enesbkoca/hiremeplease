import os

from redis import Redis
from rq import Worker
from dotenv import load_dotenv

from index import generate_and_store_questions

load_dotenv()

redis_conn = Redis.from_url(os.getenv("REDIS_URL"))
w = Worker(['gpt_response'], connection=redis_conn)
w.work()
