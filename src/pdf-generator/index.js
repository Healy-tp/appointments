const { PDFDocument, rgb, lineSplit } = require('pdf-lib');
const fs = require('fs');

const PAGE_WIDTH = 595;
const PAGE_HEIGHT = 842;
const HEADER_BORDER_HEIGHT = 780;
const HEADER_BORDER_WIDTH_START = 50;
const HEADER_BORDER_WIDTH_END = 545;
const HEADER_THICKNESS = 3;
const TITLE_SIZE = 16;
const BODY_SIZE = 12;

const self = {
  generatePDF,
}

module.exports = self;

function addPage(pdfDoc, font, appt) {
  const page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  page.drawLine({
    start: { x: HEADER_BORDER_WIDTH_START, y: HEADER_BORDER_HEIGHT },
    end: { x: HEADER_BORDER_WIDTH_END, y: HEADER_BORDER_HEIGHT },
    thickness: HEADER_THICKNESS,
    color: rgb(0.0667, 0.2275, 0.3686), // Blue divider color
  });

  const headerText = 'Healy';
  const headerFontSize = 12;

  page.drawText(headerText, {
    x: page.getWidth() / 2 - 20,
    y: 812,
    size: headerFontSize,
    font,
    color: rgb(0, 0, 0), // Black color
  });
  page.drawText(`Paciente: ${appt.User.firstName} ${appt.User.lastName}`, {
    x: HEADER_BORDER_WIDTH_START,
    y: 800,
    size: headerFontSize,
    font,
    color: rgb(0, 0, 0), // Black color
  });
  page.drawText(`Doctor: ${appt.Doctor.firstName} ${appt.Doctor.lastName}`, {
    x: HEADER_BORDER_WIDTH_START,
    y: 788,
    size: headerFontSize,
    font,
    color: rgb(0, 0, 0), // Black color
  });
  return page;
}

function addText(page, font, text, yPosition, size) {
  page.drawText(text, {
    x: 50,
    y: yPosition, // Adjust the Y-coordinate as needed
    size, // Adjust the font size as needed
    font,
    color: rgb(0, 0, 0),
    maxWidth: PAGE_WIDTH,
  });
}

async function generatePDF(appts) {
  // Create a new PDF document
  const pdfDoc = await PDFDocument.create();
  // Create a font for the header text
  const font = await pdfDoc.embedFont('Helvetica');
  const mainPage = addPage(pdfDoc, font, appts[0]);

  let currentPage = mainPage;
  let yPosition = currentPage.getHeight() - 90; // Initial Y-coordinate with extra space
  let appt, newLines, lineLength;
  for (let i = 0; i < appts.length; i++) {
    appt = appts[i];
    // Falta aca
    if (yPosition - TITLE_SIZE < 50) {
      // Create a new page if there's not enough space
      currentPage = addPage([PAGE_WIDTH, PAGE_HEIGHT]);
      yPosition = currentPage.getHeight() - 50;
    };
    // Title
    addText(currentPage, font, appts[i].arrivalTime.toJSON(), yPosition, TITLE_SIZE);
    yPosition -= TITLE_SIZE;

    // Body
    addText(currentPage, font, appts[i].notes, yPosition, BODY_SIZE);

    lineLength = ~~(appt.notes.length / 80);
    lineLength = lineLength > 0 ? (lineLength + 2) : lineLength;
    newLines = appt.notes.split('\n').length > 1 ? appt.notes.split('\n').length : 0;

    yPosition -= (3 + lineLength + newLines) * BODY_SIZE;
  }

  // Serialize the PDF to bytes
  const pdfBytes = await pdfDoc.save();

  // Create a new directory
  const dir = `${__dirname}/${appts[0].doctorId}/${appts[0].userId}/`;
  const fileName = `${dir}output_2.pdf`;
  fs.mkdir(dir, { recursive: true }, (err) => {
    if (err) {
      console.error('Error creating directory:', err);
    } else {
      console.log('Directory created successfully.');
      // Write a new file into the new directory
      fs.writeFile(fileName, pdfBytes, (err) => {
        if (err) {
          console.error('Error creating the file:', err);
        } else {
          console.log('New file created in the directory.');
        }
      });
    }
  });
  return fileName;
};
