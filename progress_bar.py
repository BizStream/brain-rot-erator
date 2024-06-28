from proglog import ProgressBarLogger
from python import socketio


class MyBarLogger(ProgressBarLogger):
    def __init__(self):
        super().__init__()
        self.last_message = ""
        self.previous_percentage = 0

    def callback(self, **changes):
        for parameter, value in changes.items():
            self.last_message = value
            print(f"Last message: {self.last_message}")

    def bars_callback(self, bar, attr, value, old_value=None):
        if "Writing video" in self.last_message:
            percentage = (value / self.bars[bar]["total"]) * 100
            if percentage > 0 and percentage < 100:
                if int(percentage) > self.previous_percentage:
                    self.previous_percentage = int(percentage)
                    socketio.emit(
                        "progress",
                        {"progress": self.previous_percentage},
                        namespace="/",
                    )
