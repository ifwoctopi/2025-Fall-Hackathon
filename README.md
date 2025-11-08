# Medical Instruction Simplifier

A full-stack application that transforms complex medical instructions into simple, easy-to-understand language using OpenAI's GPT model.

## Features

- 🔐 Login page with authentication
- 🔍 Search functionality for simplifying medical instructions
- 🤖 OpenAI GPT-4o-mini integration
- 📱 Responsive design
- 🎨 Modern UI with gradient backgrounds
- 🚀 Example queries for quick testing

## Tech Stack

### Frontend

- React 18
- React Router DOM
- CSS3

### Backend

- Flask (Python)
- OpenAI API
- Flask-CORS

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Python 3.8 or higher
- OpenAI API key

### Installation

#### 1. Install Frontend Dependencies

```bash
npm install
```

#### 2. Install Backend Dependencies

```bash
pip install -r requirements.txt
```

#### 3. Set Up Environment Variables

Create a `.env` file in the root directory:

```
OPENAI_API_KEY=your_openai_api_key_here
```

**⚠️ Important:** Never commit your `.env` file to version control. It's already in `.gitignore`.

### Running the Application

#### Start the Backend API

In one terminal:

```bash
python api.py
```

The API will run on `http://localhost:5000`

#### Start the React Frontend

In another terminal:

```bash
npm start
```

The frontend will run on `http://localhost:3000`

## Project Structure

```
2025-Fall-Hackathon/
  ├── src/                    # React frontend source
  │   ├── components/
  │   │   ├── Login.js       # Login component
  │   │   ├── Login.css
  │   │   ├── Search.js      # Search component
  │   │   └── Search.css
  │   ├── context/
  │   │   └── AuthContext.js # Authentication context
  │   ├── App.js             # Main app component
  │   ├── App.css
  │   ├── index.js           # React entry point
  │   └── index.css          # Global styles
  ├── public/                # Static files
  ├── api.py                 # Flask backend API
  ├── test                   # Original model file
  ├── requirements.txt       # Python dependencies
  ├── package.json           # Node dependencies
  └── .env                   # Environment variables (not in git)
```

## Usage

1. **Start the backend API** (`python api.py`)
2. **Start the React app** (`npm start`)
3. **Login**: Enter any email and password to login (authentication is simulated)
4. **Search**: Enter medical instructions in the text area
5. **Examples**: Click on example queries to quickly test the functionality
6. **Results**: View simplified instructions powered by OpenAI

## API Endpoints

### POST `/api/simplify`

Simplifies medical instructions using OpenAI.

**Request:**

```json
{
  "text": "How do I put in my insulin pump?"
}
```

**Response:**

```json
{
  "success": true,
  "result": "Simplified instructions here..."
}
```

### GET `/api/health`

Health check endpoint.

**Response:**

```json
{
  "status": "healthy"
}
```

## Development

### Frontend Scripts

- `npm start` - Runs the app in development mode
- `npm build` - Builds the app for production
- `npm test` - Launches the test runner

### Backend

The Flask API runs in debug mode by default. To run in production, set `debug=False` in `api.py`.

## Notes

- The OpenAI API key should be stored in `.env` file and never committed to version control
- The backend uses CORS to allow requests from the React frontend
- The model uses GPT-4o-mini for cost-effective responses
- All medical disclaimers are included in the responses

## Troubleshooting

### Backend not connecting

- Make sure the backend is running on `http://localhost:5000`
- Check that your `.env` file has a valid `OPENAI_API_KEY`
- Verify Flask and all dependencies are installed

### CORS errors

- The Flask app has CORS enabled for all origins in development
- For production, configure CORS to only allow your frontend domain
