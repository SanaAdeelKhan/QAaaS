// Example stub for IPFS upload
const { create } = require("ipfs-http-client");

async function uploadReport(reportContent) {
  const ipfs = create("https://ipfs.infura.io:5001");
  const { path } = await ipfs.add(reportContent);
  return path; // CID
}

module.exports = uploadReport;
