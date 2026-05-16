pdfjsLib.GlobalWorkerOptions.workerSrc =
  "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
 
const menu = document.getElementById("menu");
const reader = document.getElementById("reader");
const container = document.getElementById("viewer");
const status = document.getElementById("status");
const tomesContainer = document.getElementById("tomes-container");
 
// Charger le fichier index.json et générer le menu automatiquement
async function buildMenu() {
  try {
    const res = await fetch("index.json");
    const data = await res.json();
 
    data.tomes.forEach(tome => {
      const section = document.createElement("div");
      section.className = "tome-section";
 
      const title = document.createElement("h2");
      title.textContent = `Tome ${tome.numero}`;
      section.appendChild(title);
 
      const chapters = document.createElement("div");
      chapters.className = "chapters";
 
      if (tome.fichiers === 1) {
        // Un seul fichier = bouton "Lire complet"
        const btn = document.createElement("button");
        btn.textContent = "Lire le tome complet";
        btn.onclick = () => loadParts(tome.numero, [1]);
        chapters.appendChild(btn);
      } else {
        // Plusieurs fichiers = un bouton par partie
        for (let i = 1; i <= tome.fichiers; i++) {
          const btn = document.createElement("button");
          btn.textContent = `Partie ${i}`;
          btn.onclick = ((num, part) => () => loadParts(num, [part]))(tome.numero, i);
          chapters.appendChild(btn);
        }
      }
 
      section.appendChild(chapters);
      tomesContainer.appendChild(section);
    });
 
  } catch (err) {
    tomesContainer.innerHTML = `<p style="color:red">Erreur de chargement du menu : ${err.message}</p>`;
  }
}
 
function goBack() {
  reader.classList.add("hidden");
  menu.classList.remove("hidden");
  container.innerHTML = "";
  status.textContent = "";
}
 
async function loadParts(tomeNum, parts) {
  menu.classList.add("hidden");
  reader.classList.remove("hidden");
  container.innerHTML = "";
  status.textContent = "Chargement en cours...";
 
  try {
    const files = parts.map(i =>
      `pdf/Tome ${tomeNum}/DRAGON BALL TOME ${tomeNum} - Akira Toriyama_split_${i}.pdf`
    );
 
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
        const scale = window.innerWidth < 768 ? 2.5 : 1.2;
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
 
buildMenu();