from flask import request, jsonify, send_from_directory
from python import python, socketio
from python.video_processing import process_video, process_video_no_ad
from python.config import CLIPS_FOLDER
import os
from flask_socketio import emit


@python.route("/api/clips", methods=["POST"])
def process_data():
    try:
        title = request.form["title"]
        clipLength = request.form["clipLength"]
        file = request.files["file"]
        adFill = request.form.get("adFill")

        if adFill == "":
            clipsData = process_video_no_ad(title, clipLength, file)
            adFillFilename = None
        else:
            adFill = request.files["adFill"]
            clipsData = process_video(title, clipLength, file, adFill)
            adFillFilename = adFill.filename if adFill else None

        return jsonify(
            {
                "status": "success",
                "message": "Data collected: {} {} {}".format(
                    title, clipLength, file.filename, adFillFilename
                ),
                "clipsData": clipsData,
            }
        )
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500


@python.route("/api/videos", methods=["GET"])
def list_clip_urls():
    clip_urls = [
        f"http://localhost:5000/api/videos/{filename}"
        for filename in os.listdir(CLIPS_FOLDER)
    ]
    return jsonify(clip_urls)


@python.route("/api/videos/<filename>", methods=["GET"])
def get_clip(filename):
    try:
        response = send_from_directory(CLIPS_FOLDER, filename, as_attachment=True)
        response.headers["Content-Disposition"] = f"attachment; filename={filename}"
        return response
    except FileNotFoundError:
        return jsonify({"error": "File not found"}), 404


@python.route("/api/delete_clips/", methods=["POST"])
def delete_clips():
    data = request.get_json()
    filename = data.get("filename")
    filepath = os.path.join(CLIPS_FOLDER, filename)
    try:
        if os.path.exists(filepath):
            os.remove(filepath)
            socketio.emit(
                "file_deleted", {"filename": filename}, namespace="/"
            )  # files_deleted is an event name
            return jsonify({"status": "success", "message": f"Deleted {filename}"}), 200
        else:
            return jsonify({"status": "error", "message": f"{filename} not found"}), 404
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500
