pdfjsLib.GlobalWorkerOptions.workerSrc =
  "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";

const menu = document.getElementById("menu");
const reader = document.getElementById("reader");
const container = document.getElementById("viewer");
const status = document.getElementById("status");
const tomesContainer = document.getElementById("tomes-container");

let allTomes = [];

// Qualité par défaut selon l'appareil
const isMobile = window.innerWidth < 768;
let currentScale = isMobile ? 2.0 : 1.5;

// Injection du sélecteur de qualité dans le reader
function injectQualitySelector() {
  const existing = document.getElementById("quality-bar");
  if (existing) return;

  const bar = document.createElement("div");
  bar.id = "quality-bar";
  bar.style.cssText = `
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 16px;
    align-self: flex-start;
    flex-wrap: wrap;
  `;

  const label = document.createElement("span");
  label.textContent = "Qualité :";
  label.style.cssText = "color: #aaa; font-size: 0.9rem;";
  bar.appendChild(label);

  const qualities = isMobile
    ? [
        { label: "Faible", scale: 1.4 },
        { label: "Normale", scale: 2.0 },
        { label: "Haute", scale: 2.6 },
      ]
    : [
        { label: "Faible", scale: 1.0 },
        { label: "Normale", scale: 1.5 },
        { label: "Haute", scale: 2.2 },
      ];

  qualities.forEach(({ label: lbl, scale }) => {
    const btn = document.createElement("button");
    btn.textContent = lbl;
    btn.dataset.scale = scale;
    btn.style.cssText = `
      background: ${scale === currentScale ? "#f4a300" : "#2a2a2a"};
      color: ${scale === currentScale ? "#111" : "white"};
      border: 1px solid ${scale === currentScale ? "#f4a300" : "#444"};
      border-radius: 6px;
      padding: 6px 14px;
      cursor: pointer;
      font-size: 0.85rem;
      transition: background 0.2s, color 0.2s, border-color 0.2s;
    `;

    btn.addEventListener("mouseenter", () => {
      if (parseFloat(btn.dataset.scale) !== currentScale) {
        btn.style.background = "#3a3a3a";
      }
    });
    btn.addEventListener("mouseleave", () => {
      if (parseFloat(btn.dataset.scale) !== currentScale) {
        btn.style.background = "#2a2a2a";
      }
    });

    btn.onclick = () => {
      if (parseFloat(btn.dataset.scale) === currentScale) return;

      // Mettre à jour le style des boutons
      bar.querySelectorAll("button").forEach(b => {
        b.style.background = "#2a2a2a";
        b.style.color = "white";
        b.style.borderColor = "#444";
      });
      btn.style.background = "#f4a300";
      btn.style.color = "#111";
      btn.style.borderColor = "#f4a300";

      currentScale = parseFloat(btn.dataset.scale);

      // Avertissement qualité haute sur mobile
      if (isMobile && currentScale >= 2.6) {
        status.textContent = "⚠️ Haute qualité : peut être lent sur mobile.";
      }
    };

    bar.appendChild(btn);
  });

  // Insérer après le bouton retour
  const backBtn = document.getElementById("back-btn");
  backBtn.insertAdjacentElement("afterend", bar);
}

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

  injectQualitySelector();

  try {
    const file = `pdf/Tome ${tomeNum}/DRAGON BALL TOME ${tomeNum} - Akira Toriyama_split_${partNum}.pdf`;
    const pdf = await pdfjsLib.getDocument(file).promise;
    const totalPages = pdf.numPages;

    status.textContent = `${totalPages} pages — défilez pour afficher`;

    // Lazy loading : on crée des placeholders et on rend à la demande
    for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
      const wrapper = document.createElement("div");
      wrapper.style.cssText = `
        width: 100%;
        min-height: 300px;
        background: #1a1a1a;
        margin-bottom: 10px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 4px;
      `;

      const placeholder = document.createElement("span");
      placeholder.textContent = `Page ${pageNum}`;
      placeholder.style.cssText = "color: #444; font-size: 0.85rem;";
      wrapper.appendChild(placeholder);
      container.appendChild(wrapper);

      // Capture scale au moment du rendu (pas à la création)
      const observer = new IntersectionObserver(async (entries) => {
        if (!entries[0].isIntersecting) return;
        observer.disconnect();

        const scaleAtRender = currentScale;
        const page = await pdf.getPage(pageNum);
        const viewport = page.getViewport({ scale: scaleAtRender });

        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        canvas.style.cssText = "max-width: 95vw; height: auto; box-shadow: 0 0 10px black;";

        wrapper.replaceChildren(canvas);
        await page.render({ canvasContext: ctx, viewport }).promise;
      }, { rootMargin: "400px" });

      observer.observe(wrapper);
    }

    // Bouton suivant / retour accueil
    const next = getNext(tomeNum, partNum);
    const nextBtn = document.createElement("button");
    nextBtn.style.cssText = `
      margin: 30px auto;
      display: block;
      background: #f4a300;
      color: #111;
      border: none;
      border-radius: 8px;
      padding: 14px 28px;
      font-size: 1.1rem;
      cursor: pointer;
    `;

    if (next) {
      nextBtn.textContent = `Partie ${next.partNum} →`;
      nextBtn.onclick = () => loadPart(next.tomeNum, next.partNum);
    } else {
      nextBtn.textContent = "🏠 Retour à l'accueil";
      nextBtn.onclick = goBack;
    }

    container.appendChild(nextBtn);
    status.textContent = `${totalPages} pages — défilez pour lire`;

  } catch (err) {
    console.error(err);
    status.textContent = `❌ Erreur : ${err.message}`;
  }
}

buildMenu();