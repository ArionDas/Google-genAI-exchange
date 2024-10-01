# import speech_recognition as sr
import google.generativeai as genai
from dotenv import load_dotenv
import os
from gtts import gTTS
import PIL.Image
import time
from pydub import AudioSegment
import tempfile

# Load environment variables
load_dotenv()

# Set the Google API Key
GOOGLE_API_KEY = os.getenv('GOOGLE_API_KEY')

# Function to handle voice input using a file
# def voice_input(audio_path):
#     try:
#         # Convert WebM to WAV
#         audio = AudioSegment.from_file(audio_path, format="webm")
#         with tempfile.NamedTemporaryFile(delete=False, suffix=".wav") as temp_wav_file:
#             wav_path = temp_wav_file.name
#             audio.export(wav_path, format="wav")

#         print(f"WAV file created at: {wav_path}")

#         r = sr.Recognizer()
#         with sr.AudioFile(wav_path) as source:
#             audio_data = r.record(source)
#         try:
#             text = r.recognize_google(audio_data)
#             print("Transcribed: ", text)
#             return text
#         except sr.UnknownValueError:
#             print("Sorry, could not understand the audio")
#             return "Could not understand the audio"
#         except sr.RequestError as e:
#             print(f"Error with Google Speech Recognition service: {e}")
#             return "Error with speech recognition service"
#     except Exception as e:
#         print(f"Error processing audio: {str(e)}")
#         return f"Error processing audio: {str(e)}"
#     finally:
#         # Clean up temporary files
#         try:
#             os.unlink(wav_path)
#         except:
#             pass

# Function to generate response from LLM model for voice chat
def llm_model_audio(user_text):
    genai.configure(api_key=GOOGLE_API_KEY)

    model = genai.GenerativeModel(model_name='gemini-1.5-pro')
    prompt1 = """
    You are a helpful assistant named 'ShauryaNova' developed by Ayush Shaurya Jha. 
    You are supposed to answer accurately and precisely to the user's question. 
    Now, the user query begins:
    """
    content = f"{prompt1}\n{user_text}"
    response = model.generate_content(content)
    result = response.text
    result_cleaned = result.replace('*', '')
    return result_cleaned

# Function to generate response from LLM model for image input
def llm_model_image(user_text, path):
    genai.configure(api_key=GOOGLE_API_KEY)
    model = genai.GenerativeModel(model_name='gemini-1.5-pro')
    prompt1 = """
    You are a helpful assistant named 'ShauryaNova' developed by Ayush Shaurya Jha. 
    You are supposed to answer accurately and precisely to the user's question 
    and image. Now, the user query begins:
    """
    sample_file = PIL.Image.open(path)
    prompt = f"{prompt1}\n{user_text}"
    response = model.generate_content([prompt, sample_file])
    result = response.text
    return result

# Function to generate response from LLM model for video input
def llm_model_video(user_text, video_path):
    genai.configure(api_key=GOOGLE_API_KEY)
    model = genai.GenerativeModel(model_name='gemini-1.5-pro')

    prompt1 = """
    You are a helpful assistant named 'ShauryaNova' developed by Ayush Shaurya Jha.
    You are supposed to answer accurately and precisely to the user's question 
    and video. Now, the user query begins:
    """

    if not video_path:
        raise ValueError("Video path cannot be None")

    print(f"Uploading file: {video_path}")
    video_file = genai.upload_file(path=video_path)
    print(f"Completed upload: {video_file.uri}")

    # Check if file processing is done
    while video_file.state.name == "PROCESSING":
        print("Processing video...")
        time.sleep(10)
        video_file = genai.get_file(video_file.name)

    if video_file.state.name == "FAILED":
        raise ValueError("Video processing failed")

    prompt = f"{prompt1}\n{user_text}" if user_text else prompt1
    response = model.generate_content([video_file, prompt], request_options={"timeout": 600})
    result = response.text
    return result

# Function to convert text response to speech
def text_to_speech(text):
    tts = gTTS(text=text, lang="en")
    tts.save("speech.mp3")
