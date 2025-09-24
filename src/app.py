from flask import Flask, request, jsonify
from flask_cors import CORS
from faster_whisper import WhisperModel
import tempfile

app = Flask(__name__)
CORS(app)

# Modelo más pequeño y rápido
model = WhisperModel("tiny", device="cpu")

@app.route("/transcribe", methods=["POST"])
def transcribe_audio():
    audio_file = request.files['audio']  
    
    # Guardar archivo temporal
    tmp = tempfile.NamedTemporaryFile(delete=False, suffix=".wav")
    audio_file.save(tmp.name)

    # Transcribir
    segments, _ = model.transcribe(tmp.name)
    text = " ".join([s.text for s in segments])

    return jsonify({"transcribed_text": text})

if __name__ == "__main__":
    app.run(debug=True, port=5000)
