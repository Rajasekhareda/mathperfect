import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  HeadingLevel,
  AlignmentType,
  BorderStyle,
  WidthType
} from 'docx';
import { WorksheetItem } from './db.js';

export async function generateWorksheetDocxBuffer(worksheet: WorksheetItem): Promise<Buffer> {
  const children: (Paragraph | Table)[] = [];

  // Title & Header Banner
  children.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 120 },
      children: [
        new TextRun({
          text: worksheet.schoolName || 'MATH PERFECT EDUCATION',
          bold: true,
          size: 32,
          color: '1E3A8A',
          font: 'Arial'
        })
      ]
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 240 },
      children: [
        new TextRun({
          text: worksheet.title,
          bold: true,
          size: 26,
          color: '0F172A',
          font: 'Arial'
        })
      ]
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 300 },
      children: [
        new TextRun({
          text: `Subject Topic: ${worksheet.topic}   |   Grade: ${worksheet.grade}   |   Difficulty: ${worksheet.difficulty}`,
          italics: true,
          size: 20,
          color: '475569',
          font: 'Arial'
        })
      ]
    })
  );

  // Student Info Box Table
  const infoTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({
        children: [
          new TableCell({
            width: { size: 50, type: WidthType.PERCENTAGE },
            borders: {
              top: { style: BorderStyle.SINGLE, size: 1, color: 'CBD5E1' },
              bottom: { style: BorderStyle.SINGLE, size: 1, color: 'CBD5E1' },
              left: { style: BorderStyle.SINGLE, size: 1, color: 'CBD5E1' },
              right: { style: BorderStyle.SINGLE, size: 1, color: 'CBD5E1' }
            },
            children: [
              new Paragraph({
                children: [
                  new TextRun({ text: 'Student Name: _______________________', bold: true, size: 20, font: 'Arial' })
                ]
              })
            ]
          }),
          new TableCell({
            width: { size: 25, type: WidthType.PERCENTAGE },
            borders: {
              top: { style: BorderStyle.SINGLE, size: 1, color: 'CBD5E1' },
              bottom: { style: BorderStyle.SINGLE, size: 1, color: 'CBD5E1' },
              left: { style: BorderStyle.SINGLE, size: 1, color: 'CBD5E1' },
              right: { style: BorderStyle.SINGLE, size: 1, color: 'CBD5E1' }
            },
            children: [
              new Paragraph({
                children: [
                  new TextRun({ text: 'Date: ____________', bold: true, size: 20, font: 'Arial' })
                ]
              })
            ]
          }),
          new TableCell({
            width: { size: 25, type: WidthType.PERCENTAGE },
            borders: {
              top: { style: BorderStyle.SINGLE, size: 1, color: 'CBD5E1' },
              bottom: { style: BorderStyle.SINGLE, size: 1, color: 'CBD5E1' },
              left: { style: BorderStyle.SINGLE, size: 1, color: 'CBD5E1' },
              right: { style: BorderStyle.SINGLE, size: 1, color: 'CBD5E1' }
            },
            children: [
              new Paragraph({
                children: [
                  new TextRun({ text: 'Score: _____ / _____', bold: true, size: 20, font: 'Arial' })
                ]
              })
            ]
          })
        ]
      })
    ]
  });
  children.push(infoTable);

  // Instructions
  children.push(
    new Paragraph({
      spacing: { before: 200, after: 300 },
      children: [
        new TextRun({ text: 'Instructions: ', bold: true, size: 20, font: 'Arial' }),
        new TextRun({
          text: worksheet.instructions || 'Show all your mathematical work clearly in the space provided below each question. Answer all questions.',
          size: 20,
          font: 'Arial',
          color: '334155'
        })
      ]
    })
  );

  // Questions
  worksheet.questions.forEach((q, idx) => {
    children.push(
      new Paragraph({
        spacing: { before: 200, after: 80 },
        children: [
          new TextRun({
            text: `Q${idx + 1}. `,
            bold: true,
            size: 22,
            color: '1E3A8A',
            font: 'Arial'
          }),
          new TextRun({
            text: q.question,
            bold: true,
            size: 22,
            font: 'Arial'
          }),
          new TextRun({
            text: `  [${q.marks || 3} Marks]`,
            size: 18,
            color: '64748B',
            font: 'Arial',
            italics: true
          })
        ]
      })
    );

    if (q.options && q.options.length > 0) {
      const labels = ['A', 'B', 'C', 'D', 'E'];
      q.options.forEach((opt, optIdx) => {
        children.push(
          new Paragraph({
            indent: { left: 400 },
            spacing: { after: 60 },
            children: [
              new TextRun({
                text: `(${labels[optIdx]}) `,
                bold: true,
                size: 20,
                font: 'Arial'
              }),
              new TextRun({
                text: opt,
                size: 20,
                font: 'Arial'
              })
            ]
          })
        );
      });
    }

    // Space for working
    children.push(
      new Paragraph({
        spacing: { before: 100, after: 200 },
        children: [
          new TextRun({
            text: 'Working space / Solution:\n\n\n\n',
            size: 18,
            color: '94A3B8',
            font: 'Arial',
            italics: true
          })
        ]
      })
    );
  });

  // Page Break for Answer Key & Teacher Rubric
  children.push(
    new Paragraph({
      pageBreakBefore: true,
      alignment: AlignmentType.CENTER,
      spacing: { after: 200 },
      children: [
        new TextRun({
          text: 'TEACHER MARKING SCHEME & COMPLETE ANSWER KEY',
          bold: true,
          size: 26,
          color: '1E3A8A',
          font: 'Arial'
        })
      ]
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 300 },
      children: [
        new TextRun({
          text: `Worksheet Reference: ${worksheet.title} (${worksheet.topic})`,
          italics: true,
          size: 20,
          color: '64748B',
          font: 'Arial'
        })
      ]
    })
  );

  worksheet.questions.forEach((q, idx) => {
    children.push(
      new Paragraph({
        spacing: { before: 160, after: 60 },
        children: [
          new TextRun({
            text: `Answer Q${idx + 1}: `,
            bold: true,
            size: 20,
            color: '059669',
            font: 'Arial'
          }),
          new TextRun({
            text: q.correctAnswer,
            bold: true,
            size: 20,
            color: '0F172A',
            font: 'Arial'
          })
        ]
      }),
      new Paragraph({
        indent: { left: 300 },
        spacing: { after: 120 },
        children: [
          new TextRun({
            text: 'Derivation & Step-by-Step Solution: ',
            bold: true,
            size: 18,
            color: '475569',
            font: 'Arial'
          }),
          new TextRun({
            text: q.solution,
            size: 18,
            color: '334155',
            font: 'Arial'
          })
        ]
      })
    );
  });

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 720,
              bottom: 720,
              left: 720,
              right: 720
            }
          }
        },
        children
      }
    ]
  });

  return await Packer.toBuffer(doc);
}
