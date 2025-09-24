import React, { useState, type DragEvent, useRef } from "react";
import "./FileUpload.css";

type FileUploadProps = {
  onFileSelect: (file: File) => void;
  acceptedTypes?: string[];
  maxSize?: number; // en MB
};

export default function FileUpload({
  onFileSelect,
  acceptedTypes = [".mp3"],
  maxSize = 10,
}: FileUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): boolean => {
    setError(null);

    // Validar tipo de archivo
    const fileExtension = "." + file.name.split(".").pop()?.toLowerCase();
    if (!acceptedTypes.includes(fileExtension)) {
      setError(
        `Tipo de archivo no válido. Formatos aceptados: ${acceptedTypes.join(
          ", "
        )}`
      );
      return false;
    }

    // Validar tamaño (convertir MB a bytes)
    const maxSizeBytes = maxSize * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      setError(`El archivo es demasiado grande. Tamaño máximo: ${maxSize}MB`);
      return false;
    }

    return true;
  };

  const handleFile = (file: File) => {
    if (validateFile(file)) {
      setFile(file);
      setError(null);
      onFileSelect(file);
    } else {
      setFile(null);
      // Limpiar input de archivo
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleDrag = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragover" || e.type === "dragenter") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleRemoveFile = (e: React.MouseEvent) => {
    e.stopPropagation(); // Evita que se active el evento del contenedor
    setFile(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="upload-container">
      <div
        className={`dropzone ${dragActive ? "active" : ""} ${
          error ? "error" : ""
        }`}
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={acceptedTypes.join(",")}
          onChange={handleFileChange}
          className="file-input"
        />

        <div className="dropzone-content">
          {file ? (
            <>
              <div className="file-info">
                <span className="file-icon">📄</span>
                <span className="file-name">{file.name}</span>
                <span className="file-size">
                  ({(file.size / (1024 * 1024)).toFixed(2)} MB)
                </span>
                <button
                  type="button"
                  className="remove-button"
                  onClick={handleRemoveFile}
                  aria-label="Eliminar archivo"
                >
                  ×
                </button>
              </div>
              <p className="dropzone-text">
                Haz click o arrastra otro archivo para reemplazar
              </p>
            </>
          ) : (
            <>  
              <p className="dropzone-text">
                Arrastra tu archivo
              </p>
              <p className="dropzone-subtext">
                Formatos: {acceptedTypes.join(", ")} (Máx. {maxSize}
                MB)
              </p>
            </>
          )}
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}
    </div>
  );
}