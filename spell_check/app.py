from flask import Flask, request, jsonify
from hanspell import spell_checker
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

@app.route('/spell_check', methods=['POST'])
def spell_check():
    text = request.json.get('text')
    if not text:
        return jsonify({'error': 'No text provided'}), 400

    result = spell_checker.check(text)
    return jsonify({
        'original': result.original,
        'checked': result.checked,
        'errors': result.errors,
        'words': list(result.words.items())
    })

if __name__ == '__main__':
    app.run(debug=True)
