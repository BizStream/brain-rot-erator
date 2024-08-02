from python import python, socketio

if __name__ == "__main__":
    socketio.run(python, debug=True, allow_unsafe_werkzeug=True)
