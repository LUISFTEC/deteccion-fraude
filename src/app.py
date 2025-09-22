from flask import Flask, request, jsonify
from flask_cors import CORS
from faster_whisper import WhisperModel
import os
import tempfile

app = Flask(__name__)
# Habilitamos CORS para que React pueda comunicarse con el backend
CORS(app) 

# Carga el modelo de Whisper. 
# Puedes elegir un modelo más pequeño como 'tiny' o 'base' para empezar
model_size = "tiny"
# Si tienes una GPU, puedes especificar device="cuda"
model = WhisperModel(model_size, device="cpu", compute_type="int8")

@app.route("/transcribe", methods=["POST"])
def transcribe_audio():
    if 'audio' not in request.files:
        return jsonify({"error": "No se encontró el archivo de audio"}), 400

    audio_file = request.files['audio']
    
    # Guarda el archivo en un directorio temporal para procesarlo
    with tempfile.NamedTemporaryFile(delete=False, suffix=".mp3") as tmp_file:
        audio_file.save(tmp_file.name)
        temp_filename = tmp_file.name

    try:
        # Usa faster-whisper para transcribir el audio
        segments, info = model.transcribe(temp_filename, beam_size=5)
        
        # Concatena los segmentos para formar el texto completo
        transcribed_text = " ".join([segment.text for segment in segments])

        # Devuelve la transcripción como JSON
        return jsonify({"transcribed_text": transcribed_text})
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        # Asegúrate de eliminar el archivo temporal
        if os.path.exists(temp_filename):
            os.remove(temp_filename)

if __name__ == "__main__":
    app.run(debug=True, port=5000)