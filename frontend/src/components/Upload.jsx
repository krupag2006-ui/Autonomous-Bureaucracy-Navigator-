import { useState } from "react";

export default function Upload() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!selectedFile) {
      setError("Please select a file.");
      setResult(null);
      return;
    }

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      setError("");

      const response = await fetch("http://localhost:8000/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Upload failed.");
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError(err.message);
      setResult(null);
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <input
          type="file"
          onChange={(event) => setSelectedFile(event.target.files?.[0] || null)}
        />
        <button type="submit">Upload</button>
      </form>

      {error && <p>{error}</p>}

      {result && (
        <div>
          <p>Filename: {result.filename}</p>
          <p>Content Type: {result.content_type}</p>
          <p>File Size: {result.file_size} bytes</p>
        </div>
      )}
    </div>
  );
}
