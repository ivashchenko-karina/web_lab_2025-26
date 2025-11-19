const selectors = {
  stateJson: "#state",
  removeBtn: ".remove-btn",
  settingTemplate: ".settingTemplateElem",
  settingLink: ".table-link",
  settingStatus: ".setting-status",
  emptyState: ".emptyState",
  table: ".table",
};

const initialState = document.querySelector(selectors.stateJson).textContent;
const state = JSON.parse(initialState);

const toggleEmptyState = () => {
  const emptyStateElem = document.querySelector(selectors.emptyState);
  const tableElem = document.querySelector(selectors.table);

  if (!state.settings.length) {
    tableElem.classList.add("hidden");
    emptyStateElem.classList.remove("hidden");
  } else {
    emptyStateElem.classList.add("hidden");
    tableElem.classList.remove("hidden");
  }
};

const removeSetting = (id) => {
  state.settings = state.settings.filter(
    (setting) => setting.id.toString() !== id.toString()
  );
  const settingElem = document.getElementById(id);
  if (settingElem) settingElem.remove();

  toggleEmptyState();
};

const renderSettingElem = (setting) => {
  const settingTemplateElem = document.querySelector(selectors.settingTemplate);

  const settingTemplateElemCopy = settingTemplateElem.cloneNode(true);
  settingTemplateElemCopy.classList.remove("hidden");

  settingTemplateElemCopy.id = setting.id;

  const settingElemLink = settingTemplateElemCopy.querySelector(
    selectors.settingLink
  );
  const settingUrl = `/settings.html?id=${setting.id}`;

  settingElemLink.href = settingUrl;
  settingElemLink.innerText = setting.title;

  const settingElemStatus = settingTemplateElemCopy.querySelector(
    selectors.settingStatus
  );

  settingElemStatus.innerText = setting.status;

  if (settingElemStatus.innerText === "active") {
    settingElemStatus.classList.add("active");
  } else if (settingElemStatus.innerText === "draft") {
    settingElemStatus.classList.add("draft");
  }

  const settingRemoveBtn = settingTemplateElemCopy.querySelector(
    selectors.removeBtn
  );

  settingRemoveBtn.addEventListener("click", () => {
    removeSetting(settingTemplateElemCopy.id);
  });

  toggleEmptyState();

  const tableElem = document.querySelector(selectors.table);
  tableElem.appendChild(settingTemplateElemCopy);
};

state.settings.forEach((setting) => {
  renderSettingElem(setting);
});