import subprocess
import os
from pathlib import Path

def test_manim_generation():
    script_content = """
from manim import *

class Explainer(Scene):
    def construct(self):
        text = Text("Hello World")
        self.add(text)
        self.wait(1)
"""
    script_name = "generated_manim_script.py"
    with open(script_name, "w") as f:
        f.write(script_content)

    project_root = Path(".").resolve()
    venv_manim = project_root / ".venv" / "bin" / "manim"
    
    if not venv_manim.exists():
        print(f"Manim not found at {venv_manim}")
        return

    print("Running Manim...")
    try:
        subprocess.run(
            [
                str(venv_manim),
                "-qh",
                script_name,
                "Explainer"
            ],
            cwd=project_root,
            check=True,
            capture_output=True
        )
        print("Manim run successful.")
    except subprocess.CalledProcessError as e:
        print(f"Manim failed: {e.stderr.decode()}")
        return

    expected_path = Path("media/videos/generated_manim_script/1080p60/Explainer.mp4")
    if expected_path.exists():
        print(f"SUCCESS: Video file created at {expected_path}")
    else:
        print(f"FAILURE: Video file NOT found at {expected_path}")
        # List what IS there
        parent = Path("media/videos/generated_manim_script")
        if parent.exists():
            print(f"Contents of {parent}:")
            for p in parent.rglob("*"):
                print(p)

if __name__ == "__main__":
    test_manim_generation()
