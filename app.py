from flask import Flask, request, render_template
import requests

app = Flask(__name__)

LOGIC_APP_URL = 'https://prod-07.uaenorth.logic.azure.com:443/workflows/86a62f42245c48e988dcbda1afba1eca/triggers/When_a_HTTP_request_is_received/paths/invoke?api-version=2016-10-01&sp=%2Ftriggers%2FWhen_a_HTTP_request_is_received%2Frun&sv=1.0&sig=24L03m0xHL1ayjRyPATcvkZAvRyRQlmA7stXbgocyRU'

  # Replace with actual Logic App webhook URL

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/submit-score', methods=['POST'])
def submit_score():
    data = request.get_json()
    name = data.get('name')
    score = data.get('score')

    payload = {
        'playerName': name,
        'scoreInSeconds': score
    }
    r = requests.post(LOGIC_APP_URL, json=payload)

    return "Score submitted successfully!" if r.ok else "Failed to send score"

if __name__ == '__main__':
    app.run(debug=True)
