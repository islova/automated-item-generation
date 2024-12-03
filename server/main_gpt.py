from flask import Flask, jsonify, request
from flask_cors import CORS
import random
import openai
from dotenv import load_dotenv
from prompts import get_prompts

load_dotenv()
client = openai.OpenAI()

app = Flask(__name__)
cors = CORS(app, origins='*')


def get_openai_response(prompt, temperature=0):
    return client.chat.completions.create(
        model="gpt-4",
        messages=[{"role": "user", "content": prompt}],
        stream=False,
        temperature=temperature
    )


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
    amount = request.args.get('amount')
    descriptor = request.args.get('descriptor')
    context = request.args.get('context')

    topic = define_topic()
    prompt = get_prompts(level, 'characteristics',
                        topic=topic,
                        context=context)
    response = get_openai_response(prompt)
    characteristics = response.choices[0].message.content


    prompt = get_prompts(level, 'generation',
                        characteristics=characteristics,
                        context=context,
                        topic=topic,
                        descriptor=descriptor)
    response = get_openai_response(prompt, temperature=0.7)
    original_text = response.choices[0].message.content

    prompt = get_prompts(level, 'validation',
                        descriptor=descriptor,
                        context=context,
                        text=original_text)
    response = get_openai_response(prompt)
    validated_text = response.choices[0].message.content

    return jsonify({'res': validated_text})


if __name__ == '__main__':
    app.run(debug=True, port=8080)
