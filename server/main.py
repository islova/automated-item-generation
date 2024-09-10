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
    return f'Based on the following text ```{text}``` we need to design items to assess if a person that reads the previous text can understand articles and reports concerned with contemporary problems in which particular stances or viewpoints are adopted. Create 5 items following this format: multiple choice items containing 1 correct answer and 3 suitable distractors, without favoring any kind of human ground based on gender, sex, class, amongh others. Use synonymous vocabulary based on the given text. Use synonymous vocabulary based on the given text to avoid giving literal answers in the text and indicate the correct answer. The options must have a very similar/same length. \
    Each item must be preceeded by the header "Item X:", where "X" is the item  number. After each item, the correct answer must be given in the form "Correct Answer: Y)", where "Y" is the correct answer. Make sure to use bold markdown format for the item header and correct answer.\
    The following, is an example item; please use the same markdown format for every new item: \
    \
    **Item X:**\
    Item text.\
    a) Answer a\
    b) Answer b\
    c) Answer c\
    d) Answer d\
    \
    **Correct Answer: Answer Y)**'

@app.route('/api/items', methods=['GET'])
def get_iems():
    text = request.args.get('text')
    band = request.args.get('band')
    amount = request.args.get('amount')
    descriptor = request.args.get('descriptor')

    response = model.generate_content(get_prompt(text))

    return jsonify({'res': response.text})


if __name__ == '__main__':
    app.run(debug=True, port=8080)
