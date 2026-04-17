const path = require("node:path");
const { getConfig } = require("./config");
const { createStorage } = require("./storage");
const { createLocalBlockchain } = require("./blockchain");
const { createAuth } = require("./auth");
const { parseBody, json, sendFile, createId, sha256 } = require("./utils");

function createApp() {
  const config = getConfig();
  const storage = createStorage(config);
  const blockchain = createLocalBlockchain(config);
  const auth = createAuth(config);

  function logAccess(db, details) {
    const event = {
      id: createId("audit"),
      createdAt: new Date().toISOString(),
      ...details,
    };
    db.auditLogs.unshift(event);
    blockchain.appendBlock({
      type: "AUDIT_EVENT",
      auditId: event.id,
      patientId: event.patientId,
      actorId: event.actorId,
      action: event.action,
      metadataHash: sha256(JSON.stringify(event)),
    });
    return event;
  }

  function sanitizePatientView(db, patient, viewer) {
    return {
      ...patient,
      records: db.records.filter((item) => item.patientId === patient.id),
      consents: db.consents.filter((item) => item.patientId === patient.id),
      accessLogs: db.auditLogs.filter((item) => item.patientId === patient.id),
      viewerRole: viewer.role,
    };
  }

  function hasPatientAccess(db, viewer, patientId, scope = "read") {
    if (!viewer) return false;
    if (viewer.role === "admin") return true;
    if (viewer.role === "patient" && viewer.patientId === patientId) return true;
    if (viewer.role === "doctor") {
      return db.consents.some(
        (item) =>
          item.patientId === patientId &&
          item.doctorId === viewer.doctorId &&
          item.status === "active" &&
          item.scope.includes(scope) &&
          new Date(item.expiresAt).getTime() > Date.now()
      );
    }
    return false;
  }

  function routeStatic(urlPath, res) {
    const frontendDir = path.resolve(process.cwd(), "frontend");
    if (urlPath === "/" || urlPath === "/index.html") {
      sendFile(res, path.join(frontendDir, "index.html"), "text/html; charset=utf-8");
      return true;
    }
    if (urlPath === "/styles.css") {
      sendFile(res, path.join(frontendDir, "styles.css"), "text/css; charset=utf-8");
      return true;
    }
    if (urlPath === "/app.js") {
      sendFile(res, path.join(frontendDir, "app.js"), "application/javascript; charset=utf-8");
      return true;
    }
    return false;
  }

  async function handle(req, res) {
    if (req.method === "OPTIONS") {
      json(res, 200, { ok: true });
      return;
    }

    const url = new URL(req.url, "http://localhost");
    if (!url.pathname.startsWith("/api/")) {
      if (routeStatic(url.pathname, res)) return;
      json(res, 404, { error: "Sahifa topilmadi" });
      return;
    }

    const db = storage.load();
    const viewer = auth.getUserFromRequest(req);

    try {
      if (req.method === "POST" && url.pathname === "/api/auth/login") {
        const body = await parseBody(req);
        const user = db.users.find(
          (item) => item.username === body.username && item.passwordHash === sha256(body.password)
        );
        if (!user) {
          json(res, 401, { error: "Login yoki parol noto'g'ri" });
          return;
        }
        const token = auth.sign({
          id: user.id,
          role: user.role,
          fullName: user.fullName,
          doctorId: user.doctorId,
          patientId: user.patientId,
        });
        json(res, 200, {
          token,
          user: {
            id: user.id,
            role: user.role,
            fullName: user.fullName,
            doctorId: user.doctorId,
            patientId: user.patientId,
          },
        });
        return;
      }

      if (!viewer) {
        json(res, 401, { error: "Avval tizimga kiring" });
        return;
      }

      if (req.method === "GET" && url.pathname === "/api/profile") {
        json(res, 200, { user: viewer, blockchainMode: config.blockchainMode, chainName: config.chainName });
        return;
      }

      if (req.method === "GET" && url.pathname === "/api/dashboard") {
        const accessiblePatients =
          viewer.role === "doctor"
            ? db.patients.filter((patient) => hasPatientAccess(db, viewer, patient.id, "read"))
            : viewer.role === "patient"
              ? db.patients.filter((patient) => patient.id === viewer.patientId)
              : db.patients;
        json(res, 200, {
          counts: {
            patients: db.patients.length,
            doctors: db.doctors.length,
            records: db.records.length,
            consents: db.consents.filter((item) => item.status === "active").length,
            drugBatches: db.drugBatches.length,
          },
          accessiblePatients,
          latestBlocks: blockchain.readLedger().chain.slice(-5).reverse(),
        });
        return;
      }

      if (req.method === "GET" && url.pathname === "/api/patients") {
        const patients =
          viewer.role === "doctor"
            ? db.patients.filter((patient) => hasPatientAccess(db, viewer, patient.id, "read"))
            : viewer.role === "patient"
              ? db.patients.filter((patient) => patient.id === viewer.patientId)
              : db.patients;
        json(res, 200, { patients });
        return;
      }

      if (req.method === "POST" && url.pathname === "/api/patients") {
        if (!["admin", "doctor"].includes(viewer.role)) {
          json(res, 403, { error: "Bemor yaratish huquqi yo'q" });
          return;
        }
        const body = await parseBody(req);
        const patient = {
          id: createId("patient"),
          fullName: body.fullName,
          pinfl: body.pinfl,
          birthDate: body.birthDate,
          phone: body.phone,
          address: body.address,
          bloodGroup: body.bloodGroup,
          emergencyContact: body.emergencyContact,
          createdAt: new Date().toISOString(),
        };
        db.patients.push(patient);
        storage.save(db);
        blockchain.appendBlock({
          type: "PATIENT_CREATED",
          patientId: patient.id,
          patientHash: sha256(JSON.stringify(patient)),
        });
        json(res, 201, { patient });
        return;
      }

      const patientDetailMatch = url.pathname.match(/^\/api\/patients\/([^/]+)$/);
      if (req.method === "GET" && patientDetailMatch) {
        const patientId = patientDetailMatch[1];
        const patient = db.patients.find((item) => item.id === patientId);
        if (!patient) {
          json(res, 404, { error: "Bemor topilmadi" });
          return;
        }
        if (!hasPatientAccess(db, viewer, patientId, "read")) {
          json(res, 403, { error: "Bu bemorga kirish ruxsati yo'q" });
          return;
        }
        logAccess(db, {
          actorId: viewer.id,
          patientId,
          action: "READ_PATIENT",
          resourceType: "patient_profile",
          detail: `${viewer.fullName} bemor kartasini ko'rdi`,
        });
        storage.save(db);
        json(res, 200, { patient: sanitizePatientView(db, patient, viewer) });
        return;
      }

      const consentMatch = url.pathname.match(/^\/api\/patients\/([^/]+)\/consents$/);
      if (req.method === "POST" && consentMatch) {
        const patientId = consentMatch[1];
        if (!(viewer.role === "patient" && viewer.patientId === patientId) && viewer.role !== "admin") {
          json(res, 403, { error: "Faqat bemor yoki admin ruxsat berishi mumkin" });
          return;
        }
        const body = await parseBody(req);
        const consent = {
          id: createId("consent"),
          patientId,
          doctorId: body.doctorId,
          scope: Array.isArray(body.scope) && body.scope.length ? body.scope : ["read"],
          expiresAt: body.expiresAt,
          status: "active",
          grantedAt: new Date().toISOString(),
        };
        db.consents.push(consent);
        storage.save(db);
        blockchain.appendBlock({
          type: "CONSENT_GRANTED",
          consentId: consent.id,
          patientId,
          doctorId: body.doctorId,
          consentHash: sha256(JSON.stringify(consent)),
        });
        json(res, 201, { consent });
        return;
      }

      const revokeConsentMatch = url.pathname.match(/^\/api\/consents\/([^/]+)\/revoke$/);
      if (req.method === "PATCH" && revokeConsentMatch) {
        const consentId = revokeConsentMatch[1];
        const consent = db.consents.find((item) => item.id === consentId);
        if (!consent) {
          json(res, 404, { error: "Consent topilmadi" });
          return;
        }
        if (!(viewer.role === "patient" && viewer.patientId === consent.patientId) && viewer.role !== "admin") {
          json(res, 403, { error: "Consentni bekor qilish huquqi yo'q" });
          return;
        }
        consent.status = "revoked";
        consent.revokedAt = new Date().toISOString();
        storage.save(db);
        blockchain.appendBlock({
          type: "CONSENT_REVOKED",
          consentId,
          patientId: consent.patientId,
          doctorId: consent.doctorId,
        });
        json(res, 200, { consent });
        return;
      }

      const recordsMatch = url.pathname.match(/^\/api\/patients\/([^/]+)\/records$/);
      if (req.method === "POST" && recordsMatch) {
        const patientId = recordsMatch[1];
        if (!hasPatientAccess(db, viewer, patientId, "write")) {
          json(res, 403, { error: "Yozuv qo'shish ruxsati yo'q" });
          return;
        }
        const body = await parseBody(req);
        const record = {
          id: createId("record"),
          patientId,
          doctorId: viewer.doctorId || body.doctorId || "unknown",
          type: body.type,
          title: body.title,
          diagnosis: body.diagnosis,
          treatment: body.treatment,
          notes: body.notes,
          createdAt: new Date().toISOString(),
        };
        db.records.unshift(record);
        logAccess(db, {
          actorId: viewer.id,
          patientId,
          action: "WRITE_RECORD",
          resourceType: "medical_record",
          detail: `${viewer.fullName} yangi tibbiy yozuv qo'shdi`,
        });
        storage.save(db);
        const block = blockchain.appendBlock({
          type: "MEDICAL_RECORD_ADDED",
          recordId: record.id,
          patientId,
          recordHash: sha256(JSON.stringify(record)),
        });
        json(res, 201, { record, block });
        return;
      }

      const auditMatch = url.pathname.match(/^\/api\/patients\/([^/]+)\/access-logs$/);
      if (req.method === "GET" && auditMatch) {
        const patientId = auditMatch[1];
        if (!hasPatientAccess(db, viewer, patientId, "read")) {
          json(res, 403, { error: "Audit loglarni ko'rish ruxsati yo'q" });
          return;
        }
        const logs = db.auditLogs.filter((item) => item.patientId === patientId);
        json(res, 200, { logs });
        return;
      }

      if (req.method === "GET" && url.pathname === "/api/doctors") {
        json(res, 200, { doctors: db.doctors });
        return;
      }

      const drugMatch = url.pathname.match(/^\/api\/drugs\/verify\/([^/]+)$/);
      if (req.method === "GET" && drugMatch) {
        const code = decodeURIComponent(drugMatch[1]);
        const batch = db.drugBatches.find((item) => item.batchCode === code);
        if (!batch) {
          json(res, 404, { verified: false, message: "Dori partiyasi topilmadi" });
          return;
        }
        const verificationPayload = {
          batchCode: batch.batchCode,
          drugName: batch.drugName,
          manufacturer: batch.manufacturer,
          expiryDate: batch.expiryDate,
        };
        const ledgerBlock = blockchain.verifyPayload({
          type: "DRUG_BATCH",
          batchHash: sha256(JSON.stringify(verificationPayload)),
        });
        json(res, 200, {
          verified: true,
          batch,
          ledgerBlock,
          fallbackMode: !ledgerBlock,
        });
        return;
      }

      if (req.method === "POST" && url.pathname === "/api/drugs/register") {
        if (!["admin", "doctor"].includes(viewer.role)) {
          json(res, 403, { error: "Dori ro'yxatga olish huquqi yo'q" });
          return;
        }
        const body = await parseBody(req);
        const batch = {
          id: createId("batch"),
          batchCode: body.batchCode,
          drugName: body.drugName,
          manufacturer: body.manufacturer,
          expiryDate: body.expiryDate,
          currentOwner: body.currentOwner,
          status: "verified",
          history: [
            {
              event: "registered",
              actor: viewer.fullName,
              timestamp: new Date().toISOString(),
            },
          ],
        };
        db.drugBatches.unshift(batch);
        storage.save(db);
        const verificationPayload = {
          batchCode: batch.batchCode,
          drugName: batch.drugName,
          manufacturer: batch.manufacturer,
          expiryDate: batch.expiryDate,
        };
        const block = blockchain.appendBlock({
          type: "DRUG_BATCH",
          batchId: batch.id,
          batchHash: sha256(JSON.stringify(verificationPayload)),
        });
        json(res, 201, { batch, block });
        return;
      }

      if (req.method === "GET" && url.pathname === "/api/blockchain/ledger") {
        json(res, 200, blockchain.readLedger());
        return;
      }

      json(res, 404, { error: "API endpoint topilmadi" });
    } catch (error) {
      json(res, 500, { error: error.message || "Server xatosi" });
    }
  }

  return { handle };
}

module.exports = { createApp };
