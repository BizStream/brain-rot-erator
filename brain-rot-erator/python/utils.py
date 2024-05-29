import os


def get_unique_title(output_folder, title, clipSegmentNum):
    """Get a unique title for the clip by appending a number to the end."""
    new_title = title
    counter = 1
    while os.path.exists(
        os.path.join(output_folder, f"{new_title}-{clipSegmentNum}.mp4")
    ):
        new_title = f"{title}({counter})"
        counter += 1
    return new_title
