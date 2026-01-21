# 🧠 MeetMind

**MeetMind** is an intelligent meeting analysis tool that transforms your Webex (or other) recording files into actionable intelligence. Built with **FastAPI** and **Google Gemini**, it provides executive summaries, to-do lists, timelines, and requirements extraction in a premium, modern interface.

## ✨ Features

- **🤖 AI-Powered Analysis**: Uses Google's Gemini 2.5 Flash model to deeply understand meeting context.
- **📄 Comprehensive Reports**:
  - **Executive Summary**: A high-level overview of the discussion.
  - **Action Items**: Auto-generated to-do lists with assignees and priorities.
  - **Timeline**: Key events tracked by timestamps.
  - **Requirements Extraction**: Structured JSON output of project requirements.
  - **Sentiment Analysis**: Understand the tone of the meeting.
- **🎨 Premium UI**: A fully responsive, dark-themed interface with glassmorphism and smooth animations.
- **🚀 Fast & Secure**: Powered by FastAPI for high-performance file handling.

## 📸 Gallery

Here is a glimpse of MeetMind in action:

| | |
|:-------------------------:|:-------------------------:|
| <img src="sample/Screenshot from 2026-01-21 17-26-50.png" width="400" /> | <img src="sample/Screenshot from 2026-01-21 17-26-59.png" width="400" /> |
| <img src="sample/Screenshot from 2026-01-21 17-27-06.png" width="400" /> | <img src="sample/Screenshot from 2026-01-21 17-27-43.png" width="400" /> |
| <img src="sample/Screenshot from 2026-01-21 17-27-48.png" width="400" /> | <img src="sample/Screenshot from 2026-01-21 17-27-54.png" width="400" /> |

## 🛠️ Installation & Setup

### Prerequisites

- Python 3.9+
- A Google Cloud Project with Gemini API Access

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/MeetMind.git
cd MeetMind
```

### 2. Set Up Virtual Environment

It is recommended to use a virtual environment.

```bash
python3 -m venv venv
source venv/bin/activate  # On Windows use `venv\Scripts\activate`
```

### 3. Install Dependencies

```bash
pip install -r requirements.txt
```

### 4. Configure Environment Variables

Create a `.env` file in the root directory and add your Google Gemini API key:

```bash
cp .env.example .env
```

Edit the `.env` file:

```ini
GOOGLE_API_KEY=your_actual_api_key_here
```

> **Note**: Ensure strictly that your API key is not hardcoded in `app/services/gemini_service.py` before committing to public repositories!

### 5. Run the Application

Start the FastAPI server:

```bash
uvicorn app.main:app --reload
```

Then open your browser and navigate to:

👉 **http://localhost:8000/static/index.html**

## 📂 Project Structure

```
MeetMind/
├── app/
│   ├── main.py              # FastAPI entry point
│   ├── services/
│   │   └── gemini_service.py # Gemini integration logic
├── static/                  # Frontend Assets
│   ├── index.html           # Single Page Application
│   ├── style.css            # Premium Styling
│   └── script.js            # Frontend Logic
├── sample/                  # Screenshots & Samples
├── requirements.txt         # Python Dependencies
├── .env.example             # Environment Config Template
└── README.md                # Documentation
```

## 🤝 Contributing

Contributions are welcome! Please open an issue or submit a pull request for any features or bug fixes.

## 📄 License

This project is licensed under the MIT License.
