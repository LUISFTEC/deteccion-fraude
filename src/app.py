from flask import Flask, request, jsonify
from flask_cors import CORS
from faster_whisper import WhisperModel
import os
import tempfile

app = Flask(__name__)
CORS(app) 

# MODELO MÁS GRANDE PARA MEJOR CALIDAD
model_size = "base"  # o "small" para mejor calidad
model = WhisperModel(model_size, device="cpu", compute_type="int8")

@app.route("/transcribe", methods=["POST"])
def transcribe_audio():
    if 'audio' not in request.files:
        return jsonify({"error": "No se encontró el archivo de audio"}), 400

    audio_file = request.files['audio']
    # ✅ ✅ ✅ AQUÍ AGREGAS LAS VALIDACIONES ✅ ✅ ✅
    
    # 1. Validar que el archivo tenga nombre
    if audio_file.filename == '':
        return jsonify({"error": "No se seleccionó ningún archivo"}), 400

    # 2. Validar formato (SCRUM-12)
    allowed_extensions = {'.mp3', '.wav', '.ogg'}
    file_extension = os.path.splitext(audio_file.filename)[1].lower()
    if file_extension not in allowed_extensions:
        return jsonify({"error": f"Formato {file_extension} no soportado"}), 400

    # 3. Validar tamaño (SCRUM-13)
    MAX_SIZE = 10 * 1024 * 1024  # 10MB
    audio_file.seek(0, 2)  # Ir al final
    file_size = audio_file.tell()  # Obtener tamaño
    audio_file.seek(0)     # Volver al inicio
    
    if file_size > MAX_SIZE:
        return jsonify({"error": "Archivo demasiado grande. Máximo 10MB"}), 400

    # ✅ ✅ ✅ FIN DE VALIDACIONES - LO QUE SIGUE ES TU CÓDIGO ACTUAL ✅ ✅ ✅

    
    # MEJOR MANEJO DE EXTENSIONES
    _, ext = os.path.splitext(audio_file.filename)
    suffix = ext if ext else '.wav'
    
    with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp_file:
        audio_file.save(tmp_file.name)
        temp_filename = tmp_file.name

    try:
        # PARÁMETROS MEJORADOS PARA CALIDAD
        segments, info = model.transcribe(
            temp_filename,
            beam_size=5,
            best_of=5,
            temperature=0.0,
            vad_filter=True,  # IMPORTANTE: filtro de voz
            vad_parameters=dict(min_silence_duration_ms=500)
        )
        
        transcribed_text = " ".join([segment.text for segment in segments])

        # MÁS INFORMACIÓN EN LA RESPUESTA
        return jsonify({
            "transcribed_text": transcribed_text,
            "language": info.language,
            "language_probability": round(info.language_probability, 4),
            "duration": round(info.duration, 2)
        })
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        if os.path.exists(temp_filename):
            os.remove(temp_filename)

if __name__ == "__main__":
    app.run(debug=True, port=5000)