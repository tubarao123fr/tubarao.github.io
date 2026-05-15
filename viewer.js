pdfjsLib.GlobalWorkerOptions.workerSrc =
  "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";

const container = document.getElementById("viewer");
const status = document.getElementById("status");

const pdfUrl = "DRAGON BALL TOME 2 - Akira Toriyama.pdf";

async function loadManga() {
  status.textContent = "Chargement en cours...";

  try {
    const pdf = await pdfjsLib.getDocument(pdfUrl).promise;

    status.textContent = `${pdf.numPages} pages détectées — rendu en cours...`;

    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const scale = 1.2;
      const viewport = page.getViewport({ scale });

      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      container.appendChild(canvas);

      await page.render({ canvasContext: ctx, viewport }).promise;

      status.textContent = `Page ${pageNum} / ${pdf.numPages}`;
    }

    status.textContent = "✅ Chargement terminé !";

  } catch (err) {
    console.error(err);
    status.textContent = `❌ Erreur : ${err.message}`;
  }
}

loadManga();
