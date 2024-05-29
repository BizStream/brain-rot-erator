import os
from moviepy.editor import VideoFileClip, CompositeVideoClip
from werkzeug.utils import secure_filename
from python.utils import get_unique_title
from python.config import UPLOAD_FOLDER, CLIPS_FOLDER


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
        movie = VideoFileClip(filepath)
        adFill = VideoFileClip(adFillPath)
        adFill = adFill.set_position(("center", "bottom"))
        finalClip = CompositeVideoClip(
            [movie, adFill],
            size=(max(movie.size[0], adFill.size[0]), movie.size[1] + adFill.size[1]),
        )
        total_duration = movie.duration

        # loop through the video and create clips of the specified length
        while clipCurrentStart < total_duration:
            clipEnd = clipCurrentStart + int(clipLength)
            if clipEnd > total_duration:
                clipEnd = total_duration

            title = get_unique_title(CLIPS_FOLDER, title, clipSegmentNum)

            output_video_path = os.path.join(
                CLIPS_FOLDER, f"{title}-{clipSegmentNum}.mp4"
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
        os.remove(adFillPath)
    except Exception as e:
        print("Error processing video", e)
        raise e
