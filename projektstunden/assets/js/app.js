const CURRENT_USER = {
  name: "Max Mustermann",
  id: "01337",
  department: "Netzplanung"
};

const STORAGE_KEYS = {
  entries: "project-hours-mockup-entries",
  favorites: "project-hours-mockup-favorites",
  workPlan: "project-hours-mockup-work-plan",
  manualFreeDays: "project-hours-mockup-manual-free-days",
  theme: "project-hours-mockup-theme"
};

const FAVORITE_COLORS = [
  "#D8EAFE", "#CFF2E1", "#FFE9C7", "#FFD8E2",
  "#E4DBFF", "#FFE2F0", "#D7F0FF", "#FEE6C6",
  "#E5F7C8", "#DDE6FF", "#FFDACC", "#D6F3ED",
  "#E8E1D4", "#F6D8FF", "#E2F1DA", "#F6E6B8"
];

const FAVORITE_ICONS = [
  { id: "bolt", className: "fa-solid fa-bolt", label: "Energie" },
  { id: "flame", className: "fa-solid fa-fire-flame-curved", label: "Wärme" },
  { id: "temperature", className: "fa-solid fa-temperature-half", label: "Temperatur" },
  { id: "gauge", className: "fa-solid fa-gauge-high", label: "Lastgang" },
  { id: "network", className: "fa-solid fa-network-wired", label: "Wärmenetz" },
  { id: "diagram", className: "fa-solid fa-diagram-project", label: "Netzstruktur" },
  { id: "industry", className: "fa-solid fa-industry", label: "Anlage" },
  { id: "fan", className: "fa-solid fa-fan", label: "Technik" },
  { id: "house-heat", className: "fa-solid fa-house-chimney", label: "Hausanschluss" },
  { id: "water", className: "fa-solid fa-droplet", label: "Medium" },
  { id: "pipe", className: "fa-solid fa-trowel", label: "Leitungsbau" },
  { id: "leaf", className: "fa-solid fa-leaf", label: "Nachhaltig" },
  { id: "star", className: "fa-solid fa-star", label: "Stern" },
  { id: "pin", className: "fa-solid fa-thumbtack", label: "Pin" },
  { id: "compass", className: "fa-regular fa-compass", label: "Kompass" },
  { id: "wrench", className: "fa-solid fa-screwdriver-wrench", label: "Werkzeug" },
  { id: "chart", className: "fa-solid fa-chart-column", label: "Chart" },
  { id: "folder", className: "fa-regular fa-folder-open", label: "Ordner" },
  { id: "flag", className: "fa-regular fa-flag", label: "Flagge" },
  { id: "check", className: "fa-solid fa-check", label: "Check" }
];

const LEGACY_FAVORITE_ICON_MAP = {
  "⭐": "star",
  "📌": "pin",
  "🧭": "compass",
  "🛠️": "wrench",
  "📊": "chart",
  "🗂️": "folder",
  "🚩": "flag",
  "✅": "check"
};

const FALLBACK_MASTERDATA = {
  locations: [
    {
      name: "Buttenwiesen",
      costCenters: [
        { id: "BW-RW", name: "Renergiewerke Buttenwiesen", category: "RW" },
        { id: "BW-BA1", name: "Buttenwiesen Bauabschnitt 1", category: "BA" },
        { id: "BW-OA", name: "Buttenwiesen Allgemein", category: "OA" }
      ]
    },
    {
      name: "Wittislingen",
      costCenters: [
        { id: "WI-RW", name: "Renergiewerke Wittislingen", category: "RW" },
        { id: "WI-BA1", name: "Wittislingen Bauabschnitt 1", category: "BA" },
        { id: "WI-OA", name: "Wittislingen Allgemein", category: "OA" }
      ]
    },
    {
      name: "Zöschingen",
      costCenters: [
        { id: "ZO-RW", name: "Renergiewerke Zöschingen", category: "RW" },
        { id: "ZO-BA1", name: "Zöschingen Bauabschnitt 1", category: "BA" },
        { id: "ZO-OA", name: "Zöschingen Allgemein", category: "OA" }
      ]
    },
    {
      name: "Holzheim",
      costCenters: [
        { id: "HO-RW", name: "Renergiewerke Holzheim", category: "RW" },
        { id: "HO-BA1", name: "Holzheim Bauabschnitt 1", category: "BA" },
        { id: "HO-OA", name: "Holzheim Allgemein", category: "OA" }
      ]
    },
    {
      name: "Nordendorf",
      costCenters: [
        { id: "NO-RW", name: "Renergiewerke Nordendorf", category: "RW" },
        { id: "NO-BA1", name: "Nordendorf Bauabschnitt 1", category: "BA" },
        { id: "NO-OA", name: "Nordendorf Allgemein", category: "OA" }
      ]
    }
  ]
};

const FALLBACK_RULES = {
  baureifeWhitelist: ["Buttenwiesen", "Wittislingen", "Zöschingen", "Holzheim"],
  rules: [
    {
      severity: "warning",
      commentRequired: true,
      blocking: false,
      trigger: {
        departments: ["Netzplanung"],
        costCenterCategory: "RW"
      },
      message: "Mitarbeiter der Abteilung <strong><Abteilung></strong> dürfen in aller Regel nicht auf <strong>Renergiewerke</strong> buchen. Falls du denkst, dass es sich um eine begründete Ausnahme handelt, beschreibe dies bitte im Kommentar."
    },
    {
      severity: "error",
      commentRequired: false,
      blocking: true,
      trigger: {
        costCenterCategory: "BA",
        locationNotInWhitelist: "baureifeWhitelist"
      },
      message: "Das Projekt <strong><Ort></strong> hat noch nicht die Baureife erreicht, daher darf nicht auf <strong>Bauabschnitte</strong> gebucht werden. Buche stattdessen auf <strong><Ort> Allgemein</strong>. Wenn es sich hierbei um einen Fehler handelt, melde dies bitte dem BU-Controlling."
    }
  ]
};

const state = {
  masterData: { locations: [] },
  rulesConfig: { rules: [], baureifeWhitelist: [] },
  selectedDate: toIsoDate(new Date()),
  calendarMonth: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
  entries: loadFromStorage(STORAGE_KEYS.entries, []),
  favorites: loadFromStorage(STORAGE_KEYS.favorites, []),
  workPlan: loadFromStorage(STORAGE_KEYS.workPlan, ""),
  manualFreeDays: loadFromStorage(STORAGE_KEYS.manualFreeDays, []),
  theme: loadFromStorage(STORAGE_KEYS.theme, "light"),
  editingEntryId: null,
  activeRule: null,
  activeFavoriteColorTargetId: null,
  pendingDuplicateResolution: null,
  undoDeletedEntry: null,
  undoDeleteTimerId: null
};

const dom = {};

document.addEventListener("DOMContentLoaded", init);

async function init() {
  cacheDom();
  applyTheme(state.theme);
  fillUserHeader();
  registerEvents();

  const [masterData, rulesConfig] = await Promise.all([
    fetchMasterDataCsvOrFallback("./data/masterdata.csv", FALLBACK_MASTERDATA),
    fetchJsonOrFallback("./data/rules.json", FALLBACK_RULES)
  ]);

  state.masterData = masterData;
  state.rulesConfig = rulesConfig;

  populateLocationSelect();
  initializeReportRange();
  dom.workPlanInput.value = state.workPlan || "";
  renderAll();
}

function cacheDom() {
  dom.selectedDateLabel = document.getElementById("selectedDateLabel");
  dom.dayTotalHours = document.getElementById("dayTotalHours");
  dom.monthTotalHours = document.getElementById("monthTotalHours");
  dom.locationSelect = document.getElementById("locationSelect");
  dom.costCenterSelect = document.getElementById("costCenterSelect");
  dom.hoursInput = document.getElementById("hoursInput");
  dom.hoursQuickChips = document.getElementById("hoursQuickChips");
  dom.commentInput = document.getElementById("commentInput");
  dom.commentSuggestionBox = document.getElementById("commentSuggestionBox");
  dom.commentRequirementTag = document.getElementById("commentRequirementTag");
  dom.submitBtn = document.getElementById("submitBtn");
  dom.copyPreviousDayBtn = document.getElementById("copyPreviousDayBtn");
  dom.cancelEditBtn = document.getElementById("cancelEditBtn");
  dom.ruleBanner = document.getElementById("ruleBanner");
  dom.favoriteQuickList = document.getElementById("favoriteQuickList");
  dom.logForm = document.getElementById("logForm");
  dom.entryList = document.getElementById("entryList");
  dom.calendarGrid = document.getElementById("calendarGrid");
  dom.calendarQualityInline = document.getElementById("calendarQualityInline");
  dom.calendarMonthLabel = document.getElementById("calendarMonthLabel");
  dom.prevMonthBtn = document.getElementById("prevMonthBtn");
  dom.nextMonthBtn = document.getElementById("nextMonthBtn");
  dom.goTodayBtn = document.getElementById("goTodayBtn");

  dom.openFavoritesBtn = document.getElementById("openFavoritesBtn");
  dom.saveFavoriteBtn = document.getElementById("saveFavoriteBtn");
  dom.saveFavoriteFromPopoverBtn = document.getElementById("saveFavoriteFromPopoverBtn");
  dom.favoritesPopover = document.getElementById("favoritesPopover");
  dom.favoritesList = document.getElementById("favoritesList");
  dom.favoriteSuggestionsList = document.getElementById("favoriteSuggestionsList");
  dom.favoriteColorPicker = document.getElementById("favoriteColorPicker");

  dom.duplicateEntryPopover = document.getElementById("duplicateEntryPopover");
  dom.combineDuplicateEntryBtn = document.getElementById("combineDuplicateEntryBtn");
  dom.discardDuplicateEntryBtn = document.getElementById("discardDuplicateEntryBtn");
  dom.dismissDuplicateEntryBtn = document.getElementById("dismissDuplicateEntryBtn");

  dom.userProfileTrigger = document.getElementById("userProfileTrigger");
  dom.settingsPopover = document.getElementById("settingsPopover");
  dom.exportSettingsBtn = document.getElementById("exportSettingsBtn");
  dom.importSettingsBtn = document.getElementById("importSettingsBtn");
  dom.settingsImportInput = document.getElementById("settingsImportInput");
  dom.exportEntriesDebugBtn = document.getElementById("exportEntriesDebugBtn");
  dom.importEntriesDebugBtn = document.getElementById("importEntriesDebugBtn");
  dom.entriesImportInput = document.getElementById("entriesImportInput");
  dom.seedMockupEntriesBtn = document.getElementById("seedMockupEntriesBtn");
  dom.clearMockupStorageBtn = document.getElementById("clearMockupStorageBtn");

  dom.openReportBtn = document.getElementById("openReportBtn");
  dom.themeToggleSwitch = document.getElementById("themeToggleSwitch");
  dom.reportPopover = document.getElementById("reportPopover");
  dom.reportStartMonth = document.getElementById("reportStartMonth");
  dom.reportEndMonth = document.getElementById("reportEndMonth");
  dom.reportPreview = document.getElementById("reportPreview");
  dom.downloadCsvBtn = document.getElementById("downloadCsvBtn");
  dom.downloadXlsxBtn = document.getElementById("downloadXlsxBtn");
  dom.reportQualitySummary = document.getElementById("reportQualitySummary");

  dom.workPlanInput = document.getElementById("workPlanInput");
  dom.saveWorkPlanBtn = document.getElementById("saveWorkPlanBtn");
  dom.workPlanStatus = document.getElementById("workPlanStatus");
  dom.qualityChart = document.getElementById("qualityChart");
  dom.qualityChartCenter = document.getElementById("qualityChartCenter");
  dom.qualityCompletenessChart = document.getElementById("qualityCompletenessChart");
  dom.qualityCompletenessCenter = document.getElementById("qualityCompletenessCenter");
  dom.qualityCompletenessLabel = document.getElementById("qualityCompletenessLabel");
  dom.qualityTargetHours = document.getElementById("qualityTargetHours");
  dom.qualityBookedHours = document.getElementById("qualityBookedHours");
  dom.qualityCoverage = document.getElementById("qualityCoverage");

  dom.calendarDayPopover = document.getElementById("calendarDayPopover");
  dom.undoToast = document.getElementById("undoToast");
  dom.undoToastMessage = document.getElementById("undoToastMessage");
  dom.undoDeleteBtn = document.getElementById("undoDeleteBtn");
  dom.dismissUndoBtn = document.getElementById("dismissUndoBtn");
}

function fillUserHeader() {
  document.getElementById("userName").textContent = CURRENT_USER.name;
  document.getElementById("userId").textContent = CURRENT_USER.id;
  document.getElementById("userDepartment").textContent = CURRENT_USER.department;

  const avatar = document.getElementById("userAvatar");
  if (avatar) {
    const initials = CURRENT_USER.name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0].toUpperCase())
      .join("");
    avatar.textContent = initials || "MM";
  }
}

function applyTheme(theme) {
  const normalizedTheme = theme === "dark" ? "dark" : "light";
  state.theme = normalizedTheme;
  document.documentElement.setAttribute("data-theme", normalizedTheme);
  saveToStorage(STORAGE_KEYS.theme, normalizedTheme);

  if (dom.themeToggleSwitch) {
    const isDark = normalizedTheme === "dark";
    dom.themeToggleSwitch.checked = isDark;
    dom.themeToggleSwitch.setAttribute("aria-label", isDark ? "Dark Mode aktiv" : "Light Mode aktiv");
  }
}

function registerEvents() {
  dom.locationSelect.addEventListener("change", onLocationChange);
  dom.costCenterSelect.addEventListener("change", onCostCenterChange);
  dom.logForm.addEventListener("submit", onSubmitEntry);
  dom.copyPreviousDayBtn.addEventListener("click", copyPreviousDayEntries);
  dom.cancelEditBtn.addEventListener("click", resetEditMode);

  dom.prevMonthBtn.addEventListener("click", () => {
    state.calendarMonth = new Date(state.calendarMonth.getFullYear(), state.calendarMonth.getMonth() - 1, 1);
    renderCalendar();
    renderQualityWidget();
  });

  dom.nextMonthBtn.addEventListener("click", () => {
    state.calendarMonth = new Date(state.calendarMonth.getFullYear(), state.calendarMonth.getMonth() + 1, 1);
    renderCalendar();
    renderQualityWidget();
  });

  dom.goTodayBtn.addEventListener("click", () => {
    const today = new Date();
    state.selectedDate = toIsoDate(today);
    state.calendarMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    resetEditMode();
    renderAll();
  });

  dom.openFavoritesBtn.addEventListener("click", () => openPopover(dom.favoritesPopover));
  dom.saveFavoriteBtn.addEventListener("click", () => saveCurrentSelectionAsFavorite());
  dom.saveFavoriteFromPopoverBtn.addEventListener("click", () => saveCurrentSelectionAsFavorite());
  dom.openReportBtn.addEventListener("click", () => {
    openPopover(dom.reportPopover);
    renderReportPreview();
  });
  dom.themeToggleSwitch.addEventListener("change", () => {
    applyTheme(dom.themeToggleSwitch.checked ? "dark" : "light");
  });
  dom.reportStartMonth.addEventListener("change", () => renderReportPreview());
  dom.reportEndMonth.addEventListener("change", () => renderReportPreview());
  dom.downloadCsvBtn.addEventListener("click", () => exportReport("csv"));
  dom.downloadXlsxBtn.addEventListener("click", () => exportReport("xlsx"));

  dom.saveWorkPlanBtn.addEventListener("click", saveWorkPlan);

  dom.userProfileTrigger.addEventListener("click", () => openPopover(dom.settingsPopover));
  dom.userProfileTrigger.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      openPopover(dom.settingsPopover);
    }
  });

  dom.exportSettingsBtn.addEventListener("click", exportSettingsJson);
  dom.importSettingsBtn.addEventListener("click", () => dom.settingsImportInput.click());
  dom.settingsImportInput.addEventListener("change", importSettingsJson);

  dom.exportEntriesDebugBtn.addEventListener("click", exportDebugEntriesJson);
  dom.importEntriesDebugBtn.addEventListener("click", () => dom.entriesImportInput.click());
  dom.entriesImportInput.addEventListener("change", importDebugEntriesJson);
  dom.seedMockupEntriesBtn.addEventListener("click", seedMockupEntries);
  dom.clearMockupStorageBtn.addEventListener("click", clearMockupStorage);

  dom.undoDeleteBtn.addEventListener("click", undoDeleteEntry);
  dom.dismissUndoBtn.addEventListener("click", dismissUndoToast);
  dom.combineDuplicateEntryBtn.addEventListener("click", combinePendingDuplicateEntry);
  dom.discardDuplicateEntryBtn.addEventListener("click", discardPendingDuplicateEntry);
  dom.dismissDuplicateEntryBtn.addEventListener("click", discardPendingDuplicateEntry);

  dom.commentInput.addEventListener("focus", () => renderCommentSuggestions());
  dom.commentInput.addEventListener("click", () => renderCommentSuggestions());
  dom.commentInput.addEventListener("input", () => renderCommentSuggestions());
  dom.commentInput.addEventListener("blur", () => {
    setTimeout(() => hideCommentSuggestions(), 120);
  });

  document.querySelectorAll("[data-close]").forEach((closeBtn) => {
    closeBtn.addEventListener("click", () => {
      const id = closeBtn.getAttribute("data-close");
      closePopover(document.getElementById(id));
    });
  });

  [dom.favoritesPopover, dom.reportPopover, dom.settingsPopover, dom.duplicateEntryPopover].forEach((popover) => {
    popover.addEventListener("click", (event) => {
      if (event.target === popover) {
        if (popover === dom.duplicateEntryPopover) {
          state.pendingDuplicateResolution = null;
        }
        closePopover(popover);
      }
    });
  });

  document.addEventListener("click", (event) => {
    if (!dom.favoriteColorPicker || dom.favoriteColorPicker.classList.contains("hidden")) {
      return;
    }

    const target = event.target;
    if (dom.favoriteColorPicker.contains(target)) {
      return;
    }

    if (target.closest("[data-fav-color-open]")) {
      return;
    }

    closeFavoriteColorPicker();
  });

  document.addEventListener("click", (event) => {
    if (!dom.commentSuggestionBox || dom.commentSuggestionBox.classList.contains("hidden")) {
      return;
    }

    if (event.target === dom.commentInput || dom.commentSuggestionBox.contains(event.target)) {
      return;
    }

    hideCommentSuggestions();
  });
}

function renderAll() {
  renderDateHeader();
  renderCalendar();
  renderEntries();
  renderHoursQuickChips();
  renderFavorites();
  evaluateRulesAndBanner();
  renderQualityWidget();
  renderReportPreview();
}

function populateLocationSelect() {
  dom.locationSelect.innerHTML = '<option value="">Bitte wählen</option>';
  for (const location of state.masterData.locations) {
    const option = document.createElement("option");
    option.value = location.name;
    option.textContent = location.name;
    dom.locationSelect.appendChild(option);
  }
}

function onLocationChange() {
  const location = dom.locationSelect.value;
  const costCenters = getCostCentersForLocation(location);

  dom.costCenterSelect.innerHTML = "";
  if (!location) {
    dom.costCenterSelect.disabled = true;
    dom.costCenterSelect.innerHTML = '<option value="">Bitte zuerst Ort wählen</option>';
  } else {
    dom.costCenterSelect.disabled = false;
    dom.costCenterSelect.appendChild(new Option("Bitte wählen", ""));
    for (const costCenter of costCenters) {
      dom.costCenterSelect.appendChild(new Option(costCenter.name, costCenter.id));
    }
  }

  evaluateRulesAndBanner();
}

function onCostCenterChange() {
  evaluateRulesAndBanner();
}

function getCostCentersForLocation(locationName) {
  const location = state.masterData.locations.find((entry) => entry.name === locationName);
  return location ? location.costCenters : [];
}

function getSelectedCostCenter() {
  const location = dom.locationSelect.value;
  const costCenterId = dom.costCenterSelect.value;
  if (!location || !costCenterId) {
    return null;
  }

  return getCostCentersForLocation(location).find((item) => item.id === costCenterId) || null;
}

function evaluateRulesAndBanner() {
  const location = dom.locationSelect.value;
  const costCenter = getSelectedCostCenter();

  if (!location || !costCenter) {
    state.activeRule = null;
    renderRuleBanner();
    setCommentRequirement(false);
    dom.submitBtn.disabled = false;
    return;
  }

  const matchedRules = state.rulesConfig.rules.filter((rule) => matchesRule(rule, location, costCenter));
  const priority = { error: 3, warning: 2, info: 1 };

  state.activeRule = matchedRules.sort((a, b) => (priority[b.severity] || 0) - (priority[a.severity] || 0))[0] || null;

  renderRuleBanner();
  const commentRequired = Boolean(state.activeRule?.commentRequired);
  setCommentRequirement(commentRequired);
  dom.submitBtn.disabled = Boolean(state.activeRule?.blocking);
}

function matchesRule(rule, location, costCenter) {
  const trigger = rule.trigger || {};

  if (trigger.departments) {
    if (!Array.isArray(trigger.departments) || !trigger.departments.includes(CURRENT_USER.department)) {
      return false;
    }
  } else if (trigger.department && trigger.department !== CURRENT_USER.department) {
    return false;
  }

  if (trigger.costCenterCategory && trigger.costCenterCategory !== costCenter.category) {
    return false;
  }

  if (trigger.locationNotInWhitelist) {
    const whitelist = state.rulesConfig[trigger.locationNotInWhitelist] || [];
    if (whitelist.includes(location)) {
      return false;
    }
  }

  return true;
}

function renderRuleBanner() {
  if (!state.activeRule) {
    dom.ruleBanner.className = "rule-banner hidden";
    dom.ruleBanner.innerHTML = "";
    return;
  }

  const message = interpolateRuleMessage(state.activeRule.message, {
    "<Abteilung>": escapeHtml(CURRENT_USER.department),
    "<Ort> Allgemein": `${escapeHtml(dom.locationSelect.value)} Allgemein`,
    "<Ort>": escapeHtml(dom.locationSelect.value)
  });

  dom.ruleBanner.className = `rule-banner ${normalizeSeverity(state.activeRule.severity)}`;
  dom.ruleBanner.innerHTML = sanitizeRuleMarkup(message);
}

function interpolateRuleMessage(message, replacements) {
  return Object.entries(replacements).reduce(
    (result, [key, value]) => result.replaceAll(key, value || ""),
    message || ""
  );
}

function escapeHtml(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function sanitizeRuleMarkup(value) {
  return String(value || "").replace(/<(?!\/?(strong|em|br)\b)[^>]*>/gi, "");
}

function normalizeSeverity(severity) {
  const value = String(severity || "info").toLowerCase();
  return value === "error" || value === "warning" || value === "info" ? value : "info";
}

function setCommentRequirement(required) {
  dom.commentInput.required = required;
  dom.commentRequirementTag.className = `tag ${required ? "required" : "optional"}`;
  dom.commentRequirementTag.textContent = required ? "Pflicht" : "Optional";
}

function onSubmitEntry(event) {
  event.preventDefault();

  const location = dom.locationSelect.value;
  const costCenter = getSelectedCostCenter();
  const rawHours = dom.hoursInput.value;
  const comment = dom.commentInput.value.trim();

  if (!location || !costCenter) {
    alert("Bitte Ort und Kostenträger wählen.");
    return;
  }

  if (state.activeRule?.blocking) {
    alert("Für diese Kombination ist keine Buchung möglich.");
    return;
  }

  const hours = parseHours(rawHours);
  if (!hours.valid) {
    alert("Bitte gib gültige Stunden ein (z. B. 8 oder 7,5).");
    return;
  }

  if (state.activeRule?.commentRequired && !comment) {
    alert("Für diese Buchung ist ein Kommentar verpflichtend.");
    return;
  }

  const payload = {
    id: state.editingEntryId || createId(),
    date: state.selectedDate,
    location,
    costCenterId: costCenter.id,
    costCenterName: costCenter.name,
    costCenterCategory: costCenter.category,
    hoursValue: hours.value,
    hoursStored: hours.stored,
    comment,
    updatedAt: new Date().toISOString()
  };

  const duplicateEntry = findDuplicateEntryForPayload(payload);
  if (duplicateEntry) {
    state.pendingDuplicateResolution = {
      payload,
      duplicateEntryId: duplicateEntry.id
    };
    openPopover(dom.duplicateEntryPopover);
    return;
  }

  persistEntryPayload(payload);
}

function findDuplicateEntryForPayload(payload) {
  return state.entries.find((entry) => (
    entry.date === payload.date
    && entry.location === payload.location
    && entry.costCenterId === payload.costCenterId
    && entry.id !== payload.id
  ));
}

function persistEntryPayload(payload) {
  if (state.editingEntryId) {
    state.entries = state.entries.map((entry) => (entry.id === state.editingEntryId ? payload : entry));
  } else {
    state.entries.push(payload);
  }

  saveToStorage(STORAGE_KEYS.entries, state.entries);
  dom.hoursInput.value = "";
  dom.commentInput.value = "";
  hideCommentSuggestions();
  resetEditMode();
  renderAll();
}

function combinePendingDuplicateEntry() {
  if (!state.pendingDuplicateResolution) {
    closePopover(dom.duplicateEntryPopover);
    return;
  }

  const { payload, duplicateEntryId } = state.pendingDuplicateResolution;
  const target = state.entries.find((entry) => entry.id === duplicateEntryId);
  if (!target) {
    state.pendingDuplicateResolution = null;
    closePopover(dom.duplicateEntryPopover);
    return;
  }

  const mergedComment = mergeComments(target.comment, payload.comment);
  const mergedHours = Number(target.hoursValue || 0) + Number(payload.hoursValue || 0);

  state.entries = state.entries
    .filter((entry) => entry.id !== payload.id && entry.id !== target.id)
    .concat({
      ...target,
      hoursValue: mergedHours,
      hoursStored: formatHours(mergedHours),
      comment: mergedComment,
      updatedAt: new Date().toISOString()
    });

  saveToStorage(STORAGE_KEYS.entries, state.entries);
  state.pendingDuplicateResolution = null;
  closePopover(dom.duplicateEntryPopover);
  dom.hoursInput.value = "";
  dom.commentInput.value = "";
  hideCommentSuggestions();
  resetEditMode();
  renderAll();
}

function discardPendingDuplicateEntry() {
  state.pendingDuplicateResolution = null;
  closePopover(dom.duplicateEntryPopover);
}

function mergeComments(left, right) {
  const leftValue = String(left || "").trim();
  const rightValue = String(right || "").trim();

  if (!leftValue) {
    return rightValue;
  }
  if (!rightValue || leftValue === rightValue) {
    return leftValue;
  }

  return `${leftValue} | ${rightValue}`;
}

function renderEntries() {
  const dayEntries = getEntriesForDate(state.selectedDate);

  if (!dayEntries.length) {
    dom.entryList.innerHTML = '<div class="notice-empty">Für diesen Tag sind noch keine Stunden gebucht.</div>';
    return;
  }

  dom.entryList.innerHTML = dayEntries
    .map((entry) => {
      const advisories = getEntryAdvisories(entry)
        .map((advisory) => `<div class="entry-inline-banner ${normalizeSeverity(advisory.severity)}">${sanitizeRuleMarkup(advisory.message)}</div>`)
        .join("");

      return `
        <article class="entry-card">
          <div class="entry-card-head">
            <div>
              <strong>${escapeHtml(entry.location)}</strong>
              <div class="muted">${escapeHtml(entry.costCenterName)}</div>
            </div>
            <span class="hours-badge">${escapeHtml(entry.hoursStored)} h</span>
          </div>
          <div class="entry-comment">${entry.comment ? escapeHtml(entry.comment) : "Kein Kommentar"}</div>
          ${advisories}
          <div class="entry-actions">
            <button type="button" class="btn btn-secondary" data-action="edit" data-id="${entry.id}">Bearbeiten</button>
            <button type="button" class="btn btn-ghost" data-action="delete" data-id="${entry.id}">Löschen</button>
          </div>
        </article>
      `;
    })
    .join("");

  dom.entryList.querySelectorAll("button[data-action='edit']").forEach((btn) => {
    btn.addEventListener("click", () => startEdit(btn.dataset.id));
  });

  dom.entryList.querySelectorAll("button[data-action='delete']").forEach((btn) => {
    btn.addEventListener("click", () => deleteEntry(btn.dataset.id));
  });
}

function startEdit(entryId) {
  const entry = state.entries.find((item) => item.id === entryId);
  if (!entry) {
    return;
  }

  state.editingEntryId = entryId;
  dom.locationSelect.value = entry.location;
  onLocationChange();
  dom.costCenterSelect.value = entry.costCenterId;
  onCostCenterChange();
  dom.hoursInput.value = entry.hoursStored;
  dom.commentInput.value = entry.comment || "";

  dom.submitBtn.textContent = "Änderung speichern";
  dom.cancelEditBtn.classList.remove("hidden");
}

function resetEditMode() {
  state.editingEntryId = null;
  dom.submitBtn.textContent = "Hinzufügen";
  dom.cancelEditBtn.classList.add("hidden");
}

function deleteEntry(entryId) {
  const confirmed = confirm("Diesen Eintrag wirklich löschen?");
  if (!confirmed) {
    return;
  }

  const deletedEntry = state.entries.find((entry) => entry.id === entryId);

  state.entries = state.entries.filter((entry) => entry.id !== entryId);
  saveToStorage(STORAGE_KEYS.entries, state.entries);
  if (state.editingEntryId === entryId) {
    resetEditMode();
  }
  renderAll();

  if (deletedEntry) {
    showUndoToast(deletedEntry);
  }
}

function renderDateHeader() {
  const selectedDateObj = fromIsoDate(state.selectedDate);
  dom.selectedDateLabel.textContent = selectedDateObj.toLocaleDateString("de-DE", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric"
  });

  const dayTotal = getEntriesForDate(state.selectedDate).reduce((sum, entry) => sum + Number(entry.hoursValue), 0);

  const monthEntries = state.entries.filter((entry) => {
    const date = fromIsoDate(entry.date);
    return (
      date.getFullYear() === selectedDateObj.getFullYear() &&
      date.getMonth() === selectedDateObj.getMonth()
    );
  });

  const monthTotal = monthEntries.reduce((sum, entry) => sum + Number(entry.hoursValue), 0);
  dom.dayTotalHours.textContent = formatHours(dayTotal);
  dom.monthTotalHours.textContent = formatHours(monthTotal);
}

function renderCalendar() {
  const year = state.calendarMonth.getFullYear();
  const month = state.calendarMonth.getMonth();
  dom.calendarMonthLabel.textContent = state.calendarMonth.toLocaleDateString("de-DE", {
    month: "long",
    year: "numeric"
  });

  const firstDayOffset = (new Date(year, month, 1).getDay() + 6) % 7;
  const startDate = new Date(year, month, 1 - firstDayOffset);
  const visibleCells = 42;

  dom.calendarGrid.innerHTML = "";

  for (let index = 0; index < visibleCells; index += 1) {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + index);

    const iso = toIsoDate(date);
    const isToday = iso === toIsoDate(new Date());
    const isSelected = iso === state.selectedDate;
    const hasEntries = getEntriesForDate(iso).length > 0;
    const isOutsideMonth = date.getMonth() !== month;
    const isPlanFree = isPlanFreeDay(date);
    const isManualFree = isManualFreeDay(iso);
    const isFreeDay = isPlanFree || isManualFree;
    const daySummary = buildCalendarDaySummary(date, iso);

    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = `day-cell${isToday ? " today" : ""}${isSelected ? " selected" : ""}${isOutsideMonth ? " outside-month" : ""}${isFreeDay ? " free-day" : ""}${isManualFree ? " manual-free" : ""}`;
    btn.innerHTML = `<span>${date.getDate()}</span><i class="dot ${hasEntries ? "dot-green" : "dot-gray"}"></i>`;
    btn.setAttribute("aria-label", buildCalendarDayAria(daySummary));
    btn.addEventListener("click", () => {
      state.selectedDate = iso;
      state.calendarMonth = new Date(date.getFullYear(), date.getMonth(), 1);
      resetEditMode();
      renderAll();
    });

    btn.addEventListener("contextmenu", (event) => {
      event.preventDefault();
      toggleManualFreeDay(iso);
    });

    btn.addEventListener("mouseenter", () => showCalendarDayPopover(daySummary, btn));
    btn.addEventListener("mouseleave", hideCalendarDayPopover);
    btn.addEventListener("focus", () => showCalendarDayPopover(daySummary, btn));
    btn.addEventListener("blur", hideCalendarDayPopover);

    dom.calendarGrid.appendChild(btn);
  }
}

function toggleManualFreeDay(isoDate) {
  if (state.manualFreeDays.includes(isoDate)) {
    state.manualFreeDays = state.manualFreeDays.filter((entry) => entry !== isoDate);
  } else {
    state.manualFreeDays.push(isoDate);
  }

  saveToStorage(STORAGE_KEYS.manualFreeDays, state.manualFreeDays);
  renderCalendar();
  renderQualityWidget();
  renderReportPreview();
}

function isManualFreeDay(isoDate) {
  return state.manualFreeDays.includes(isoDate);
}

function isPlanFreeDay(dateObj) {
  const workPlan = getCurrentWorkPlanHours();
  if (!workPlan) {
    return false;
  }

  const weekDayIndex = (dateObj.getDay() + 6) % 7;
  return Number(workPlan[weekDayIndex] || 0) === 0;
}

function getPlannedHoursForDate(dateObj, isoDate) {
  const workPlan = getCurrentWorkPlanHours();
  if (!workPlan) {
    return null;
  }

  if (isManualFreeDay(isoDate)) {
    return 0;
  }

  const weekDayIndex = (dateObj.getDay() + 6) % 7;
  return Number(workPlan[weekDayIndex] || 0);
}

function buildCalendarDaySummary(dateObj, isoDate) {
  const dateLabel = dateObj.toLocaleDateString("de-DE", {
    weekday: "long",
    day: "2-digit",
    month: "2-digit"
  });

  const entries = getEntriesForDate(isoDate);
  const totalHours = entries.reduce((sum, entry) => sum + Number(entry.hoursValue), 0);

  const byLocation = new Map();
  for (const entry of entries) {
    byLocation.set(entry.location, (byLocation.get(entry.location) || 0) + Number(entry.hoursValue));
  }

  const locationLines = [...byLocation.entries()]
    .sort((a, b) => a[0].localeCompare(b[0], "de"))
    .map(([location, hours]) => ({ location, hours }));

  const plannedHours = getPlannedHoursForDate(dateObj, isoDate);

  return {
    dateLabel,
    locations: locationLines,
    totalHours,
    plannedHours
  };
}

function buildCalendarDayAria(summary) {
  const locationPart = summary.locations.length
    ? summary.locations.map((item) => `${item.location}: ${formatHours(item.hours)} Stunden`).join(", ")
    : "keine Buchungen";

  const plannedPart = summary.plannedHours !== null ? ` Soll ${formatHours(summary.plannedHours)} Stunden.` : "";
  return `${summary.dateLabel}. ${locationPart}. Gesamt ${formatHours(summary.totalHours)} Stunden.${plannedPart}`;
}

function showCalendarDayPopover(summary, anchorElement) {
  if (!dom.calendarDayPopover) {
    return;
  }

  const rows = summary.locations.length
    ? summary.locations.map((item) => `<li><span>${escapeHtml(item.location)}</span><strong>${formatHours(item.hours)} h</strong></li>`).join("")
    : '<li class="empty"><span>Keine Buchungen</span></li>';

  const planned = summary.plannedHours !== null
    ? `<div class="popover-stat"><span>Soll</span><strong>${formatHours(summary.plannedHours)} h</strong></div>`
    : "";

  dom.calendarDayPopover.innerHTML = `
    <div class="calendar-popover-head">${escapeHtml(summary.dateLabel)}</div>
    <ul class="calendar-popover-list">${rows}</ul>
    <div class="calendar-popover-footer">
      <div class="popover-stat"><span>Gesamt</span><strong>${formatHours(summary.totalHours)} h</strong></div>
      ${planned}
    </div>
  `;

  const rect = anchorElement.getBoundingClientRect();
  const maxWidth = 280;
  const margin = 12;
  let left = rect.right + 10;
  let top = rect.top;

  if (left + maxWidth > window.innerWidth - margin) {
    left = rect.left - maxWidth - 10;
  }
  if (left < margin) {
    left = margin;
  }
  if (top + 180 > window.innerHeight - margin) {
    top = window.innerHeight - 180 - margin;
  }
  if (top < margin) {
    top = margin;
  }

  dom.calendarDayPopover.style.left = `${left}px`;
  dom.calendarDayPopover.style.top = `${top}px`;
  dom.calendarDayPopover.classList.remove("hidden");
}

function hideCalendarDayPopover() {
  if (dom.calendarDayPopover) {
    dom.calendarDayPopover.classList.add("hidden");
  }
}

function copyPreviousDayEntries() {
  const selectedDate = fromIsoDate(state.selectedDate);
  const previousDate = new Date(selectedDate);
  previousDate.setDate(previousDate.getDate() - 1);
  const previousIso = toIsoDate(previousDate);

  const previousEntries = getEntriesForDate(previousIso);
  if (!previousEntries.length) {
    alert("Am Vortag liegen keine Buchungen vor.");
    return;
  }

  const timestamp = new Date().toISOString();
  const copiedEntries = previousEntries.map((entry) => ({
    ...entry,
    id: createId(),
    date: state.selectedDate,
    updatedAt: timestamp
  }));

  state.entries.push(...copiedEntries);
  saveToStorage(STORAGE_KEYS.entries, state.entries);
  renderAll();
}

function showUndoToast(entry) {
  state.undoDeletedEntry = entry;
  if (state.undoDeleteTimerId) {
    clearTimeout(state.undoDeleteTimerId);
  }

  dom.undoToastMessage.textContent = `Eintrag für ${entry.location} gelöscht.`;
  dom.undoToast.classList.remove("hidden");

  state.undoDeleteTimerId = setTimeout(() => {
    dismissUndoToast();
  }, 8000);
}

function undoDeleteEntry() {
  if (!state.undoDeletedEntry) {
    return;
  }

  state.entries.push(state.undoDeletedEntry);
  saveToStorage(STORAGE_KEYS.entries, state.entries);
  dismissUndoToast();
  renderAll();
}

function dismissUndoToast() {
  state.undoDeletedEntry = null;
  if (state.undoDeleteTimerId) {
    clearTimeout(state.undoDeleteTimerId);
    state.undoDeleteTimerId = null;
  }
  dom.undoToast.classList.add("hidden");
}

function getEntryAdvisories(entry) {
  const category = resolveEntryCostCenterCategory(entry);
  if (!category) {
    return [];
  }

  const pseudoCostCenter = { category };
  return state.rulesConfig.rules
    .filter((rule) => {
      const severity = rule.severity || "info";
      return (severity === "warning" || severity === "info") && matchesRule(rule, entry.location, pseudoCostCenter);
    })
    .map((rule) => ({
      severity: normalizeSeverity(rule.severity),
      message: interpolateRuleMessage(rule.message, {
        "<Abteilung>": escapeHtml(CURRENT_USER.department),
        "<Ort> Allgemein": `${escapeHtml(entry.location)} Allgemein`,
        "<Ort>": escapeHtml(entry.location)
      })
    }));
}

function resolveEntryCostCenterCategory(entry) {
  if (entry.costCenterCategory) {
    return entry.costCenterCategory;
  }

  const locationCostCenters = getCostCentersForLocation(entry.location);
  const found = locationCostCenters.find((item) => item.id === entry.costCenterId);
  return found ? found.category : null;
}

function getEntriesForDate(isoDate) {
  return state.entries
    .filter((entry) => entry.date === isoDate)
    .sort((a, b) => a.updatedAt.localeCompare(b.updatedAt));
}

function saveCurrentSelectionAsFavorite() {
  const location = dom.locationSelect.value;
  const costCenter = getSelectedCostCenter();

  if (!location || !costCenter) {
    alert("Bitte erst Ort und Kostenträger wählen.");
    return;
  }

  const duplicate = state.favorites.find((fav) => fav.location === location && fav.costCenterId === costCenter.id);
  if (duplicate) {
    alert("Diese Kombination ist bereits als Favorit gespeichert.");
    return;
  }

  state.favorites.push({
    id: createId(),
    label: costCenter.name,
    location,
    costCenterId: costCenter.id,
    costCenterName: costCenter.name,
    color: "",
    icon: ""
  });

  saveToStorage(STORAGE_KEYS.favorites, state.favorites);
  renderFavorites();
  openPopover(dom.favoritesPopover);
}

function renderFavorites() {
  renderQuickFavorites();
  renderFavoriteSuggestions();

  if (!state.favorites.length) {
    dom.favoritesList.innerHTML = '<div class="notice-empty">Noch keine Favoriten gespeichert.</div>';
    return;
  }

  dom.favoritesList.innerHTML = "";
  for (const favorite of state.favorites) {
    const activeColor = getFavoriteColor(favorite.color);
    const activeIcon = getFavoriteIconId(favorite.icon);
    const row = document.createElement("div");
    row.className = "fav-row";
    row.setAttribute("data-fav-action", "use");
    row.setAttribute("data-id", favorite.id);
    row.tabIndex = 0;
    row.innerHTML = `
      <div class="fav-row-main">
        <strong>${renderFavoriteIconHtml(activeIcon)} ${escapeHtml(favorite.label)}</strong>
        <div class="muted">${favorite.location} → ${favorite.costCenterName}</div>
      </div>
      <div class="fav-config" data-config-stop="1">
        <div class="fav-order-actions">
          <button class="icon-btn" type="button" data-fav-action="move-up" data-id="${favorite.id}" aria-label="Nach oben">↑</button>
          <button class="icon-btn" type="button" data-fav-action="move-down" data-id="${favorite.id}" aria-label="Nach unten">↓</button>
        </div>
        <button
          type="button"
          class="color-picker-trigger"
          data-fav-color-open="${favorite.id}"
          style="--favorite-color:${activeColor}"
          aria-label="Farbe wählen"
          title="Farbe wählen"
        ></button>
        <select data-fav-icon="${favorite.id}" aria-label="Icon wählen">
          ${buildFavoriteIconOptions(activeIcon)}
        </select>
      </div>
      <div class="entry-actions" data-config-stop="1">
        <button class="btn btn-ghost" type="button" data-fav-action="delete" data-id="${favorite.id}">Löschen</button>
      </div>
    `;
    dom.favoritesList.appendChild(row);
  }

  dom.favoritesList.querySelectorAll("[data-fav-action='use']").forEach((row) => {
    row.addEventListener("click", () => applyFavorite(row.dataset.id));
    row.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        applyFavorite(row.dataset.id);
      }
    });
  });

  dom.favoritesList.querySelectorAll("button[data-fav-action='delete']").forEach((btn) => {
    btn.addEventListener("click", (event) => {
      event.stopPropagation();
      removeFavorite(btn.dataset.id);
    });
  });

  dom.favoritesList.querySelectorAll("button[data-fav-action='move-up']").forEach((btn) => {
    btn.addEventListener("click", (event) => {
      event.stopPropagation();
      moveFavorite(btn.dataset.id, -1);
    });
  });

  dom.favoritesList.querySelectorAll("button[data-fav-action='move-down']").forEach((btn) => {
    btn.addEventListener("click", (event) => {
      event.stopPropagation();
      moveFavorite(btn.dataset.id, 1);
    });
  });

  dom.favoritesList.querySelectorAll("button[data-fav-color-open]").forEach((button) => {
    button.addEventListener("click", (event) => {
      event.stopPropagation();
      openFavoriteColorPicker(button.dataset.favColorOpen, button);
    });
  });

  dom.favoritesList.querySelectorAll("select[data-fav-icon]").forEach((select) => {
    select.addEventListener("click", (event) => event.stopPropagation());
    select.addEventListener("change", () => {
      updateFavoriteAppearance(select.dataset.favIcon, { icon: select.value });
    });
  });
}

function renderQuickFavorites() {
  if (!dom.favoriteQuickList) {
    return;
  }

  if (!state.favorites.length) {
    dom.favoriteQuickList.innerHTML = '<span class="muted">Noch keine Favoriten</span>';
    return;
  }

  dom.favoriteQuickList.innerHTML = state.favorites
    .slice(0, 6)
    .map(
      (favorite) => `
        <button
          type="button"
          class="favorite-chip${favorite.color ? " favorite-chip-custom" : ""}"
          data-quick-fav="${favorite.id}"
          title="${escapeHtml(favorite.location)} → ${escapeHtml(favorite.costCenterName)}"
          ${favorite.color ? `style="--favorite-color:${escapeHtml(getFavoriteColor(favorite.color))}"` : ""}
        >
          ${renderFavoriteIconHtml(favorite.icon)} ${escapeHtml(favorite.label)}
        </button>`
    )
    .join("");

  dom.favoriteQuickList.querySelectorAll("button[data-quick-fav]").forEach((button) => {
    button.addEventListener("click", () => applyFavorite(button.dataset.quickFav));
  });
}

function applyFavorite(favoriteId) {
  const favorite = state.favorites.find((entry) => entry.id === favoriteId);
  if (!favorite) {
    return;
  }

  dom.locationSelect.value = favorite.location;
  onLocationChange();
  dom.costCenterSelect.value = favorite.costCenterId;
  onCostCenterChange();
  closePopover(dom.favoritesPopover);
}

function removeFavorite(favoriteId) {
  state.favorites = state.favorites.filter((fav) => fav.id !== favoriteId);
  saveToStorage(STORAGE_KEYS.favorites, state.favorites);
  renderFavorites();
}

function moveFavorite(favoriteId, direction) {
  const index = state.favorites.findIndex((entry) => entry.id === favoriteId);
  if (index < 0) {
    return;
  }

  const targetIndex = index + direction;
  if (targetIndex < 0 || targetIndex >= state.favorites.length) {
    return;
  }

  const reordered = [...state.favorites];
  const [item] = reordered.splice(index, 1);
  reordered.splice(targetIndex, 0, item);
  state.favorites = reordered;
  saveToStorage(STORAGE_KEYS.favorites, state.favorites);
  renderFavorites();
}

function renderFavoriteSuggestions() {
  if (!dom.favoriteSuggestionsList) {
    return;
  }

  const suggestions = buildFavoriteSuggestions();
  if (!suggestions.length) {
    dom.favoriteSuggestionsList.innerHTML = '<div class="notice-empty">Keine neuen Vorschläge verfügbar.</div>';
    return;
  }

  dom.favoriteSuggestionsList.innerHTML = suggestions
    .map((suggestion) => `
      <div class="favorite-suggestion-row">
        <div>
          <strong>${escapeHtml(suggestion.location)}</strong>
          <div class="muted">${escapeHtml(suggestion.costCenterName)} · ${suggestion.count}×</div>
        </div>
        <button type="button" class="btn btn-secondary" data-fav-suggestion="${encodeURIComponent(suggestion.location)}|${encodeURIComponent(suggestion.costCenterId)}">Übernehmen</button>
      </div>
    `)
    .join("");

  dom.favoriteSuggestionsList.querySelectorAll("button[data-fav-suggestion]").forEach((button) => {
    button.addEventListener("click", () => {
      const [locationEncoded, costCenterEncoded] = button.dataset.favSuggestion.split("|");
      addFavoriteFromSuggestion(decodeURIComponent(locationEncoded), decodeURIComponent(costCenterEncoded));
    });
  });
}

function buildFavoriteSuggestions() {
  const favoriteKeys = new Set(state.favorites.map((fav) => `${fav.location}::${fav.costCenterId}`));
  const map = new Map();

  for (const entry of state.entries) {
    const key = `${entry.location}::${entry.costCenterId}`;
    if (favoriteKeys.has(key)) {
      continue;
    }

    const existing = map.get(key) || {
      key,
      location: entry.location,
      costCenterId: entry.costCenterId,
      costCenterName: entry.costCenterName,
      count: 0,
      latest: entry.updatedAt || entry.date
    };

    existing.count += 1;
    if ((entry.updatedAt || entry.date) > existing.latest) {
      existing.latest = entry.updatedAt || entry.date;
    }
    map.set(key, existing);
  }

  return [...map.values()]
    .sort((left, right) => right.count - left.count || String(right.latest).localeCompare(String(left.latest)))
    .slice(0, 3);
}

function addFavoriteFromSuggestion(location, costCenterId) {
  const locationData = state.masterData.locations.find((item) => item.name === location);
  const costCenter = locationData?.costCenters?.find((item) => item.id === costCenterId);
  if (!costCenter) {
    return;
  }

  const exists = state.favorites.some((fav) => fav.location === location && fav.costCenterId === costCenterId);
  if (exists) {
    renderFavorites();
    return;
  }

  state.favorites.push({
    id: createId(),
    label: costCenter.name,
    location,
    costCenterId: costCenter.id,
    costCenterName: costCenter.name,
    color: "",
    icon: ""
  });

  saveToStorage(STORAGE_KEYS.favorites, state.favorites);
  renderFavorites();
}

function renderHoursQuickChips() {
  if (!dom.hoursQuickChips) {
    return;
  }

  const baseHours = [1, 2, 3];
  const frequent = getMostFrequentHourValues(3);
  const chips = baseHours.map((value) => ({ value, dynamic: false }));

  for (const value of frequent) {
    if (!chips.some((chip) => chip.value === value)) {
      chips.push({ value, dynamic: true });
    }
  }

  dom.hoursQuickChips.innerHTML = chips
    .map((chip) => `<button type="button" class="hours-chip" data-hours-chip="${chip.value}"${chip.dynamic ? ' title="Basierend auf deinen bisherigen Buchungen"' : ""}>${formatHours(chip.value)} h</button>`)
    .join("");

  dom.hoursQuickChips.querySelectorAll("button[data-hours-chip]").forEach((button) => {
    button.addEventListener("click", () => {
      const value = Number(button.dataset.hoursChip);
      dom.hoursInput.value = formatHours(value);
      dom.hoursInput.focus();
    });
  });
}

function getMostFrequentHourValues(limit = 3) {
  const counter = new Map();
  for (const entry of state.entries) {
    const value = Number(entry.hoursValue);
    if (!Number.isFinite(value) || value <= 0) {
      continue;
    }
    counter.set(value, (counter.get(value) || 0) + 1);
  }

  return [...counter.entries()]
    .sort((left, right) => right[1] - left[1] || left[0] - right[0])
    .slice(0, limit)
    .map(([value]) => value);
}

function renderCommentSuggestions() {
  if (!dom.commentSuggestionBox || !dom.commentInput) {
    return;
  }

  const suggestions = getCommentSuggestions(dom.commentInput.value, 8);
  if (!suggestions.length) {
    hideCommentSuggestions();
    return;
  }

  dom.commentSuggestionBox.innerHTML = suggestions
    .map((suggestion) => `<button type="button" class="comment-suggestion-item" data-comment-suggestion="${escapeHtml(suggestion)}">${escapeHtml(suggestion)}</button>`)
    .join("");
  dom.commentSuggestionBox.classList.remove("hidden");

  dom.commentSuggestionBox.querySelectorAll("button[data-comment-suggestion]").forEach((button) => {
    button.addEventListener("mousedown", (event) => {
      event.preventDefault();
    });
    button.addEventListener("click", () => {
      dom.commentInput.value = button.dataset.commentSuggestion || "";
      dom.commentInput.focus();
      hideCommentSuggestions();
    });
  });
}

function hideCommentSuggestions() {
  if (!dom.commentSuggestionBox) {
    return;
  }
  dom.commentSuggestionBox.classList.add("hidden");
  dom.commentSuggestionBox.innerHTML = "";
}

function getCommentSuggestions(currentValue, limit = 8) {
  const filterText = String(currentValue || "").trim().toLowerCase();
  const selectedCostCenterId = dom.costCenterSelect?.value || "";

  const sameCostCenter = new Map();
  const others = new Map();

  for (const entry of state.entries) {
    const comment = String(entry.comment || "").trim();
    if (!comment) {
      continue;
    }
    if (filterText && !comment.toLowerCase().includes(filterText)) {
      continue;
    }

    const targetMap = entry.costCenterId === selectedCostCenterId ? sameCostCenter : others;
    const existing = targetMap.get(comment) || { text: comment, count: 0, latest: entry.updatedAt || entry.date };
    existing.count += 1;
    if ((entry.updatedAt || entry.date) > existing.latest) {
      existing.latest = entry.updatedAt || entry.date;
    }
    targetMap.set(comment, existing);
  }

  const sortByPriority = (map) => [...map.values()]
    .sort((left, right) => right.count - left.count || String(right.latest).localeCompare(String(left.latest)))
    .map((entry) => entry.text);

  const prioritized = [...sortByPriority(sameCostCenter), ...sortByPriority(others)];
  return [...new Set(prioritized)].slice(0, limit);
}

function openFavoriteColorPicker(favoriteId, triggerButton) {
  state.activeFavoriteColorTargetId = favoriteId;

  const rect = triggerButton.getBoundingClientRect();
  dom.favoriteColorPicker.innerHTML = FAVORITE_COLORS
    .map((color) => `<button type="button" class="color-swatch" data-color-value="${color}" style="--swatch:${color}" aria-label="${color}"></button>`)
    .join("");

  dom.favoriteColorPicker.classList.remove("hidden");
  dom.favoriteColorPicker.style.left = `${rect.left}px`;
  dom.favoriteColorPicker.style.top = `${rect.bottom + 8}px`;

  dom.favoriteColorPicker.querySelectorAll("button[data-color-value]").forEach((button) => {
    button.addEventListener("click", () => {
      updateFavoriteAppearance(state.activeFavoriteColorTargetId, { color: button.dataset.colorValue });
      closeFavoriteColorPicker();
    });
  });
}

function closeFavoriteColorPicker() {
  state.activeFavoriteColorTargetId = null;
  dom.favoriteColorPicker.classList.add("hidden");
  dom.favoriteColorPicker.innerHTML = "";
}

function updateFavoriteAppearance(favoriteId, changes) {
  state.favorites = state.favorites.map((favorite) => {
    if (favorite.id !== favoriteId) {
      return favorite;
    }

    return {
      ...favorite,
      color: changes.color !== undefined ? getFavoriteColor(changes.color) : (favorite.color || ""),
      icon: changes.icon !== undefined ? getFavoriteIconId(changes.icon) : getFavoriteIconId(favorite.icon)
    };
  });

  saveToStorage(STORAGE_KEYS.favorites, state.favorites);
  renderFavorites();
}

function getFavoriteColor(color) {
  return FAVORITE_COLORS.includes(color) ? color : FAVORITE_COLORS[0];
}

function getFavoriteIconId(icon) {
  if (!icon) {
    return FAVORITE_ICONS[0].id;
  }

  if (LEGACY_FAVORITE_ICON_MAP[icon]) {
    return LEGACY_FAVORITE_ICON_MAP[icon];
  }

  return FAVORITE_ICONS.some((entry) => entry.id === icon) ? icon : FAVORITE_ICONS[0].id;
}

function getFavoriteIconMeta(icon) {
  const id = getFavoriteIconId(icon);
  return FAVORITE_ICONS.find((entry) => entry.id === id) || FAVORITE_ICONS[0];
}

function renderFavoriteIconHtml(icon) {
  const meta = getFavoriteIconMeta(icon);
  return `<i class="${meta.className}" aria-hidden="true"></i>`;
}

function buildFavoriteIconOptions(activeIcon) {
  const activeId = getFavoriteIconId(activeIcon);
  return FAVORITE_ICONS
    .map((icon) => `<option value="${icon.id}"${icon.id === activeId ? " selected" : ""}>${icon.label}</option>`)
    .join("");
}

function exportSettingsJson() {
  const payload = {
    version: 1,
    type: "settings",
    exportedAt: new Date().toISOString(),
    favorites: state.favorites,
    workPlan: state.workPlan,
    manualFreeDays: state.manualFreeDays,
    theme: state.theme
  };

  downloadJson(payload, `einstellungen_${CURRENT_USER.id}.json`);
}

async function importSettingsJson(event) {
  const file = event.target.files?.[0];
  if (!file) {
    return;
  }

  try {
    const raw = await file.text();
    const parsed = JSON.parse(raw);
    if (!parsed || parsed.type !== "settings") {
      alert("Ungültige Einstellungsdatei.");
      return;
    }

    state.favorites = Array.isArray(parsed.favorites) ? parsed.favorites : [];
    state.workPlan = typeof parsed.workPlan === "string" ? parsed.workPlan : "";
    state.manualFreeDays = Array.isArray(parsed.manualFreeDays) ? parsed.manualFreeDays : [];
    if (typeof parsed.theme === "string") {
      applyTheme(parsed.theme);
    }

    saveToStorage(STORAGE_KEYS.favorites, state.favorites);
    saveToStorage(STORAGE_KEYS.workPlan, state.workPlan);
    saveToStorage(STORAGE_KEYS.manualFreeDays, state.manualFreeDays);
    dom.workPlanInput.value = state.workPlan;
    renderAll();
  } catch {
    alert("Datei konnte nicht gelesen werden.");
  } finally {
    event.target.value = "";
  }
}

function exportDebugEntriesJson() {
  const payload = {
    version: 1,
    type: "debug-entries",
    exportedAt: new Date().toISOString(),
    entries: state.entries
  };

  downloadJson(payload, `debug_stunden_${CURRENT_USER.id}.json`);
}

async function importDebugEntriesJson(event) {
  const file = event.target.files?.[0];
  if (!file) {
    return;
  }

  try {
    const raw = await file.text();
    const parsed = JSON.parse(raw);
    if (!parsed || parsed.type !== "debug-entries" || !Array.isArray(parsed.entries)) {
      alert("Ungültige Debug-Stundendatei.");
      return;
    }

    state.entries = parsed.entries;
    saveToStorage(STORAGE_KEYS.entries, state.entries);
    renderAll();
  } catch {
    alert("Datei konnte nicht gelesen werden.");
  } finally {
    event.target.value = "";
  }
}

function clearMockupStorage() {
  const confirmed = confirm("Local Storage für dieses Mockup wirklich bereinigen?\n\nDies entfernt Stunden, Favoriten, Arbeitsplan, freie Tage und Theme-Einstellung.");
  if (!confirmed) {
    return;
  }

  Object.values(STORAGE_KEYS).forEach((key) => localStorage.removeItem(key));

  state.entries = [];
  state.favorites = [];
  state.workPlan = "";
  state.manualFreeDays = [];
  state.editingEntryId = null;
  state.activeRule = null;

  applyTheme("light");
  dom.workPlanInput.value = "";
  resetEditMode();
  renderAll();

  alert("Mockup-LocalStorage wurde bereinigt.");
}

function seedMockupEntries() {
  if (!Array.isArray(state.masterData.locations) || !state.masterData.locations.length) {
    alert("Masterdaten sind nicht geladen. Testdaten konnten nicht erzeugt werden.");
    return;
  }

  const confirmed = confirm("Vorhandene Stundenbuchungen durch zufällige Mockup-Daten ersetzen?");
  if (!confirmed) {
    return;
  }

  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const generatedEntries = [];
  const commentPool = [
    "Abstimmung mit Netzbetrieb und Trassenprüfung",
    "Aufmaß und Plausibilitätscheck der Hausanschlüsse",
    "Koordination mit Tiefbau und Bauleitung",
    "Datenpflege im Projektboard",
    "Planstand aktualisiert und Rückfragen dokumentiert",
    "Termin mit Kommune und Versorgungsträgern",
    "Sichtung Rücklauf und Klärung offener Punkte",
    "Kontrollgang Baustelle und Fotodokumentation"
  ];

  for (let day = 1; day <= daysInMonth; day += 1) {
    const dateObj = new Date(year, month, day);
    const isoDate = toIsoDate(dateObj);
    const weekday = dateObj.getDay();
    const isWeekend = weekday === 0 || weekday === 6;

    const bookedToday = Math.random() < (isWeekend ? 0.18 : 0.86);
    if (!bookedToday) {
      continue;
    }

    const carefulQuality = Math.random() < 0.6;
    const totalHours = pickDailyHours(isWeekend, carefulQuality);
    const entryCount = pickEntryCount(carefulQuality);
    const parts = splitHours(totalHours, entryCount);

    const selectedLocation = pickRandom(state.masterData.locations);
    const availableCostCenters = selectedLocation?.costCenters || [];
    if (!selectedLocation || !availableCostCenters.length) {
      continue;
    }

    for (let index = 0; index < parts.length; index += 1) {
      const costCenter = pickRandom(availableCostCenters);
      if (!costCenter) {
        continue;
      }

      const hoursValue = parts[index];
      const includeComment = carefulQuality ? Math.random() < 0.75 : Math.random() < 0.3;

      generatedEntries.push({
        id: createId(),
        date: isoDate,
        location: selectedLocation.name,
        costCenterId: costCenter.id,
        costCenterName: costCenter.name,
        costCenterCategory: costCenter.category,
        hoursValue,
        hoursStored: formatHours(hoursValue),
        comment: includeComment ? pickRandom(commentPool) : "",
        updatedAt: new Date(year, month, day, randomInt(7, 18), randomInt(0, 59)).toISOString()
      });
    }
  }

  state.entries = generatedEntries.sort((left, right) => left.date.localeCompare(right.date));
  saveToStorage(STORAGE_KEYS.entries, state.entries);

  const selectedDateObj = fromIsoDate(state.selectedDate);
  if (selectedDateObj.getFullYear() !== year || selectedDateObj.getMonth() !== month) {
    state.selectedDate = toIsoDate(new Date(year, month, 1));
  }

  resetEditMode();
  renderAll();
  alert(`Mockup-Daten erzeugt: ${generatedEntries.length} Einträge.`);
}

function pickDailyHours(isWeekend, carefulQuality) {
  if (isWeekend) {
    return roundToHalf(randomNumber(1, carefulQuality ? 4.5 : 3.5));
  }

  if (carefulQuality) {
    return roundToHalf(randomNumber(7, 9.5));
  }

  return roundToHalf(randomNumber(3.5, 8));
}

function pickEntryCount(carefulQuality) {
  const maxEntries = carefulQuality ? 3 : 2;
  return randomInt(1, maxEntries);
}

function splitHours(totalHours, partsCount) {
  if (partsCount <= 1) {
    return [roundToHalf(totalHours)];
  }

  let remaining = totalHours;
  const values = [];

  for (let index = 0; index < partsCount; index += 1) {
    if (index === partsCount - 1) {
      values.push(roundToHalf(Math.max(0.5, remaining)));
      break;
    }

    const remainingSlots = partsCount - index - 1;
    const minRemaining = remainingSlots * 0.5;
    const maxPart = Math.max(0.5, remaining - minRemaining);
    const part = roundToHalf(randomNumber(0.5, maxPart));
    values.push(part);
    remaining -= part;
  }

  const sum = values.reduce((acc, current) => acc + current, 0);
  const delta = roundToHalf(totalHours - sum);
  values[values.length - 1] = roundToHalf(Math.max(0.5, values[values.length - 1] + delta));

  return values;
}

function roundToHalf(value) {
  return Math.max(0.5, Math.round(Number(value) * 2) / 2);
}

function randomNumber(min, max) {
  return min + Math.random() * (max - min);
}

function randomInt(min, max) {
  const normalizedMin = Math.ceil(min);
  const normalizedMax = Math.floor(max);
  return Math.floor(Math.random() * (normalizedMax - normalizedMin + 1)) + normalizedMin;
}

function pickRandom(items) {
  if (!Array.isArray(items) || !items.length) {
    return null;
  }

  return items[randomInt(0, items.length - 1)];
}

function downloadJson(payload, fileName) {
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json;charset=utf-8;" });
  triggerDownload(blob, fileName);
}

function initializeReportRange() {
  const now = new Date();
  const defaultMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  dom.reportStartMonth.value = defaultMonth;
  dom.reportEndMonth.value = defaultMonth;
}

function saveWorkPlan() {
  const input = dom.workPlanInput.value;
  const parsed = parseWorkPlanInput(input);
  if (!parsed.valid) {
    dom.workPlanStatus.textContent = "Ungültiges Format. Beispiel: 9/9/9/9 oder 8/8/8/8/6/0/0";
    return;
  }

  state.workPlan = parsed.normalizedString;
  saveToStorage(STORAGE_KEYS.workPlan, state.workPlan);
  dom.workPlanInput.value = state.workPlan;
  dom.workPlanStatus.textContent = "Arbeitsplan gespeichert.";
  renderCalendar();
  renderQualityWidget();
  renderReportPreview();
}

function parseWorkPlanInput(rawValue) {
  const cleaned = String(rawValue || "").trim();
  if (!cleaned) {
    return { valid: false };
  }

  const parts = cleaned.split("/").map((part) => part.trim());
  if (parts.length < 4 || parts.length > 7) {
    return { valid: false };
  }

  const parsed = [];
  for (const part of parts) {
    if (!/^\d+([.,]\d+)?$/.test(part)) {
      return { valid: false };
    }
    const value = Number(part.replace(",", "."));
    if (!Number.isFinite(value) || value < 0 || value > 24) {
      return { valid: false };
    }
    parsed.push(value);
  }

  const weekHours = [0, 0, 0, 0, 0, 0, 0];
  for (let index = 0; index < parsed.length; index += 1) {
    weekHours[index] = parsed[index];
  }

  const normalized = [...parsed];
  while (normalized.length > 1 && Number(normalized[normalized.length - 1]) === 0) {
    normalized.pop();
  }

  return {
    valid: true,
    weekHours,
    normalizedString: normalized.map((value) => formatHours(value)).join("/")
  };
}

function getCurrentWorkPlanHours() {
  const parsed = parseWorkPlanInput(state.workPlan);
  return parsed.valid ? parsed.weekHours : null;
}

function buildQualityStatsForRange(startMonth, endMonth) {
  const workPlan = getCurrentWorkPlanHours();
  const startDate = new Date(Number(startMonth.slice(0, 4)), Number(startMonth.slice(5, 7)) - 1, 1);
  const endDate = new Date(Number(endMonth.slice(0, 4)), Number(endMonth.slice(5, 7)), 0);

  const bookedHours = state.entries
    .filter((entry) => entry.date >= toIsoDate(startDate) && entry.date <= toIsoDate(endDate))
    .reduce((sum, entry) => sum + Number(entry.hoursValue), 0);

  let targetHours = 0;
  if (workPlan) {
    const day = new Date(startDate);
    while (day <= endDate) {
      const isoDay = toIsoDate(day);
      if (isManualFreeDay(isoDay)) {
        day.setDate(day.getDate() + 1);
        continue;
      }

      const weekIndex = (day.getDay() + 6) % 7;
      targetHours += Number(workPlan[weekIndex] || 0);
      day.setDate(day.getDate() + 1);
    }
  }

  const coverage = targetHours > 0 ? (bookedHours / targetHours) * 100 : 0;
  return {
    startMonth,
    endMonth,
    targetHours,
    bookedHours,
    coverage,
    hasPlan: Boolean(workPlan)
  };
}

function renderQualityWidget() {
  const month = `${state.calendarMonth.getFullYear()}-${String(state.calendarMonth.getMonth() + 1).padStart(2, "0")}`;
  const stats = buildQualityStatsForRange(month, month);
  const completeness = buildCompletenessStatusForMonth(month);

  if (!stats.hasPlan) {
    dom.workPlanStatus.textContent = "Kein Arbeitsplan hinterlegt.";
    dom.qualityChart.style.setProperty("--quality-progress", "0%");
    dom.qualityChartCenter.textContent = "–";
    dom.qualityTargetHours.textContent = "0,0 h";
    dom.qualityBookedHours.textContent = `${formatHours(stats.bookedHours)} h`;
    dom.qualityCoverage.textContent = "0%";
    dom.calendarQualityInline.innerHTML = '<span class="muted">Buchungsgüte Monat</span><strong>–</strong>';
    renderCompletenessChart({ percent: 0, status: "neutral", label: "Kein Arbeitsplan" });
    return;
  }

  const progress = Math.max(0, Math.min(stats.coverage, 100));
  dom.qualityChart.style.setProperty("--quality-progress", `${progress}%`);
  dom.qualityChartCenter.textContent = `${formatPercent(stats.coverage)}%`;
  dom.qualityTargetHours.textContent = `${formatHours(stats.targetHours)} h`;
  dom.qualityBookedHours.textContent = `${formatHours(stats.bookedHours)} h`;
  dom.qualityCoverage.textContent = `${formatPercent(stats.coverage)}%`;
  dom.calendarQualityInline.innerHTML = `
    <span class="muted">Buchungsgüte Monat</span>
    <strong>${formatPercent(stats.coverage)}%</strong>
    <span>${formatHours(stats.bookedHours)} h / ${formatHours(stats.targetHours)} h</span>
  `;

  renderCompletenessChart(completeness);
}

function buildCompletenessStatusForMonth(monthKey) {
  const year = Number(monthKey.slice(0, 4));
  const monthIndex = Number(monthKey.slice(5, 7)) - 1;
  const monthStart = new Date(year, monthIndex, 1);
  const monthEnd = new Date(year, monthIndex + 1, 0);
  const todayIso = toIsoDate(new Date());
  const currentMonthKey = todayIso.slice(0, 7);
  const isCurrentMonth = monthKey === currentMonthKey;
  const isPastMonth = monthKey < currentMonthKey;

  const workPlan = getCurrentWorkPlanHours();
  if (!workPlan) {
    return { percent: 0, status: "neutral", label: "Kein Arbeitsplan" };
  }

  const bookedDates = new Set(state.entries.map((entry) => entry.date));
  const requiredDays = [];

  const cursor = new Date(monthStart);
  while (cursor <= monthEnd) {
    const iso = toIsoDate(cursor);
    if (!isManualFreeDay(iso)) {
      const weekIndex = (cursor.getDay() + 6) % 7;
      const planned = Number(workPlan[weekIndex] || 0);
      if (planned > 0) {
        requiredDays.push(iso);
      }
    }
    cursor.setDate(cursor.getDate() + 1);
  }

  const dueDays = requiredDays.filter((iso) => !isCurrentMonth || iso < todayIso);
  const completedDueDays = dueDays.filter((iso) => bookedDates.has(iso));
  const missingDueDays = dueDays.filter((iso) => !bookedDates.has(iso));
  const percent = dueDays.length ? (completedDueDays.length / dueDays.length) * 100 : 100;

  if (isPastMonth) {
    return {
      percent,
      status: missingDueDays.length > 0 ? "red" : "green",
      label: missingDueDays.length > 0
        ? `${missingDueDays.length} ${missingDueDays.length === 1 ? "fehlender Tag" : "fehlende Tage"}`
        : "Vollständig"
    };
  }

  if (!isCurrentMonth) {
    return { percent: 100, status: "neutral", label: "Zukünftiger Monat" };
  }

  const todayRequired = requiredDays.includes(todayIso);
  const todayMissing = todayRequired && !bookedDates.has(todayIso);
  const previousRequired = [...requiredDays].filter((iso) => iso < todayIso).sort().slice(-1)[0];
  const previousMissing = previousRequired ? !bookedDates.has(previousRequired) : false;

  let status = "green";
  let label = "Vollständig";

  if (missingDueDays.length > 1) {
    status = "red";
    label = `${missingDueDays.length} fehlende Tage`;
  } else if (todayMissing || previousMissing || missingDueDays.length === 1) {
    status = "yellow";
    label = missingDueDays.length === 1 ? "1 fehlender Tag" : "Lücke erkannt";
  }

  return { percent, status, label };
}

function renderCompletenessChart(data) {
  const safePercent = Math.max(0, Math.min(data.percent || 0, 100));
  dom.qualityCompletenessChart.style.setProperty("--quality-progress", `${safePercent}%`);
  dom.qualityCompletenessChart.classList.remove("status-green", "status-yellow", "status-red", "status-neutral");
  dom.qualityCompletenessChart.classList.add(`status-${data.status || "neutral"}`);
  dom.qualityCompletenessCenter.textContent = `${formatPercent(safePercent)}%`;
  dom.qualityCompletenessLabel.textContent = data.label || "Vollständigkeit";
}

function exportReport(format) {
  const range = getReportRange();
  if (!range.valid) {
    alert(range.message);
    return;
  }

  const pivot = buildPivotReport(range.startMonth, range.endMonth);
  const quality = buildQualityStatsForRange(range.startMonth, range.endMonth);
  const rows = buildReportRows(range.startMonth, range.endMonth, pivot, quality);
  if (!rows.length) {
    alert("Für den gewählten Zeitraum liegen keine Buchungen vor.");
    return;
  }

  const fileBase = `stundenreport_${CURRENT_USER.id}_${range.startMonth}_${range.endMonth}`;

  if (format === "csv") {
    downloadCsv(rows, `${fileBase}.csv`);
  } else {
    downloadXlsx({ rows, pivot, quality, range }, `${fileBase}.xlsx`);
  }
}

function buildReportRows(startMonth, endMonth, pivot, quality) {
  const rows = [];

  for (const group of pivot.groups) {
    for (const item of group.items) {
      rows.push({
        Mitarbeiter: CURRENT_USER.name,
        MitarbeiterID: CURRENT_USER.id,
        Abteilung: CURRENT_USER.department,
        VonMonat: startMonth,
        BisMonat: endMonth,
        Ort: group.location,
        Kostenträger: item.costCenterName,
        Stunden: formatHours(item.hours),
        SollstundenZeitraum: formatHours(quality.targetHours),
        GebuchteStundenZeitraum: formatHours(quality.bookedHours),
        BuchungsgüteProzent: `${formatPercent(quality.coverage)}%`
      });
    }
  }

  return rows;
}

function buildPivotReport(startMonth, endMonth) {
  const startDate = `${startMonth}-01`;
  const endDateObj = new Date(Number(endMonth.slice(0, 4)), Number(endMonth.slice(5, 7)), 0);
  const endDate = toIsoDate(endDateObj);

  const filtered = state.entries.filter((entry) => entry.date >= startDate && entry.date <= endDate);

  const aggregateByLocation = new Map();
  for (const entry of filtered) {
    if (!aggregateByLocation.has(entry.location)) {
      aggregateByLocation.set(entry.location, new Map());
    }

    const costCenterMap = aggregateByLocation.get(entry.location);
    const existing = costCenterMap.get(entry.costCenterId) || {
      costCenterId: entry.costCenterId,
      costCenterName: entry.costCenterName,
      hours: 0
    };

    existing.hours += Number(entry.hoursValue);
    costCenterMap.set(entry.costCenterId, existing);
  }

  const groups = [...aggregateByLocation.entries()]
    .sort((a, b) => a[0].localeCompare(b[0], "de"))
    .map(([location, itemMap]) => {
      const items = [...itemMap.values()].sort((a, b) => a.costCenterName.localeCompare(b.costCenterName, "de"));
      const totalHours = items.reduce((sum, item) => sum + item.hours, 0);
      return {
        location,
        items,
        totalHours
      };
    });

  const grandTotal = groups.reduce((sum, group) => sum + group.totalHours, 0);
  return {
    groups,
    grandTotal
  };
}

function renderReportPreview() {
  if (!dom.reportPreview) {
    return;
  }

  const range = getReportRange();
  if (!range.valid) {
    dom.reportQualitySummary.innerHTML = "";
    dom.reportPreview.innerHTML = `<div class="notice-empty">${range.message}</div>`;
    return;
  }

  const pivot = buildPivotReport(range.startMonth, range.endMonth);
  const quality = buildQualityStatsForRange(range.startMonth, range.endMonth);

  dom.reportQualitySummary.innerHTML = `
    <div class="report-quality-item"><span class="muted">Sollstunden</span><strong>${formatHours(quality.targetHours)} h</strong></div>
    <div class="report-quality-item"><span class="muted">Gebuchte Stunden</span><strong>${formatHours(quality.bookedHours)} h</strong></div>
    <div class="report-quality-item"><span class="muted">Buchungsgüte</span><strong>${formatPercent(quality.coverage)}%</strong></div>
  `;

  if (!pivot.groups.length) {
    dom.reportPreview.innerHTML = '<div class="notice-empty">Keine Daten für den gewählten Zeitraum.</div>';
    return;
  }

  const rows = pivot.groups
    .map((group) => {
      const children = group.items
        .map(
          (item) => `
            <tr class="pivot-child-row">
              <td></td>
              <td>${escapeHtml(item.costCenterName)}</td>
              <td>${formatHours(item.hours)}</td>
            </tr>`
        )
        .join("");

      return `
        <tr class="pivot-group-row">
          <td><strong>${escapeHtml(group.location)}</strong></td>
          <td><span class="muted">Gesamt Ort</span></td>
          <td><strong>${formatHours(group.totalHours)}</strong></td>
        </tr>
        ${children}`;
    })
    .join("");

  dom.reportPreview.innerHTML = `
    <div class="report-meta muted">Zeitraum: ${range.startMonth} bis ${range.endMonth}</div>
    <table class="entry-table report-table">
      <thead>
        <tr>
          <th>Ort</th>
          <th>Kostenträger</th>
          <th>Stunden</th>
        </tr>
      </thead>
      <tbody>
        ${rows}
        <tr class="pivot-total-row">
          <td colspan="2"><strong>Gesamtsumme</strong></td>
          <td><strong>${formatHours(pivot.grandTotal)}</strong></td>
        </tr>
      </tbody>
    </table>
  `;
}

function getReportRange() {
  const startMonth = dom.reportStartMonth.value;
  const endMonth = dom.reportEndMonth.value;

  if (!startMonth || !endMonth) {
    return { valid: false, message: "Bitte Start- und Endmonat angeben." };
  }

  if (startMonth > endMonth) {
    return { valid: false, message: "Der Startmonat darf nicht nach dem Endmonat liegen." };
  }

  return {
    valid: true,
    startMonth,
    endMonth
  };
}

function downloadCsv(rows, fileName) {
  const columns = Object.keys(rows[0]);
  const content = [
    columns.join(";"),
    ...rows.map((row) => columns.map((col) => csvEscape(String(row[col]))).join(";"))
  ].join("\n");

  const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
  triggerDownload(blob, fileName);
}

function downloadXlsx(reportData, fileName) {
  if (!window.XLSX) {
    alert("XLSX-Bibliothek wurde nicht geladen.");
    return;
  }

  const { rows, pivot, quality, range } = reportData;
  const workbook = XLSX.utils.book_new();

  const pivotAoa = [
    ["Projektstunden-Report"],
    [`Mitarbeiter: ${CURRENT_USER.name} (${CURRENT_USER.id})`],
    [`Abteilung: ${CURRENT_USER.department}`],
    [`Zeitraum: ${range.startMonth} bis ${range.endMonth}`],
    [],
    ["Ort", "Kostenträger", "Stunden"]
  ];

  for (const group of pivot.groups) {
    pivotAoa.push([group.location, "Gesamt Ort", Number(group.totalHours.toFixed(2))]);
    for (const item of group.items) {
      pivotAoa.push(["", item.costCenterName, Number(item.hours.toFixed(2))]);
    }
  }
  pivotAoa.push(["", "Gesamtsumme", Number(pivot.grandTotal.toFixed(2))]);

  const pivotSheet = XLSX.utils.aoa_to_sheet(pivotAoa);
  pivotSheet["!cols"] = [{ wch: 20 }, { wch: 38 }, { wch: 14 }];
  pivotSheet["!autofilter"] = { ref: "A6:C6" };
  XLSX.utils.book_append_sheet(workbook, pivotSheet, "Pivot");

  const qualityAoa = [
    ["Buchungsgüte"],
    ["Zeitraum", `${range.startMonth} bis ${range.endMonth}`],
    ["Sollstunden", Number(quality.targetHours.toFixed(2))],
    ["Gebuchte Stunden", Number(quality.bookedHours.toFixed(2))],
    ["Buchungsgüte (%)", Number(quality.coverage.toFixed(2))]
  ];
  const qualitySheet = XLSX.utils.aoa_to_sheet(qualityAoa);
  qualitySheet["!cols"] = [{ wch: 24 }, { wch: 22 }];
  XLSX.utils.book_append_sheet(workbook, qualitySheet, "Buchungsguete");

  const flatRows = rows.map((row) => ({
    ...row,
    Stunden: Number(String(row.Stunden).replace(",", ".")),
    SollstundenZeitraum: Number(String(row.SollstundenZeitraum).replace(",", ".")),
    GebuchteStundenZeitraum: Number(String(row.GebuchteStundenZeitraum).replace(",", ".")),
    BuchungsgüteProzent: Number(String(row.BuchungsgüteProzent).replace("%", "").replace(",", "."))
  }));
  const dataSheet = XLSX.utils.json_to_sheet(flatRows);
  dataSheet["!cols"] = [
    { wch: 20 }, { wch: 14 }, { wch: 14 }, { wch: 10 }, { wch: 10 },
    { wch: 18 }, { wch: 34 }, { wch: 10 }, { wch: 16 }, { wch: 20 },
    { wch: 18 }
  ];
  XLSX.utils.book_append_sheet(workbook, dataSheet, "Daten");

  XLSX.writeFile(workbook, fileName, { compression: true });
}

function triggerDownload(blob, fileName) {
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function csvEscape(value) {
  if (value.includes(";") || value.includes("\"") || value.includes("\n")) {
    return `"${value.replaceAll("\"", "\"\"")}"`;
  }
  return value;
}

function parseHours(rawInput) {
  const value = String(rawInput || "").trim();
  const normalized = value.replace(",", ".");

  if (!/^\d+(\.\d+)?$/.test(normalized)) {
    return { valid: false };
  }

  const parsed = Number(normalized);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return { valid: false };
  }

  return {
    valid: true,
    value: parsed,
    stored: formatHours(parsed)
  };
}

function formatHours(value) {
  return new Intl.NumberFormat("de-DE", {
    minimumFractionDigits: Number.isInteger(value) ? 0 : 1,
    maximumFractionDigits: 2
  }).format(value);
}

function formatPercent(value) {
  return new Intl.NumberFormat("de-DE", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 1
  }).format(value);
}

function openPopover(element) {
  element.classList.remove("hidden");
}

function closePopover(element) {
  element.classList.add("hidden");
}

async function fetchJsonOrFallback(url, fallback) {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      return fallback;
    }
    return await response.json();
  } catch {
    return fallback;
  }
}

async function fetchMasterDataCsvOrFallback(url, fallback) {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      return fallback;
    }

    const csvText = await response.text();
    const parsed = parseMasterDataCsv(csvText);
    return parsed.locations.length ? parsed : fallback;
  } catch {
    return fallback;
  }
}

function parseMasterDataCsv(csvText) {
  const lines = String(csvText || "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length < 2) {
    return { locations: [] };
  }

  const rows = lines.slice(1).map(parseSemicolonCsvLine).filter((row) => row.length >= 4);
  const grouped = new Map();

  for (const row of rows) {
    const number = (row[0] || "").trim();
    const location = (row[1] || "").trim();
    const costCenterName = (row[2] || "").trim();
    const category = (row[3] || "").trim();

    if (!number || !location || !costCenterName || !category) {
      continue;
    }

    if (!grouped.has(location)) {
      grouped.set(location, []);
    }

    grouped.get(location).push({
      id: number,
      name: costCenterName,
      category
    });
  }

  return {
    locations: [...grouped.entries()].map(([name, costCenters]) => ({ name, costCenters }))
  };
}

function parseSemicolonCsvLine(line) {
  const fields = [];
  let current = "";
  let inQuotes = false;

  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    const next = line[index + 1];

    if (char === '"') {
      if (inQuotes && next === '"') {
        current += '"';
        index += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === ";" && !inQuotes) {
      fields.push(current);
      current = "";
      continue;
    }

    current += char;
  }

  fields.push(current);
  return fields;
}

function loadFromStorage(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function saveToStorage(key, payload) {
  localStorage.setItem(key, JSON.stringify(payload));
}

function toIsoDate(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function fromIsoDate(isoDate) {
  const [year, month, day] = isoDate.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function createId() {
  return crypto.randomUUID ? crypto.randomUUID() : `id-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}
