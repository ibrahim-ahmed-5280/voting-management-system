require("dotenv").config();
const bcrypt = require("bcryptjs");
const connectDB = require("./utils/db");
const Admin = require("./models/Admin");
const Voter = require("./models/Voter");
const Election = require("./models/Election");
const Candidate = require("./models/Candidate");
const { getElectionStatus } = require("./utils/status");

async function seed() {
  await connectDB();

  const adminEmail = "admin@ems.com";
  const adminPassword = "admin123";
  const voterEmail = "voter@ems.com";

  const adminHash = await bcrypt.hash(adminPassword, 10);
  const admin = await Admin.findOneAndUpdate(
    { email: adminEmail },
    {
      $set: {
        name: "System Admin",
        email: adminEmail,
        password: adminHash,
        role: "admin",
        activeSession: null
      }
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  const now = new Date();
  const startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const endDate = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  let election = await Election.findOne({ name: "Demo General Election 2026" });
  if (!election) {
    election = await Election.create({
      name: "Demo General Election 2026",
      description: "Demo election for login and voting flow.",
      startDate,
      endDate,
      status: getElectionStatus(startDate, endDate)
    });
  }

  const candidateNames = ["Jane Carter", "Michael Reyes"];
  const candidateIds = [];
  for (const name of candidateNames) {
    let candidate = await Candidate.findOne({ name, election: election._id });
    if (!candidate) {
      candidate = await Candidate.create({
        name,
        election: election._id,
        description: `Candidate profile for ${name}.`
      });
    }
    candidateIds.push(candidate._id);
  }

  election.candidates = candidateIds;
  election.status = getElectionStatus(election.startDate, election.endDate);
  await election.save();

  const voter = await Voter.findOneAndUpdate(
    { email: voterEmail },
    {
      $set: {
        name: "Demo Voter",
        email: voterEmail,
        phone: "1234567890",
        role: "voter",
        activeSession: null
      },
      $addToSet: {
        assignedElections: election._id
      }
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  console.log("Demo seed completed.");
  console.log("Admin login:");
  console.log(`- Email: ${adminEmail}`);
  console.log(`- Password: ${adminPassword}`);
  console.log("Voter login:");
  console.log(`- Email: ${voterEmail}`);
  process.exit(0);
}

seed().catch((error) => {
  console.error("Seed failed:", error);
  process.exit(1);
});
