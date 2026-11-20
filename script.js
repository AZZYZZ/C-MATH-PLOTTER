const canvas = document.getElementById("graph");
const ctx = canvas.getContext("2d");
const exprInput = document.getElementById("expr");
const gExprInput = document.getElementById("gExpr");
const xminInput = document.getElementById("xmin");
const xmaxInput = document.getElementById("xmax");
const xvalInput = document.getElementById("xval");
const yminInput = document.getElementById("ymin");
const ymaxInput = document.getElementById("ymax");
const yAxisModeToggle = document.getElementById("yAxisModeToggle");
const yAxisBounds = document.getElementById("yAxisBounds");
const intMinInput = document.getElementById("intMin");
const intMaxInput = document.getElementById("intMax");
const integrationAutoButton = document.getElementById("integrationAutoBtn");
const angleModeButtons = document.querySelectorAll(".angle-mode-button");
const parameterAInput = document.getElementById("parameterA");
const parameterBInput = document.getElementById("parameterB");
const parameterAValue = document.getElementById("parameterAValue");
const parameterBValue = document.getElementById("parameterBValue");
const parametersToggle = document.getElementById("parametersToggle");
const parameterControls = document.getElementById("parameterControls");
const parameterSection = document.querySelector(".parameter-section");
const showDerivativeInput = document.getElementById("showDerivative");
const showGDerivativeInput = document.getElementById("showGDerivative");
const gDerivativeToggle = document.getElementById("gDerivativeToggle");
const showKeyPointsInput = document.getElementById("showKeyPoints");
const showTangentInput = document.getElementById("showTangent");
const tangentResultItem = document.getElementById("tangentResultItem");
const tangentResult = document.getElementById("tangentResult");
const tooltip = document.getElementById("graphTooltip");
const fResult = document.getElementById("fResult");
const derivativeResult = document.getElementById("derivativeResult");
const integralResult = document.getElementById("integralResult");
const gResultItem = document.getElementById("gResultItem");
const gResult = document.getElementById("gResult");
const gDerivativeResultItem = document.getElementById("gDerivativeResultItem");
const gDerivativeResult = document.getElementById("gDerivativeResult");
const gIntegralResultItem = document.getElementById("gIntegralResultItem");
const gIntegralResult = document.getElementById("gIntegralResult");
const canvasLoading = document.getElementById("canvasLoading");
const keypadToggle = document.getElementById("keypadToggle");
const mathKeyboard = document.getElementById("mathKeyboard");
const addGButton = document.getElementById("addGButton");
const gExpressionRow = document.getElementById("gExpressionRow");
const removeGButton = document.getElementById("removeGButton");
const graphModeSwitch = document.getElementById("graphModeSwitch");
const graphModeButtons = graphModeSwitch.querySelectorAll("[data-mode]");
const graphMenus = document.querySelectorAll(".graph-menu");
const app = document.querySelector(".app");
const graphPanel = document.querySelector(".graph-panel");
const fullscreenButton = document.getElementById("fullscreenBtn");
const shareButton = document.getElementById("shareBtn");
const gridToggle = document.getElementById("gridToggle");
const integralToggle = document.getElementById("integralToggle");
const exportCsvButton = document.getElementById("exportCsvBtn");
const valuesTableButton = document.getElementById("valuesTableBtn");
const valuesDialog = document.getElementById("valuesDialog");
const valuesCloseButton = document.getElementById("valuesCloseButton");
const valuesStartInput = document.getElementById("valuesStart");
const valuesEndInput = document.getElementById("valuesEnd");
const valuesStepInput = document.getElementById("valuesStep");
const valuesGenerateButton = document.getElementById("valuesGenerateButton");
const valuesTableHead = document.getElementById("valuesTableHead");
const valuesTableBody = document.getElementById("valuesTableBody");
const valuesStatus = document.getElementById("valuesStatus");
const copyValuesButton = document.getElementById("copyValuesButton");
const graphActionStatus = document.getElementById("graphActionStatus");
const functionResultsRow = document.getElementById("functionResultsRow");
const gResultsRow = document.getElementById("gResultsRow");
const sequenceResultsRow = document.getElementById("sequenceResultsRow");
const fLegend = document.querySelector(".f-legend");
const fDerivativeLegend = document.querySelector(".f-derivative-legend");
const gLegend = document.querySelector(".g-legend");
const gDerivativeLegend = document.querySelector(".g-derivative-legend");
const zoomInButton = document.getElementById("zoomInBtn");
const zoomOutButton = document.getElementById("zoomOutBtn");
const workspaceModeButtons = document.querySelectorAll(".workspace-mode-button");
const functionModeContent = document.getElementById("functionModeContent");
const sequenceModeContent = document.getElementById("sequenceModeContent");
const resultBar = document.getElementById("resultBar");
const graphTitle = document.getElementById("graphTitle");
const sequenceExprInput = document.getElementById("sequenceExpr");
const sequenceTypeButtons = document.querySelectorAll(".sequence-type-button");
const sequenceKeypadToggle = document.getElementById("sequenceKeypadToggle");
const functionKeyboardSlot = document.getElementById("functionKeyboardSlot");
const sequenceKeyboardSlot = document.getElementById("sequenceKeyboardSlot");
const variableKey = mathKeyboard.querySelector("[data-insert-variable]");
const sequenceExpressionPrefix = document.getElementById("sequenceExpressionPrefix");
const sequenceTypeDescription = document.getElementById("sequenceTypeDescription");
const sequenceNminInput = document.getElementById("sequenceNmin");
const sequenceNmaxInput = document.getElementById("sequenceNmax");
const sequenceEvalNInput = document.getElementById("sequenceEvalN");
const sequenceU0Input = document.getElementById("sequenceU0");
const sequenceNminGroup = document.getElementById("sequenceNminGroup");
const sequenceU0Group = document.getElementById("sequenceU0Group");
const sequencePlotButton = document.getElementById("sequencePlotButton");
const sequenceStatus = document.getElementById("sequenceStatus");
const sequenceEvalIndex = document.getElementById("sequenceEvalIndex");
const sequenceEvalValue = document.getElementById("sequenceEvalValue");
const sequenceLastValue = document.getElementById("sequenceLastValue");
const sequenceLastLabel = document.getElementById("sequenceLastLabel");
const sequenceTermCount = document.getElementById("sequenceTermCount");
const sequenceTermsBody = document.getElementById("sequenceTermsBody");
const sequenceLegend = document.getElementById("sequenceLegend");
const secondDerivativeResult = document.getElementById("secondDerivativeResult");
const concavityBadge = document.getElementById("concavityBadge");
const showConcavityInput = document.getElementById("showConcavity");
const concavityLegend = document.getElementById("concavityLegend");
const analysisActiveCount = document.getElementById("analysisActiveCount");
const advancedActiveCount = document.getElementById("advancedActiveCount");
const guideDialog = document.getElementById("guideDialog");
const guideOpenButton = document.getElementById("guideOpenButton");
const guideCloseButton = document.getElementById("guideCloseButton");
const expressionHistory = document.getElementById("expressionHistory");
const historyChips = document.getElementById("historyChips");
const historyStatus = document.getElementById("historyStatus");
const clearHistoryButton = document.getElementById("clearHistoryButton");
const historyCount = document.getElementById("historyCount");
const functionExamplesContent = document.getElementById("functionExamplesContent");
const sequenceExamplesContent = document.getElementById("sequenceExamplesContent");

const initialView = { xmin: -10, xmax: 10 };
const expressionHistoryStorageKey = "cMathPlotter.recentExpressions";
const plotBounds = { left: 58, right: 18, top: 20, bottom: 42 };
let currentData = null;
let gData = null;
let sequenceData = null;
let workspaceMode = "function";
let sequenceType = "explicit";
let displayMode = "both";
let angleMode = "rad";
let integrationAuto = true;
let yAxisAuto = true;
let showGrid = true;
let showIntegralArea = true;
let expressionHistoryItems = [];
let view = { ...initialView };
let hoverPoint = null;
let hoverTimer = null;
let hoverRequestId = 0;
let plotRequestId = 0;
let zoomTimer = null;
let parameterPlotTimer = null;
let settingsPlotTimer = null;
let drag = null;
let activeInput = exprInput;
const savedSelections = new Map([
    [exprInput, { start: exprInput.value.length, end: exprInput.value.length }],
    [gExprInput, { start: gExprInput.value.length, end: gExprInput.value.length }],
    [sequenceExprInput, {
        start: sequenceExprInput.value.length,
        end: sequenceExprInput.value.length
    }]
]);
let pixelRatio = 1;
const canvasSize = { width: 0, height: 0 };
let resizeScheduled = false;
let touchGesture = null;
let pendingTouchPoints = null;
let touchFrameId = 0;
let touchViewChanged = false;
let shareFeedbackTimer = null;
let valuesTableRequestId = 0;
let valuesTableTsv = "";

function formatNumber(value, digits = 3) {
    return value === null || !Number.isFinite(Number(value))
        ? "Indéfini"
        : Number(value).toFixed(digits);
}

function formatXValue(value) {
    if (value === null || value === undefined) return "Indéfini";
    const number = Number(value);
    return Number.isFinite(number) ? number.toString() : "Indéfini";
}

function setLoading(isLoading) {
    canvasLoading.classList.toggle("is-visible", isLoading);
}

function updateGResultPending() {
    const hasExpression = !gExpressionRow.hidden && Boolean(gExprInput.value.trim());
    gResultsRow.hidden = workspaceMode === "sequence" || !hasExpression;
    gResultItem.classList.toggle("is-hidden", !hasExpression);
    gDerivativeResultItem.classList.toggle("is-hidden", !hasExpression);
    gIntegralResultItem.classList.toggle("is-hidden", !hasExpression);
    gResult.textContent = hasExpression ? "..." : "";
    gDerivativeResult.textContent = hasExpression ? "..." : "";
    gIntegralResult.textContent = hasExpression ? "..." : "";
    updateDisplayModeUI();
}

function updateDisplayModeUI() {
    const hasGExpression = !gExpressionRow.hidden && Boolean(gExprInput.value.trim());
    graphModeSwitch.hidden = workspaceMode !== "function" || !hasGExpression;
    graphModeButtons.forEach(button => {
        const isActive = button.dataset.mode === displayMode;
        button.classList.toggle("is-active", isActive);
        button.setAttribute("aria-pressed", String(isActive));
    });
}

function updateWorkspaceModeUI() {
    const isSequenceMode = workspaceMode === "sequence";
    functionModeContent.hidden = isSequenceMode;
    sequenceModeContent.hidden = !isSequenceMode;
    functionExamplesContent.hidden = isSequenceMode;
    sequenceExamplesContent.hidden = !isSequenceMode;
    resultBar.hidden = false;
    resultBar.classList.toggle("is-sequence-mode", isSequenceMode);
    functionResultsRow.hidden = isSequenceMode;
    sequenceResultsRow.hidden = !isSequenceMode;
    gResultsRow.hidden = isSequenceMode || gExpressionRow.hidden ||
        !gExprInput.value.trim();
    graphTitle.textContent = isSequenceMode ? "Suite numérique" : "Graphe";
    sequenceLegend.hidden = !isSequenceMode;
    exportCsvButton.hidden = isSequenceMode;
    valuesTableButton.hidden = isSequenceMode;
    updateParameterAvailability();
    const keyboardSlot = isSequenceMode ? sequenceKeyboardSlot : functionKeyboardSlot;
    keyboardSlot.parentNode.insertBefore(mathKeyboard, keyboardSlot.nextSibling);
    updateSequenceVariableKey();
    workspaceModeButtons.forEach(button => {
        const isActive = button.dataset.workspaceMode === workspaceMode;
        button.classList.toggle("is-active", isActive);
        button.setAttribute("aria-pressed", String(isActive));
    });
    updateDisplayModeUI();
}

function updateYAxisModeUI() {
    yAxisModeToggle.textContent = yAxisAuto ? "Auto" : "Manuel";
    yAxisModeToggle.classList.toggle("is-active", yAxisAuto);
    yAxisModeToggle.setAttribute("aria-pressed", String(yAxisAuto));
    yAxisBounds.hidden = yAxisAuto;
    yminInput.disabled = yAxisAuto;
    ymaxInput.disabled = yAxisAuto;
}

function updateGraphToggle(button, isActive) {
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
}

function updateParameterAvailability() {
    const usesParameters = workspaceMode === "function" &&
        (expressionUsesParameters(exprInput.value) ||
            (!gExpressionRow.hidden && expressionUsesParameters(gExprInput.value)));
    parameterSection.hidden = !usesParameters;
    setParameterControlsExpanded(usesParameters);
}

function updateAnalysisActiveCount() {
    const activeCount = [
        showDerivativeInput,
        showGDerivativeInput,
        showConcavityInput,
        showKeyPointsInput,
        showTangentInput
    ].filter(input => input.checked && !input.closest(".derivative-toggle").hidden).length;
    analysisActiveCount.textContent = String(activeCount);
    analysisActiveCount.hidden = activeCount === 0;
}

function updateAdvancedActiveCount() {
    const activeCount = Number(angleMode === "deg") +
        Number(!integrationAuto) + Number(!yAxisAuto);
    advancedActiveCount.textContent = String(activeCount);
    advancedActiveCount.hidden = activeCount === 0;
}

function renderExpressionHistory() {
    historyChips.replaceChildren();
    for (const expression of expressionHistoryItems) {
        const chip = document.createElement("button");
        chip.className = "history-chip";
        chip.type = "button";
        chip.textContent = expression;
        chip.title = expression;
        chip.addEventListener("click", () => {
            exprInput.value = expression;
            gExprInput.value = "";
            gExpressionRow.hidden = true;
            gDerivativeToggle.hidden = true;
            addGButton.hidden = false;
            addGButton.setAttribute("aria-expanded", "false");
            showGDerivativeInput.checked = false;
            gData = null;
            displayMode = "both";
            updateParameterAvailability();
            updateGResultPending();
            fetchAndPlot();
        });
        historyChips.appendChild(chip);
    }
    expressionHistory.hidden = !expressionHistoryItems.length && !historyStatus.textContent;
    historyCount.textContent = String(expressionHistoryItems.length);
    historyCount.hidden = expressionHistoryItems.length === 0;
}

function loadExpressionHistory() {
    try {
        const saved = localStorage.getItem(expressionHistoryStorageKey);
        const parsed = saved ? JSON.parse(saved) : [];
        if (!Array.isArray(parsed)) {
            throw new TypeError("Saved expression history is not an array.");
        }
        expressionHistoryItems = parsed
            .filter(expression => typeof expression === "string" && expression.trim())
            .filter((expression, index, entries) => entries.indexOf(expression) === index)
            .slice(0, 5);
    } catch (error) {
        historyStatus.textContent = "Impossible de charger l’historique.";
        console.error("Unable to load expression history.", error);
    }
    renderExpressionHistory();
}

function saveExpressionHistory(expressions) {
    const recent = expressions.filter(expression => expression);
    for (let i = recent.length - 1; i >= 0; i--) {
        const expression = recent[i];
        expressionHistoryItems = expressionHistoryItems.filter(item => item !== expression);
        expressionHistoryItems.unshift(expression);
    }
    expressionHistoryItems = expressionHistoryItems.slice(0, 5);
    try {
        localStorage.setItem(
            expressionHistoryStorageKey,
            JSON.stringify(expressionHistoryItems)
        );
        historyStatus.textContent = "";
    } catch (error) {
        historyStatus.textContent = "Historique non enregistré sur ce navigateur.";
        console.error("Unable to save expression history.", error);
    }
    renderExpressionHistory();
}

function restoreSharedGraphState() {
    const params = new URLSearchParams(window.location.search);
    const hasFunction = params.has("f");
    const hasSecondFunction = params.has("g");
    if (!hasFunction && !hasSecondFunction) return;

    const sharedF = hasFunction ? params.get("f").slice(0, 255) : "";
    const sharedG = hasSecondFunction ? params.get("g").slice(0, 255) : "";
    exprInput.value = sharedF || (sharedG ? "0" : "");
    if (sharedG) {
        gExprInput.value = sharedG;
        gExpressionRow.hidden = false;
        gDerivativeToggle.hidden = false;
        addGButton.hidden = true;
        addGButton.setAttribute("aria-expanded", "true");
        displayMode = sharedF ? "both" : "g";
        showGDerivativeInput.checked = params.get("gDerivative") === "1";
    } else {
        showGDerivativeInput.checked = false;
    }
    if (sharedG && ["f", "g", "both"].includes(params.get("display"))) {
        displayMode = params.get("display");
    }

    const numericParams = [
        ["xmin", xminInput],
        ["xmax", xmaxInput],
        ["xval", xvalInput],
        ["a", parameterAInput],
        ["b", parameterBInput],
        ["ymin", yminInput],
        ["ymax", ymaxInput]
    ];
    for (const [name, input] of numericParams) {
        const value = params.get(name);
        if (value !== null && value.trim() !== "" && Number.isFinite(Number(value))) {
            input.value = value;
        }
    }
    if (params.get("angle") === "rad" || params.get("angle") === "deg") {
        angleMode = params.get("angle");
    }
    if (params.has("yauto")) yAxisAuto = params.get("yauto") !== "0";
    if (params.has("grid")) showGrid = params.get("grid") !== "0";
    if (params.has("integral")) showIntegralArea = params.get("integral") !== "0";
    if (params.has("derivative")) {
        showDerivativeInput.checked = params.get("derivative") !== "0";
    }
    if (params.has("concavity")) {
        showConcavityInput.checked = params.get("concavity") !== "0";
    }
    if (params.has("keypoints")) {
        showKeyPointsInput.checked = params.get("keypoints") !== "0";
    }
    if (params.has("tangent")) {
        showTangentInput.checked = params.get("tangent") !== "0";
    }
    updateYAxisModeUI();
    updateGraphToggle(gridToggle, showGrid);
    updateGraphToggle(integralToggle, showIntegralArea);
    updateAngleModeUI();
    updateParameterOutputs();
    updateParameterAvailability();
    updateAnalysisActiveCount();
    updateAdvancedActiveCount();
    updateGResultPending();
    fetchAndPlot();
}

function setSequenceType(type) {
    sequenceType = type;
    sequenceTypeButtons.forEach(button => {
        const isActive = button.dataset.sequenceType === sequenceType;
        button.classList.toggle("is-active", isActive);
        button.setAttribute("aria-pressed", String(isActive));
    });
    const isRecursive = sequenceType === "recursive";
    sequenceExpressionPrefix.textContent = isRecursive ? "uₙ₊₁ =" : "uₙ =";
    sequenceTypeDescription.textContent = isRecursive
        ? "uₙ₊₁ = f(uₙ), à partir de u₀"
        : "uₙ = f(n)";
    sequenceNminGroup.hidden = isRecursive;
    sequenceU0Group.hidden = !isRecursive;
    sequenceEvalNInput.min = isRecursive ? "0" : "";
    updateSequenceVariableKey();
    if (isRecursive && Number(sequenceEvalNInput.value) > Number(sequenceNmaxInput.value)) {
        sequenceEvalNInput.value = sequenceNmaxInput.value;
    }
}

function updateSequenceVariableKey() {
    const variable = workspaceMode === "function"
        ? "x"
        : sequenceType === "recursive" ? "u" : "n";
    variableKey.textContent = variable;
    variableKey.setAttribute("aria-label", variable);
}

function setMathKeyboardExpanded(expanded) {
    keypadToggle.setAttribute("aria-expanded", String(expanded));
    sequenceKeypadToggle.setAttribute("aria-expanded", String(expanded));
    mathKeyboard.hidden = !expanded;
}

function fitSequenceView(terms) {
    if (!Array.isArray(terms) || !terms.length) return;
    const firstN = Number(terms[0].n);
    const lastN = Number(terms[terms.length - 1].n);
    if (!Number.isFinite(firstN) || !Number.isFinite(lastN)) return;
    const range = lastN - firstN;
    const padding = range > 0 ? Math.max(0.5, range * 0.04) : 0.5;
    setView(firstN - padding, lastN + padding);
}

function makeSequenceRequestUrl(nmin, nmax, evalN, u0) {
    const params = new URLSearchParams({
        expr: sequenceExprInput.value.trim(),
        type: sequenceType,
        nmin: String(nmin),
        nmax: String(nmax),
        evalN: String(evalN),
        u0: String(u0),
        a: parameterAInput.value,
        b: parameterBInput.value,
        angle: angleMode
    });
    return `${getApiBaseUrl()}/sequence?${params.toString()}`;
}

function renderSequenceTerms(terms) {
    sequenceTermsBody.replaceChildren();
    for (const term of terms) {
        const row = document.createElement("tr");
        const indexCell = document.createElement("td");
        const valueCell = document.createElement("td");
        indexCell.textContent = String(term.n);
        valueCell.textContent = formatNumber(term.u, 6);
        row.append(indexCell, valueCell);
        sequenceTermsBody.appendChild(row);
    }
    sequenceTermCount.textContent = `${terms.length} / 500`;
}

async function fetchSequenceAndPlot(fitView = false) {
    const requestId = ++plotRequestId;
    const expr = sequenceExprInput.value.trim();
    if (!expr) {
        sequenceData = null;
        sequenceStatus.textContent = "";
        sequenceEvalValue.textContent = "—";
        sequenceLastValue.textContent = "—";
        sequenceTermsBody.replaceChildren();
        sequenceTermCount.textContent = "0";
        setLoading(false);
        drawGraph();
        return;
    }

    const nmin = sequenceType === "explicit" ? Number(sequenceNminInput.value) : 0;
    const nmax = Number(sequenceNmaxInput.value);
    const evalN = Number(sequenceEvalNInput.value);
    const u0 = Number(sequenceU0Input.value);
    const termCount = nmax - nmin + 1;
    const validIndex = value => Number.isSafeInteger(value) &&
        value >= -2147483648 && value <= 2147483647;
    const inputsPresent = sequenceNmaxInput.value.trim() !== "" &&
        sequenceEvalNInput.value.trim() !== "" &&
        (sequenceType !== "recursive" || sequenceU0Input.value.trim() !== "") &&
        (sequenceType !== "explicit" || sequenceNminInput.value.trim() !== "");
    const validIntegers = validIndex(nmin) && validIndex(nmax) && validIndex(evalN);
    if (!validIntegers || (sequenceType === "recursive" && !Number.isFinite(u0)) ||
        !inputsPresent ||
        (sequenceType === "explicit" && (nmax < nmin || termCount > 500)) ||
        (sequenceType === "recursive" &&
            (nmax < 0 || nmax > 499 || evalN < 0 || evalN > nmax))) {
        sequenceStatus.textContent = "Vérifiez les indices (maximum 500 termes).";
        setLoading(false);
        return;
    }

    sequenceStatus.textContent = "";
    setLoading(true);
    try {
        const response = await fetch(makeSequenceRequestUrl(nmin, nmax, evalN, u0));
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const result = await response.json();
        if (requestId !== plotRequestId) return;
        if (!Array.isArray(result.terms) || !result.terms.length) {
            throw new Error("Invalid sequence response");
        }
        sequenceData = result;
        sequenceEvalIndex.textContent = String(result.evalN);
        sequenceEvalValue.textContent = formatNumber(result.evalU, 6);
        sequenceLastValue.textContent = formatNumber(result.last, 6);
        sequenceLastLabel.textContent = `u(${result.terms[result.terms.length - 1].n})`;
        renderSequenceTerms(result.terms);
        if (fitView) fitSequenceView(result.terms);
        drawGraph();
    } catch (error) {
        if (requestId !== plotRequestId) return;
        sequenceData = null;
        sequenceStatus.textContent = "Impossible de calculer la suite. Vérifiez l'expression et le serveur.";
        sequenceEvalValue.textContent = "—";
        sequenceLastValue.textContent = "—";
        sequenceTermsBody.replaceChildren();
        sequenceTermCount.textContent = "0";
        drawGraph();
    } finally {
        if (requestId === plotRequestId) setLoading(false);
    }
}

function setWorkspaceMode(mode) {
    if (workspaceMode === mode) return;
    workspaceMode = mode;
    activeInput = mode === "sequence" ? sequenceExprInput : exprInput;
    setMathKeyboardExpanded(false);
    ++plotRequestId;
    ++hoverRequestId;
    clearTimeout(hoverTimer);
    hoverPoint = null;
    tooltip.style.display = "none";
    updateWorkspaceModeUI();
    drawGraph();
    if (workspaceMode === "sequence") fetchSequenceAndPlot(true);
    else fetchAndPlot();
}

function setDisplayMode(mode) {
    displayMode = mode;
    updateDisplayModeUI();
    hoverPoint = null;
    ++hoverRequestId;
    clearTimeout(hoverTimer);
    tooltip.style.display = "none";
    drawGraph();
}

function setView(xmin, xmax) {
    view = { xmin, xmax };
    if (workspaceMode === "function") {
        xminInput.value = Number(xmin.toPrecision(10));
        xmaxInput.value = Number(xmax.toPrecision(10));
        if (integrationAuto) {
            intMinInput.value = xminInput.value;
            intMaxInput.value = xmaxInput.value;
        }
    }
    hoverPoint = null;
    ++hoverRequestId;
    clearTimeout(hoverTimer);
    tooltip.style.display = "none";
}

function getIntegrationBounds() {
    return integrationAuto
        ? { min: view.xmin, max: view.xmax }
        : { min: Number(intMinInput.value), max: Number(intMaxInput.value) };
}

function updateAngleModeUI() {
    angleModeButtons.forEach(button => {
        const isActive = button.dataset.angle === angleMode;
        button.classList.toggle("is-active", isActive);
        button.setAttribute("aria-pressed", String(isActive));
    });
}

function setParameterControlsExpanded(expanded) {
    parametersToggle.setAttribute("aria-expanded", String(expanded));
    parameterControls.hidden = !expanded;
}

function expressionUsesParameters(expression) {
    const withoutFunctions = expression.replace(
        /sin|cos|tan|sqrt|abs|exp|log|ln|pi/gi,
        ""
    );
    return /[ab]/i.test(withoutFunctions);
}

function updateParameterOutputs() {
    parameterAValue.value = Number(parameterAInput.value).toFixed(1);
    parameterBValue.value = Number(parameterBInput.value).toFixed(1);
}

function updateConcavityResult(value, clear = false) {
    concavityBadge.className = "concavity-badge";
    if (clear) {
        secondDerivativeResult.textContent = "—";
        concavityBadge.textContent = "—";
        return;
    }

    secondDerivativeResult.textContent = formatNumber(value, 3);
    if (value === null || value === undefined || !Number.isFinite(Number(value))) {
        concavityBadge.textContent = "Indéfini";
        return;
    }
    const secondDerivative = Number(value);
    if (secondDerivative > 1e-6) {
        concavityBadge.textContent = "Convexe (∪)";
        concavityBadge.classList.add("is-convex");
    } else if (secondDerivative < -1e-6) {
        concavityBadge.textContent = "Concave (∩)";
        concavityBadge.classList.add("is-concave");
    } else {
        concavityBadge.textContent = "Inflexion / Linéaire";
        concavityBadge.classList.add("is-inflection");
    }
}

function updateTangentResult() {
    const hasTangent = showTangentInput.checked && currentData &&
        Number.isFinite(currentData.xval) &&
        Number.isFinite(currentData.yval) &&
        Number.isFinite(currentData.derivative);
    tangentResultItem.classList.toggle("is-hidden", !hasTangent);
    if (!hasTangent) {
        tangentResult.textContent = "";
        return;
    }

    const slope = currentData.derivative;
    const intercept = currentData.yval - slope * currentData.xval;
    const sign = intercept < 0 ? "−" : "+";
    tangentResult.textContent =
        `T: y = ${formatNumber(slope, 3)}x ${sign} ${formatNumber(Math.abs(intercept), 3)}`;
}

function zoomByFactor(factor) {
    const oldRange = view.xmax - view.xmin;
    if (!Number.isFinite(oldRange) || oldRange <= 0 ||
        !Number.isFinite(factor) || factor <= 0) return;
    const center = view.xmin + oldRange / 2;
    const newRange = Math.max(1e-6, Math.min(1e6, oldRange * factor));
    setView(center - newRange / 2, center + newRange / 2);
    drawGraph();
    clearTimeout(zoomTimer);
    zoomTimer = setTimeout(fetchAndPlot, 120);
}

function getApiBaseUrl() {
    const localHosts = ["localhost", "127.0.0.1", "::1", "[::1]"];
    const isLiveServer = localHosts.includes(window.location.hostname) &&
        ["5500", "5501"].includes(window.location.port);
    const localPreview = window.location.protocol === "file:" || isLiveServer;
    return localPreview ? "http://localhost:8080" : "";
}

function makeRequestUrl(xmin, xmax, xval, valueOnly = false, expression = exprInput.value.trim()) {
    const integrationBounds = getIntegrationBounds();
    const params = new URLSearchParams({
        expr: expression,
        xmin: String(xmin),
        xmax: String(xmax),
        xval: String(xval),
        angle: angleMode,
        intMin: String(integrationBounds.min),
        intMax: String(integrationBounds.max),
        a: parameterAInput.value,
        b: parameterBInput.value
    });
    if (valueOnly) params.set("valueOnly", "1");
    return `${getApiBaseUrl()}/plot?${params.toString()}`;
}

async function fetchAndPlot(options = null) {
    if (workspaceMode === "sequence") {
        return fetchSequenceAndPlot(Boolean(options && options.fitSequence));
    }

    const xmin = Number(xminInput.value);
    const xmax = Number(xmaxInput.value);
    const xval = Number(xvalInput.value);
    const intMin = integrationAuto ? xmin : Number(intMinInput.value);
    const intMax = integrationAuto ? xmax : Number(intMaxInput.value);
    if (!Number.isFinite(xmin) || !Number.isFinite(xmax) ||
        !Number.isFinite(xmax - xmin) || xmin >= xmax ||
        !Number.isFinite(xval) || !Number.isFinite(intMin) || !Number.isFinite(intMax)) {
        fResult.textContent = "Vérifiez les valeurs saisies";
        return;
    }

    if (!exprInput.value.trim()) {
        ++plotRequestId;
        setView(xmin, xmax);
        currentData = null;
        gData = null;
        fResult.textContent = "—";
        derivativeResult.textContent = "—";
        integralResult.textContent = "—";
        updateConcavityResult(null, true);
        updateTangentResult();
        updateGResultPending();
        gResultItem.classList.add("is-hidden");
        gDerivativeResultItem.classList.add("is-hidden");
        gIntegralResultItem.classList.add("is-hidden");
        gResult.textContent = "";
        gDerivativeResult.textContent = "";
        gIntegralResult.textContent = "";
        setLoading(false);
        drawGraph();
        return;
    }

    const functionExpression = exprInput.value.trim();
    const gExpression = gExpressionRow.hidden ? "" : gExprInput.value.trim();
    updateGResultPending();
    setView(xmin, xmax);
    const requestId = ++plotRequestId;
    setLoading(true);
    try {
        const requests = [
            fetch(makeRequestUrl(xmin, xmax, xval, false, functionExpression))
        ];
        if (gExpression) {
            requests.push(fetch(makeRequestUrl(xmin, xmax, xval, false, gExpression)));
        }
        const responses = await Promise.all(requests);
        for (const response of responses) {
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
        }
        const results = await Promise.all(responses.map(response => response.json()));
        if (requestId !== plotRequestId) return;

        currentData = results[0];
        const currentGExpression = gExpressionRow.hidden ? "" : gExprInput.value.trim();
        gData = gExpression && currentGExpression === gExpression ? results[1] : null;
        const hasCurrentGExpression = Boolean(currentGExpression);
        gResultItem.classList.toggle("is-hidden", !hasCurrentGExpression);
        gDerivativeResultItem.classList.toggle("is-hidden", !hasCurrentGExpression);
        gIntegralResultItem.classList.toggle("is-hidden", !hasCurrentGExpression);
        gResult.textContent = !hasCurrentGExpression
            ? ""
            : gData
                ? `g(${formatXValue(gData.xval)}) = ${formatNumber(gData.yval, 3)}`
                : "...";
        gDerivativeResult.textContent = hasCurrentGExpression && gData
            ? formatNumber(gData.derivative, 3)
            : hasCurrentGExpression ? "..." : "";
        gIntegralResult.textContent = hasCurrentGExpression && gData
            ? formatNumber(gData.integral, 3)
            : hasCurrentGExpression ? "..." : "";
        updateDisplayModeUI();
        fResult.textContent = `f(${formatXValue(currentData.xval)}) = ${formatNumber(currentData.yval)}`;
        derivativeResult.textContent = formatNumber(currentData.derivative);
        integralResult.textContent = formatNumber(currentData.integral);
        updateConcavityResult(currentData.secondDerivative);
        updateTangentResult();
        saveExpressionHistory([
            functionExpression,
            gData ? gExpression : ""
        ]);
        drawGraph();
    } catch (error) {
        if (requestId !== plotRequestId) return;
        fResult.textContent = "Erreur : démarrez server.exe puis réessayez";
        derivativeResult.textContent = "—";
        integralResult.textContent = "—";
        updateConcavityResult(null, true);
        gData = null;
        const hasGExpression = !gExpressionRow.hidden && Boolean(gExprInput.value.trim());
        gResultItem.classList.toggle("is-hidden", !hasGExpression);
        gDerivativeResultItem.classList.toggle("is-hidden", !hasGExpression);
        gIntegralResultItem.classList.toggle("is-hidden", !hasGExpression);
        gResult.textContent = hasGExpression ? "—" : "";
        gDerivativeResult.textContent = hasGExpression ? "—" : "";
        gIntegralResult.textContent = hasGExpression ? "—" : "";
        updateDisplayModeUI();
        drawGraph();
    } finally {
        if (requestId === plotRequestId) setLoading(false);
    }
}

function niceStep(span, targetTicks = 8) {
    const roughStep = span / targetTicks;
    const magnitude = Math.pow(10, Math.floor(Math.log10(roughStep)));
    const normalized = roughStep / magnitude;
    const factor = normalized < 1.5 ? 1 : normalized < 3.5 ? 2 : normalized < 7.5 ? 5 : 10;
    return factor * magnitude;
}

function getTicks(min, max, targetTicks) {
    if (!Number.isFinite(min) || !Number.isFinite(max) || max <= min) {
        return { step: 0, ticks: [] };
    }
    const step = niceStep(max - min, targetTicks);
    if (!Number.isFinite(step) || step <= 0) return { step: 0, ticks: [] };
    const ticks = [];
    for (let value = Math.ceil(min / step) * step; value <= max + step * 1e-8; value += step) {
        ticks.push(Math.abs(value) < step * 1e-9 ? 0 : value);
    }
    return { step, ticks };
}

function getIntegerTicks(min, max, targetTicks) {
    if (!Number.isFinite(min) || !Number.isFinite(max) || max <= min) {
        return { step: 0, ticks: [] };
    }
    const roughStep = (max - min) / targetTicks;
    const magnitude = Math.pow(10, Math.floor(Math.log10(Math.max(roughStep, 1))));
    const candidates = [1, 2, 5, 10].map(factor => factor * magnitude);
    const step = Math.max(1, candidates.find(candidate => candidate >= roughStep) || candidates[3]);
    const ticks = [];
    for (let value = Math.ceil(min / step) * step; value <= max + step * 1e-8; value += step) {
        ticks.push(Math.round(value));
    }
    return { step, ticks };
}

function getValidYValues(points) {
    if (!Array.isArray(points)) return [];
    return points
        .filter(point => point && Number.isFinite(point.x) &&
            point.y !== null && Number.isFinite(point.y) && Math.abs(point.y) < 1e6)
        .map(point => point.y);
}

function getInflectionPoints(secondDerivativePoints, functionPoints) {
    if (!Array.isArray(secondDerivativePoints) || !Array.isArray(functionPoints)) return [];
    const points = [];
    const length = Math.min(secondDerivativePoints.length, functionPoints.length);
    const tolerance = 1e-6;
    const addInterpolated = (index, ratio) => {
        const secondLeft = secondDerivativePoints[index - 1];
        const secondRight = secondDerivativePoints[index];
        const functionLeft = functionPoints[index - 1];
        const functionRight = functionPoints[index];
        if (!functionLeft || !functionRight ||
            !Number.isFinite(functionLeft.y) || !Number.isFinite(functionRight.y)) return;
        points.push({
            x: secondLeft.x + (secondRight.x - secondLeft.x) * ratio,
            y: functionLeft.y + (functionRight.y - functionLeft.y) * ratio
        });
    };

    for (let i = 1; i < length; i++) {
        const left = secondDerivativePoints[i - 1];
        const right = secondDerivativePoints[i];
        if (!left || !right || !Number.isFinite(left.x) || !Number.isFinite(right.x) ||
            !Number.isFinite(left.y) || !Number.isFinite(right.y)) continue;
        const leftSign = Math.abs(left.y) <= tolerance ? 0 : Math.sign(left.y);
        const rightSign = Math.abs(right.y) <= tolerance ? 0 : Math.sign(right.y);
        if (leftSign * rightSign < 0) {
            addInterpolated(i, -left.y / (right.y - left.y));
        } else if (rightSign === 0 && i + 1 < length) {
            const next = secondDerivativePoints[i + 1];
            if (next && Number.isFinite(next.y) &&
                leftSign * (Math.abs(next.y) <= tolerance ? 0 : Math.sign(next.y)) < 0) {
                const functionPoint = functionPoints[i];
                if (functionPoint && Number.isFinite(functionPoint.y)) {
                    points.push({ x: right.x, y: functionPoint.y });
                }
            }
        }
    }
    return points.filter(point => Number.isFinite(point.x) && Number.isFinite(point.y));
}

function getZeroCrossings(points, getDifference, interpolateY = () => 0) {
    if (!Array.isArray(points)) return [];
    const crossings = [];
    const tolerance = 1e-6;
    let previous = null;
    let inZeroRun = false;

    for (const point of points) {
        const difference = point && Number.isFinite(point.x)
            ? getDifference(point)
            : NaN;
        if (!Number.isFinite(difference)) {
            previous = null;
            inZeroRun = false;
            continue;
        }

        if (Math.abs(difference) <= tolerance) {
            if (!inZeroRun) {
                const y = interpolateY(point, point, 0);
                if (Number.isFinite(y)) crossings.push({ x: point.x, y });
            }
            inZeroRun = true;
            previous = { point, difference };
            continue;
        }

        if (previous && !inZeroRun &&
            Math.sign(previous.difference) !== Math.sign(difference)) {
            const ratio = -previous.difference / (difference - previous.difference);
            const x = previous.point.x + (point.x - previous.point.x) * ratio;
            const y = interpolateY(previous.point, point, ratio);
            if (Number.isFinite(x) && Number.isFinite(y)) crossings.push({ x, y });
        }
        previous = { point, difference };
        inZeroRun = false;
    }

    return crossings;
}

function getFunctionIntersections(functionPoints, secondFunctionPoints) {
    if (!Array.isArray(functionPoints) || !Array.isArray(secondFunctionPoints)) return [];
    const length = Math.min(functionPoints.length, secondFunctionPoints.length);
    const pairedPoints = [];
    for (let index = 0; index < length; index++) {
        const functionPoint = functionPoints[index];
        const secondFunctionPoint = secondFunctionPoints[index];
        if (!functionPoint || !secondFunctionPoint ||
            !Number.isFinite(functionPoint.x) || !Number.isFinite(functionPoint.y) ||
            !Number.isFinite(secondFunctionPoint.x) || !Number.isFinite(secondFunctionPoint.y) ||
            Math.abs(functionPoint.x - secondFunctionPoint.x) > 1e-8) {
            pairedPoints.push(null);
            continue;
        }
        pairedPoints.push({
            x: functionPoint.x,
            y: functionPoint.y,
            difference: functionPoint.y - secondFunctionPoint.y
        });
    }

    return getZeroCrossings(
        pairedPoints,
        point => point.difference,
        (left, right, ratio) => left.y + (right.y - left.y) * ratio
    );
}

function drawKeyPointMarkers(roots, intersections, toX, toY, xAxisY, plotWidth, plotHeight) {
    const markers = [
        ...roots.map(point => ({ ...point, type: "root" })),
        ...intersections.map(point => ({ ...point, type: "intersection" }))
    ];
    if (!markers.length) return;

    ctx.save();
    ctx.beginPath();
    ctx.rect(plotBounds.left, plotBounds.top, plotWidth, plotHeight);
    ctx.clip();
    ctx.font = "10px Consolas, monospace";
    ctx.textBaseline = "middle";
    const labels = [];

    markers.forEach((point, index) => {
        const px = toX(point.x);
        const py = point.type === "root" ? xAxisY : toY(point.y);
        if (!Number.isFinite(px) || !Number.isFinite(py)) return;

        ctx.beginPath();
        if (point.type === "root") {
            ctx.shadowColor = "#a3e635";
            ctx.shadowBlur = 10;
            ctx.fillStyle = "#a3e635";
            ctx.strokeStyle = "#e8edf4";
            ctx.lineWidth = 1.5;
            ctx.arc(px, py, 4.5, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
        } else {
            ctx.shadowColor = "#38bdf8";
            ctx.shadowBlur = 9;
            ctx.fillStyle = "#0b1016";
            ctx.strokeStyle = "#38bdf8";
            ctx.lineWidth = 2;
            ctx.arc(px, py, 5, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
        }
        ctx.shadowBlur = 0;

        const label = `(${formatNumber(point.x, 2)}, ${formatNumber(point.y, 2)})`;
        const labelWidth = ctx.measureText(label).width;
        const labelHeight = 12;
        const minX = plotBounds.left + 3;
        const maxX = plotBounds.left + plotWidth - labelWidth - 3;
        const minY = plotBounds.top + labelHeight / 2;
        const maxY = plotBounds.top + plotHeight - labelHeight / 2;
        const offsets = [-15, 15, -29, 29, -43, 43, 0];
        let labelBounds = null;

        for (const offset of offsets) {
            for (const side of index % 2 === 0 ? [1, -1] : [-1, 1]) {
                const proposedX = side > 0 ? px + 8 : px - labelWidth - 8;
                const left = Math.max(minX, Math.min(proposedX, maxX));
                const middleY = Math.max(minY, Math.min(py + offset, maxY));
                const bounds = {
                    left,
                    right: left + labelWidth,
                    top: middleY - labelHeight / 2,
                    bottom: middleY + labelHeight / 2
                };
                const overlaps = labels.some(existing =>
                    bounds.left < existing.right + 3 &&
                    bounds.right + 3 > existing.left &&
                    bounds.top < existing.bottom + 3 &&
                    bounds.bottom + 3 > existing.top
                );
                if (!overlaps) {
                    labelBounds = bounds;
                    break;
                }
            }
            if (labelBounds) break;
        }

        if (labelBounds) {
            labels.push(labelBounds);
            ctx.textAlign = "left";
            ctx.lineWidth = 3;
            ctx.strokeStyle = "#0b1016";
            ctx.strokeText(label, labelBounds.left, (labelBounds.top + labelBounds.bottom) / 2);
            ctx.fillStyle = "#e8edf4";
            ctx.fillText(label, labelBounds.left, (labelBounds.top + labelBounds.bottom) / 2);
        }
    });
    ctx.restore();
}

function drawTangentLine(x0, y0, slope, toX, toY, plotWidth, plotHeight) {
    if (![x0, y0, slope].every(Number.isFinite)) return;
    const leftY = slope * (view.xmin - x0) + y0;
    const rightY = slope * (view.xmax - x0) + y0;
    if (!Number.isFinite(leftY) || !Number.isFinite(rightY)) return;

    ctx.save();
    ctx.beginPath();
    ctx.rect(plotBounds.left, plotBounds.top, plotWidth, plotHeight);
    ctx.clip();
    ctx.strokeStyle = "#38bdf8";
    ctx.lineWidth = 2;
    ctx.setLineDash([8, 6]);
    ctx.shadowColor = "#38bdf8";
    ctx.shadowBlur = 5;
    ctx.beginPath();
    ctx.moveTo(toX(view.xmin), toY(leftY));
    ctx.lineTo(toX(view.xmax), toY(rightY));
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.shadowBlur = 10;
    ctx.fillStyle = "#38bdf8";
    ctx.beginPath();
    ctx.arc(toX(x0), toY(y0), 4.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
}

function drawInflectionPoints(points, toX, toY, plotWidth, plotHeight) {
    if (!Array.isArray(points) || !points.length) return;
    ctx.save();
    ctx.beginPath();
    ctx.rect(plotBounds.left, plotBounds.top, plotWidth, plotHeight);
    ctx.clip();
    ctx.font = "10px Consolas, monospace";
    ctx.textBaseline = "middle";
    const labels = [];
    points.forEach((point, index) => {
        const px = toX(point.x);
        const py = toY(point.y);
        if (!Number.isFinite(px) || !Number.isFinite(py)) return;
        const label = `(${formatNumber(point.x, 2)}, ${formatNumber(point.y, 2)})`;
        const labelWidth = ctx.measureText(label).width;
        const labelHeight = 12;
        const minX = plotBounds.left + 3;
        const maxX = plotBounds.left + plotWidth - labelWidth - 3;
        const minY = plotBounds.top + labelHeight / 2;
        const maxY = plotBounds.top + plotHeight - labelHeight / 2;
        const offsets = [-15, 15, -29, 29, -43, 43, 0];
        let labelBounds = null;

        for (const offset of offsets) {
            for (const side of index % 2 === 0 ? [1, -1] : [-1, 1]) {
                const proposedX = side > 0 ? px + 8 : px - labelWidth - 8;
                const left = Math.max(minX, Math.min(proposedX, maxX));
                const middleY = Math.max(minY, Math.min(py + offset, maxY));
                const bounds = {
                    left,
                    right: left + labelWidth,
                    top: middleY - labelHeight / 2,
                    bottom: middleY + labelHeight / 2
                };
                const overlaps = labels.some(existing =>
                    bounds.left < existing.right + 3 &&
                    bounds.right + 3 > existing.left &&
                    bounds.top < existing.bottom + 3 &&
                    bounds.bottom + 3 > existing.top
                );
                if (!overlaps) {
                    labelBounds = bounds;
                    break;
                }
            }
            if (labelBounds) break;
        }

        ctx.fillStyle = "#0b1016";
        ctx.strokeStyle = "#f59e0b";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(px, py, 4.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        if (labelBounds) {
            labels.push(labelBounds);
            ctx.textAlign = "left";
            ctx.lineWidth = 3;
            ctx.strokeStyle = "#0b1016";
            ctx.strokeText(label, labelBounds.left, (labelBounds.top + labelBounds.bottom) / 2);
            ctx.fillStyle = "#fbbf24";
            ctx.fillText(label, labelBounds.left, (labelBounds.top + labelBounds.bottom) / 2);
        }
    });
    ctx.restore();
}

function drawMinorGrid(min, max, majorStep, toPixel, horizontal, plotWidth, plotHeight) {
    const minorStep = majorStep / 5;
    if (!Number.isFinite(minorStep) || minorStep <= 0) return;
    ctx.beginPath();
    for (let value = Math.ceil(min / minorStep) * minorStep; value < max; value += minorStep) {
        if (Math.abs(value / majorStep - Math.round(value / majorStep)) < 1e-7) continue;
        const pixel = toPixel(value);
        if (horizontal) {
            ctx.moveTo(plotBounds.left, pixel);
            ctx.lineTo(plotBounds.left + plotWidth, pixel);
        } else {
            ctx.moveTo(pixel, plotBounds.top);
            ctx.lineTo(pixel, plotBounds.top + plotHeight);
        }
    }
    ctx.stroke();
}

function drawIntegralArea(points, xmin, xmax, baselineY, toX, toY, plotWidth, plotHeight, fillColor) {
    if (!Array.isArray(points) || !Number.isFinite(xmin) || !Number.isFinite(xmax) ||
        !Number.isFinite(baselineY) || typeof toX !== "function" ||
        typeof toY !== "function" || !Number.isFinite(plotWidth) ||
        !Number.isFinite(plotHeight) || plotWidth <= 0 || plotHeight <= 0) return;
    const minX = Math.max(Math.min(xmin, xmax), view.xmin);
    const maxX = Math.min(Math.max(xmin, xmax), view.xmax);
    if (!Number.isFinite(minX) || !Number.isFinite(maxX) || maxX <= minX) return;

    ctx.save();
    ctx.beginPath();
    ctx.rect(plotBounds.left, plotBounds.top, plotWidth, plotHeight);
    ctx.clip();
    ctx.fillStyle = fillColor;

    let segment = [];
    const fillSegment = () => {
        if (segment.length >= 2) {
            ctx.beginPath();
            ctx.moveTo(toX(segment[0].x), baselineY);
            for (const point of segment) ctx.lineTo(toX(point.x), toY(point.y));
            const lastPoint = segment[segment.length - 1];
            ctx.lineTo(toX(lastPoint.x), baselineY);
            ctx.closePath();
            ctx.fill();
        }
        segment = [];
    };

    for (const point of points) {
        if (!point || !Number.isFinite(point.x) || point.y === null ||
            !Number.isFinite(point.y) || Math.abs(point.y) > 1e6) {
            fillSegment();
            continue;
        }
        if (point.x < minX) continue;
        if (point.x > maxX) break;
        segment.push(point);
    }
    fillSegment();
    ctx.restore();
}

function drawIntegralBoundaries(xmin, xmax, toX, plotTop, plotBottom, color) {
    if (!Number.isFinite(xmin) || !Number.isFinite(xmax) ||
        !Number.isFinite(plotTop) || !Number.isFinite(plotBottom) ||
        typeof toX !== "function") return;
    ctx.save();
    ctx.strokeStyle = color;
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 5]);
    ctx.beginPath();
    for (const value of [xmin, xmax]) {
        if (value < view.xmin || value > view.xmax) continue;
        const x = toX(value);
        ctx.moveTo(x, plotTop);
        ctx.lineTo(x, plotBottom);
    }
    ctx.stroke();
    ctx.restore();
}

function drawSeries(points, color, lineWidth, dashed = false, glow = false) {
    if (!Array.isArray(points)) return;
    const width = canvasSize.width - plotBounds.left - plotBounds.right;
    const height = canvasSize.height - plotBounds.top - plotBounds.bottom;
    const xmin = view.xmin;
    const xmax = view.xmax;
    const ymin = drawGraph.ymin;
    const ymax = drawGraph.ymax;
    const toX = x => plotBounds.left + ((x - xmin) / (xmax - xmin)) * width;
    const toY = y => plotBounds.top + height - ((y - ymin) / (ymax - ymin)) * height;

    ctx.save();
    ctx.beginPath();
    ctx.rect(plotBounds.left, plotBounds.top, width, height);
    ctx.clip();
    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth;
    ctx.setLineDash(Array.isArray(dashed) ? dashed : dashed ? [8, 6] : []);
    ctx.shadowColor = glow ? "rgba(163, 230, 53, 0.75)" : "transparent";
    ctx.shadowBlur = glow ? 12 : 0;
    ctx.beginPath();
    let drawing = false;
    let previousY = null;

    for (const point of points) {
        if (!point || !Number.isFinite(point.x) || point.y === null ||
            !Number.isFinite(point.y) || Math.abs(point.y) > 1e6) {
            drawing = false;
            continue;
        }
        const px = toX(point.x);
        const py = toY(point.y);
        if (drawing && Math.abs(py - previousY) > height * 0.6) drawing = false;
        if (!drawing) {
            ctx.moveTo(px, py);
            drawing = true;
        } else {
            ctx.lineTo(px, py);
        }
        previousY = py;
    }
    ctx.stroke();
    ctx.restore();
}

function drawSequenceGraph() {
    const width = canvasSize.width;
    const height = canvasSize.height;
    const terms = sequenceData && Array.isArray(sequenceData.terms)
        ? sequenceData.terms
        : [];
    const values = terms
        .filter(term => term && Number.isFinite(Number(term.n)) &&
            term.u !== null && Number.isFinite(Number(term.u)) && Math.abs(Number(term.u)) < 1e6)
        .map(term => Number(term.u));
    let ymin = values.length ? Math.min(0, ...values) : -1;
    let ymax = values.length ? Math.max(0, ...values) : 1;
    if (ymax - ymin < 1e-9) {
        const padding = Math.max(1, Math.abs(ymin) * 0.1);
        ymin -= padding;
        ymax += padding;
    } else {
        const padding = (ymax - ymin) * 0.12;
        ymin -= padding;
        ymax += padding;
    }
    drawSequenceGraph.ymin = ymin;
    drawSequenceGraph.ymax = ymax;

    const plotWidth = width - plotBounds.left - plotBounds.right;
    const plotHeight = height - plotBounds.top - plotBounds.bottom;
    const toX = n => plotBounds.left + ((n - view.xmin) / (view.xmax - view.xmin)) * plotWidth;
    const toY = value => plotBounds.top + plotHeight -
        ((value - ymin) / (ymax - ymin)) * plotHeight;
    const xAxisY = Math.max(plotBounds.top, Math.min(plotBounds.top + plotHeight, toY(0)));
    const yAxisX = view.xmin <= 0 && view.xmax >= 0 ? toX(0) : plotBounds.left;

    fLegend.classList.add("is-mode-hidden");
    fDerivativeLegend.classList.add("is-mode-hidden");
    gLegend.classList.add("is-mode-hidden");
    gDerivativeLegend.classList.add("is-mode-hidden");
    concavityLegend.classList.add("is-mode-hidden");
    sequenceLegend.hidden = false;

    const xTicks = getIntegerTicks(
        view.xmin, view.xmax, Math.max(3, Math.floor(plotWidth / 70))
    );
    const yTicks = getTicks(ymin, ymax, Math.max(3, Math.floor(plotHeight / 55)));
    ctx.font = "12px Consolas, monospace";
    ctx.textBaseline = "middle";
    ctx.lineWidth = 1;
    if (showGrid) {
        ctx.strokeStyle = "rgba(148, 163, 184, 0.075)";
        drawMinorGrid(view.xmin, view.xmax, xTicks.step, toX, false, plotWidth, plotHeight);
        drawMinorGrid(ymin, ymax, yTicks.step, toY, true, plotWidth, plotHeight);
    }

    ctx.strokeStyle = "rgba(148, 163, 184, 0.15)";
    ctx.fillStyle = "#8996a6";
    for (const tick of xTicks.ticks) {
        const px = toX(tick);
        if (showGrid) {
            ctx.beginPath();
            ctx.moveTo(px, plotBounds.top);
            ctx.lineTo(px, plotBounds.top + plotHeight);
            ctx.stroke();
        }
        ctx.textAlign = "center";
        ctx.fillText(Number(tick.toPrecision(5)).toString(), px,
            Math.min(height - 16, xAxisY + 16));
    }
    for (const tick of yTicks.ticks) {
        const py = toY(tick);
        if (showGrid) {
            ctx.beginPath();
            ctx.moveTo(plotBounds.left, py);
            ctx.lineTo(plotBounds.left + plotWidth, py);
            ctx.stroke();
        }
        ctx.textAlign = "right";
        ctx.fillText(Number(tick.toPrecision(5)).toString(),
            Math.max(32, yAxisX - 8), py);
    }

    ctx.strokeStyle = "#718096";
    ctx.lineWidth = 1.25;
    ctx.beginPath();
    ctx.moveTo(plotBounds.left, xAxisY);
    ctx.lineTo(plotBounds.left + plotWidth, xAxisY);
    ctx.moveTo(yAxisX, plotBounds.top);
    ctx.lineTo(yAxisX, plotBounds.top + plotHeight);
    ctx.stroke();

    ctx.save();
    ctx.beginPath();
    ctx.rect(plotBounds.left, plotBounds.top, plotWidth, plotHeight);
    ctx.clip();
    ctx.strokeStyle = "rgba(163, 230, 53, 0.28)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (const term of terms) {
        if (!term) continue;
        const n = Number(term.n);
        const value = Number(term.u);
        if (!Number.isFinite(n) || n < view.xmin || n > view.xmax || term.u === null ||
            !Number.isFinite(value) || Math.abs(value) >= 1e6) {
            continue;
        }
        const px = toX(n);
        const py = toY(value);
        ctx.moveTo(px, toY(0));
        ctx.lineTo(px, py);
    }
    ctx.stroke();
    ctx.shadowColor = "rgba(163, 230, 53, 0.72)";
    ctx.shadowBlur = 10;
    for (const term of terms) {
        const n = Number(term.n);
        const value = Number(term.u);
        if (!Number.isFinite(n) || n < view.xmin || n > view.xmax ||
            term.u === null || !Number.isFinite(value) || Math.abs(value) >= 1e6) continue;
        ctx.fillStyle = "#a3e635";
        ctx.beginPath();
        ctx.arc(toX(n), toY(value), 4, 0, Math.PI * 2);
        ctx.fill();
    }
    ctx.shadowBlur = 0;
    if (hoverPoint && Number.isFinite(hoverPoint.sequenceN) &&
        Number.isFinite(hoverPoint.sequenceU)) {
        const px = toX(hoverPoint.sequenceN);
        const py = toY(hoverPoint.sequenceU);
        ctx.strokeStyle = "rgba(226, 232, 240, 0.55)";
        ctx.setLineDash([4, 5]);
        ctx.beginPath();
        ctx.moveTo(px, plotBounds.top);
        ctx.lineTo(px, plotBounds.top + plotHeight);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.fillStyle = "#f1f5f9";
        ctx.beginPath();
        ctx.arc(px, py, 5, 0, Math.PI * 2);
        ctx.fill();
    }
    ctx.restore();

    ctx.fillStyle = "#8996a6";
    ctx.textAlign = "left";
    ctx.textBaseline = "top";
    ctx.fillText(`n: [${formatNumber(view.xmin, 3)}, ${formatNumber(view.xmax, 3)}]`, 12, 8);
}

function drawGraph() {
    const width = canvasSize.width;
    const height = canvasSize.height;
    if (!width || !height) return;
    ctx.clearRect(0, 0, width, height);
    if (!Number.isFinite(view.xmin) || !Number.isFinite(view.xmax) ||
        !Number.isFinite(view.xmax - view.xmin) || view.xmin >= view.xmax) return;
    if (workspaceMode === "sequence") {
        drawSequenceGraph();
        return;
    }

    const showF = displayMode !== "g";
    const showG = displayMode !== "f";
    const hasCurrentData = showF && currentData && Array.isArray(currentData.points);
    const hasGData = showG && gData && Array.isArray(gData.points);
    const hasFDerivative = showDerivativeInput.checked && hasCurrentData &&
        Array.isArray(currentData.derivativePoints);
    const hasGDerivative = showGDerivativeInput.checked && hasGData &&
        Array.isArray(gData.derivativePoints);
    const hasConcavity = showConcavityInput.checked && hasCurrentData &&
        Array.isArray(currentData.secondDerivativePoints);
    const hasKeyPoints = showKeyPointsInput.checked && hasCurrentData;
    const hasTangent = showTangentInput.checked && hasCurrentData &&
        Number.isFinite(currentData.xval) &&
        Number.isFinite(currentData.yval) &&
        Number.isFinite(currentData.derivative);
    const values = hasCurrentData ? getValidYValues(currentData.points) : [];
    if (hasGData) {
        values.push(...getValidYValues(gData.points));
    }
    if (hasFDerivative) {
        values.push(...getValidYValues(currentData.derivativePoints));
    }
    if (hasGDerivative) {
        values.push(...getValidYValues(gData.derivativePoints));
    }
    if (hasConcavity) {
        values.push(...getValidYValues(currentData.secondDerivativePoints));
    }
    const inflectionPoints = hasConcavity
        ? getInflectionPoints(currentData.secondDerivativePoints, currentData.points)
        : [];
    const roots = hasKeyPoints
        ? getZeroCrossings(currentData.points, point => point.y)
        : [];
    const intersections = hasKeyPoints && hasGData
        ? getFunctionIntersections(currentData.points, gData.points)
        : [];
    fLegend.classList.toggle("is-mode-hidden", !showF);
    fDerivativeLegend.classList.toggle("is-mode-hidden", !showF);
    fDerivativeLegend.classList.toggle("is-hidden", !showDerivativeInput.checked);
    gLegend.classList.toggle("is-hidden", !hasGData);
    gDerivativeLegend.classList.toggle("is-mode-hidden", !hasGData);
    gDerivativeLegend.classList.toggle("is-hidden", !showGDerivativeInput.checked);
    concavityLegend.classList.toggle("is-mode-hidden", !showF);
    concavityLegend.classList.toggle("is-hidden", !showConcavityInput.checked);
    let ymin = values.length ? Math.min(...values) : -10;
    let ymax = values.length ? Math.max(...values) : 10;
    const manualYmin = yminInput.value.trim() ? Number(yminInput.value) : NaN;
    const manualYmax = ymaxInput.value.trim() ? Number(ymaxInput.value) : NaN;
    const hasManualYBounds = !yAxisAuto && Number.isFinite(manualYmin) &&
        Number.isFinite(manualYmax) && manualYmin < manualYmax;
    if (hasManualYBounds) {
        ymin = manualYmin;
        ymax = manualYmax;
    } else if (ymax - ymin < 1e-9) {
        const padding = Math.max(1, Math.abs(ymin) * 0.1);
        ymin -= padding;
        ymax += padding;
    } else {
        const padding = (ymax - ymin) * 0.12;
        ymin -= padding;
        ymax += padding;
    }
    drawGraph.ymin = ymin;
    drawGraph.ymax = ymax;

    const plotWidth = width - plotBounds.left - plotBounds.right;
    const plotHeight = height - plotBounds.top - plotBounds.bottom;
    const integrationBounds = getIntegrationBounds();
    const toX = x => plotBounds.left + ((x - view.xmin) / (view.xmax - view.xmin)) * plotWidth;
    const toY = y => plotBounds.top + plotHeight - ((y - ymin) / (ymax - ymin)) * plotHeight;
    const xAxisY = Math.max(plotBounds.top, Math.min(plotBounds.top + plotHeight, toY(0)));
    const yAxisX = view.xmin <= 0 && view.xmax >= 0 ? toX(0) : plotBounds.left;

    ctx.font = "12px Consolas, monospace";
    ctx.textBaseline = "middle";
    ctx.lineWidth = 1;

    if (showIntegralArea && hasCurrentData && Number.isFinite(currentData.integral)) {
        drawIntegralArea(
            currentData.points, integrationBounds.min, integrationBounds.max, xAxisY, toX, toY,
            plotWidth, plotHeight, "rgba(163, 230, 53, 0.18)"
        );
    }
    if (showIntegralArea && hasGData && Number.isFinite(gData.integral)) {
        drawIntegralArea(
            gData.points, integrationBounds.min, integrationBounds.max, xAxisY, toX, toY,
            plotWidth, plotHeight, "rgba(56, 189, 248, 0.14)"
        );
    }

    const xTicks = getTicks(view.xmin, view.xmax, Math.max(3, Math.floor(plotWidth / 90)));
    const yTicks = getTicks(ymin, ymax, Math.max(3, Math.floor(plotHeight / 55)));
    if (showGrid) {
        ctx.strokeStyle = "rgba(148, 163, 184, 0.075)";
        drawMinorGrid(view.xmin, view.xmax, xTicks.step, toX, false, plotWidth, plotHeight);
        drawMinorGrid(ymin, ymax, yTicks.step, toY, true, plotWidth, plotHeight);
    }

    ctx.strokeStyle = "rgba(148, 163, 184, 0.15)";
    ctx.fillStyle = "#8996a6";
    for (const tick of xTicks.ticks) {
        const px = toX(tick);
        if (showGrid) {
            ctx.beginPath();
            ctx.moveTo(px, plotBounds.top);
            ctx.lineTo(px, plotBounds.top + plotHeight);
            ctx.stroke();
        }
        ctx.beginPath();
        ctx.moveTo(px, xAxisY - 4);
        ctx.lineTo(px, xAxisY + 4);
        ctx.strokeStyle = "#718096";
        ctx.stroke();
        ctx.strokeStyle = "rgba(148, 163, 184, 0.15)";
        ctx.textAlign = "center";
        ctx.fillText(Number(tick.toPrecision(5)).toString(), px, Math.min(height - 16, xAxisY + 16));
    }

    for (const tick of yTicks.ticks) {
        const py = toY(tick);
        if (showGrid) {
            ctx.beginPath();
            ctx.moveTo(plotBounds.left, py);
            ctx.lineTo(plotBounds.left + plotWidth, py);
            ctx.stroke();
        }
        ctx.beginPath();
        ctx.moveTo(yAxisX - 4, py);
        ctx.lineTo(yAxisX + 4, py);
        ctx.strokeStyle = "#718096";
        ctx.stroke();
        ctx.strokeStyle = "rgba(148, 163, 184, 0.15)";
        ctx.textAlign = "right";
        ctx.fillText(Number(tick.toPrecision(5)).toString(), Math.max(32, yAxisX - 8), py);
    }

    ctx.strokeStyle = "#718096";
    ctx.lineWidth = 1.25;
    ctx.beginPath();
    ctx.moveTo(plotBounds.left, xAxisY);
    ctx.lineTo(plotBounds.left + plotWidth, xAxisY);
    ctx.moveTo(yAxisX, plotBounds.top);
    ctx.lineTo(yAxisX, plotBounds.top + plotHeight);
    ctx.stroke();

    if (showIntegralArea && hasCurrentData && Number.isFinite(currentData.integral)) {
        drawIntegralBoundaries(
            integrationBounds.min, integrationBounds.max, toX, plotBounds.top, plotBounds.top + plotHeight,
            "rgba(163, 230, 53, 0.48)"
        );
    }
    if (showIntegralArea && hasGData && Number.isFinite(gData.integral)) {
        drawIntegralBoundaries(
            integrationBounds.min, integrationBounds.max, toX, plotBounds.top, plotBounds.top + plotHeight,
            "rgba(56, 189, 248, 0.48)"
        );
    }

    if (hasCurrentData) {
        drawSeries(currentData.points, "#a3e635", 2.5, false, true);
    }
    if (hasGData) {
        drawSeries(gData.points, "#38bdf8", 2.5);
    }
    if (hasFDerivative) {
        drawSeries(currentData.derivativePoints, "#7835e6", 2, true);
        ctx.save();
        ctx.setLineDash([8, 6]);
        ctx.strokeStyle = "#7835e6";
        ctx.beginPath();
        ctx.moveTo(width - 135, 18);
        ctx.lineTo(width - 110, 18);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.fillStyle = "#7835e6";
        ctx.textAlign = "left";
        ctx.fillText("f'(x)", width - 104, 18);
        ctx.restore();
    }
    if (hasGDerivative) {
        const legendY = hasFDerivative ? 36 : 18;
        drawSeries(gData.derivativePoints, "#f472b6", 2, true);
        ctx.save();
        ctx.setLineDash([8, 6]);
        ctx.strokeStyle = "#f472b6";
        ctx.beginPath();
        ctx.moveTo(width - 135, legendY);
        ctx.lineTo(width - 110, legendY);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.fillStyle = "#f472b6";
        ctx.textAlign = "left";
        ctx.fillText("g'(x)", width - 104, legendY);
        ctx.restore();
    }
    if (hasConcavity) {
        drawSeries(currentData.secondDerivativePoints, "#f59e0b", 2, [3, 4]);
        drawInflectionPoints(inflectionPoints, toX, toY, plotWidth, plotHeight);
    }
    if (hasTangent) {
        drawTangentLine(
            currentData.xval, currentData.yval, currentData.derivative,
            toX, toY, plotWidth, plotHeight
        );
    }
    if (hasKeyPoints) {
        drawKeyPointMarkers(
            roots, intersections, toX, toY, xAxisY, plotWidth, plotHeight
        );
    }

    if (hoverPoint && Number.isFinite(hoverPoint.x) &&
        hoverPoint.x >= view.xmin && hoverPoint.x <= view.xmax) {
        const px = toX(hoverPoint.x);
        ctx.save();
        ctx.beginPath();
        ctx.rect(plotBounds.left, plotBounds.top, plotWidth, plotHeight);
        ctx.clip();
        ctx.strokeStyle = "rgba(226, 232, 240, 0.55)";
        ctx.lineWidth = 1;
        ctx.setLineDash([4, 5]);
        ctx.beginPath();
        ctx.moveTo(px, plotBounds.top);
        ctx.lineTo(px, plotBounds.top + plotHeight);
        const hoverValues = [];
        if (showF && Number.isFinite(hoverPoint.fY)) {
            hoverValues.push({ y: hoverPoint.fY, color: "#a3e635" });
        }
        if (showG && Number.isFinite(hoverPoint.gY)) {
            hoverValues.push({ y: hoverPoint.gY, color: "#38bdf8" });
        }
        for (const point of hoverValues) {
            const py = toY(point.y);
            ctx.moveTo(plotBounds.left, py);
            ctx.lineTo(plotBounds.left + plotWidth, py);
        }
        ctx.stroke();
        ctx.setLineDash([]);
        for (const point of hoverValues) {
            ctx.fillStyle = point.color;
            ctx.beginPath();
            ctx.arc(px, toY(point.y), 4, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.restore();
    }

    ctx.fillStyle = "#8996a6";
    ctx.textAlign = "left";
    ctx.textBaseline = "top";
    ctx.fillText(`X: [${formatNumber(view.xmin, 3)}, ${formatNumber(view.xmax, 3)}]`, 12, 8);
}

function resizeCanvas() {
    if (resizeScheduled) return;
    resizeScheduled = true;
    window.requestAnimationFrame(() => {
        resizeScheduled = false;
        const rect = canvas.getBoundingClientRect();
        if (!rect.width || !rect.height) return;
        canvasSize.width = rect.width;
        canvasSize.height = rect.height;
        pixelRatio = Math.max(1, window.devicePixelRatio || 1);
        const backingWidth = Math.round(rect.width * pixelRatio);
        const backingHeight = Math.round(rect.height * pixelRatio);
        if (canvas.width !== backingWidth || canvas.height !== backingHeight) {
            canvas.width = backingWidth;
            canvas.height = backingHeight;
        }
        ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
        drawGraph();
    });
}

function toggleGraphFullscreen(force = !app.classList.contains("graph-fullscreen")) {
    app.classList.toggle("graph-fullscreen", force);
    graphPanel.classList.toggle("graph-fullscreen", force);
    document.body.classList.toggle("graph-focus-mode", force);
    fullscreenButton.setAttribute("aria-pressed", String(force));
    fullscreenButton.textContent = force ? "⛶ Quitter" : "⛶ Plein écran";
    fullscreenButton.title = force ? "Quitter le plein écran" : "Plein écran";
    window.requestAnimationFrame(() => {
        resizeCanvas();
        if (force) window.scrollTo(0, 0);
    });
}

function buildShareUrl() {
    const url = new URL(window.location.href);
    const params = new URLSearchParams();
    const expression = exprInput.value.trim();
    if (expression) params.set("f", expression);
    const secondExpression = !gExpressionRow.hidden ? gExprInput.value.trim() : "";
    if (secondExpression) params.set("g", secondExpression);
    for (const [key, input] of [
        ["xmin", xminInput],
        ["xmax", xmaxInput],
        ["xval", xvalInput],
        ["a", parameterAInput],
        ["b", parameterBInput]
    ]) {
        if (input.value.trim()) params.set(key, input.value.trim());
    }
    params.set("angle", angleMode);
    params.set("yauto", yAxisAuto ? "1" : "0");
    if (!yAxisAuto) {
        params.set("ymin", yminInput.value);
        params.set("ymax", ymaxInput.value);
    }
    params.set("grid", showGrid ? "1" : "0");
    params.set("integral", showIntegralArea ? "1" : "0");
    params.set("derivative", showDerivativeInput.checked ? "1" : "0");
    params.set("concavity", showConcavityInput.checked ? "1" : "0");
    params.set("keypoints", showKeyPointsInput.checked ? "1" : "0");
    params.set("tangent", showTangentInput.checked ? "1" : "0");
    params.set("gDerivative", showGDerivativeInput.checked ? "1" : "0");
    params.set("display", displayMode);
    url.search = params.toString();
    return url.toString();
}

async function copyShareUrl() {
    if (!exprInput.value.trim() &&
        (gExpressionRow.hidden || !gExprInput.value.trim())) {
        graphActionStatus.textContent = "Saisissez une expression avant de la partager.";
        return;
    }
    try {
        clearTimeout(shareFeedbackTimer);
        shareButton.textContent = "Partager";
        await navigator.clipboard.writeText(buildShareUrl());
        shareButton.textContent = "Copié ✓";
        graphActionStatus.textContent = "";
        shareFeedbackTimer = setTimeout(() => {
            shareButton.textContent = "Partager";
        }, 2000);
    } catch (error) {
        console.error("Unable to copy the share URL.", error);
        graphActionStatus.textContent =
            "Copie impossible. Vérifiez les permissions du presse-papiers.";
    }
}

function exportCsv() {
    if (!currentData || !Array.isArray(currentData.points)) {
        graphActionStatus.textContent = "Tracez une fonction avant d’exporter les données.";
        return;
    }
    const hasG = !gExpressionRow.hidden && Boolean(gExprInput.value.trim());
    const headers = ["x", "f(x)", "f'(x)"];
    if (hasG) headers.push("g(x)");
    const csvRows = [headers.join(",")];
    const derivativePoints = Array.isArray(currentData.derivativePoints)
        ? currentData.derivativePoints
        : [];
    for (let i = 0; i < currentData.points.length; i++) {
        const point = currentData.points[i];
        const derivative = derivativePoints[i];
        const row = [
            point && Number.isFinite(point.x) ? point.x : "",
            point && Number.isFinite(point.y) ? point.y : "",
            derivative && Number.isFinite(derivative.y) ? derivative.y : ""
        ];
        if (hasG) {
            const gPoint = gData && Array.isArray(gData.points) ? gData.points[i] : null;
            row.push(gPoint && Number.isFinite(gPoint.y) ? gPoint.y : "");
        }
        csvRows.push(row.join(","));
    }
    try {
        const blob = new Blob(["\uFEFF", csvRows.join("\r\n")], {
            type: "text/csv;charset=utf-8"
        });
        const objectUrl = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = objectUrl;
        link.download = "c-math-plotter-data.csv";
        link.click();
        window.setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
        graphActionStatus.textContent = "Export CSV téléchargé.";
    } catch (error) {
        console.error("Unable to export CSV data.", error);
        graphActionStatus.textContent = "Export CSV impossible dans ce navigateur.";
    }
}

function interpolateSampledValue(points, x) {
    if (!Array.isArray(points) || !points.length || !Number.isFinite(x)) return null;
    const tolerance = 1e-9 * Math.max(1, Math.abs(x));
    let low = 0;
    let high = points.length;
    while (low < high) {
        const middle = Math.floor((low + high) / 2);
        const point = points[middle];
        if (!point || !Number.isFinite(point.x)) return null;
        if (point.x < x) low = middle + 1;
        else high = middle;
    }

    const right = points[low];
    if (right && Math.abs(right.x - x) <= tolerance) {
        return Number.isFinite(right.y) ? right.y : null;
    }
    if (low === 0 || low >= points.length) return null;

    const left = points[low - 1];
    if (!left || !right || !Number.isFinite(left.x) || !Number.isFinite(right.x) ||
        !Number.isFinite(left.y) || !Number.isFinite(right.y) || right.x <= left.x) {
        return null;
    }
    const ratio = (x - left.x) / (right.x - left.x);
    return left.y + (right.y - left.y) * ratio;
}

function renderValuesTable(functionSamples, secondFunctionSamples, start, end, step, hasG) {
    const headers = ["x", "f(x)", "f'(x)"];
    if (hasG) headers.push("g(x)");

    const headerRow = document.createElement("tr");
    headers.forEach(label => {
        const cell = document.createElement("th");
        cell.scope = "col";
        cell.textContent = label;
        headerRow.appendChild(cell);
    });
    valuesTableHead.replaceChildren(headerRow);
    valuesTableBody.replaceChildren();

    const tsvRows = [headers.join("\t")];
    const derivativeSamples = functionSamples.derivativePoints;
    let rowCount = 0;
    for (let index = 0; index < 200; index++) {
        const x = start + index * step;
        if (x > end + step * 1e-10) break;
        const values = [
            x,
            interpolateSampledValue(functionSamples.points, x),
            interpolateSampledValue(derivativeSamples, x)
        ];
        if (hasG) {
            values.push(interpolateSampledValue(
                secondFunctionSamples && secondFunctionSamples.points,
                x
            ));
        }
        const formattedValues = values.map(value => formatNumber(value, 3));
        const row = document.createElement("tr");
        formattedValues.forEach(value => {
            const cell = document.createElement("td");
            cell.textContent = value;
            row.appendChild(cell);
        });
        valuesTableBody.appendChild(row);
        tsvRows.push(formattedValues.join("\t"));
        rowCount++;
    }

    const truncated = rowCount === 200 && start + rowCount * step <= end + step * 1e-10;
    valuesTableTsv = rowCount ? tsvRows.join("\n") : "";
    copyValuesButton.disabled = !valuesTableTsv;
    valuesStatus.textContent = truncated
        ? `200 valeurs affichées (limite atteinte).`
        : `${rowCount} valeur${rowCount > 1 ? "s" : ""} affichée${rowCount > 1 ? "s" : ""}.`;
}

async function generateValuesTable() {
    const start = Number(valuesStartInput.value);
    const end = Number(valuesEndInput.value);
    const step = Number(valuesStepInput.value);
    const expression = exprInput.value.trim();
    const secondExpression = !gExpressionRow.hidden ? gExprInput.value.trim() : "";
    if (!valuesStartInput.value.trim() || !valuesEndInput.value.trim() ||
        !valuesStepInput.value.trim() || !Number.isFinite(start) ||
        !Number.isFinite(end) || start >= end ||
        !Number.isFinite(step) || step < 0.01 || !expression) {
        valuesTableHead.replaceChildren();
        valuesTableBody.replaceChildren();
        valuesTableTsv = "";
        copyValuesButton.disabled = true;
        valuesStatus.textContent = "Vérifiez l'expression, les bornes et le pas (minimum 0,01).";
        return;
    }

    const requestId = ++valuesTableRequestId;
    valuesGenerateButton.disabled = true;
    copyValuesButton.disabled = true;
    valuesTableHead.replaceChildren();
    valuesTableBody.replaceChildren();
    valuesTableTsv = "";
    valuesStatus.textContent = "Calcul des valeurs…";

    try {
        const requests = [
            fetch(makeRequestUrl(start, end, start, false, expression))
        ];
        if (secondExpression) {
            requests.push(fetch(makeRequestUrl(start, end, start, false, secondExpression)));
        }
        const responses = await Promise.all(requests);
        for (const response of responses) {
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
        }
        const samples = await Promise.all(responses.map(response => response.json()));
        if (requestId !== valuesTableRequestId) return;
        renderValuesTable(
            samples[0], secondExpression ? samples[1] : null, start, end, step,
            Boolean(secondExpression)
        );
    } catch (error) {
        if (requestId !== valuesTableRequestId) return;
        console.error("Unable to generate the values table.", error);
        valuesStatus.textContent = "Impossible de générer le tableau. Vérifiez le serveur et réessayez.";
    } finally {
        if (requestId === valuesTableRequestId) {
            valuesGenerateButton.disabled = false;
        }
    }
}

async function copyValuesTable() {
    if (!valuesTableTsv) return;
    try {
        await navigator.clipboard.writeText(valuesTableTsv);
        valuesStatus.textContent = "Tableau copié.";
    } catch (error) {
        console.error("Unable to copy the values table.", error);
        valuesStatus.textContent =
            "Copie impossible. Vérifiez les permissions du presse-papiers.";
    }
}

function canvasPoint(event) {
    const rect = canvas.getBoundingClientRect();
    return {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
        clientX: event.clientX,
        clientY: event.clientY
    };
}

function requestSequenceHover(point) {
    const plotWidth = canvas.clientWidth - plotBounds.left - plotBounds.right;
    const plotHeight = canvas.clientHeight - plotBounds.top - plotBounds.bottom;
    const ratio = (point.x - plotBounds.left) / plotWidth;
    if (ratio < 0 || ratio > 1 || !sequenceData || !Array.isArray(sequenceData.terms)) {
        hoverPoint = null;
        tooltip.style.display = "none";
        drawGraph();
        return;
    }

    let nearest = null;
    let nearestDistance = Infinity;
    for (const candidate of sequenceData.terms) {
        const n = Number(candidate.n);
        const value = Number(candidate.u);
        if (!Number.isFinite(n) || n < view.xmin || n > view.xmax ||
            candidate.u === null || !Number.isFinite(value)) continue;
        const distance = Math.hypot(
            (n - view.xmin) / (view.xmax - view.xmin) * plotWidth -
                (point.x - plotBounds.left),
            (drawSequenceGraph.ymax - value) /
                (drawSequenceGraph.ymax - drawSequenceGraph.ymin) * plotHeight -
                (point.y - plotBounds.top)
        );
        if (distance < nearestDistance) {
            nearest = candidate;
            nearestDistance = distance;
        }
    }
    const term = nearestDistance <= 16 ? nearest : null;
    const n = term ? Number(term.n) : NaN;
    if (!term || term.u === null || !Number.isFinite(Number(term.u))) {
        hoverPoint = null;
        tooltip.style.display = "none";
        drawGraph();
        return;
    }
    hoverPoint = { sequenceN: n, sequenceU: Number(term.u) };
    const wrapperRect = canvas.parentElement.getBoundingClientRect();
    const mouseX = point.clientX - wrapperRect.left;
    const mouseY = point.clientY - wrapperRect.top;
    tooltip.textContent = `(n, uₙ) = (${n}, ${formatNumber(term.u, 6)})`;
    tooltip.style.left = `${Math.max(4, Math.min(mouseX, wrapperRect.width - 210))}px`;
    tooltip.style.top = `${Math.max(4, Math.min(mouseY, wrapperRect.height - 42))}px`;
    tooltip.style.display = "block";
    drawGraph();
}

function requestHover(point) {
    if (workspaceMode === "sequence") {
        requestSequenceHover(point);
        return;
    }
    clearTimeout(hoverTimer);
    const requestId = ++hoverRequestId;
    const plotWidth = canvas.clientWidth - plotBounds.left - plotBounds.right;
    const ratio = (point.x - plotBounds.left) / plotWidth;
    if (ratio < 0 || ratio > 1) {
        hoverPoint = null;
        tooltip.style.display = "none";
        drawGraph();
        return;
    }
    const x = view.xmin + ratio * (view.xmax - view.xmin);
    const modeAtRequest = displayMode;
    hoverTimer = setTimeout(async () => {
        try {
            const fetchValue = expression => fetch(
                makeRequestUrl(view.xmin, view.xmax, x, true, expression)
            ).then(response => {
                if (!response.ok) throw new Error(`HTTP ${response.status}`);
                return response.json();
            });
            const requests = [];
            const requestTypes = [];
            const fExpression = exprInput.value.trim();
            const gExpression = !gExpressionRow.hidden ? gExprInput.value.trim() : "";
            if (modeAtRequest !== "g" && fExpression) {
                requests.push(fetchValue(fExpression));
                requestTypes.push("f");
            }
            if (modeAtRequest !== "f" && gExpression) {
                requests.push(fetchValue(gExpression));
                requestTypes.push("g");
            }
            if (!requests.length) return;
            const results = await Promise.all(requests);
            if (requestId !== hoverRequestId || modeAtRequest !== displayMode || drag || touchGesture) return;
            const values = {};
            requestTypes.forEach((type, index) => {
                values[type] = results[index];
            });
            const xval = (values.f || values.g).xval;
            hoverPoint = {
                x: xval,
                fY: values.f ? values.f.yval : null,
                gY: values.g ? values.g.yval : null
            };
            const wrapperRect = canvas.parentElement.getBoundingClientRect();
            const mouseX = point.clientX - wrapperRect.left;
            const mouseY = point.clientY - wrapperRect.top;
            const tooltipLines = [];
            if (values.f) {
                tooltipLines.push(`f(x): (${formatNumber(values.f.xval, 6)}, ${formatNumber(values.f.yval, 6)})`);
            }
            if (values.g) {
                tooltipLines.push(`g(x): (${formatNumber(values.g.xval, 6)}, ${formatNumber(values.g.yval, 6)})`);
            }
            tooltip.textContent = tooltipLines.join("\n");
            tooltip.style.left = `${Math.max(4, Math.min(mouseX, wrapperRect.width - 210))}px`;
            tooltip.style.top = `${Math.max(4, Math.min(mouseY, wrapperRect.height - (tooltipLines.length > 1 ? 60 : 42)))}px`;
            tooltip.style.display = "block";
            drawGraph();
        } catch (error) {
            if (requestId === hoverRequestId) {
                hoverPoint = null;
                tooltip.style.display = "none";
                drawGraph();
            }
        }
    }, 45);
}

function rememberExpressionSelection(input = activeInput) {
    savedSelections.set(input, {
        start: input.selectionStart,
        end: input.selectionEnd
    });
}

function focusExpression(input = activeInput, restoreSelection = false) {
    activeInput = input;
    input.focus({ preventScroll: true });
    const selection = savedSelections.get(input);
    if (restoreSelection && selection && document.activeElement === input) {
        input.setSelectionRange(selection.start, selection.end);
    }
}

function insertAtExpressionSelection(text, caretOffset = text.length) {
    const input = activeInput;
    const savedSelection = savedSelections.get(input) || {
        start: input.value.length,
        end: input.value.length
    };
    const selection = document.activeElement === input
        ? { start: input.selectionStart, end: input.selectionEnd }
        : savedSelection;
    const start = Math.max(0, Math.min(selection.start, input.value.length));
    const end = Math.max(start, Math.min(selection.end, input.value.length));
    if (input.maxLength > 0 &&
        input.value.length - (end - start) + text.length > input.maxLength) {
        focusExpression(input);
        input.setSelectionRange(start, end);
        fResult.textContent = `Limite : ${input.maxLength} caractères`;
        rememberExpressionSelection(input);
        return;
    }
    input.setRangeText(text, start, end, "end");
    focusExpression(input);
    const caret = start + caretOffset;
    input.setSelectionRange(caret, caret);
    input.dispatchEvent(new Event("input", { bubbles: true }));
    rememberExpressionSelection(input);
}

function backspaceExpression() {
    const input = activeInput;
    const savedSelection = savedSelections.get(input) || {
        start: input.value.length,
        end: input.value.length
    };
    const selection = document.activeElement === input
        ? { start: input.selectionStart, end: input.selectionEnd }
        : savedSelection;
    let { start, end } = selection;
    if (start === end && start > 0) start--;
    if (start !== end) {
        input.setRangeText("", start, end, "start");
        input.dispatchEvent(new Event("input", { bubbles: true }));
    }
    focusExpression(input);
    input.setSelectionRange(start, start);
    rememberExpressionSelection(input);
}

function beginTouchGesture(touches) {
    const rect = canvas.getBoundingClientRect();
    if (touches.length >= 2) {
        const first = touches[0];
        const second = touches[1];
        touchGesture = {
            type: "pinch",
            centerX: (first.clientX + second.clientX) / 2 - rect.left,
            distance: Math.max(1, Math.hypot(
                second.clientX - first.clientX,
                second.clientY - first.clientY
            ))
        };
        return;
    }

    if (touches.length === 1) {
        touchGesture = {
            type: "pan",
            startX: touches[0].clientX - rect.left,
            xmin: view.xmin,
            xmax: view.xmax
        };
    } else {
        touchGesture = null;
    }
}

function applyPendingTouchMove() {
    const touches = pendingTouchPoints;
    pendingTouchPoints = null;
    if (!touchGesture || !touches || !touches.length) return;

    const rect = canvas.getBoundingClientRect();
    const plotWidth = rect.width - plotBounds.left - plotBounds.right;
    if (plotWidth <= 0) return;

    if (touchGesture.type === "pan" && touches.length === 1) {
        const touchX = touches[0].clientX - rect.left;
        const shift = (touchX - touchGesture.startX) / plotWidth *
            (touchGesture.xmax - touchGesture.xmin);
        if (shift !== 0) {
            setView(touchGesture.xmin - shift, touchGesture.xmax - shift);
            touchViewChanged = true;
            drawGraph();
        }
        return;
    }

    if (touchGesture.type !== "pinch" || touches.length < 2) return;
    const first = touches[0];
    const second = touches[1];
    const centerX = (first.clientX + second.clientX) / 2 - rect.left;
    const distance = Math.max(1, Math.hypot(
        second.clientX - first.clientX,
        second.clientY - first.clientY
    ));
    const oldRange = view.xmax - view.xmin;
    const oldRatio = Math.max(0, Math.min(1,
        (touchGesture.centerX - plotBounds.left) / plotWidth));
    const anchorX = view.xmin + oldRatio * oldRange;
    const newRange = Math.max(1e-6, Math.min(1e6,
        oldRange * touchGesture.distance / distance));
    const newRatio = Math.max(0, Math.min(1,
        (centerX - plotBounds.left) / plotWidth));
    const newXmin = anchorX - newRatio * newRange;

    if (newRange !== oldRange || newXmin !== view.xmin) {
        setView(newXmin, newXmin + newRange);
        touchViewChanged = true;
        drawGraph();
    }
    touchGesture.centerX = centerX;
    touchGesture.distance = distance;
}

function flushPendingTouchMove() {
    if (touchFrameId) {
        window.cancelAnimationFrame(touchFrameId);
        touchFrameId = 0;
    }
    applyPendingTouchMove();
}

canvas.addEventListener("touchstart", event => {
    event.preventDefault();
    flushPendingTouchMove();
    if (!touchGesture) touchViewChanged = false;
    beginTouchGesture(event.touches);
    drag = null;
    hoverPoint = null;
    ++hoverRequestId;
    clearTimeout(hoverTimer);
    tooltip.style.display = "none";
}, { passive: false });

canvas.addEventListener("touchmove", event => {
    if (!touchGesture || !event.touches.length) return;
    event.preventDefault();
    pendingTouchPoints = Array.from(event.touches)
        .slice(0, 2)
        .map(touch => ({ clientX: touch.clientX, clientY: touch.clientY }));
    if (touchFrameId) return;
    touchFrameId = window.requestAnimationFrame(() => {
        touchFrameId = 0;
        applyPendingTouchMove();
    });
}, { passive: false });

canvas.addEventListener("touchend", event => {
    event.preventDefault();
    flushPendingTouchMove();
    if (event.touches.length) {
        beginTouchGesture(event.touches);
        return;
    }
    touchGesture = null;
    if (touchViewChanged) fetchAndPlot();
    touchViewChanged = false;
}, { passive: false });

canvas.addEventListener("touchcancel", () => {
    flushPendingTouchMove();
    touchGesture = null;
    if (touchViewChanged) fetchAndPlot();
    touchViewChanged = false;
});

canvas.addEventListener("wheel", event => {
    event.preventDefault();
    const point = canvasPoint(event);
    const plotWidth = canvas.clientWidth - plotBounds.left - plotBounds.right;
    const ratio = Math.max(0, Math.min(1, (point.x - plotBounds.left) / plotWidth));
    const oldRange = view.xmax - view.xmin;
    const anchorX = view.xmin + ratio * oldRange;
    const factor = event.deltaY < 0 ? 0.8 : 1.25;
    const newRange = Math.max(1e-6, Math.min(1e6, oldRange * factor));
    setView(anchorX - ratio * newRange, anchorX + (1 - ratio) * newRange);
    drawGraph();
    clearTimeout(zoomTimer);
    zoomTimer = setTimeout(fetchAndPlot, 120);
}, { passive: false });

canvas.addEventListener("pointerdown", event => {
    if (event.pointerType === "touch" || event.button !== 0) return;
    const point = canvasPoint(event);
    drag = {
        startX: point.x,
        xmin: view.xmin,
        xmax: view.xmax
    };
    canvas.setPointerCapture(event.pointerId);
    canvas.style.cursor = "grabbing";
    hoverPoint = null;
    tooltip.style.display = "none";
});

canvas.addEventListener("pointermove", event => {
    if (event.pointerType === "touch") return;
    const point = canvasPoint(event);
    if (drag) {
        const plotWidth = canvas.clientWidth - plotBounds.left - plotBounds.right;
        const shift = (point.x - drag.startX) / plotWidth * (drag.xmax - drag.xmin);
        setView(drag.xmin - shift, drag.xmax - shift);
        drawGraph();
        return;
    }
    requestHover(point);
});

function finishDrag(event) {
    if (event && event.pointerType === "touch") return;
    if (!drag) return;
    drag = null;
    canvas.style.cursor = "crosshair";
    fetchAndPlot();
}

canvas.addEventListener("pointerup", finishDrag);
canvas.addEventListener("pointercancel", finishDrag);
canvas.addEventListener("pointerleave", event => {
    if (event.pointerType === "touch" || drag) return;
    clearTimeout(hoverTimer);
    ++hoverRequestId;
    hoverPoint = null;
    tooltip.style.display = "none";
    drawGraph();
});

document.getElementById("plotBtn").addEventListener("click", fetchAndPlot);
document.getElementById("resetBtn").addEventListener("click", () => {
    if (workspaceMode === "sequence") {
        fetchSequenceAndPlot(true);
        return;
    }
    setView(initialView.xmin, initialView.xmax);
    fetchAndPlot();
});
document.getElementById("exportBtn").addEventListener("click", () => {
    const link = document.createElement("a");
    link.download = "math-graph.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
});
fullscreenButton.addEventListener("click", () => toggleGraphFullscreen());
shareButton.addEventListener("click", copyShareUrl);
exportCsvButton.addEventListener("click", exportCsv);
valuesTableButton.addEventListener("click", () => {
    ++valuesTableRequestId;
    valuesGenerateButton.disabled = false;
    valuesTableHead.replaceChildren();
    valuesTableBody.replaceChildren();
    valuesTableTsv = "";
    copyValuesButton.disabled = true;
    valuesStartInput.value = xminInput.value;
    valuesEndInput.value = xmaxInput.value;
    valuesStepInput.value = "1";
    valuesStatus.textContent = "";
    valuesDialog.showModal();
});
valuesCloseButton.addEventListener("click", () => valuesDialog.close());
valuesDialog.addEventListener("click", event => {
    if (event.target === valuesDialog) valuesDialog.close();
});
valuesDialog.addEventListener("close", () => {
    ++valuesTableRequestId;
    valuesGenerateButton.disabled = false;
    valuesTableButton.focus();
});
[valuesStartInput, valuesEndInput, valuesStepInput].forEach(input => {
    input.addEventListener("input", () => {
        ++valuesTableRequestId;
        valuesGenerateButton.disabled = false;
        valuesTableHead.replaceChildren();
        valuesTableBody.replaceChildren();
        valuesTableTsv = "";
        copyValuesButton.disabled = true;
        valuesStatus.textContent = "Générez pour actualiser le tableau.";
    });
});
valuesGenerateButton.addEventListener("click", generateValuesTable);
copyValuesButton.addEventListener("click", copyValuesTable);
gridToggle.addEventListener("click", () => {
    showGrid = !showGrid;
    updateGraphToggle(gridToggle, showGrid);
    drawGraph();
});
integralToggle.addEventListener("click", () => {
    showIntegralArea = !showIntegralArea;
    updateGraphToggle(integralToggle, showIntegralArea);
    drawGraph();
});
clearHistoryButton.addEventListener("click", () => {
    expressionHistoryItems = [];
    try {
        localStorage.removeItem(expressionHistoryStorageKey);
        historyStatus.textContent = "";
    } catch (error) {
        console.error("Unable to clear expression history.", error);
        historyStatus.textContent = "Impossible d’effacer l’historique enregistré.";
    }
    renderExpressionHistory();
});
zoomInButton.addEventListener("click", () => zoomByFactor(0.75));
zoomOutButton.addEventListener("click", () => zoomByFactor(1.33));
addGButton.addEventListener("click", () => {
    gExpressionRow.style.removeProperty("display");
    gExpressionRow.hidden = false;
    gDerivativeToggle.hidden = false;
    addGButton.style.removeProperty("display");
    addGButton.hidden = true;
    addGButton.setAttribute("aria-expanded", "true");
    updateParameterAvailability();
    updateGResultPending();
    focusExpression(gExprInput, true);
});
removeGButton.addEventListener("click", () => {
    gExpressionRow.style.removeProperty("display");
    gExpressionRow.hidden = true;
    gDerivativeToggle.hidden = true;
    showGDerivativeInput.checked = false;
    addGButton.style.removeProperty("display");
    addGButton.hidden = false;
    addGButton.setAttribute("aria-expanded", "false");
    gExprInput.value = "";
    gData = null;
    displayMode = "both";
    updateParameterAvailability();
    updateGResultPending();
    updateAnalysisActiveCount();
    ++hoverRequestId;
    clearTimeout(hoverTimer);
    tooltip.style.display = "none";
    activeInput = exprInput;
    focusExpression(exprInput, true);
    drawGraph();
    fetchAndPlot();
});
guideOpenButton.addEventListener("click", () => guideDialog.showModal());
guideCloseButton.addEventListener("click", () => guideDialog.close());
guideDialog.addEventListener("click", event => {
    if (event.target === guideDialog) guideDialog.close();
});
guideDialog.addEventListener("keydown", event => {
    if (event.key === "Escape") {
        event.preventDefault();
        guideDialog.close();
    }
});
guideDialog.addEventListener("close", () => guideOpenButton.focus());
[showDerivativeInput, showGDerivativeInput, showConcavityInput, showKeyPointsInput]
    .forEach(input => {
        input.addEventListener("change", () => {
            updateAnalysisActiveCount();
            drawGraph();
        });
    });
showTangentInput.addEventListener("change", () => {
    updateAnalysisActiveCount();
    updateTangentResult();
    drawGraph();
});
workspaceModeButtons.forEach(button => {
    button.addEventListener("click", () => setWorkspaceMode(button.dataset.workspaceMode));
});
sequenceTypeButtons.forEach(button => {
    button.addEventListener("click", () => {
        setSequenceType(button.dataset.sequenceType);
        if (workspaceMode === "sequence") fetchSequenceAndPlot(true);
    });
});
sequencePlotButton.addEventListener("click", () => fetchSequenceAndPlot(true));
angleModeButtons.forEach(button => {
    button.addEventListener("click", () => {
        angleMode = button.dataset.angle;
        updateAngleModeUI();
        updateAdvancedActiveCount();
        fetchAndPlot();
    });
});
integrationAutoButton.addEventListener("click", () => {
    integrationAuto = !integrationAuto;
    integrationAutoButton.classList.toggle("is-active", integrationAuto);
    integrationAutoButton.setAttribute("aria-pressed", String(integrationAuto));
    intMinInput.disabled = integrationAuto;
    intMaxInput.disabled = integrationAuto;
    updateAdvancedActiveCount();
    if (integrationAuto) setView(view.xmin, view.xmax);
    fetchAndPlot();
});
yAxisModeToggle.addEventListener("click", () => {
    yAxisAuto = !yAxisAuto;
    updateYAxisModeUI();
    updateAdvancedActiveCount();
    drawGraph();
});
[yminInput, ymaxInput].forEach(input => {
    input.addEventListener("input", drawGraph);
    input.addEventListener("keydown", event => {
        if (event.key === "Enter") drawGraph();
    });
});
[intMinInput, intMaxInput].forEach(input => {
    input.addEventListener("input", () => {
        if (integrationAuto) return;
        clearTimeout(settingsPlotTimer);
        settingsPlotTimer = setTimeout(fetchAndPlot, 180);
    });
    input.addEventListener("keydown", event => {
        if (event.key === "Enter") fetchAndPlot();
    });
});
parametersToggle.addEventListener("click", () => {
    setParameterControlsExpanded(parametersToggle.getAttribute("aria-expanded") !== "true");
});
[parameterAInput, parameterBInput].forEach(input => {
    input.addEventListener("input", () => {
        updateParameterOutputs();
        clearTimeout(parameterPlotTimer);
        parameterPlotTimer = setTimeout(fetchAndPlot, 60);
    });
});
graphModeButtons.forEach(button => {
    button.addEventListener("click", () => setDisplayMode(button.dataset.mode));
});
function toggleMathKeyboard(input) {
    if (input) activeInput = input;
    setMathKeyboardExpanded(mathKeyboard.hidden);
}

keypadToggle.addEventListener("click", () => toggleMathKeyboard(exprInput));
sequenceKeypadToggle.addEventListener("click", () => toggleMathKeyboard(sequenceExprInput));
mathKeyboard.querySelectorAll("button").forEach(button => {
    button.addEventListener("mousedown", event => event.preventDefault());
    button.addEventListener("click", () => {
        const action = button.dataset.keyAction;
        if (action === "backspace") {
            backspaceExpression();
        } else if (action === "clear") {
            const input = activeInput;
            input.setRangeText("", 0, input.value.length, "start");
            input.dispatchEvent(new Event("input", { bubbles: true }));
            focusExpression(input);
            input.setSelectionRange(0, 0);
            rememberExpressionSelection(input);
        } else if (action === "plot") {
            focusExpression(activeInput, true);
            fetchAndPlot();
        } else {
            const text = button.hasAttribute("data-insert-variable")
                ? (workspaceMode === "sequence"
                    ? sequenceType === "recursive" ? "u" : "n"
                    : "x")
                : button.dataset.insert;
            insertAtExpressionSelection(
                text,
                Number(button.dataset.caret || text.length)
            );
        }
    });
});
document.querySelectorAll(".preset").forEach(button => {
    button.addEventListener("click", () => {
        exprInput.value = button.dataset.fn;
        rememberExpressionSelection(exprInput);
        fetchAndPlot();
    });
});
document.querySelectorAll(".sequence-preset").forEach(button => {
    button.addEventListener("click", () => {
        const preset = button.dataset.sequencePreset;
        if (preset === "recursive") {
            setSequenceType("recursive");
            sequenceExprInput.value = "0.5*u + 2";
            sequenceU0Input.value = "0";
        } else {
            setSequenceType("explicit");
            sequenceExprInput.value = preset === "alternating"
                ? "(-1)^n / (n + 1)"
                : "1 / (n + 1)";
        }
        sequenceNminInput.value = "0";
        sequenceNmaxInput.value = "20";
        sequenceEvalNInput.value = "5";
        rememberExpressionSelection(sequenceExprInput);
        if (workspaceMode === "sequence") fetchSequenceAndPlot(true);
    });
});

[exprInput, gExprInput].forEach(input => {
    input.addEventListener("focus", () => {
        activeInput = input;
        rememberExpressionSelection(input);
    });
    ["click", "keyup", "select", "input", "blur"].forEach(eventName => {
        input.addEventListener(eventName, () => rememberExpressionSelection(input));
    });
});
gExprInput.addEventListener("input", () => {
    gData = null;
    if (!gExprInput.value.trim()) displayMode = "both";
    updateParameterAvailability();
    updateGResultPending();
    ++hoverRequestId;
    clearTimeout(hoverTimer);
    tooltip.style.display = "none";
    drawGraph();
});
sequenceExprInput.addEventListener("focus", () => {
    activeInput = sequenceExprInput;
    rememberExpressionSelection(sequenceExprInput);
});
["click", "keyup", "select", "input", "blur"].forEach(eventName => {
    sequenceExprInput.addEventListener(eventName, () =>
        rememberExpressionSelection(sequenceExprInput));
});
function scheduleSequencePlot() {
    clearTimeout(settingsPlotTimer);
    settingsPlotTimer = setTimeout(() => fetchSequenceAndPlot(true), 180);
}
[sequenceExprInput, sequenceNminInput, sequenceNmaxInput, sequenceEvalNInput, sequenceU0Input]
    .forEach(input => {
        input.addEventListener("input", () => {
            if (sequenceType === "recursive" &&
                input === sequenceNmaxInput &&
                Number(sequenceEvalNInput.value) > Number(sequenceNmaxInput.value)) {
                sequenceEvalNInput.value = sequenceNmaxInput.value;
            }
            if (workspaceMode === "sequence") scheduleSequencePlot();
        });
        input.addEventListener("keydown", event => {
            if (event.key === "Enter" && workspaceMode === "sequence") {
                fetchSequenceAndPlot(true);
            }
        });
    });
exprInput.addEventListener("input", () => {
    updateParameterAvailability();
});
exprInput.addEventListener("keydown", event => {
    if (event.key === "Enter") fetchAndPlot();
});
[gExprInput, xminInput, xmaxInput, xvalInput].forEach(input => {
    input.addEventListener("keydown", event => {
        if (event.key === "Enter") fetchAndPlot();
    });
});

window.addEventListener("resize", resizeCanvas);
window.addEventListener("keydown", event => {
    if (event.key === "Escape" && app.classList.contains("graph-fullscreen")) {
        toggleGraphFullscreen(false);
    }
});
document.addEventListener("click", event => {
    graphMenus.forEach(menu => {
        if (menu.open && !menu.contains(event.target)) menu.open = false;
    });
});
document.addEventListener("keydown", event => {
    if (event.key !== "Escape") return;
    graphMenus.forEach(menu => {
        if (!menu.open) return;
        menu.open = false;
        if (!document.querySelector("dialog[open]")) {
            menu.querySelector("summary").focus();
        }
    });
});
if (typeof ResizeObserver !== "undefined") {
    new ResizeObserver(resizeCanvas).observe(canvas.parentElement);
}
resizeCanvas();
updateAngleModeUI();
updateParameterOutputs();
updateWorkspaceModeUI();
setSequenceType("explicit");
updateYAxisModeUI();
updateGraphToggle(gridToggle, showGrid);
updateGraphToggle(integralToggle, showIntegralArea);
updateAnalysisActiveCount();
updateAdvancedActiveCount();
loadExpressionHistory();
restoreSharedGraphState();
