import os

# Get the directory where the config file is located
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# Define folders relative to the config file location
UPLOAD_FOLDER = os.path.join(BASE_DIR, "../temporary_folder")
CLIPS_FOLDER = os.path.join(BASE_DIR, "../temporary_folder/clips")
MAX_AGE = 3600

# Other configurations can be added here
