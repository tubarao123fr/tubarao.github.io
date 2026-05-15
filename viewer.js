const identifier = "dragon-ball-tome-2-akira-toriyama";
const container = document.getElementById("viewer");

// Configuration du worker (obligatoire pour PDF.js)
pdfjsLib.GlobalWorkerOptions.workerSrc =
  "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";

async function loadManga() {
  try {
    // 1. On construit l'URL directe vers Archive.org
    // Note: On utilise le nom exact du fichier tel qu'il apparaît dans l'erreur CORS
    const fileName = "DRAGON%20BALL%20TOME%202%20-%20Akira%20Toriyama.pdf";
    const originalUrl = `https://archive.org/download/${identifier}/${fileName}`;
    
    // 2. ON PASSE PAR LE PROXY (Crucial pour éviter l'erreur de ta capture)
    const proxiedUrl = "https://corsproxy.io/?" + encodeURIComponent(originalUrl);

    console.log("Tentative de chargement via proxy :", proxiedUrl);

    // 3. Chargement du document
    const loadingTask = pdfjsLib.getDocument(proxiedUrl);
    const pdf = await loadingTask.promise;

    console.log("PDF chargé ! Nombre de pages :", pdf.numPages);

    // 4. Rendu des pages une par une
    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const scale = 1.2; // Ajuste la taille si besoin
      const viewport = page.getViewport({ scale });

      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      container.appendChild(canvas);

      await page.render({
        canvasContext: ctx,
        viewport: viewport
      }).promise;
      
      console.log(`Page ${pageNum} rendue`);
    }

  } catch (error) {
    console.error("Erreur détaillée :", error);
    container.innerHTML = `<p style="color:red">Erreur : ${error.message}<br>Vérifie la console pour plus de détails.</p>`;
  }
}

// Lancer le chargement
loadManga();