pdfjsLib.GlobalWorkerOptions.workerSrc =
  "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
 
const container = document.getElementById("viewer");
const status = document.getElementById("status");
 
const pdfFiles = [
  "DRAGON BALL TOME 2 - Akira Toriyama_split_1.pdf",
  "DRAGON BALL TOME 2 - Akira Toriyama_split_2.pdf"
];
 
async function renderPdf(url, pageOffset, totalPages) {
  const pdf = await pdfjsLib.getDocument(url).promise;
 
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
 
    status.textContent = `Page ${pageOffset + pageNum} / ${totalPages}`;
  }
 
  return pdf.numPages;
}
 
async function loadManga() {
  status.textContent = "Chargement en cours...";
 
  try {
    const pdf1 = await pdfjsLib.getDocument(pdfFiles[0]).promise;
    const pdf2 = await pdfjsLib.getDocument(pdfFiles[1]).promise;
    const totalPages = pdf1.numPages + pdf2.numPages;
 
    status.textContent = `${totalPages} pages détectées — rendu en cours...`;
 
    let offset = 0;
    for (const file of pdfFiles) {
      const pages = await renderPdf(file, offset, totalPages);
      offset += pages;
    }
 
    status.textContent = "✅ Chargement terminé !";
 
  } catch (err) {
    console.error(err);
    status.textContent = `❌ Erreur : ${err.message}`;
  }
}
 
loadManga();