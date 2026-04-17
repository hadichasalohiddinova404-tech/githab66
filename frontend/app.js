const state = {
  token: localStorage.getItem("token") || "",
  user: JSON.parse(localStorage.getItem("user") || "null"),
  selectedPatientId: null,
};

const loginCard = document.getElementById("loginCard");
const dashboard = document.getElementById("dashboard");
const loginForm = document.getElementById("loginForm");
const loginMessage = document.getElementById("loginMessage");
const statsGrid = document.getElementById("statsGrid");
const patientsList = document.getElementById("patientsList");
const ledgerList = document.getElementById("ledgerList");
const patientForm = document.getElementById("patientForm");
const patientMessage = document.getElementById("patientMessage");
const patientDetail = document.getElementById("patientDetail");
const welcomeTitle = document.getElementById("welcomeTitle");
const logoutBtn = document.getElementById("logoutBtn");
const refreshPatientsBtn = document.getElementById("refreshPatientsBtn");
const drugVerifyForm = document.getElementById("drugVerifyForm");
const drugRegisterForm = document.getElementById("drugRegisterForm");
const drugResult = document.getElementById("drugResult");
const patientCardTemplate = document.getElementById("patientCardTemplate");

async function api(path, options = {}) {
  const response = await fetch(path, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(state.token ? { Authorization: `Bearer ${state.token}` } : {}),
      ...(options.headers || {}),
    },
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "So'rov bajarilmadi");
  return data;
}

function setMessage(node, text, isError = false) {
  node.textContent = text || "";
  node.classList.toggle("error", Boolean(isError));
}

function setAuth(user, token) {
  state.user = user;
  state.token = token;
  if (user && token) {
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));
  } else {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  }
  renderAuth();
}

function renderAuth() {
  const authenticated = Boolean(state.token && state.user);
  loginCard.classList.toggle("hidden", authenticated);
  dashboard.classList.toggle("hidden", !authenticated);
  if (authenticated) {
    welcomeTitle.textContent = `${state.user.fullName} (${state.user.role})`;
    loadDashboard();
  }
}

function renderStats(counts) {
  const entries = [
    ["Bemorlar", counts.patients],
    ["Shifokorlar", counts.doctors],
    ["Yozuvlar", counts.records],
    ["Active consent", counts.consents],
    ["Dori batch", counts.drugBatches],
  ];
  statsGrid.innerHTML = entries
    .map(
      ([label, value]) => `
        <article class="stat-card">
          <span>${label}</span>
          <strong>${value}</strong>
        </article>
      `
    )
    .join("");
}

function renderPatients(patients) {
  patientsList.innerHTML = "";
  patients.forEach((patient) => {
    const node = patientCardTemplate.content.firstElementChild.cloneNode(true);
    node.querySelector("[data-name]").textContent = patient.fullName;
    node.querySelector("[data-meta]").textContent = `${patient.phone || "Telefon yo'q"} • ${patient.birthDate}`;
    node.querySelector("[data-id]").textContent = patient.id;
    node.addEventListener("click", () => {
      state.selectedPatientId = patient.id;
      loadPatientDetail(patient.id);
    });
    patientsList.appendChild(node);
  });
}

function renderLedger(blocks) {
  ledgerList.innerHTML = blocks
    .map(
      (block) => `
        <article class="list-item">
          <strong>${block.payload.type}</strong>
          <p>${block.id}</p>
          <p>${new Date(block.createdAt).toLocaleString()}</p>
        </article>
      `
    )
    .join("");
}

function renderPatientDetail(patient) {
  const recordCards = patient.records
    .map(
      (record) => `
        <article class="detail-section">
          <h4>${record.title}</h4>
          <p><strong>Turi:</strong> ${record.type}</p>
          <p><strong>Tashxis:</strong> ${record.diagnosis || "-"}</p>
          <p><strong>Davolanish:</strong> ${record.treatment || "-"}</p>
          <p><strong>Izoh:</strong> ${record.notes || "-"}</p>
          <p><strong>Sana:</strong> ${new Date(record.createdAt).toLocaleString()}</p>
        </article>
      `
    )
    .join("");

  const consentCards = patient.consents
    .map(
      (consent) => `
        <article class="detail-section">
          <h4>Consent ${consent.id}</h4>
          <p><strong>Doctor:</strong> ${consent.doctorId}</p>
          <p><strong>Holat:</strong> ${consent.status}</p>
          <div class="pill-row">${consent.scope.map((item) => `<span class="pill">${item}</span>`).join("")}</div>
          <p><strong>Muddat:</strong> ${new Date(consent.expiresAt).toLocaleString()}</p>
          ${
            state.user.role === "patient" || state.user.role === "admin"
              ? `<button onclick="revokeConsent('${consent.id}')">Consentni bekor qilish</button>`
              : ""
          }
        </article>
      `
    )
    .join("");

  const accessCards = patient.accessLogs
    .map(
      (log) => `
        <article class="detail-section">
          <h4>${log.action}</h4>
          <p><strong>Actor:</strong> ${log.actorId}</p>
          <p><strong>Resurs:</strong> ${log.resourceType}</p>
          <p>${log.detail}</p>
          <p><strong>Vaqt:</strong> ${new Date(log.createdAt).toLocaleString()}</p>
        </article>
      `
    )
    .join("");

  patientDetail.innerHTML = `
    <section class="detail-section">
      <h4>${patient.fullName}</h4>
      <p><strong>PINFL:</strong> ${patient.pinfl}</p>
      <p><strong>Telefon:</strong> ${patient.phone}</p>
      <p><strong>Manzil:</strong> ${patient.address}</p>
      <p><strong>Qon guruhi:</strong> ${patient.bloodGroup}</p>
      <p><strong>Emergency contact:</strong> ${patient.emergencyContact}</p>
    </section>

    <section class="detail-section">
      <h4>Yangi tashxis yoki davolanish qo'shish</h4>
      <form id="recordForm" class="form-grid">
        <label>Turi
          <select name="type">
            <option value="diagnosis">Diagnosis</option>
            <option value="treatment">Treatment</option>
            <option value="analysis">Analysis</option>
          </select>
        </label>
        <label>Sarlavha <input name="title" value="Yangi ko'rik" required /></label>
        <label>Tashxis <input name="diagnosis" value="Nazorat tashxisi" /></label>
        <label>Davolanish <input name="treatment" value="Vitamin terapiya" /></label>
        <label>Izoh <textarea name="notes">Holat kuzatuvga olindi</textarea></label>
        <button type="submit">Yozuv qo'shish</button>
      </form>
      <p id="recordMessage" class="message"></p>
    </section>

    <section class="detail-section">
      <h4>Doctor access berish</h4>
      <form id="consentForm" class="form-grid">
        <label>Doctor ID <input name="doctorId" value="doctor_1" required /></label>
        <label>Muddat <input type="datetime-local" name="expiresAt" required /></label>
        <label>Scope
          <select name="scope">
            <option value="read">read</option>
            <option value="read,write">read + write</option>
          </select>
        </label>
        <button type="submit">Consent berish</button>
      </form>
      <p id="consentMessage" class="message"></p>
    </section>

    <section class="detail-section">
      <h4>Tibbiy yozuvlar</h4>
      ${recordCards || "<p>Hozircha yozuv yo'q</p>"}
    </section>

    <section class="detail-section">
      <h4>Consentlar</h4>
      ${consentCards || "<p>Consent yo'q</p>"}
    </section>

    <section class="detail-section">
      <h4>Audit loglar</h4>
      ${accessCards || "<p>Audit event yo'q</p>"}
    </section>
  `;

  const recordForm = document.getElementById("recordForm");
  const consentForm = document.getElementById("consentForm");
  const recordMessage = document.getElementById("recordMessage");
  const consentMessage = document.getElementById("consentMessage");

  recordForm?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const form = new FormData(recordForm);
    try {
      await api(`/api/patients/${patient.id}/records`, {
        method: "POST",
        body: JSON.stringify(Object.fromEntries(form.entries())),
      });
      setMessage(recordMessage, "Yangi record qo'shildi");
      loadPatientDetail(patient.id);
      loadDashboard();
    } catch (error) {
      setMessage(recordMessage, error.message, true);
    }
  });

  consentForm?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const form = new FormData(consentForm);
    const values = Object.fromEntries(form.entries());
    try {
      await api(`/api/patients/${patient.id}/consents`, {
        method: "POST",
        body: JSON.stringify({
          doctorId: values.doctorId,
          expiresAt: new Date(values.expiresAt).toISOString(),
          scope: values.scope.split(","),
        }),
      });
      setMessage(consentMessage, "Consent saqlandi");
      loadPatientDetail(patient.id);
      loadDashboard();
    } catch (error) {
      setMessage(consentMessage, error.message, true);
    }
  });
}

async function loadDashboard() {
  try {
    const data = await api("/api/dashboard");
    renderStats(data.counts);
    renderPatients(data.accessiblePatients);
    renderLedger(data.latestBlocks);
    if (state.selectedPatientId) loadPatientDetail(state.selectedPatientId);
  } catch (error) {
    setMessage(loginMessage, error.message, true);
  }
}

async function loadPatientDetail(patientId) {
  try {
    const data = await api(`/api/patients/${patientId}`);
    renderPatientDetail(data.patient);
  } catch (error) {
    patientDetail.textContent = error.message;
  }
}

async function revokeConsent(consentId) {
  try {
    await api(`/api/consents/${consentId}/revoke`, { method: "PATCH" });
    if (state.selectedPatientId) {
      loadPatientDetail(state.selectedPatientId);
      loadDashboard();
    }
  } catch (error) {
    alert(error.message);
  }
}

window.revokeConsent = revokeConsent;

loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const formData = new FormData(loginForm);
  try {
    const data = await api("/api/auth/login", {
      method: "POST",
      body: JSON.stringify(Object.fromEntries(formData.entries())),
    });
    setAuth(data.user, data.token);
    setMessage(loginMessage, "");
  } catch (error) {
    setMessage(loginMessage, error.message, true);
  }
});

logoutBtn.addEventListener("click", () => {
  state.selectedPatientId = null;
  setAuth(null, "");
});

refreshPatientsBtn.addEventListener("click", loadDashboard);

patientForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const formData = new FormData(patientForm);
  try {
    await api("/api/patients", {
      method: "POST",
      body: JSON.stringify(Object.fromEntries(formData.entries())),
    });
    setMessage(patientMessage, "Bemor muvaffaqiyatli yaratildi");
    patientForm.reset();
    loadDashboard();
  } catch (error) {
    setMessage(patientMessage, error.message, true);
  }
});

drugVerifyForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const formData = new FormData(drugVerifyForm);
  try {
    const data = await api(`/api/drugs/verify/${encodeURIComponent(formData.get("batchCode"))}`);
    drugResult.textContent = JSON.stringify(data, null, 2);
  } catch (error) {
    drugResult.textContent = error.message;
  }
});

drugRegisterForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const formData = new FormData(drugRegisterForm);
  try {
    const data = await api("/api/drugs/register", {
      method: "POST",
      body: JSON.stringify(Object.fromEntries(formData.entries())),
    });
    drugResult.textContent = JSON.stringify(data, null, 2);
    loadDashboard();
  } catch (error) {
    drugResult.textContent = error.message;
  }
});

renderAuth();
