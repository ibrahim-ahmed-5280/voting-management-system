const xlsx = require("xlsx");
const ExcelJS = require("exceljs");

const parseVotersFromExcel = (filePath) => {
  const workbook = xlsx.readFile(filePath);
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  return xlsx.utils.sheet_to_json(sheet, { defval: "" });
};

const buildVotesWorkbook = async (votes) => {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Votes");
  sheet.columns = [
    { header: "Voter Email", key: "voterEmail", width: 30 },
    { header: "Voter Name", key: "voterName", width: 26 },
    { header: "Election", key: "electionName", width: 26 },
    { header: "Candidate", key: "candidateName", width: 26 },
    { header: "Voted At", key: "votedAt", width: 24 },
    { header: "IP Address", key: "ipAddress", width: 18 }
  ];

  votes.forEach((vote) => {
    sheet.addRow({
      voterEmail: vote.voter?.email || "",
      voterName: vote.voter?.name || "",
      electionName: vote.election?.name || "",
      candidateName: vote.candidate?.name || "",
      votedAt: vote.votedAt,
      ipAddress: vote.ipAddress || ""
    });
  });

  sheet.getRow(1).font = { bold: true };
  return workbook;
};

module.exports = {
  parseVotersFromExcel,
  buildVotesWorkbook
};

