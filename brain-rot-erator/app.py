from flask import Flask, request, jsonify, send_from_directory, after_this_request
from flask_cors import CORS
from moviepy.editor import VideoFileClip, CompositeVideoClip
from werkzeug.utils import secure_filename
import os
from apscheduler.schedulers.background import BackgroundScheduler
import atexit
import time
from threading import Timer


app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "http://localhost:3000"}})


clips_started = False


@app.route("/api/clips", methods=["POST"])
def process_data():
    try:
        title = request.form["title"]
        clipLength = request.form["clipLength"]
        file = request.files["file"]  # For files, use request.files
        adFill = request.files["adFill"]

        # Create the temporary folder if it doesn't exist
        upload_folder = os.path.join("temporary_folder")
        if not os.path.exists(upload_folder):
            os.makedirs(upload_folder)

        adFillFileName = secure_filename(adFill.filename)

        fileName = secure_filename(
            file.filename
        )  # file is a file object with a filename attribute and a bunch of other attributes

        # prev temp file wasn't removed correctly
        if upload_folder.__contains__(fileName):
            fileName = secure_filename("1" + file.filename)

        if upload_folder.__contains__(adFillFileName):
            adFillFileName = secure_filename("1" + adFill.filename)

        filepath = os.path.join(
            upload_folder, fileName
        )  # put the file in the temporary folder
        file.save(filepath)

        adFillPath = os.path.join(upload_folder, adFillFileName)
        adFill.save(adFillPath)

        # Create the output folder if it doesn't exist
        output_folder = os.path.join("temporary_folder", "clips")
        if not os.path.exists(output_folder):
            os.makedirs(output_folder)

        clipSegmentNum = 1
        clipCurrentStart = 0
        movie = VideoFileClip(filepath)
        adFill = VideoFileClip(adFillPath)
        adFill = adFill.set_position(("center", "bottom"))
        finalClip = CompositeVideoClip(
            [movie, adFill],
            size=(max(movie.size[0], adFill.size[0]), movie.size[1] + adFill.size[1]),
        )
        total_duration = movie.duration

        print("movie duration: ", total_duration)

        # loop through the video and create clips of the specified length
        while clipCurrentStart < total_duration:
            clipEnd = clipCurrentStart + int(clipLength)
            if clipEnd > total_duration:
                clipEnd = total_duration

            output_video_path = os.path.join(
                output_folder, f"{title}-{clipSegmentNum}.mp4"
            )

            # Process video
            myClip = finalClip.subclip(clipCurrentStart, clipEnd)
            myClip.write_videofile(output_video_path, codec="libx264", audio=False)

            myClip.close()

            clipCurrentStart += int(clipLength)
            clipSegmentNum += 1

        movie.close()
        adFill.close()

        # delete the file after processing
        os.remove(filepath)
        print("adFillPath: ", adFillPath)
        os.remove(adFillPath)
        scheduled_job()

        # # Process data here
        # # return 'Data collected: ' + title + ' ' + clipLength + ' ' + file.filename
        return jsonify(
            {
                "status": "success",
                "message": "Data collected: {} {} {}".format(
                    title, clipLength, file.filename, adFill.filename
                ),
            }
        )
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500


@app.route("/api/videos", methods=["GET"])
def list_clip_urls():

    output_folder = os.path.join("temporary_folder", "clips")
    clip_urls = []
    for filename in os.listdir(output_folder):
        clip_urls.append(f"http://localhost:5000/api/videos/{filename}")

    return jsonify(clip_urls)


# TODO: just give it beginning file name and then it will return all the clips
@app.route("/api/videos/<filename>", methods=["GET"])
def get_clip(filename):
    output_folder = os.path.join("temporary_folder", "clips")
    try:
        response = send_from_directory(output_folder, filename, as_attachment=True)
        response.headers["Content-Disposition"] = f"attachment; filename={filename}"
        return response
    except FileNotFoundError:
        return jsonify({"error": "File not found"}), 404


@app.route("/api/delete_clips/", methods=["POST"])
def delete_clips():
    output_folder = os.path.join("temporary_folder", "clips")
    data = request.get_json()
    filename = data.get("filename")
    filepath = os.path.join(output_folder, filename)
    try:
        if os.path.exists(filepath):
            os.remove(filepath)
            return jsonify({"status": "success", "message": f"Deleted {filename}"}), 200
        else:
            return jsonify({"status": "error", "message": f"{filename} not found"}), 404
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500


def delete_old_videos(directory, max_age=3600):
    """Deletes files older than max_age seconds in the specified directory."""
    now = time.time()
    for filename in os.listdir(directory):
        file_path = os.path.join(directory, filename)
        if os.stat(file_path).st_mtime < now - max_age:
            os.remove(file_path)


def scheduled_job():
    output_folder = os.path.join("temporary_folder", "clips")
    global clips_started
    if not clips_started:
        scheduler.add_job(
            func=delete_old_videos,
            trigger="interval",
            seconds=3600,
            args=[output_folder],
        )
        clips_started = True
        print("Starting scheduled job for ONE HOUR")


scheduler = BackgroundScheduler()
scheduler.start()
atexit.register(lambda: scheduler.shutdown())

if __name__ == "__main__":
    app.run(debug=True)
