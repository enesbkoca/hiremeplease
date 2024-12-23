import os

from redis import Redis
from rq import Worker
from dotenv import load_dotenv
from .prompting import generate_response

load_dotenv()

redis_conn = Redis.from_url(os.getenv("REDIS_URL"))
w = Worker(['gpt_response'], connection=redis_conn)
w.work()
