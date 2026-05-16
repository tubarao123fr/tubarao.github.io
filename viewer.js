Viewer · JS
Copier

pdfjsLib.GlobalWorkerOptions.workerSrc =
  "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
 
const menu = document.getElementById("menu");
const reader = document.getElementById("reader");
const container = document.getElementById("viewer");
const status = document.getElementById("status");
const tomesContainer = document.getElementById("tomes-container");
 
let allTomes = [];
 
async function buildMenu() {
  try {
    const res = await fetch("index.json");
    const data = await res.json();
    allTomes = data.tomes;
 
    allTomes.forEach(tome => {
      const section = document.createElement("div");
      section.className = "tome-section";
 
      const title = document.createElement("h2");
      title.textContent = `Tome ${tome.numero}`;
      section.appendChild(title);
 
      const chapters = document.createElement("div");
      chapters.className = "chapters";
 
      if (tome.fichiers === 1) {
        const btn = document.createElement("button");
        btn.textContent = "Lire le tome complet";
        btn.onclick = () => loadPart(tome.numero, 1);
        chapters.appendChild(btn);
      } else {
        for (let i = 1; i <= tome.fichiers; i++) {
          const btn = document.createElement("button");
          btn.textContent = `Partie ${i}`;
          btn.onclick = ((num, part) => () => loadPart(num, part))(tome.numero, i);
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
 
function getNext(tomeNum, partNum) {
  const tome = allTomes.find(t => t.numero === tomeNum);
  if (!tome) return null;
  if (partNum < tome.fichiers) return { tomeNum, partNum: partNum + 1 };
  return null;
}
 
async function loadPart(tomeNum, partNum) {
  menu.classList.add("hidden");
  reader.classList.remove("hidden");
  container.innerHTML = "";
  status.textContent = "Chargement en cours...";
 
  try {
    const file = `pdf/Tome ${tomeNum}/DRAGON BALL TOME ${tomeNum} - Akira Toriyama_split_${partNum}.pdf`;
    const pdf = await pdfjsLib.getDocument(file).promise;
    const totalPages = pdf.numPages;
 
    status.textContent = `${totalPages} pages — rendu en cours...`;
 
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
 
      status.textContent = `Page ${pageNum} / ${totalPages}`;
    }
 
    status.textContent = "✅ Chargement terminé !";
 
    // Bouton suivant
    const next = getNext(tomeNum, partNum);
    const nextBtn = document.createElement("button");
    nextBtn.style.cssText = "margin: 30px auto; display: block; background: #f4a300; color: #111; border: none; border-radius: 8px; padding: 14px 28px; font-size: 1.1rem; cursor: pointer;";
 
    if (next) {
      nextBtn.textContent = `Partie ${next.partNum} →`;
      nextBtn.onclick = () => loadPart(next.tomeNum, next.partNum);
    } else {
      nextBtn.textContent = "🏠 Retour à l'accueil";
      nextBtn.onclick = goBack;
    }
 
    container.appendChild(nextBtn);
 
  } catch (err) {
    console.error(err);
    status.textContent = `❌ Erreur : ${err.message}`;
  }
}
 
buildMenu();