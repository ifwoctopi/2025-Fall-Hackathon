# Backend Setup & Update Guide

## Quick Start

### 1. Install/Update Dependencies

```bash
# Navigate to project directory
cd 2025-Fall-Hackathon

# Install or update Python dependencies
pip install -r requirements.txt

# Or if using a virtual environment (recommended)
python -m venv venv
venv\Scripts\activate  # On Windows
# or
source venv/bin/activate  # On Mac/Linux

pip install -r requirements.txt
```

### 2. Set Up Environment Variables

Create a `.env` file in the root directory:

```
OPENAI_API_KEY=your_openai_api_key_here
```

### 3. Start the Backend Server

```bash
python api.py
```

The server will run on `http://localhost:5000`

## Updating the Backend

### Option 1: Auto-Reload (Debug Mode)

The backend is running in **debug mode**, which means it will automatically reload when you make changes to `api.py`. Just save your changes and the server will restart automatically.

### Option 2: Manual Restart

1. **Stop the server**: Press `Ctrl+C` in the terminal running the Flask server
2. **Start again**: Run `python api.py`

### Option 3: Update Dependencies

If you've updated `requirements.txt`:

```bash
# Update all packages
pip install --upgrade -r requirements.txt

# Or update specific package
pip install --upgrade flask
```

## Verifying Backend is Running

### Check Health Endpoint

Open your browser or use curl:

```bash
# Browser
http://localhost:5000/api/health

# Command line (Windows PowerShell)
curl http://localhost:5000/api/health

# Command line (Mac/Linux)
curl http://localhost:5000/api/health
```

You should see:

```json
{ "status": "healthy" }
```

### Check Server Logs

The Flask server will show logs in the terminal:

- `* Running on http://127.0.0.1:5000`
- Request logs when the frontend makes API calls

## Troubleshooting

### Port Already in Use

If port 5000 is already in use:

1. **Find what's using the port**:

   ```bash
   # Windows
   netstat -ano | findstr :5000

   # Mac/Linux
   lsof -i :5000
   ```

2. **Kill the process** or change the port in `api.py`:
   ```python
   app.run(debug=True, port=5001)  # Use different port
   ```

### Module Not Found Errors

```bash
# Make sure all dependencies are installed
pip install -r requirements.txt

# Check if you're in the correct directory
cd 2025-Fall-Hackathon
python api.py
```

### API Key Not Found

Make sure your `.env` file exists and contains:

```
OPENAI_API_KEY=your_actual_api_key_here
```

## API Endpoints

- `POST /api/simplify` - Simplify medical instructions
- `POST /api/upload` - Upload and extract text from files
- `GET /api/health` - Health check

## Development Tips

1. **Debug Mode**: Already enabled - changes auto-reload
2. **CORS**: Enabled for React frontend on `http://localhost:3000`
3. **Error Handling**: Check terminal logs for errors
4. **Testing**: Use `test_api.py` to test endpoints
