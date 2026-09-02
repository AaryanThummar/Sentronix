from celery import Celery
from app.core.config import settings

celery_app = Celery(
    "worker",
    broker=settings.REDIS_URI,
    backend=settings.REDIS_URI
)

# Default all task queues for local dev
celery_app.conf.task_default_queue = 'celery'

# Ensure celery discovers tasks
celery_app.autodiscover_tasks([
    "app.workers.tasks_sast", 
    "app.workers.tasks_file_defense",
    "app.workers.tasks_app_defense"
])
