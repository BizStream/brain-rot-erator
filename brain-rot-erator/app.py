from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "http://localhost:3000"}})

@app.route('/api/clips' , methods=['POST'])
def process_data():
    title = request.form['title']
    clipLength = request.form['clipLength']
    file = request.files['file']  # For files, use request.files

    # # Process data here
    # # return 'Data collected: ' + title + ' ' + clipLength + ' ' + file.filename
    return jsonify({'status': 'success', 'message': 'Data collected: {} {} {}'.format(title, clipLength, file.filename)}), 200


if __name__ == '__main__':
    app.run(debug=True)
