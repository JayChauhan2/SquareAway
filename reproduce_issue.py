from gtts import gTTS
import subprocess
import os

def test_voiceover():
    text = "This is a test voiceover to check if generation works."
    print("Step 1: Testing gTTS...")
    try:
        tts = gTTS(text=text, lang='en')
        tts.save('test_voiceover_temp.mp3')
        if os.path.exists('test_voiceover_temp.mp3'):
            print("✓ gTTS saved test_voiceover_temp.mp3")
        else:
            print("✗ gTTS failed to save file")
            return
    except Exception as e:
        print(f"✗ gTTS threw an exception: {e}")
        return

    print("Step 2: Testing FFmpeg...")
    try:
        subprocess.run([
            'ffmpeg', '-y', '-i', 'test_voiceover_temp.mp3',
            '-filter:a', 'atempo=1.5',
            'test_voiceover.mp3'
        ], check=True, capture_output=True)
        
        if os.path.exists('test_voiceover.mp3'):
             print("✓ FFmpeg created test_voiceover.mp3")
        else:
             print("✗ FFmpeg ran but test_voiceover.mp3 not found")
    except subprocess.CalledProcessError as e:
        print(f"✗ FFmpeg failed with return code {e.returncode}")
        print(f"Stderr: {e.stderr.decode('utf-8') if e.stderr else 'No stderr'}")
    except FileNotFoundError:
        print("✗ FFmpeg not found in path. Is it installed?")
    except Exception as e:
        print(f"✗ An unexpected error occurred during FFmpeg step: {e}")
    finally:
        # Cleanup
        if os.path.exists('test_voiceover_temp.mp3'):
            os.remove('test_voiceover_temp.mp3')

if __name__ == "__main__":
    test_voiceover()
