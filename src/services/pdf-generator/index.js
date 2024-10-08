const { PDFDocument, rgb } = require('pdf-lib');
const fs = require('fs');
const moment = require('moment');
require('moment/locale/es');

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
  saveFile,
};

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

function saveFile(pdfBytes, appt) {
  const dir = `${__dirname}/${appt.doctorId}/${appt.userId}/`;
  const fileName = `${dir}output_2.pdf`;
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(fileName, pdfBytes);
  return fileName;
}

async function generatePDF(appts) {
  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont('Helvetica');
  const mainPage = addPage(pdfDoc, font, appts[0]);

  let currentPage = mainPage;
  let yPosition = currentPage.getHeight() - 90;
  let appt, newLines, lineLength, date;
  for (let i = 0; i < appts.length; i++) {
    appt = appts[i];
    if (yPosition - TITLE_SIZE < 50) {
      currentPage = addPage([PAGE_WIDTH, PAGE_HEIGHT]);
      yPosition = currentPage.getHeight() - 50;
    }

    date = appt.extraAppt ? `${moment(appt.extraAppt).format('ll')} Sobreturno` : moment(appt.arrivalTime).utc().format('LLLL')

    // Title
    addText(currentPage, font, date, yPosition, TITLE_SIZE);
    yPosition -= TITLE_SIZE;

    // Body
    addText(currentPage, font, appts[i].notes, yPosition, BODY_SIZE);

    lineLength = ~~(appt.notes.length / 80);
    lineLength = lineLength > 0 ? (lineLength + 2) : lineLength;
    newLines = appt.notes.split('\n').length > 1 ? appt.notes.split('\n').length : 0;

    yPosition -= (3 + lineLength + newLines) * BODY_SIZE;
  }
  const pdfBytes = await pdfDoc.save();
  const fileName = this.saveFile(pdfBytes, appts[0]);
  return fileName;
}
