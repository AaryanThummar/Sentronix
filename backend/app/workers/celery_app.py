from celery import Celery
from app.core.config import settings

celery_app = Celery(
    "worker",
    broker=settings.REDIS_URI,
    backend=settings.REDIS_URI
)

celery_app.conf.task_routes = {
    "app.workers.tasks_sast.*": {"queue": "sast_queue"},
    "app.workers.tasks_file_defense.*": {"queue": "file_defense_queue"},
    "app.workers.tasks_app_defense.*": {"queue": "app_defense_queue"}
}

# Ensure celery discovers tasks
celery_app.autodiscover_tasks([
    "app.workers.tasks_sast", 
    "app.workers.tasks_file_defense",
    "app.workers.tasks_app_defense"
])
