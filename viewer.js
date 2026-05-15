const url = "https://drive.google.com/file/d/187DslUF9mt-9ZfTY6ioq26Yv4ubta1XD/view"

const container = document.getElementById("viewer");

pdfjsLib.GlobalWorkerOptions.workerSrc =
  "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";

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