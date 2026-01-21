# SquareAway - AI-Powered Study Companion

SquareAway is an intelligent educational platform designed to transform how students engage with their study materials. By leveraging advanced AI technologies, it bridges the gap between static notes and interactive learning, offering features like autonomous video generation, smart note digitization, and an AI-powered study assistant.

## 🚀 Key Features

1.  **Agentic AI Video Creation**: Utilizing a sophisticated multi-agent workflow, SquareAway autonomously analyzes uploaded notes, scripts educational content, refining it via a "Critic" agent, and generates high-quality explainer videos using the **Manim** engine.
2.  **Note Digitization & AI Extraction**: Converts handwritten notes and textbook images into structured, digital formulations with LaTeX support using **Google Gemini Vision**.
3.  **Interactive Practice & Assessment**: Generates context-aware practice sets (MCQs, word problems) effectively tailored to the user's material.
4.  **AI Study Assistant**: A built-in chatbot powered by **Groq (Llama 3.3)** that acts as a personal tutor, capable of understanding complex mathematical logic.
5.  **Teacher Dashboard**: A dedicated interface for educators to manage classes and enrollments.
6.  **Mobile Companion App**: A React Native application for on-the-go learning.

## 🛠️ Technical Architecture

### AI & APIs
-   **Google Gemini API**:
    -   `gemini-2.5-flash`: Vision analysis for extracting text and math from images.
    -   `gemma-2-27b-it`: Powers the Agentic Workflow (Scripting, Assessment, Refinement).
-   **Groq API**:
    -   `llama-3.3-70b-versatile`: Drives the Chatbot, Title Generation, and Answer Grading.
    -   `meta-llama/llama-4-maverick-17b-128e-instruct`: Specialized for generating Manim Python code.
-   **Manim**: A programmatic video generation engine used to render visual explanations.

### Stack
-   **Frontend**: React, Vite, Tailwind CSS.
-   **Backend**: Flask (Python).
-   **Database**: Supabase (PostgreSQL).
-   **Text-to-Speech**: gTTS (Google Text-to-Speech).

## 📦 Getting Started

### Prerequisites
-   **Python 3.8+**
-   **Node.js & npm**
-   **FFmpeg** (Required for Manim video rendering)
-   **LaTeX** (Required for Manim mathematical rendering)

### Installation

1.  **Clone the repository**
    ```bash
    git clone <repository-url>
    cd tts-attempt-squareaway
    ```

2.  **Backend Setup**
    ```bash
    # Create a virtual environment
    python -m venv .venv
    
    # Activate the virtual environment
    # On Windows:
    .venv\Scripts\activate
    # On macOS/Linux:
    source .venv/bin/activate
    
    # Install dependencies
    pip install -r requirements.txt
    ```

3.  **Frontend Setup**
    ```bash
    # Install Node dependencies
    npm install
    ```

4.  **Configuration**
    Create a `.env` file in the root directory with the following variables:
    ```env
    GROQ_API_KEY=your_groq_api_key
    GOOGLE_API_KEY=your_google_gemini_api_key
    SUPABASE_URL=your_supabase_url
    SUPABASE_KEY=your_supabase_anon_key
    SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_key
    ```

## 🏃‍♂️ Usage

### Running the Backend
From the root directory (with virtual environment activated):
```bash
python app.py
```
The backend server will start (defaulting typically to port 5000).

### Running the Frontend
In a new terminal window:
```bash
npm run dev
```
Access the application at `http://localhost:5173`.

## 📂 Project Structure

```
tts-attempt-squareaway/
├── app.py                  # Main Flask backend application
├── src/                    # React frontend source code
├── media/                  # Generated Manim videos and assets
├── uploads/                # Temporary storage for uploaded user files
├── api/                    # API route definitions (if separated)
├── generated_manim_script.py # Dynamically generated script for video creation
└── requirements.txt        # Python dependencies
```

## 📄 License

[MIT License](LICENSE)
