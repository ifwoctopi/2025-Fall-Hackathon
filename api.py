from flask import Flask, request, jsonify
from flask_cors import CORS
from openai import OpenAI
from dotenv import load_dotenv
import os
import io
try:
    import PyPDF2
    PDF_SUPPORT = True
except ImportError:
    PDF_SUPPORT = False

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

@app.route('/api/upload', methods=['POST'])
def upload_file():
    """API endpoint to upload and extract text from files."""
    try:
        if 'file' not in request.files:
            return jsonify({'success': False, 'error': 'No file provided'}), 400
        
        file = request.files['file']
        
        if file.filename == '':
            return jsonify({'success': False, 'error': 'No file selected'}), 400
        
        # Check file extension
        filename = file.filename.lower()
        allowed_extensions = ['.txt', '.md', '.pdf', '.csv']
        
        if not any(filename.endswith(ext) for ext in allowed_extensions):
            return jsonify({
                'success': False,
                'error': f'File type not supported. Please upload: {", ".join(allowed_extensions)}'
            }), 400
        
        # Read file content based on type
        text_content = ''
        
        if filename.endswith('.txt') or filename.endswith('.md') or filename.endswith('.csv'):
            # Read text files directly
            try:
                # Try to decode as UTF-8
                text_content = file.read().decode('utf-8')
            except UnicodeDecodeError:
                # Try other encodings
                file.seek(0)  # Reset file pointer
                try:
                    text_content = file.read().decode('latin-1')
                except:
                    return jsonify({
                        'success': False,
                        'error': 'Unable to read file. Please ensure it is a valid text file.'
                    }), 400
        
        elif filename.endswith('.pdf'):
            # Extract text from PDF files
            if not PDF_SUPPORT:
                return jsonify({
                    'success': False,
                    'error': 'PDF support not available. Please install PyPDF2: pip install PyPDF2'
                }), 500
            
            try:
                # Read PDF file
                file.seek(0)  # Reset file pointer
                pdf_reader = PyPDF2.PdfReader(file)
                
                # Extract text from all pages
                text_content = ''
                for page_num in range(len(pdf_reader.pages)):
                    page = pdf_reader.pages[page_num]
                    text_content += page.extract_text() + '\n'
                
                if not text_content.strip():
                    return jsonify({
                        'success': False,
                        'error': 'PDF appears to be empty or contains only images. Unable to extract text.'
                    }), 400
                    
            except Exception as pdf_error:
                return jsonify({
                    'success': False,
                    'error': f'Error reading PDF file: {str(pdf_error)}'
                }), 400
        
        if not text_content.strip():
            return jsonify({
                'success': False,
                'error': 'File appears to be empty or could not be read'
            }), 400
        
        return jsonify({
            'success': True,
            'text': text_content,
            'filename': file.filename
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': f'Error processing file: {str(e)}'
        }), 500

@app.route('/api/health', methods=['GET'])
def health():
    """Health check endpoint."""
    return jsonify({'status': 'healthy'}), 200

if __name__ == '__main__':
    app.run(debug=True, port=5000)

