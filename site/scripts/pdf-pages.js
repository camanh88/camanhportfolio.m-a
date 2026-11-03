// Renders every page of a PDF to PNG with macOS PDFKit (used for the Brunch catalogue).
// Usage: osascript -l JavaScript scripts/pdf-pages.js "<file.pdf>" <out folder> <width> [page number]
ObjC.import('PDFKit'); ObjC.import('AppKit'); ObjC.import('Foundation');
function run(argv) {
  const url = $.NSURL.fileURLWithPath(argv[0]);
  const doc = $.PDFDocument.alloc.initWithURL(url);
  const n = Number(doc.pageCount);
  const w = Number(argv[2]);
  const only = argv[3] ? Number(argv[3]) : 0;
  let log = 'pages ' + n + '\n';
  for (let i = 0; i < n; i++) {
    if (only && i + 1 !== only) continue;
    const page = doc.pageAtIndex(i);
    const b = page.boundsForBox(0);
    const sc = w / b.size.width;
    const img = page.thumbnailOfSizeForBox($.NSMakeSize(w, b.size.height * sc), 0);
    const rep = $.NSBitmapImageRep.imageRepWithData(img.TIFFRepresentation);
    const png = rep.representationUsingTypeProperties($.NSBitmapImageFileTypePNG, $());
    const name = argv[1] + '/page-' + String(i + 1).padStart(2, '0') + '.png';
    png.writeToFileAtomically(name, true);
    log += (i + 1) + ' ' + Math.round(b.size.width) + 'x' + Math.round(b.size.height) + '\n';
  }
  return log;
}
