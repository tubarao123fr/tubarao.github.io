const url = "pdf/tonfichier.pdf";

const container = document.getElementById("viewer");

pdfjsLib.GlobalWorkerOptions.workerSrc =
  "https://mozilla.github.io/pdf.js/build/pdf.worker.js";

pdfjsLib.getDocument(url).promise.then(pdf => {

  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
    pdf.getPage(pageNum).then(page => {

      const scale = 1.5;
      const viewport = page.getViewport({ scale });

      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      canvas.height = viewport.height;
      canvas.width = viewport.width;

      container.appendChild(canvas);

      page.render({
        canvasContext: ctx,
        viewport: viewport
      });
    });
  }
});