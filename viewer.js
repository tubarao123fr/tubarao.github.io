pdfjsLib.GlobalWorkerOptions.workerSrc =
  "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";

const menu = document.getElementById("menu");
const reader = document.getElementById("reader");
const container = document.getElementById("viewer");
const status = document.getElementById("status");

// Générer les boutons du Tome 3
const tome3Div = document.getElementById("tome3-chapters");
for (let i = 1; i <= 14; i++) {
  const btn = document.createElement("button");
  btn.textContent = `Chapitre ${i}`;
  btn.onclick = () => loadParts('tome3', [`pdf/Tome 3/DRAGON BALL TOME 3 - Akira Toriyama_split_${i}.pdf`]);
  tome3Div.appendChild(btn);
}

function goBack() {
  reader.classList.add("hidden");
  menu.classList.remove("hidden");
  container.innerHTML = "";
  status.textContent = "";
}

async function loadParts(tome, files) {
  menu.classList.add("hidden");
  reader.classList.remove("hidden");
  container.innerHTML = "";
  status.textContent = "Chargement en cours...";

  try {
    // Compter le total de pages
    let totalPages = 0;
    const pdfs = [];
    for (const file of files) {
      const pdf = await pdfjsLib.getDocument(file).promise;
      pdfs.push(pdf);
      totalPages += pdf.numPages;
    }

    status.textContent = `${totalPages} pages — rendu en cours...`;

    let offset = 0;
    for (const pdf of pdfs) {
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

        status.textContent = `Page ${offset + pageNum} / ${totalPages}`;
      }
      offset += pdf.numPages;
    }

    status.textContent = "✅ Chargement terminé !";

  } catch (err) {
    console.error(err);
    status.textContent = `❌ Erreur : ${err.message}`;
  }
}
