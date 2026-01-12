# ADD VIDEO SAVING FROM FIREBASE, tried fixing bug where the agentic video generation didn't work because of LLM backticks

from flask import Flask, request, jsonify, send_file
from werkzeug.utils import secure_filename
from flask_cors import CORS
from google import genai
from google.genai import types
from pathlib import Path
import subprocess
import os
import json
import requests
import mimetypes
import shutil
import threading
from dotenv import load_dotenv
from gtts import gTTS

load_dotenv()

app = Flask(__name__)
CORS(app)

UPLOAD_FOLDER = "uploads"
RESULTS_FOLDER = "results"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(RESULTS_FOLDER, exist_ok=True)




def clear_folder(folder_path):
    """Delete all files in a folder but keep the folder itself."""
    for filename in os.listdir(folder_path):
        file_path = os.path.join(folder_path, filename)

        if os.path.isfile(file_path):
            os.remove(file_path)
        elif os.path.isdir(file_path):
            shutil.rmtree(file_path)


@app.route('/chatbot', methods=['POST'])
def chatbot():
    """
    Receives:
      - notes: The converted notes text
      - user_message: The user's question
      - chat_history: optional list of previous messages [{role, content}]
    Returns:
      - chatbot response
    """
    data = request.json
    notes = data.get("notes", "")
    user_message = data.get("user_message", "")
    chat_history = data.get("chat_history", [])

    if not user_message:
        return jsonify({"error": "No message provided"}), 400

    # Build conversation
    conversation = [{"role": "system", "content": (
        "You are a helpful study assistant. "
        "Keep your answers concise for chat display, "
        "wrap all formulas in LaTeX (use $...$ for inline math), "
        "and do not write huge paragraphs."
    )}]
    
    # Add previous chat messages if any
    conversation.extend(chat_history)
    
    # Add current user message
    conversation.append({"role": "user", "content": f"{user_message}\n\nNotes:\n{notes}"})

    model_api_key = os.getenv("GROQ_API_KEY")
    response = requests.post(
        url="https://api.groq.com/openai/v1/chat/completions",
        headers={
            "Authorization": f"Bearer {model_api_key}",
            "Content-Type": "application/json",
        },
        data=json.dumps({
            "model": "llama-3.3-70b-versatile",
            "messages": conversation
        })
    )
    if response.status_code != 200:
        return jsonify({"error": "Chatbot API failed"}), 500

    data = response.json()
    answer = data["choices"][0]["message"]["content"]

    return jsonify({"answer": answer})


@app.route('/leave-class', methods=['POST'])
def leave_class():
    data = request.json
    student_id = data.get('student_id')
    class_id = data.get('class_id')

    if not student_id or not class_id:
        return jsonify({"error": "Missing student_id or class_id"}), 400

    supabase_url = os.getenv("SUPABASE_URL")
    # Try service role key first, fallback to standard key (might fail if RLS blocks it)
    supabase_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY") or os.getenv("SUPABASE_KEY")

    if not supabase_url or not supabase_key:
        return jsonify({"error": "Server misconfiguration: Missing Supabase keys"}), 500

    headers = {
        "apikey": supabase_key,
        "Authorization": f"Bearer {supabase_key}",
        "Content-Type": "application/json",
        "Prefer": "return=representation"
    }

    # PostgREST Delete
    url = f"{supabase_url}/rest/v1/class_enrollments?student_id=eq.{student_id}&class_id=eq.{class_id}"
    
    response = requests.delete(url, headers=headers)

    if response.status_code >= 200 and response.status_code < 300:
        return jsonify({"message": "Successfully left class", "details": response.json() if response.content else {}})
    else:
        return jsonify({"error": "Failed to leave class", "details": response.text}), response.status_code

@app.route('/create-questions', methods=['POST', 'OPTIONS'])
def create_questions():
    if request.method == 'OPTIONS':
        return jsonify({}), 200

    # Get topic and parameters from request body
    try:
        data = request.get_json()
    except Exception as e:
        return jsonify({"error": "Invalid JSON in request body"}), 400

    topic = data.get("topic")
    if not topic:
        return jsonify({"error": "Topic is required"}), 400

    # Default to 5 if not provided, for normal practice
    count = data.get("count", 5)
    # Default to all if not provided
    question_types = data.get("types", []) 
    
    # Map friendly names to internals if needed, or just pass strings
    # The prompt expects: "multiple-choice, true/false, short answer/free response, and word problems"
    # If types are provided, format them for the prompt.
    types_str = "multiple-choice, true/false, short answer/free response, and word problems"
    if question_types:
        types_str = ", ".join(question_types)

    try:
        with open("./src/assets/question_create_prompt.txt", "r") as file:
            content = file.read()
    except FileNotFoundError:
        return jsonify({"error": "Prompt file not found"}), 500
    
    # ------------------------------------------------------------------
    # DYNAMIC PROMPT INJECTION
    # ------------------------------------------------------------------
    # Replace lines in the text file with our custom constraints
    # Valid types line: "The ONLY 4 types of problems you can ask the user are: ..."
    content = content.replace(
        "The ONLY 4 types of problems you can ask the user are: multiple-choice, true/false, short answer/free response, and word problems.",
        f"The ONLY types of problems you can ask the user are: {types_str}."
    )
    
    # Count line: "ONLY ask the user 5 questions."
    content = content.replace(
        "ONLY ask the user 5 questions. No more, no less.",
        f"ONLY ask the user {count} questions. No more, no less."
    )
    # ------------------------------------------------------------------

    model_api_key = os.getenv("GOOGLE_API_KEY")
    if not model_api_key:
        return jsonify({"error": "GOOGLE_API_KEY not set"}), 500

    try:
        response = requests.post(
            url="https://generativelanguage.googleapis.com/v1beta/openai/chat/completions",
            headers={
                "Authorization": f"Bearer {model_api_key}",
                "Content-Type": "application/json",
            },
            data=json.dumps({
                "model": "gemini-2.5-flash-lite",
                "messages": [
                {
                    "role": "user",
                    "content": content + topic
                }
                ]
            }),
            timeout=60 # Add timeout
        )
        
        if response.status_code != 200:
            print(f"API Error: {response.status_code} - {response.text}")
            return jsonify({"error": f"LLM API returned {response.status_code}", "details": response.text}), 500

        data = response.json()
    except requests.exceptions.RequestException as e:
        print(f"Request failed: {e}")
        return jsonify({"error": "Failed to contact LLM API", "details": str(e)}), 500
    except json.JSONDecodeError as e:
         print(f"Invalid JSON response from LLM API: {e}")
         return jsonify({"error": "Invalid JSON response from LLM API"}), 500


    # # Extract the assistant message content
    try:
        raw_output = data["choices"][0]["message"]["content"]
    except (KeyError, IndexError) as e:
        print(f"Unexpected response format: {data}")
        return jsonify({"error": "Unexpected response format from LLM API"}), 500

    print("raw_output: " + raw_output)

    lines = raw_output.strip().split("\n")
    # Remove first and last lines (backticks) if present and look like code blocks
    lines = raw_output.strip().split("\n")
    if len(lines) > 2 and lines[0].startswith("```") and lines[-1].startswith("```"):
         middle = "\n".join(lines[1:-1])
    else:
        middle = raw_output  # fallback if no extra lines

    # Attempt to parse JSON safely
    try:
        questions_json = json.loads(middle)
    except json.JSONDecodeError as e:
        print("JSON decode error:", e)
        # Try to be lenient if the LLM outputted some extra text? 
        # For now, just return error
        return jsonify({"error": "Failed to parse questions JSON from LLM output", "raw": middle}), 500

    print(middle)
    # Return JSON directly
    return jsonify(questions_json)

def generate_title(text):
    model_api_key = os.getenv("GROQ_API_KEY")
    response = requests.post(
    url="https://api.groq.com/openai/v1/chat/completions",
    headers={
        "Authorization": f"Bearer {model_api_key}",
        "Content-Type": "application/json",
    },
    data=json.dumps({
        "model": "llama-3.3-70b-versatile",
        "messages": [
        {
            "role": "user",
            "content": '''Carefully review the text provided and generate a viable TITLE for the topic that the content is on. The content should be 10-12 words MAXIMUM, it can be shorter as needed.
                Do not include any other extra text like 'okay here's your message' or something similar. ONLY include the title.''' + text
        }
        ]
    })
    )
    data = response.json()

    # # Extract the assistant message content
    llm_output = data["choices"][0]["message"]["content"]

    return llm_output

def convert_to_latex(text):
    model_api_key = os.getenv("GROQ_API_KEY")
    response = requests.post(
    url="https://api.groq.com/openai/v1/chat/completions",
    headers={
        "Authorization": f"Bearer {model_api_key}",
        "Content-Type": "application/json",
    },
    data=json.dumps({
        "model": "llama-3.3-70b-versatile",
        "messages": [
        {
            "role": "user",
            "content": '''Convert the text below into a LaTeX document.
                After converting, carefully review the text and correct any mistakes
                or misread characters. Preserve formatting like bullet points,
                headings, or mathematical notation where possible.
                Do not include any other extra text like 'okay here's your message' or something similar. ONLY include the extracted LaTeX output.''' + text
        }
        ]
    })
    )
    data = response.json()

    # # Extract the assistant message content
    llm_output = data["choices"][0]["message"]["content"]

    return llm_output
    
@app.route('/extract-text', methods=['POST'])
def extractText():
    # 1. Clear uploads and results folders
    clear_folder(UPLOAD_FOLDER)
    clear_folder(RESULTS_FOLDER)

    # --- 1. Handle multiple uploaded images ---
    uploaded_files = request.files.getlist('images')

    if not uploaded_files or uploaded_files == [None]:
        return jsonify({"error": "No images uploaded"}), 400

    for file in uploaded_files:
        if file.filename == "":
            continue
        
        filename = secure_filename(file.filename)
        save_path = os.path.join(UPLOAD_FOLDER, filename)
        file.save(save_path)
        print(f"Saved uploaded image: {save_path}")

    API_KEY = os.getenv("GOOGLE_API_KEY")
    client = genai.Client(api_key=API_KEY)

    extracted_text = ""
    for filename in os.listdir(UPLOAD_FOLDER):
        file_path = os.path.join(UPLOAD_FOLDER, filename)

        # Skip directories
        if not os.path.isfile(file_path):
            continue

        mime_type, _ = mimetypes.guess_type(file_path)

        # Accept only JPEG/PNG images
        if mime_type not in ("image/jpeg", "image/png"):
            print(f"Skipping non-image file: {filename}")
            continue

        print(f"\nProcessing image: {filename}")

        with open(file_path, 'rb') as f:
            image_bytes = f.read()

        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=[
                types.Part.from_bytes(
                    data=image_bytes,
                    mime_type=mime_type,
                ),
                (
                    "Extract all the text from this image and "
                    "After extracting, carefully review the text and correct any mistakes "
                    "or misread characters. THEN, CONVERT the text into a neatly formatted notes with logical understanding."
                    " Do not include any other extra text like 'okay here's your message' or something similar. ONLY include the neatly formatted output."
                )
            ]
        )
        extracted_text += response.text + "\n"
    
    # Save to file
    results_file_path = os.path.join(RESULTS_FOLDER, "results.txt")
    with open(results_file_path, "w", encoding="utf-8") as f:
        f.write(extracted_text)

    print(f"\nAll results saved to {results_file_path}")
    
    #generate a title and return that too
    notes_title = generate_title(extracted_text)

    # Return the extracted text in the response
    return jsonify({
        "status": "success",
        "extracted_text": extracted_text,
        "notes_title" : notes_title,
    })

def background_video_creation(user_text):
    # Sanitize user input to prevent LaTeX errors
    if user_text:
        user_text = user_text.replace("&", "and").replace("%", " percent ")

    try:
        # Correct path where Manim saves the output
        video_path = Path("media/videos/generated_manim_script/1080p60/Explainer.mp4")
        if video_path.exists():
            video_path.unlink()
            print(f"Deleted old video at: {video_path}")
        else:
            print("No old video to delete.")
        createVideo(user_text)
        print("Video generation finished!")
    except Exception as e:
        print("Error generating video:", e)
    
@app.route('/generate-video', methods=['POST'])
def generate_video():
    data = request.json
    user_text = data.get('text', '')
    if not user_text:
        return jsonify({"error": "No text provided"}), 400
    
    # Start the video generation in a separate thread
    thread = threading.Thread(target=background_video_creation, args=(user_text,))
    thread.start()
    
    # Immediately respond to the client
    return jsonify({"status": "started"})

@app.route('/video', methods=['GET'])
def get_video():
    """Serve the generated video file"""
    video_path = Path("media/videos/generated_manim_script/1080p60/Explainer.mp4")
    
    if not video_path.exists():
        return jsonify({"error": "Video not found"}), 404
    
    return send_file(
        video_path,
        mimetype='video/mp4',
        as_attachment=False,
        download_name='Explainer.mp4'
    )

def extract_manim_positions(script_text):
    """
    Parse Manim script to extract element positions.
    Returns list of dicts with element info and positions.
    """
    import re
    
    positions = []
    
    # Pattern for .move_to() calls - e.g., .move_to(UP*2 + LEFT*3) or .move_to([1, 2, 0])
    move_to_pattern = r'(\w+)\.move_to\((.*?)\)'
    
    # Pattern for .shift() calls
    shift_pattern = r'(\w+)\.shift\((.*?)\)'
    
    # Pattern for .to_edge() and .to_corner()
    edge_pattern = r'(\w+)\.to_edge\((.*?)\)'
    corner_pattern = r'(\w+)\.to_corner\((.*?)\)'
    
    # Find all move_to calls
    for match in re.finditer(move_to_pattern, script_text):
        element_name = match.group(1)
        position_expr = match.group(2).strip()
        
        # Try to evaluate simple position expressions
        try:
            # Handle common Manim constants
            pos_eval = position_expr
            pos_eval = pos_eval.replace('UP', '[0, 1, 0]')
            pos_eval = pos_eval.replace('DOWN', '[0, -1, 0]')
            pos_eval = pos_eval.replace('LEFT', '[-1, 0, 0]')
            pos_eval = pos_eval.replace('RIGHT', '[1, 0, 0]')
            pos_eval = pos_eval.replace('ORIGIN', '[0, 0, 0]')
            
            # Simple evaluation for basic arithmetic
            # This is a simplified version - doesn't handle all cases
            positions.append({
                'element': element_name,
                'method': 'move_to',
                'expression': position_expr,
                'line': script_text[:match.start()].count('\n') + 1
            })
        except:
            # If we can't evaluate, still record it
            positions.append({
                'element': element_name,
                'method': 'move_to',
                'expression': position_expr,
                'line': script_text[:match.start()].count('\n') + 1
            })
    
    # Check for elements without explicit positioning (likely at center)
    # Find all object creations
    object_pattern = r'(\w+)\s*=\s*(Text|MathTex|Tex|Circle|Square|Rectangle|Line|Dot|Arrow)\('
    positioned_elements = {p['element'] for p in positions}
    
    for match in re.finditer(object_pattern, script_text):
        element_name = match.group(1)
        element_type = match.group(2)
        
        if element_name not in positioned_elements:
            # Element created but not explicitly positioned - defaults to center
            positions.append({
                'element': element_name,
                'method': 'default',
                'expression': 'ORIGIN (default)',
                'line': script_text[:match.start()].count('\n') + 1,
                'warning': 'No explicit position - defaults to center (0,0,0)'
            })
    
    return positions

def detect_overlaps(positions, threshold=1.5):
    """
    Detect potential overlaps based on position expressions.
    Returns list of overlap warnings.
    """
    overlaps = []
    
    # Count elements at center/origin - only flag if 3+ elements (more lenient)
    center_elements = [p for p in positions if 'ORIGIN' in p['expression'] or p.get('method') == 'default']
    
    if len(center_elements) >= 3:  # Changed from > 1 to >= 3
        overlaps.append({
            'type': 'center_clustering',
            'severity': 'high',
            'message': f'{len(center_elements)} elements positioned at or near center (0,0,0)',
            'elements': [p['element'] for p in center_elements],
            'lines': [p['line'] for p in center_elements]
        })
    elif len(center_elements) == 2:
        # Medium severity for 2 elements at center
        overlaps.append({
            'type': 'center_clustering',
            'severity': 'medium',
            'message': f'2 elements at center - may overlap',
            'elements': [p['element'] for p in center_elements],
            'lines': [p['line'] for p in center_elements]
        })
    
    # Check for duplicate position expressions (excluding center which we already checked)
    expr_groups = {}
    for p in positions:
        expr = p['expression']
        if expr not in expr_groups:
            expr_groups[expr] = []
        expr_groups[expr].append(p)
    
    for expr, elements in expr_groups.items():
        if len(elements) > 1 and expr != '' and 'ORIGIN' not in expr:
            overlaps.append({
                'type': 'duplicate_position',
                'severity': 'medium',
                'message': f'{len(elements)} elements at same position: {expr}',
                'elements': [p['element'] for p in elements],
                'lines': [p['line'] for p in elements]
            })
    
    return overlaps

def safe_json_parse(json_string, fallback=None):
    """
    Safely parse JSON from LLM responses that may contain unescaped characters.
    
    Args:
        json_string: The JSON string to parse
        fallback: Default value to return if parsing fails (None by default)
    
    Returns:
        Parsed JSON object or fallback value
    """
    try:
        # Try standard JSON parsing first
        return json.loads(json_string)
    except json.JSONDecodeError as e:
        print(f"Initial JSON parse failed: {e}")
        
        # Try to fix common issues
        try:
            # Remove any markdown code fences if present
            cleaned = json_string.strip()
            if cleaned.startswith("```"):
                lines = cleaned.split("\n")
                # Remove first line if it's a code fence
                if lines[0].startswith("```"):
                    lines = lines[1:]
                # Remove last line if it's a code fence
                if lines and lines[-1].strip() == "```":
                    lines = lines[:-1]
                cleaned = "\n".join(lines)
            
            # Try parsing the cleaned version
            return json.loads(cleaned)
        except json.JSONDecodeError:
            print(f"Cleaned JSON parse also failed. Returning fallback: {fallback}")
            return fallback

def assess_visual_layout(script_content, positions, overlaps, model_api_key, iteration):
    """
    LLM assessment specifically for visual layout and spacing.
    """
    overlap_summary = "\n".join([
        f"- {o['severity'].upper()}: {o['message']}" for o in overlaps
    ]) if overlaps else "No overlaps detected by static analysis."
    
    position_summary = "\n".join([
        f"- Line {p['line']}: {p['element']} -> {p['expression']}" + 
        (f" (WARNING: {p['warning']})" if 'warning' in p else "")
        for p in positions[:20]  # Limit to first 20 for brevity
    ])
    
    layout_prompt = f"""You are an expert in visual design and Manim animations. Assess the visual layout of this Manim script.

ITERATION {iteration} - VISUAL LAYOUT ASSESSMENT

DETECTED POSITIONS:
{position_summary}

STATIC OVERLAP ANALYSIS:
{overlap_summary}

MANIM SCRIPT:
{script_content[:3000]}  # First 3000 chars

Your assessment must check:
1. **Spatial Distribution**: Are elements spread across the screen or clustered in one area?
2. **Center Overuse**: Are too many elements positioned at (0,0,0)?
3. **Overlap Risk**: Could text or shapes overlap based on their positions?
4. **Screen Space Usage**: Is the available screen space being used effectively?

Respond in JSON format ONLY:
{{
    "layout_quality": "GOOD" or "NEEDS_IMPROVEMENT",
    "reasoning": "Brief explanation of layout assessment",
    "spatial_issues": ["list specific positioning problems"],
    "suggested_positions": {{"element_name": "suggested position like UP*2 + LEFT*3"}},
    "layout_score": <1-10 rating>
}}
"""
    
    response = requests.post(
        url="https://generativelanguage.googleapis.com/v1beta/openai/chat/completions",
        headers={
            "Authorization": f"Bearer {model_api_key}",
            "Content-Type": "application/json",
        },
        data=json.dumps({
            "model": "gemini-2.5-flash-lite",
            "messages": [{"role": "user", "content": layout_prompt}],
            "response_format": {"type": "json_object"}
        })
    )
    
    layout_data = response.json()
    if "error" in layout_data:
        print(f"Layout Assessment API Error: {layout_data['error']}")
        return {"layout_quality": "GOOD", "reasoning": "Assessment failed, proceeding"}
    
    layout_result = safe_json_parse(
        layout_data["choices"][0]["message"]["content"],
        fallback={"layout_quality": "GOOD", "reasoning": "JSON parse failed, proceeding"}
    )
    print(f"\n=== ITERATION {iteration} LAYOUT ASSESSMENT ===")
    print(f"Layout Quality: {layout_result.get('layout_quality')}")
    print(f"Layout Score: {layout_result.get('layout_score')}/10")
    print(f"Reasoning: {layout_result.get('reasoning')}")
    if layout_result.get('spatial_issues'):
        print(f"Spatial Issues: {layout_result.get('spatial_issues')}")
    print("=" * 50)
    
    return layout_result

def assess_script(script_content, original_content, model_api_key, iteration):
    """
    LLM critic that assesses the video script for quality and accuracy.
    Returns a decision on whether to refine or approve the script.
    """
    assessment_prompt = f"""You are an expert educational content reviewer. Your task is to assess a video script for quality and accuracy.

ORIGINAL CONTENT (Source Material):
{original_content}

CURRENT SCRIPT (Iteration {iteration}):
{script_content}

Your assessment must:
1. Verify FACTUAL ACCURACY - Check if the script accurately represents the source material
2. Check CLARITY - Ensure explanations are clear and well-structured
3. Evaluate COMPLETENESS - Confirm all key concepts are covered
4. Review PEDAGOGICAL QUALITY - Assess if the teaching approach is effective

Based on your assessment, you must decide:
- APPROVE: If the script is accurate, clear, complete, and ready for video creation
- REFINE: If improvements are needed (specify what needs improvement)

Respond in JSON format ONLY:
{{
    "decision": "APPROVE" or "REFINE",
    "reasoning": "Brief explanation of your decision",
    "accuracy_issues": ["list any factual errors or inaccuracies"],
    "suggested_improvements": ["specific improvements if decision is REFINE"],
    "quality_score": <1-10 rating>
}}
"""
    
    response = requests.post(
        url="https://generativelanguage.googleapis.com/v1beta/openai/chat/completions",
        headers={
            "Authorization": f"Bearer {model_api_key}",
            "Content-Type": "application/json",
        },
        data=json.dumps({
            "model": "gemini-2.5-flash-lite",
            "messages": [{"role": "user", "content": assessment_prompt}],
            "response_format": {"type": "json_object"}
        })
    )
    
    assessment_data = response.json()
    if "error" in assessment_data:
        print(f"Assessment API Error: {assessment_data['error']}")
        # Default to approval if assessment fails
        return {"decision": "APPROVE", "reasoning": "Assessment failed, proceeding with current script"}
    
    assessment_result = safe_json_parse(
        assessment_data["choices"][0]["message"]["content"],
        fallback={"decision": "APPROVE", "reasoning": "JSON parse failed, proceeding with current script"}
    )
    print(f"\n=== ITERATION {iteration} ASSESSMENT ===")
    print(f"Decision: {assessment_result.get('decision')}")
    print(f"Quality Score: {assessment_result.get('quality_score')}/10")
    print(f"Reasoning: {assessment_result.get('reasoning')}")
    if assessment_result.get('accuracy_issues'):
        print(f"Accuracy Issues: {assessment_result.get('accuracy_issues')}")
    if assessment_result.get('suggested_improvements'):
        print(f"Suggested Improvements: {assessment_result.get('suggested_improvements')}")
    print("=" * 50)
    
    return assessment_result

def refine_script(current_script, assessment_feedback, original_content, model_api_key):
    """
    Uses LLM to refine the script based on assessment feedback.
    """
    refinement_prompt = f"""You are an expert educational content creator. Improve the following video script based on the feedback provided.

ORIGINAL CONTENT (Source Material):
{original_content}

CURRENT SCRIPT:
{current_script}

ASSESSMENT FEEDBACK:
- Reasoning: {assessment_feedback.get('reasoning')}
- Accuracy Issues: {assessment_feedback.get('accuracy_issues', [])}
- Suggested Improvements: {assessment_feedback.get('suggested_improvements', [])}

Your task:
1. Fix all accuracy issues mentioned
2. Implement the suggested improvements
3. Maintain the same output format (VOICEOVER_SCRIPT...END_VOICEOVER and Manim code)
4. Ensure the script is factually correct and pedagogically sound
5. DO NOT add any explanatory text, comments, or notes after the script - output ONLY the script itself

Generate the IMPROVED complete script with the same format as before. Output ONLY the script, nothing else.
"""
    
    response = requests.post(
        url="https://generativelanguage.googleapis.com/v1beta/openai/chat/completions",
        headers={
            "Authorization": f"Bearer {model_api_key}",
            "Content-Type": "application/json",
        },
        data=json.dumps({
            "model": "gemini-2.5-flash-lite",
            "messages": [{"role": "user", "content": refinement_prompt}]
        })
    )
    
    refinement_data = response.json()
    if "error" in refinement_data:
        raise ValueError(f"Refinement API Error: {refinement_data['error']}")
    
    refined_script = refinement_data["choices"][0]["message"]["content"]
    print(f"\n=== SCRIPT REFINED ===")
    print(f"New script length: {len(refined_script)} characters")
    
    return refined_script

def createVideo(user_text_here):
    with open("./src/assets/video_prompt.txt", "r") as file:
        content = file.read()
    
    model_api_key = os.getenv("GOOGLE_API_KEY")
    latex_content = convert_to_latex(user_text_here)
    
    # Initial script generation
    print("\n=== GENERATING INITIAL SCRIPT ===")
    response = requests.post(
        url="https://generativelanguage.googleapis.com/v1beta/openai/chat/completions",
        headers={
            "Authorization": f"Bearer {model_api_key}",
            "Content-Type": "application/json",
        },
        data=json.dumps({
            "model": "gemini-2.5-flash-lite",
            "messages": [
                {
                    "role": "user",
                    "content": content + latex_content
                }
            ]
        })
    )
    data = response.json()

    print("API Response:", json.dumps(data, indent=2))

    if "error" in data:
        raise ValueError(f"API Error: {data['error']}")

    if "choices" not in data:
        raise ValueError(f"Unexpected API response format: {data}")

    llm_output = data["choices"][0]["message"]["content"]
    
    # Agentic workflow: Iterative refinement
    max_iterations = 5  # Prevent infinite loops
    iteration = 1
    current_script = llm_output
    
    print("\n" + "=" * 60)
    print("STARTING AGENTIC SCRIPT REFINEMENT WORKFLOW")
    print("=" * 60)
    
    while iteration <= max_iterations:
        # Assess the current script
        assessment = assess_script(current_script, user_text_here, model_api_key, iteration)
        
        # Check if script is approved
        if assessment.get("decision") == "APPROVE":
            print(f"\n✓ Script APPROVED after {iteration} iteration(s)")
            print(f"Final Quality Score: {assessment.get('quality_score')}/10")
            llm_output = current_script
            break
        
        # If not approved and we haven't hit max iterations, refine
        if iteration < max_iterations:
            print(f"\n→ Refining script (Iteration {iteration + 1})...")
            current_script = refine_script(current_script, assessment, user_text_here, model_api_key)
            iteration += 1
        else:
            print(f"\n⚠ Max iterations ({max_iterations}) reached. Using current script.")
            llm_output = current_script
            break
    
    print("\n" + "=" * 60)
    print("AGENTIC WORKFLOW COMPLETE - PROCEEDING WITH VIDEO GENERATION")
    print("=" * 60 + "\n")

    # 1. Parse Voiceover
    if "VOICEOVER_SCRIPT" in llm_output and "END_VOICEOVER" in llm_output:
        try:
            voice_part = llm_output.split("VOICEOVER_SCRIPT", 1)[1]
            voice_text = voice_part.split("END_VOICEOVER", 1)[0].strip()
            
            # Generate MP3 using gTTS
            print(f"Generating voiceover ({len(voice_text)} chars) with gTTS...")
            
            # Generate base audio with gTTS
            tts = gTTS(text=voice_text, lang='en', slow=False)
            tts.save('voiceover_temp.mp3')
            
            # Speed up audio to 1.5x using ffmpeg
            subprocess.run([
                'ffmpeg', '-y', '-i', 'voiceover_temp.mp3',
                '-filter:a', 'atempo=1.5',
                'voiceover.mp3'
            ], check=True, capture_output=True)
            
            # Clean up temp file
            if os.path.exists('voiceover_temp.mp3'):
                os.remove('voiceover_temp.mp3')
            
            # Verify file exists and has content
            if os.path.exists("voiceover.mp3") and os.path.getsize("voiceover.mp3") > 0:
                 print(f"voiceover.mp3 saved successfully. Size: {os.path.getsize('voiceover.mp3')} bytes")
            else:
                 print("Error: voiceover.mp3 is empty or missing.")

        except Exception as e:
            print(f"Error generating voiceover: {e}")
    else:
        print("No VOICEOVER_SCRIPT found in LLM output.")

    # Try to find the Manim script - be flexible about the marker
    if "Manim" in llm_output:
        script_text = llm_output.split("Manim", 1)[1].strip()
    elif "```python" in llm_output:
        # Sometimes LLM skips the marker but includes code fence
        print("⚠ Warning: 'Manim' marker not found, trying to extract from code fence...")
        script_text = llm_output.split("```python", 1)[1].strip()
    elif "class Explainer" in llm_output:
        # Last resort: look for the class definition
        print("⚠ Warning: 'Manim' marker not found, extracting from class definition...")
        script_text = llm_output.split("class Explainer", 1)[0] + "class Explainer" + llm_output.split("class Explainer", 1)[1]
        # Find where the actual code starts (after VOICEOVER if present)
        if "END_VOICEOVER" in script_text:
            script_text = script_text.split("END_VOICEOVER", 1)[1].strip()
    else:
        # Print the output for debugging
        print("\n=== LLM OUTPUT (first 500 chars) ===")
        print(llm_output[:500])
        print("=== END OUTPUT ===\n")
        raise ValueError("LLM did not return a valid script with 'Manim' marker or recognizable code structure.")

    # Remove code fences (``` or ```python) and any trailing text
    if script_text.startswith("```"):
        # Split by newline after the first ``` line
        lines = script_text.splitlines()
        if lines[0].startswith("```"):
            lines = lines[1:]  # remove opening ```
        
        # Find and remove closing ``` and everything after it
        closing_fence_index = -1
        for i, line in enumerate(lines):
            if line.strip().startswith("```"):
                closing_fence_index = i
                break
        
        if closing_fence_index != -1:
            lines = lines[:closing_fence_index]  # remove closing ``` and everything after
        elif lines[-1].startswith("```"):
            lines = lines[:-1]  # fallback: remove last line if it's ```
        
        script_text = "\n".join(lines).strip()
    else:
        # Even if no opening fence, check for closing fence with trailing content
        lines = script_text.splitlines()
        closing_fence_index = -1
        for i, line in enumerate(lines):
            if line.strip().startswith("```") or line.strip() == "```":
                closing_fence_index = i
                break
        
        if closing_fence_index != -1:
            lines = lines[:closing_fence_index]
            script_text = "\n".join(lines).strip()

    # -------------------------------------------------------------
    # 2. Use a fixed script name — delete if it already exists
    # -------------------------------------------------------------
    script_name = "generated_manim_script.py"
    script_path = Path(script_name)

    if script_path.exists():
        script_path.unlink()  # delete old file

    # Write new script
    with open(script_path, "w", encoding="utf-8") as f:
        f.write(script_text)

    project_root = Path(__file__).parent
    # venv_python = project_root / ".venv" / "bin" / "python"
    venv_manim  = project_root / ".venv" / "bin" / "manim"

    if not venv_manim.exists():
        raise RuntimeError("Manim is not installed inside .venv.")

    subprocess.run(
        [
            str(venv_manim),
            "-qh",
            script_name,
            "Explainer"
        ],
        cwd=project_root,
        check=True
    )
    print("==== Extracted Script Start ====")
    print(script_text[:200])  # first 200 chars
    print("==== Extracted Script End ====")

     #return llm_output


@app.route('/evaluate-answer', methods=['POST'])
def evaluate_answer():
    data = request.json
    question_text = data.get('question', '')
    user_answer = data.get('user_answer', '')
    correct_answer = data.get('correct_answer', '') # Optional, if available

    if not question_text or not user_answer:
        return jsonify({"error": "Missing question or answer"}), 400

    prompt = (
        "You are an expert teacher grading a student's answer.\n"
        f"Question: {question_text}\n"
        f"Student Answer: {user_answer}\n"
        f"Target Concept/Answer: {correct_answer}\n\n"
        "Task:\n"
        "1. Determine if the student's answer is essentially correct based on the target concept. Be generous with phrasing but strict on facts.\n"
        "2. Provide short, constructive feedback (max 2 sentences).\n\n"
        "Output JSON ONLY:\n"
        "{ \"correct\": boolean, \"feedback\": \"string\" }"
    )

    model_api_key = os.getenv("GROQ_API_KEY")
    try:
        response = requests.post(
            url="https://api.groq.com/openai/v1/chat/completions",
            headers={
                "Authorization": f"Bearer {model_api_key}",
                "Content-Type": "application/json",
            },
            data=json.dumps({
                "model": "llama-3.3-70b-versatile",
                "messages": [{"role": "user", "content": prompt}],
                "response_format": {"type": "json_object"}
            })
        )
        data = response.json()
        content = data["choices"][0]["message"]["content"]
        result = json.loads(content)
        return jsonify(result)
    except Exception as e:
        print(f"Error evaluating answer: {e}")
        # Fallback to simple containment check if AI fails
        is_correct = correct_answer.lower() in user_answer.lower() if correct_answer else False
        return jsonify({"correct": is_correct, "feedback": "AI evaluation failed, falling back to simple check."})

@app.route('/save-changed-notes', methods=['POST'])
def save_changed_notes():
    """Save edited notes content back to file"""
    try:
        data = request.json
        content = data.get('changedNotes')
        filename = data.get('filename', 'results.txt')
        
        if not content:
            return jsonify({'error': 'No content provided'}), 400
        
        filepath = os.path.join(RESULTS_FOLDER, filename)
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        
        print(f"Saved content to {filepath}")
        return jsonify({'success': True, 'message': 'Content saved successfully'}), 200
    
    except Exception as e:
        print(f"Error in save-changed-notes: {str(e)}")
        return jsonify({'error': str(e)}), 500


@app.route('/get-users', methods=['GET'])
def get_users():
    """
    Fetches all users from Supabase Auth Admin API.
    Requires SUPABASE_SERVICE_ROLE_KEY or SUPABASE_KEY (if it has admin rights) in .env.
    Returns:
        JSON list of users: { id, email, name }
    """
    print("--- /get-users called ---")
    try:
        # Prefer SERVICE_ROLE_KEY for admin tasks, fallback to standard KEY
        supabase_url = os.getenv("SUPABASE_URL")
        
        service_role_key_env = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
        anon_key_env = os.getenv("SUPABASE_KEY")
        
        # Ensure your .env has SUPABASE_SERVICE_ROLE_KEY for this to work
        service_key = service_role_key_env or anon_key_env

        print(f"Supabase URL found: {bool(supabase_url)}")
        print(f"Has SUPABASE_SERVICE_ROLE_KEY: {bool(service_role_key_env)}")
        print(f"Has SUPABASE_KEY: {bool(anon_key_env)}")
        print(f"Using Key: {'Service Role Key' if service_role_key_env else 'Anon Key (Likely Insufficient)'}")

        if not supabase_url or not service_key:
            print("Error: Missing keys")
            return jsonify({"error": "Missing Supabase configuration in .env"}), 500

        # Construct the Admin API URL
        # Docs: https://supabase.com/docs/reference/api/auth-admin-list-users
        admin_url = f"{supabase_url}/auth/v1/admin/users"
        
        headers = {
            "apikey": service_key,
            "Authorization": f"Bearer {service_key}",
            "Content-Type": "application/json"
        }

        users = []
        page = 1
        per_page = 50 # Default page size

        while True:
            print(f"Fetching page {page}...")
            response = requests.get(
                f"{admin_url}?page={page}&per_page={per_page}",
                headers=headers
            )

            print(f"Supabase Response Status: {response.status_code}")
            if response.status_code != 200:
                print(f"Failed to fetch users: {response.text}")
                return jsonify({"error": "Failed to fetch users from Supabase"}), 500

            data = response.json()
            users_page = data.get("users", [])
            print(f"Users found in page: {len(users_page)}")
            
            if not users_page:
                break
                
            users.extend(users_page)
            page += 1

        print(f"Total users fetched: {len(users)}")

        # Format for frontend
        formatted_users = []
        for u in users:
            uid = u.get("id")
            email = u.get("email")
            meta = u.get("user_metadata", {})
            name = meta.get("full_name") or meta.get("name") or "Student"
            
            formatted_users.append({
                "id": uid,
                "email": email,
                "name": name
            })

        return jsonify(formatted_users)

    except Exception as e:
        print(f"Error in /get-users: {e}")
        return jsonify({"error": str(e)}), 500


if __name__ == '__main__':
    app.run(debug=True)