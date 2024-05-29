from apscheduler.schedulers.background import BackgroundScheduler
import atexit
import time
import os
from flask_socketio import emit
from python.config import CLIPS_FOLDER, MAX_AGE
from python import socketio


scheduler = BackgroundScheduler()
clips_started = False


def delete_old_videos(directory, max_age=MAX_AGE):
    """Deletes files older than max_age seconds in the specified directory."""
    files_deleted = []
    now = time.time()
    for filename in os.listdir(directory):
        file_path = os.path.join(directory, filename)
        if os.stat(file_path).st_mtime < now - max_age:
            os.remove(file_path)
            files_deleted.append(filename)
            print(f"Deleted {filename}")
    if files_deleted:
        socketio.emit("files_deleted", {"files_deleted": files_deleted}, namespace="/")


def scheduled_job():
    global clips_started
    if not clips_started:
        scheduler.add_job(
            func=delete_old_videos,
            trigger="interval",
            seconds=MAX_AGE,
            args=[CLIPS_FOLDER],
        )
        clips_started = True
        print("Starting scheduled job for ONE HOUR")


scheduler.start()
atexit.register(lambda: scheduler.shutdown())
