const path = require("node:path");
const { readJson, writeJson, sha256 } = require("./utils");

function createSeedData() {
  const now = new Date().toISOString();
  return {
    users: [
      {
        id: "user_admin",
        username: "admin",
        passwordHash: sha256("admin123"),
        fullName: "Bosh administrator",
        role: "admin",
      },
      {
        id: "user_doc_1",
        username: "doctor",
        passwordHash: sha256("doctor123"),
        fullName: "Dr. Dilshod Karimov",
        role: "doctor",
        doctorId: "doctor_1",
      },
      {
        id: "user_patient_1",
        username: "patient",
        passwordHash: sha256("patient123"),
        fullName: "Malika Yusupova",
        role: "patient",
        patientId: "patient_1",
      },
    ],
    patients: [
      {
        id: "patient_1",
        fullName: "Malika Yusupova",
        pinfl: "12345678901234",
        birthDate: "1998-05-12",
        phone: "+998901234567",
        address: "Toshkent shahri",
        bloodGroup: "O+",
        emergencyContact: "Yusupov Akmal +998909998877",
        createdAt: now,
      },
    ],
    doctors: [
      {
        id: "doctor_1",
        fullName: "Dr. Dilshod Karimov",
        specialty: "Terapevt",
        department: "Ichki kasalliklar",
      },
    ],
    records: [
      {
        id: "record_1",
        patientId: "patient_1",
        doctorId: "doctor_1",
        type: "diagnosis",
        title: "Birlamchi ko'rik",
        diagnosis: "Temir tanqisligi anemiyasi",
        treatment: "Ferrous sulfate 2 oy",
        notes: "Qo'shimcha laborator tekshiruv tavsiya qilindi",
        createdAt: now,
      },
    ],
    consents: [
      {
        id: "consent_1",
        patientId: "patient_1",
        doctorId: "doctor_1",
        scope: ["read", "write"],
        expiresAt: "2027-01-01T00:00:00.000Z",
        status: "active",
        grantedAt: now,
      },
    ],
    auditLogs: [],
    drugBatches: [
      {
        id: "batch_1",
        batchCode: "DRUG-0001",
        drugName: "Amoxicillin 500mg",
        manufacturer: "MedLab Pharm",
        expiryDate: "2027-12-31",
        currentOwner: "Toshkent Markaziy Dorixona",
        status: "verified",
        history: [
          {
            event: "registered",
            actor: "MedLab Pharm",
            timestamp: now,
          },
          {
            event: "transferred",
            actor: "Wholesale Distributor 1",
            timestamp: now,
          },
        ],
      },
    ],
  };
}

function createStorage(config) {
  const dbFile = path.join(config.dataDir, "db.json");

  function load() {
    const data = readJson(dbFile, null);
    if (data) {
      return data;
    }
    const seed = createSeedData();
    writeJson(dbFile, seed);
    return seed;
  }

  function save(data) {
    writeJson(dbFile, data);
  }

  return { load, save, dbFile };
}

module.exports = { createStorage };
