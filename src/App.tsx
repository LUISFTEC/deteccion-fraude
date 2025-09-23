import { useState } from "react";
import FileUpload from "./components/FileUpload";
import "./App.css";
import Slidebar from "./components/Slidebar";

function App() {
  const [file, setFile] = useState<File | null>(null);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // ✅ NUEVA FUNCIÓN para descargar TXT
  const handleDownload = () => {
    if (!text) return;
    
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'transcripcion.txt';  // Nombre del archivo
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleFileSelect = (file: File) => {
    setFile(file);
    setText("");
    setError("");
  };

  const handleTranscribe = async () => {
    if (!file) {
      setError("No hay archivo seleccionado.");
      return;
    }

    setLoading(true);
    setText("");
    setError("");

    const formData = new FormData();
    formData.append("audio", file);

    try {
      const response = await fetch("http://localhost:5000/transcribe", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Error en la transcripción. Código de estado: " + response.status);
      }

      const data = await response.json();
      setText(data.transcribed_text);

    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(`Ocurrió un error: ${err.message}`);
      } else {
        setError("Ocurrió un error desconocido.");
      }
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Slidebar/>
       
      <div className="app-container">
        <div className="card">
          <h1>Detector de Fraude - Audio a Texto</h1>

          <FileUpload onFileSelect={handleFileSelect} />

          <button onClick={handleTranscribe} disabled={!file || loading}>
            {loading ? "Transcribiendo..." : "Transcribir"}
          </button>

          {loading && <div className="loading">Procesando archivo...</div>}
          {error && <div className="error-message">{error}</div>}

        <div className="text-output">{text}</div>
      </div>
    </div>
  );
}

export default App;