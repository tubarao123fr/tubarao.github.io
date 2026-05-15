const identifier = "dragon-ball-tome-2-akira-toriyama";
const container = document.getElementById("viewer");

// Configuration du worker
pdfjsLib.GlobalWorkerOptions.workerSrc =
  "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";

async function loadManga() {
  try {
    // 1. Récupération des métadonnées (optionnel si tu as déjà l'URL directe)
    const response = await fetch(`https://archive.org/metadata/${identifier}`);
    const data = await response.json();
    
    const pdfFile = data.files.find(f => f.name.endsWith(".pdf"));
    if (!pdfFile) throw new Error("Aucun PDF trouvé");

    // 2. Construction de l'URL avec Proxy
    const originalUrl = `https://archive.org/download/${identifier}/${pdfFile.name}`;
    const proxiedUrl = "https://corsproxy.io/?" + encodeURIComponent(originalUrl);

    // 3. Chargement du document
    const loadingTask = pdfjsLib.getDocument(proxiedUrl);
    const pdf = await loadingTask.promise;

    // 4. Rendu séquentiel des pages (pour ne pas faire planter le navigateur)
    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      await renderPage(pdf, pageNum);
    }

  } catch (error) {
    console.error("Erreur lors du chargement :", error);
    container.innerHTML = `<p style="color:red">Erreur : ${error.message}</p>`;
  }
}

async function renderPage(pdf, pageNum) {
  const page = await pdf.getPage(pageNum);
  const scale = 1.5;
  const viewport = page.getViewport({ scale });

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  canvas.width = viewport.width;
  canvas.height = viewport.height;
  container.appendChild(canvas);

  await page.render({
    canvasContext: ctx,
    viewport: viewport
  }).promise; // On attend que la page soit dessinée avant de passer à la suivante
}

loadManga();