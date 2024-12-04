from flask import Flask, jsonify, request
from flask_cors import CORS
import random
import os
import google.generativeai as genai
from dotenv import load_dotenv
from prompts import get_prompts

load_dotenv()
genai.configure(api_key=os.environ['GEMINI_API_KEY'])
model = genai.GenerativeModel('gemini-1.5-flash')

app = Flask(__name__)
cors = CORS(app, origins='*')


def define_topic():
    topics = ['Technological Advances',
              'Personal Identity',
              'Self-care (physical, emotional, among others)',
              'Teaching Practice']
    probabilities = [0.2934, 0.2509, 0.2409, 0.2149]
    return random.choices(topics, weights=probabilities, k=1)[0]


@app.route('/api/texts', methods=['GET'])
def get_iems():
    level = request.args.get('level')
    amount = int(request.args.get('amount'))
    descriptor = request.args.get('descriptor')
    context = request.args.get('context')
    results = {'results': []}

    for _ in range(amount):
        topic = define_topic()
        prompt = get_prompts(level, 'characteristics',
                            topic=topic,
                            context=context)
        response = model.generate_content(prompt)
        characteristics = response.text


        prompt = get_prompts(level, 'generation',
                            characteristics=characteristics,
                            context=context,
                            topic=topic,
                            descriptor=descriptor)
        response = model.generate_content(prompt)
        original_text = response.text

        prompt = get_prompts(level, 'validation',
                            descriptor=descriptor,
                            context=context,
                            text=original_text)
        response = model.generate_content(prompt)
        validated_text = response.text

        results['results'].append({'text': validated_text,
                                   'descriptor': descriptor,
                                   'level': level,
                                   'context': context})

    return jsonify(results)


if __name__ == '__main__':
    app.run(debug=True, port=8080)
