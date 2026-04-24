import { PDFDocument } from "pdf-lib";

export const runApplicationAgent = (goal, extractedData) => {
  goal = goal.toLowerCase();

  let formType = "water";

  if (goal.includes("electricity")) formType = "electricity";
  else if (goal.includes("house") || goal.includes("building")) formType = "building";

  return {
    action: "fill_form",
    formType,
    extractedData,
  };
};

export const fillPdf = async (fileUrl, schema, data) => {
  const res = await fetch(fileUrl);
  const bytes = await res.arrayBuffer();

  const pdfDoc = await PDFDocument.load(bytes);
  const form = pdfDoc.getForm();

  Object.entries(schema.fields).forEach(([pdfField, key]) => {
    try {
      const field = form.getTextField(pdfField);
      field.setText(data[key] || "");
    } catch (e) {
      console.log("Missing field:", pdfField);
    }
  });

  const filledBytes = await pdfDoc.save();

  return URL.createObjectURL(
    new Blob([filledBytes], { type: "application/pdf" })
  );
};
