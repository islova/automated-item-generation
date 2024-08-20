from flask import Flask, jsonify, request
from flask_cors import CORS
import os
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
cors = CORS(app, origins='*')

genai.configure(api_key=os.environ['GEMINI_KEY'])
model = genai.GenerativeModel('gemini-1.5-flash')

def get_prompt(text):
    return f'Based on the following text ```{text}``` we need to design items to assess if a person that reads the previous text can understand articles and reports concerned with contemporary problems in which particular stances or viewpoints are adopted. Create 5 items following this format: multiple choice items containing 1 correct answer and 3 suitable distractors, without favoring any kind of human ground based on gender, sex, class, amongh others. Use synonymous vocabulary based on the given text. Use synonymous vocabulary based on the given text to avoid giving literal answers in the text and indicate the correct answer. The options must have a very similar/same length.'

@app.route('/api/items', methods=['GET'])
def get_iems():
    text = request.args.get('text')
    band = request.args.get('band')
    amount = request.args.get('amount')

    response = model.generate_content(get_prompt(text))

    return jsonify({'res': response.text})


if __name__ == '__main__':
    app.run(debug=True, port=8080)
