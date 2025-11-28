/**
 * Лабораторна робота №6: Розробка сторінки налаштувань з функціоналом управління формулами на JavaScript.
 * Повна версія з порожнім полем на старті та додаванням нових формул.
 */

// --- Глобальні змінні ---
let state = {};
let currentSettings = null;
let savedSettings = null;

// --- DOM-елементи ---
const settingsTitleInput = document.getElementById('setting-title-input');
const formulasListContainer = document.getElementById('formulas-list');
const formulaTemplate = document.getElementById('formula-template');
const emptyStateElement = document.getElementById('empty-state');
const saveButton = document.getElementById('save-button');
const discardButton = document.getElementById('discard-button');
const addFormulaButtonHeader = document.getElementById('add-formula-button-header');
const addFormulaButtonEmpty = document.getElementById('add-formula-button-empty');

// --- Допоміжні функції ---
function getUrlParams() {
    if (!window.location.search) return {};
    const params = new URLSearchParams(window.location.search);
    const obj = {};
    for (const [key, value] of params.entries()) {
        obj[key] = value;
    }
    return obj;
}

function handleChange() {
    if (!currentSettings || !savedSettings) return;
    const isEditing = JSON.stringify(currentSettings) !== JSON.stringify(savedSettings);

    if (isEditing) {
        saveButton.classList.remove('disabled');
        saveButton.disabled = false;
        discardButton.classList.remove('disabled');
        discardButton.disabled = false;
    } else {
        saveButton.classList.add('disabled');
        saveButton.disabled = true;
        discardButton.classList.add('disabled');
        discardButton.disabled = true;
    }
}

// --- Формули ---
function goToNewFormula(event) {
    event.preventDefault();
    window.location.href = `formula.html?settingId=${currentSettings.id}`;
}

function editFormulaHandler(event, formulaId) {
    event.preventDefault();
    window.location.href = `formula.html?settingId=${currentSettings.id}&formulaId=${formulaId}`;
}

function removeFormulaHandler(formulaId) {
    const initialLength = currentSettings.formulas.length;
    currentSettings.formulas = currentSettings.formulas.filter(f => f.id !== formulaId);

    if (currentSettings.formulas.length < initialLength) {
        const el = document.getElementById(`formula-${formulaId}`);
        if (el) el.remove();
        toggleEmptyState();
        handleChange();
    }
}

function renderFormulas(formulas) {
    formulasListContainer.innerHTML = '';

    if (!formulaTemplate) return;

    formulas.forEach(f => {
        const clone = formulaTemplate.content.cloneNode(true);
        const item = clone.querySelector('.formula-item');
        item.id = `formula-${f.id}`;

        const titleEl = item.querySelector('.formula-title');
        if (titleEl) titleEl.textContent = f.title;

        const editEls = [
            item.querySelector('.edit-formula-btn'),
            item.querySelector('.edit-formula-link')
        ].filter(el => el);
        editEls.forEach(el => el.onclick = e => editFormulaHandler(e, f.id));

        const removeBtn = item.querySelector('.remove-formula-btn');
        if (removeBtn) removeBtn.onclick = () => removeFormulaHandler(f.id);

        formulasListContainer.appendChild(clone);
    });
}

function toggleEmptyState() {
    const hasFormulas = currentSettings?.formulas?.length > 0;
    if (hasFormulas) {
        emptyStateElement.classList.add('hidden');
        formulasListContainer.classList.remove('hidden');
    } else {
        emptyStateElement.classList.remove('hidden');
        formulasListContainer.classList.add('hidden');
    }
}

function titleEditHandler(event) {
    if (!currentSettings) return;
    currentSettings.title = event.target.value;
    handleChange();
}

// --- Додавання нової "формули" зі збереженою назвою ---
function addSettingAsFormula() {
    if (!currentSettings || !currentSettings.title) return;

    const newId = currentSettings.formulas.length > 0
        ? Math.max(...currentSettings.formulas.map(f => f.id)) + 1
        : 1;

    const newFormula = {
        id: newId,
        title: currentSettings.title,
        formula: "",
        frequency: 0,
        currency: "",
        targets: { collectionsIds: [], products: [] }
    };

    currentSettings.formulas.push(newFormula);
    renderFormulas(currentSettings.formulas);
    toggleEmptyState();
    handleChange();
}

// --- Save / Discard ---
function saveSettingsHandler() {
    if (!currentSettings) return;

    // Додаємо новий об’єкт формули
    addSettingAsFormula();

    // Зберігаємо стан
    savedSettings = JSON.parse(JSON.stringify(currentSettings));

    // Очищаємо поле Title після додавання
    settingsTitleInput.value = "";

    handleChange();
}

function discardSettingsHandler() {
    if (!savedSettings) return;

    currentSettings = JSON.parse(JSON.stringify(savedSettings));

    // Поле Title залишається порожнім
    settingsTitleInput.value = "";

    renderFormulas(currentSettings.formulas);
    toggleEmptyState();
    handleChange();
}

// --- Ініціалізація ---
function renderPage() {
    if (!currentSettings) return;

    discardButton.classList.remove('hidden');
    saveButton.classList.remove('hidden');

    // Поле Title спочатку пусте
    settingsTitleInput.value = "";

    renderFormulas(currentSettings.formulas);
    toggleEmptyState();
    handleChange();
}

function loadPage() {
    const stateScript = document.getElementById('state');
    if (!stateScript) return console.error("Елемент #state не знайдено.");

    try {
        state = JSON.parse(stateScript.textContent);
    } catch (e) {
        return console.error("Помилка парсингу JSON стану:", e);
    }

    const params = getUrlParams();
    const settingId = parseInt(params.settingId) || 1;
    const foundSettings = state.settings.find(s => s.id === settingId);

    if (!foundSettings) return console.error(`Налаштування з ID ${settingId} не знайдено.`);

    currentSettings = JSON.parse(JSON.stringify(foundSettings));
    savedSettings = JSON.parse(JSON.stringify(foundSettings));

    settingsTitleInput.addEventListener('input', titleEditHandler);
    saveButton.addEventListener('click', saveSettingsHandler);
    discardButton.addEventListener('click', discardSettingsHandler);

    addFormulaButtonHeader.addEventListener('click', goToNewFormula);
    addFormulaButtonEmpty.addEventListener('click', goToNewFormula);

    renderPage();
}

document.addEventListener('DOMContentLoaded', loadPage);
