pdfjsLib.GlobalWorkerOptions.workerSrc =
  "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";

const container = document.getElementById("viewer");
const status = document.getElementById("status");

const pdfFiles = [
  "DRAGON BALL TOME 2 - Akira Toriyama_split_1.pdf",
  "DRAGON BALL TOME 2 - Akira Toriyama_split_2.pdf"
];

let allPages = [];
let totalPages = 0;
let renderedCount = 0;
const pendingRenders = new Set();

async function initManga() {
  status.textContent = "Chargement en cours...";

  try {
    const pdfDocs = await Promise.all(
      pdfFiles.map(file => pdfjsLib.getDocument(file).promise)
    );

    for (const doc of pdfDocs) {
      for (let i = 1; i <= doc.numPages; i++) {
        allPages.push({ doc, pageNum: i });
      }
    }

    totalPages = allPages.length;

    // Get first page dimensions to size placeholders accurately
    const firstPage = await pdfDocs[0].getPage(1);
    const viewport = firstPage.getViewport({ scale: 1.2 });
    firstPage.cleanup();

    status.textContent = `${totalPages} pages — défilement pour charger`;

    setupLazyViewer(viewport.width, viewport.height);

  } catch (err) {
    console.error(err);
    status.textContent = `❌ Erreur : ${err.message}`;
  }
}

function setupLazyViewer(pageWidth, pageHeight) {
  // Preload 800px before the page enters the viewport
  const observer = new IntersectionObserver(handleVisible, {
    rootMargin: "800px 0px",
    threshold: 0
  });

  allPages.forEach((_, index) => {
    const wrapper = document.createElement("div");
    wrapper.className = "page-placeholder";
    wrapper.dataset.index = index;
    wrapper.style.width = Math.min(pageWidth, window.innerWidth * 0.95) + "px";
    wrapper.style.height = Math.min(pageWidth, window.innerWidth * 0.95) / pageWidth * pageHeight + "px";

    container.appendChild(wrapper);
    observer.observe(wrapper);
  });
}

function handleVisible(entries) {
  for (const entry of entries) {
    if (!entry.isIntersecting) continue;

    const wrapper = entry.target;
    const index = parseInt(wrapper.dataset.index);

    if (!pendingRenders.has(index) && !wrapper.dataset.rendered) {
      pendingRenders.add(index);
      renderPage(wrapper, index);
    }
  }
}

async function renderPage(wrapper, index) {
  const { doc, pageNum } = allPages[index];

  try {
    const page = await doc.getPage(pageNum);
    const scale = 1.2;
    const viewport = page.getViewport({ scale });

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    canvas.width = viewport.width;
    canvas.height = viewport.height;

    await page.render({ canvasContext: ctx, viewport }).promise;

    wrapper.innerHTML = "";
    wrapper.appendChild(canvas);
    wrapper.dataset.rendered = "1";
    wrapper.classList.remove("page-placeholder");
    wrapper.style.width = "";
    wrapper.style.height = "";

    page.cleanup();

    renderedCount++;
    if (renderedCount < totalPages) {
      status.textContent = `${renderedCount} / ${totalPages} pages chargées`;
    } else {
      status.textContent = "✅ Tout chargé !";
    }

  } catch (err) {
    console.error(`Erreur page ${index + 1}:`, err);
    wrapper.classList.add("page-error");
    wrapper.textContent = `❌ Page ${index + 1}`;
    wrapper.dataset.rendered = "1";
  } finally {
    pendingRenders.delete(index);
  }
}

initManga();
