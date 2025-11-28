import React, { useCallback, useState } from "react";
import Routes from "./Routes";
import Something from "./Something";

function App() {
  const [downloading, setDownloading] = useState(false);

  const downloadProject = useCallback(async () => {
    try {
      setDownloading(true);

      // Load JSZip from CDN (window.JSZip)
      const JSZipLib = window.JSZip;
      if (!JSZipLib) {
        alert("JSZip CDN not loaded. Check index.html script tag.");
        setDownloading(false);
        return;
      }

      const zip = new JSZipLib();

      // 1. Get everything inside src/
      const srcFiles = import.meta.glob("/src/**/*", { as: "raw" });

      for (const path in srcFiles) {
        try {
          const content = await srcFiles[path]();
          const fileName = path.replace("/src/", "src/");
          zip.file(fileName, content);
        } catch (err) {
          zip.file(
            path.replace("/src/", "src/") + ".missing.txt",
            `// Failed to load ${path}\n${err}`
          );
        }
      }

      // 2. Optional: include root files
      const rootFiles = import.meta.glob(
        [
          "/package.json",
          "/vite.config.js",
          "/tailwind.config.js",
          "/index.html",
          "/.env"
        ],
        { as: "raw" }
      );

      for (const path in rootFiles) {
        try {
          const content = await rootFiles[path]();
          zip.file(path.replace("/", ""), content);
        } catch {}
      }

      // 3. Generate ZIP
      const blob = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = "react_project.zip";
      a.click();

      URL.revokeObjectURL(url);
    } catch (error) {
      console.error(error);
      alert("Download failed. See console.");
    } finally {
      setDownloading(false);
    }
  }, []);

  return (
    <>
      {/* Download button */}
      <div style={{ position: "fixed", right: 12, bottom: 12, zIndex: 9999 }}>
        <button
          onClick={downloadProject}
          disabled={downloading}
          style={{
            padding: "8px 12px",
            background: "#0284c7",
            color: "white",
            borderRadius: "6px",
            border: "none",
            cursor: "pointer"
          }}
        >
          {downloading ? "Preparing..." : "Download Project"}
        </button>
      </div>

      <Routes />
      <Something />
    </>
  );
}

export default App;
