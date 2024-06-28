from flask import Flask
from flask_cors import CORS
from flask_socketio import SocketIO

python = Flask(__name__)
CORS(python, resources={r"/api/*": {"origins": "http://localhost:3000"}})
socketio = SocketIO(python, cors_allowed_origins="http://localhost:3000")

from python import routes  # import routes to register with the app
