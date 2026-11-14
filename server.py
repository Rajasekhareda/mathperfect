from flask import Flask, jsonify, request, send_from_directory
import random
import os

app = Flask(__name__)

def generate_worksheet(data):
    grade = data['grade']
    subject = data['subject']
    num_questions = data['num_questions']
    difficulty = data['difficulty']
    
    questions = []
    for i in range(num_questions):
        question = {
            'id': i + 1,
            'text': f'Question {i + 1}',
            'options': ['Option 1', 'Option 2', 'Option 3', 'Option 4'],
            'correct_answer': random.choice(['Option 1', 'Option 2', 'Option 3', 'Option 4'])
        }
        questions.append(question)
    
    return {
        'grade': grade,
        'subject': subject,
        'num_questions': num_questions,
        'difficulty': difficulty,
        'questions': questions
    }

@app.route('/generate-worksheet', methods=['GET', 'POST'])
def generate_worksheet_endpoint():
    if request.method == 'POST':
        data = request.get_json()
        worksheet = generate_worksheet(data)
        return jsonify(worksheet)
    else:
        return jsonify({ 'message': 'Use POST method to generate worksheet' })

@app.route('/', methods=['GET'])
def home():
    return send_from_directory('.', 'index_backup.html')

if __name__ == '__main__':
    app.run(debug=True, port=7000)
