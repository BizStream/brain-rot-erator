from flask import Flask
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

@app.route('/api/clips' , methods=['POST'])
def hello_world():
    data = request.get_json()
    
    return 'Hello, World!'

if __name__ == '__main__':
    app.run(debug=True)
