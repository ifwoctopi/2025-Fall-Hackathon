from flask import Flask, request, jsonify
from flask_cors import CORS
from openai import OpenAI
from dotenv import load_dotenv
import os

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app)  # Enable CORS for React frontend

# Initialize OpenAI client
api_key = os.environ.get("OPENAI_API_KEY")
if not api_key:
    raise ValueError("OPENAI_API_KEY environment variable is not set. Please create a .env file with your API key.")

client = OpenAI(api_key=api_key)

def simplify_instructions(raw_text: str):
    """
    Simplify medical instructions using OpenAI.
    This function is based on the model from test.py
    """
    system_prompt = """You are a medical education assistant.
Your job is to rephrase medical or device instructions into plain, easy-to-understand language.
- Use simple terms and short sentences.
- Define medical words using reputable sources like WebMD or Harvard Health.
- Never remove or change safety warnings.
- Never give personal medical advice or make recommendations.
- If a step seems unclear, say: "Ask your healthcare provider for clarification."
- Always include: (Source: Educational summary, not medical advice.)"""

    try:
        # Use the correct OpenAI API method (chat.completions.create)
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": raw_text}
            ],
            temperature=0.2,
            max_tokens=800
        )
        
        return response.choices[0].message.content
    except Exception as e:
        raise Exception(f"Error calling OpenAI API: {str(e)}")

@app.route('/api/simplify', methods=['POST'])
def simplify():
    """API endpoint to simplify medical instructions."""
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({'success': False, 'error': 'No data provided'}), 400
        
        raw_text = data.get('text', '')
        
        if not raw_text:
            return jsonify({'success': False, 'error': 'No text provided'}), 400
        
        simplified = simplify_instructions(raw_text)
        
        return jsonify({
            'success': True,
            'result': simplified
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/health', methods=['GET'])
def health():
    """Health check endpoint."""
    return jsonify({'status': 'healthy'}), 200

if __name__ == '__main__':
    app.run(debug=True, port=5000)

