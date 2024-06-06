import os
from moviepy.editor import VideoFileClip, CompositeVideoClip, concatenate_videoclips
from werkzeug.utils import secure_filename
from python.config import UPLOAD_FOLDER, CLIPS_FOLDER
from datetime import datetime
from pytz import timezone


def process_video(title, clipLength, file, adFill):
    try:
        # Secure the file names
        adFillFileName = secure_filename(adFill.filename)
        fileName = secure_filename(file.filename)

        filepath = create_temp_file(fileName, file)
        adFillPath = create_temp_file(adFillFileName, adFill)

        clipSegmentNum = 1
        clipCurrentStart = 0
        movie = VideoFileClip(filepath).resize(height=2532 / 2)
        adFill = VideoFileClip(adFillPath, audio=None).resize(height=2532 / 2)

        adFill_duration = adFill.duration
        movie_duration = movie.duration

        extended_adFill = loop_adFill(movie_duration, adFill_duration, adFill)

        finalClip = CompositeVideoClip(
            [
                movie.set_position(("center", "top")),
                extended_adFill.set_position(("center", "bottom")),
            ],
            size=(1170, 2532),
        )

        clipsData = []

        # loop through the video and create clips of the specified length
        while clipCurrentStart < movie_duration:
            process_single_clip(
                title,
                clipLength,
                movie_duration,
                finalClip,
                clipsData,
                clipSegmentNum,
                clipCurrentStart,
            )
            clipCurrentStart += int(clipLength)
            clipSegmentNum += 1

        movie.close()
        adFill.close()
        extended_adFill.close()

        # delete the file after processing
        os.remove(filepath)
        os.remove(adFillPath)
        return clipsData
    except Exception as e:
        print("Error processing video", e)
        raise e


def process_video_no_ad(title, clipLength, file):
    try:
        # Secure the file names
        fileName = secure_filename(file.filename)

        filepath = create_temp_file(fileName, file)

        clipSegmentNum = 1
        clipCurrentStart = 0
        movie = VideoFileClip(filepath).resize(height=2532)

        movie_duration = movie.duration

        finalClip = CompositeVideoClip(
            [movie.set_position(("center", "top"))], size=(1170, 2532)
        )

        clipsData = []

        # loop through the video and create clips of the specified length
        while clipCurrentStart < movie_duration:
            process_single_clip(
                title,
                clipLength,
                movie_duration,
                finalClip,
                clipsData,
                clipSegmentNum,
                clipCurrentStart,
            )
            clipCurrentStart += int(clipLength)
            clipSegmentNum += 1

        movie.close()

        # delete the file after processing
        os.remove(filepath)
        return clipsData
    except Exception as e:
        print("Error processing video", e)
        raise e


def create_temp_file(fileName, file):
    if not os.path.exists(UPLOAD_FOLDER):
        os.makedirs(UPLOAD_FOLDER)
    if not os.path.exists(CLIPS_FOLDER):
        os.makedirs(CLIPS_FOLDER)

    if UPLOAD_FOLDER.__contains__(fileName):
        fileName = secure_filename("1" + file.filename)

    filepath = os.path.join(UPLOAD_FOLDER, fileName)
    file.save(filepath)
    return filepath


def process_single_clip(
    title,
    clipLength,
    movie_duration,
    finalClip,
    clipsData,
    clipSegmentNum,
    clipCurrentStart,
):
    clipEnd = clipCurrentStart + int(clipLength)
    if clipEnd > movie_duration:
        clipEnd = movie_duration

    output_video_path = os.path.join(CLIPS_FOLDER, f"{title}-{clipSegmentNum}.mp4")

    # Process video
    myClip = finalClip.subclip(clipCurrentStart, clipEnd)
    myClip.write_videofile(
        output_video_path,
        codec="libx264",
        audio_codec="aac",
        temp_audiofile="temp-audio.m4a",
        remove_temp=True,
    )

    # Get the current time in Eastern Time (ET)
    eastern = timezone("US/Eastern")

    write_time = os.path.getmtime(output_video_path)
    write_time = datetime.fromtimestamp(
        write_time, eastern
    )  # make it readable for humans
    expires_at = datetime.fromtimestamp(write_time.timestamp() + 10, eastern)
    formatted_time = write_time.strftime("%H.%M.%S")

    output_video_path = os.path.join(
        CLIPS_FOLDER, f"{title}[{clipSegmentNum}]-{formatted_time}.mp4"
    )
    os.rename(
        os.path.join(CLIPS_FOLDER, f"{title}-{clipSegmentNum}.mp4"),
        output_video_path,
    )
    new_title = f"{title}[{clipSegmentNum}]-{formatted_time}.mp4"
    print("new_title:", new_title)

    myClip.close()

    clipData = {
        "clipName": new_title,
        "clipPath": output_video_path,
        "segment": clipSegmentNum,
        "hasAdfill": False,
        "clipLength": myClip.duration,
        "createdAt": write_time,
        "expiresAt": expires_at,
    }
    clipsData.append(clipData)


def loop_adFill(movie_duration, adFill_duration, adFill):
    clips = []
    current_duration = 0
    while current_duration < movie_duration:
        clips.append(adFill)
        current_duration += adFill_duration

    extended_adFill = concatenate_videoclips(clips)
    extended_adFill = extended_adFill.subclip(0, movie_duration)
    return extended_adFill
