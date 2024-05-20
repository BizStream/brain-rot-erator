from flask import Flask, request, jsonify
from flask_cors import CORS
from moviepy.editor import VideoFileClip, AudioFileClip
from werkzeug.utils import secure_filename
import os
from flask import send_from_directory

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "http://localhost:3000"}})


@app.route("/api/clips", methods=["POST"])
def process_data():
    title = request.form["title"]
    clipLength = request.form["clipLength"]
    file = request.files["file"]  # For files, use request.files

    # Create the temporary folder if it doesn't exist
    upload_folder = os.path.join("temporary_folder")
    if not os.path.exists(upload_folder):
        os.makedirs(upload_folder)

    fileName = secure_filename(
        file.filename
    )  # file is a file object with a filename attribute and a bunch of other attributes

    # prev temp file wasn't removed correctly
    if upload_folder.__contains__(fileName):
        fileName = secure_filename("1" + file.filename)

    filepath = os.path.join(
        upload_folder, fileName
    )  # put the file in the temporary folder
    file.save(filepath)

    # Create the output folder if it doesn't exist
    output_folder = os.path.join("public/videos")
    if not os.path.exists(output_folder):
        os.makedirs(output_folder)

    clipSegmentNum = 1
    clipCurrentStart = 0
    # audio = AudioFileClip(filepath)

    movie = VideoFileClip(filepath)
    total_duration = movie.duration
    print(total_duration)

    # loop through the video and create clips of the specified length
    while clipCurrentStart < total_duration:
        clipEnd = clipCurrentStart + int(clipLength)
        if clipEnd > total_duration:
            clipEnd = total_duration

        output_video_path = os.path.join(output_folder, f"{title}-{clipSegmentNum}.mp4")

        # Process video
        myClip = movie.subclip(clipCurrentStart, clipEnd)
        myClip.write_videofile(output_video_path, codec="libx264", audio=False)

        # Process audio
        # if clipSegmentNum == 1:
        #     myAudio = audio.subclip(clipCurrentStart, clipEnd)
        #     print("First segment")
        # else:
        #     myAudio = audio.subclip(clipCurrentStart)
        #     print("Not first segment")
        # myAudio.write_audiofile(output_video_path.replace(".mp4", ".mp3"))

        # myAudio.close()
        myClip.close()

        print(
            f"Processed video and audio clip from {clipCurrentStart} to {clipEnd} seconds."
        )
        clipCurrentStart += int(clipLength)
        clipSegmentNum += 1

    movie.close()
    # audio.close()

    # delete the file after processing

    os.remove(filepath)

    # # Process data here
    # # return 'Data collected: ' + title + ' ' + clipLength + ' ' + file.filename
    return (
        jsonify(
            {
                "status": "success",
                "message": "Data collected: {} {} {}".format(
                    title, clipLength, file.filename
                ),
            }
        ),
        200,
    )


@app.route("/api/test", methods=["GET"])
def get_clips():
    return "Hello, World!"


if __name__ == "__main__":
    app.run(debug=True)
