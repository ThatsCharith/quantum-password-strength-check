from flask import Flask, request, jsonify
from password_strength_checker import PasswordStrength

app = Flask(__name__)
ps = PasswordStrength()

@app.route('/api/check', methods=['POST'])
def check_password():
    try:
        password = request.json['password']
        result = ps.check_password_strength(password)
        suggestions = ps.suggest_improvements(password)
        # Split suggestions and remove the initial "Suggested improvements:" line
        suggestion_list = [s.strip("- ") for s in suggestions.split('\n') if s.startswith("- ")]
        
        return jsonify({
            'strength': result.strength,
            'score': result.score,
            'message': result.message,
            'suggestions': suggestion_list
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@app.route('/api/generate', methods=['GET'])
def generate():
    try:
        password = ps.generate_random_password()
        return jsonify({'password': password})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(port=5000, debug=True)
