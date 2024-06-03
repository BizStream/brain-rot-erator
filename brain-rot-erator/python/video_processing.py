import os
from moviepy.editor import VideoFileClip, CompositeVideoClip, concatenate_videoclips
from werkzeug.utils import secure_filename
from python.config import UPLOAD_FOLDER, CLIPS_FOLDER
from PIL import Image
from datetime import datetime


def process_video(title, clipLength, file, adFill):
    try:
        # Create the temporary folder if it doesn't exist
        if not os.path.exists(UPLOAD_FOLDER):
            os.makedirs(UPLOAD_FOLDER)
        if not os.path.exists(CLIPS_FOLDER):
            os.makedirs(CLIPS_FOLDER)

        adFillFileName = secure_filename(adFill.filename)
        fileName = secure_filename(file.filename)

        # prev temp file wasn't removed correctly
        if UPLOAD_FOLDER.__contains__(fileName):
            fileName = secure_filename("1" + file.filename)
        if UPLOAD_FOLDER.__contains__(adFillFileName):
            adFillFileName = secure_filename("1" + adFill.filename)

        filepath = os.path.join(UPLOAD_FOLDER, fileName)
        file.save(filepath)
        adFillPath = os.path.join(UPLOAD_FOLDER, adFillFileName)
        adFill.save(adFillPath)

        clipSegmentNum = 1
        clipCurrentStart = 0
        movie = VideoFileClip(filepath).resize(height=2532 / 2)
        adFill = VideoFileClip(adFillPath, audio=None).resize(height=2532 / 2)

        adFill_duration = adFill.duration
        movie_duration = movie.duration

        clips = []
        current_duration = 0
        while current_duration < movie_duration:
            clips.append(adFill)
            current_duration += adFill_duration

        extended_adFill = concatenate_videoclips(clips)
        extended_adFill = extended_adFill.subclip(0, movie_duration)

        finalClip = CompositeVideoClip(
            [
                movie.set_position(("center", "top")),
                extended_adFill.set_position(("center", "bottom")),
            ],
            size=(1170, 2532),
        )

        # loop through the video and create clips of the specified length
        while clipCurrentStart < movie_duration:
            clipEnd = clipCurrentStart + int(clipLength)
            if clipEnd > movie_duration:
                clipEnd = movie_duration

            output_video_path = os.path.join(
                CLIPS_FOLDER, f"{title}-{clipSegmentNum}.mp4"
            )

            # Process video
            myClip = finalClip.subclip(clipCurrentStart, clipEnd)
            myClip.write_videofile(
                output_video_path,
                codec="libx264",
                audio_codec="aac",
                temp_audiofile="temp-audio.m4a",
                remove_temp=True,
            )

            write_time = os.path.getmtime(output_video_path)
            write_time = datetime.fromtimestamp(
                write_time
            )  # make it readable for humans
            formatted_time = write_time.strftime("%H.%M.%S")

            output_video_path = os.path.join(
                CLIPS_FOLDER, f"{title}[{clipSegmentNum}]-{formatted_time}.mp4"
            )
            print(f"Writing to {output_video_path}")
            os.rename(
                os.path.join(CLIPS_FOLDER, f"{title}-{clipSegmentNum}.mp4"),
                output_video_path,
            )

            myClip.close()

            clipCurrentStart += int(clipLength)
            clipSegmentNum += 1

        movie.close()
        adFill.close()
        extended_adFill.close()

        # delete the file after processing
        os.remove(filepath)
        os.remove(adFillPath)
    except Exception as e:
        print("Error processing video", e)
        raise e


def process_video_no_ad(title, clipLength, file):
    try:
        # Create the temporary folder if it doesn't exist
        if not os.path.exists(UPLOAD_FOLDER):
            os.makedirs(UPLOAD_FOLDER)
        if not os.path.exists(CLIPS_FOLDER):
            os.makedirs(CLIPS_FOLDER)

        fileName = secure_filename(file.filename)

        # prev temp file wasn't removed correctly
        if UPLOAD_FOLDER.__contains__(fileName):
            fileName = secure_filename("1" + file.filename)

        filepath = os.path.join(UPLOAD_FOLDER, fileName)
        file.save(filepath)

        clipSegmentNum = 1
        clipCurrentStart = 0
        movie = VideoFileClip(filepath).resize(height=2532)
        movie_duration = movie.duration

        finalClip = CompositeVideoClip(
            [movie.set_position(("center", "top"))], size=(1170, 2532)
        )

        # loop through the video and create clips of the specified length
        while clipCurrentStart < movie_duration:
            clipEnd = clipCurrentStart + int(clipLength)
            if clipEnd > movie_duration:
                clipEnd = movie_duration

            output_video_path = os.path.join(
                CLIPS_FOLDER, f"{title}-{clipSegmentNum}.mp4"
            )

            # Process video
            myClip = finalClip.subclip(clipCurrentStart, clipEnd)
            myClip.write_videofile(
                output_video_path,
                codec="libx264",
                audio_codec="aac",
                temp_audiofile="temp-audio.m4a",
                remove_temp=True,
            )

            write_time = os.path.getmtime(output_video_path)
            write_time = datetime.fromtimestamp(
                write_time
            )  # make it readable for humans
            formatted_time = write_time.strftime("%H.%M.%S")

            output_video_path = os.path.join(
                CLIPS_FOLDER, f"{title}[{clipSegmentNum}]-{formatted_time}.mp4"
            )
            print(f"Writing to {output_video_path}")
            os.rename(
                os.path.join(CLIPS_FOLDER, f"{title}-{clipSegmentNum}.mp4"),
                output_video_path,
            )

            myClip.close()

            clipCurrentStart += int(clipLength)
            clipSegmentNum += 1

        movie.close()

        # delete the file after processing
        os.remove(filepath)
    except Exception as e:
        print("Error processing video", e)
        raise e
