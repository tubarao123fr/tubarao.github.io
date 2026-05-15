const identifier = "dragon-ball-tome-2-akira-toriyama";

fetch(`https://archive.org/metadata/${identifier}`)
  .then(res => res.json())
  .then(data => {
    // cherche le premier PDF
    const pdfFile = data.files.find(f => f.name.endsWith(".pdf"));

    if (!pdfFile) {
      console.log("Aucun PDF trouvé");
      return;
    }

    const url =
      `https://archive.org/download/${identifier}/${encodeURIComponent(pdfFile.name)}`;

    console.log(url);

    // charger le PDF avec pdf.js
    pdfjsLib.GlobalWorkerOptions.workerSrc =
      "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";

    const container = document.getElementById("viewer");

    pdfjsLib.getDocument(url).promise.then(pdf => {
      for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        pdf.getPage(pageNum).then(page => {
          const scale = 1.5;
          const viewport = page.getViewport({ scale });

          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");

          canvas.width = viewport.width;
          canvas.height = viewport.height;

          container.appendChild(canvas);

          page.render({
            canvasContext: ctx,
            viewport
          });
        });
      }
    });
  });