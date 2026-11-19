const canvas = document.getElementById("graph");
const ctx = canvas.getContext("2d");
const exprInput = document.getElementById("expr");
const gExprInput = document.getElementById("gExpr");
const xminInput = document.getElementById("xmin");
const xmaxInput = document.getElementById("xmax");
const xvalInput = document.getElementById("xval");
const showDerivativeInput = document.getElementById("showDerivative");
const tooltip = document.getElementById("graphTooltip");
const fResult = document.getElementById("fResult");
const derivativeResult = document.getElementById("derivativeResult");
const integralResult = document.getElementById("integralResult");
const gResultItem = document.getElementById("gResultItem");
const gResult = document.getElementById("gResult");
const canvasLoading = document.getElementById("canvasLoading");
const keypadToggle = document.getElementById("keypadToggle");
const mathKeyboard = document.getElementById("mathKeyboard");
const addGButton = document.getElementById("addGButton");
const gExpressionRow = document.getElementById("gExpressionRow");
const removeGButton = document.getElementById("removeGButton");
const derivativeLegend = document.querySelector(".derivative-legend");
const gLegend = document.querySelector(".g-legend");
const guideDialog = document.getElementById("guideDialog");
const guideOpenButton = document.getElementById("guideOpenButton");
const guideCloseButton = document.getElementById("guideCloseButton");

const initialView = { xmin: -10, xmax: 10 };
const plotBounds = { left: 58, right: 18, top: 20, bottom: 42 };
let currentData = null;
let gData = null;
let view = { ...initialView };
let hoverPoint = null;
let hoverTimer = null;
let hoverRequestId = 0;
let plotRequestId = 0;
let zoomTimer = null;
let drag = null;
let activeInput = exprInput;
const savedSelections = new Map([
    [exprInput, { start: exprInput.value.length, end: exprInput.value.length }],
    [gExprInput, { start: gExprInput.value.length, end: gExprInput.value.length }]
]);
let pixelRatio = 1;
const canvasSize = { width: 0, height: 0 };
let resizeScheduled = false;
let touchGesture = null;
let pendingTouchPoints = null;
let touchFrameId = 0;
let touchViewChanged = false;

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
    gResultItem.classList.toggle("is-hidden", !hasExpression);
    gResult.textContent = hasExpression ? "..." : "";
}

function setView(xmin, xmax) {
    view = { xmin, xmax };
    xminInput.value = Number(xmin.toPrecision(10));
    xmaxInput.value = Number(xmax.toPrecision(10));
    hoverPoint = null;
    ++hoverRequestId;
    clearTimeout(hoverTimer);
    tooltip.style.display = "none";
}

function getApiBaseUrl() {
    const localHosts = ["localhost", "127.0.0.1", "::1", "[::1]"];
    const isLiveServer = localHosts.includes(window.location.hostname) &&
        ["5500", "5501"].includes(window.location.port);
    const localPreview = window.location.protocol === "file:" || isLiveServer;
    return localPreview ? "http://localhost:8080" : "";
}

function makeRequestUrl(xmin, xmax, xval, valueOnly = false, expression = exprInput.value.trim()) {
    const params = new URLSearchParams({
        expr: expression,
        xmin: String(xmin),
        xmax: String(xmax),
        xval: String(xval)
    });
    if (valueOnly) params.set("valueOnly", "1");
    return `${getApiBaseUrl()}/plot?${params.toString()}`;
}

async function fetchAndPlot() {
    const xmin = Number(xminInput.value);
    const xmax = Number(xmaxInput.value);
    const xval = Number(xvalInput.value);
    if (!Number.isFinite(xmin) || !Number.isFinite(xmax) ||
        !Number.isFinite(xmax - xmin) || xmin >= xmax ||
        !Number.isFinite(xval)) {
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
        gResultItem.classList.add("is-hidden");
        gResult.textContent = "";
        setLoading(false);
        drawGraph();
        return;
    }

    const gExpression = gExpressionRow.hidden ? "" : gExprInput.value.trim();
    updateGResultPending();
    setView(xmin, xmax);
    const requestId = ++plotRequestId;
    setLoading(true);
    try {
        const requests = [
            fetch(makeRequestUrl(xmin, xmax, xval, false, exprInput.value.trim()))
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
        gResult.textContent = !hasCurrentGExpression
            ? ""
            : gData
                ? `g(${formatXValue(gData.xval)}) = ${formatNumber(gData.yval)}`
                : "...";
        fResult.textContent = `f(${formatXValue(currentData.xval)}) = ${formatNumber(currentData.yval)}`;
        derivativeResult.textContent = formatNumber(currentData.derivative);
        integralResult.textContent = formatNumber(currentData.integral);
        drawGraph();
    } catch (error) {
        if (requestId !== plotRequestId) return;
        fResult.textContent = "Erreur : démarrez server.exe puis réessayez";
        derivativeResult.textContent = "—";
        integralResult.textContent = "—";
        gData = null;
        const hasGExpression = !gExpressionRow.hidden && Boolean(gExprInput.value.trim());
        gResultItem.classList.toggle("is-hidden", !hasGExpression);
        gResult.textContent = hasGExpression ? "—" : "";
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

function getValidYValues(points) {
    if (!Array.isArray(points)) return [];
    return points
        .filter(point => point && Number.isFinite(point.x) &&
            point.y !== null && Number.isFinite(point.y) && Math.abs(point.y) < 1e6)
        .map(point => point.y);
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

function drawIntegralArea(points, xmin, xmax, baselineY, toX, toY, plotWidth, plotHeight) {
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
    ctx.fillStyle = "rgba(163, 230, 53, 0.18)";

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

function drawIntegralBoundaries(xmin, xmax, toX, plotTop, plotBottom) {
    if (!Number.isFinite(xmin) || !Number.isFinite(xmax) ||
        !Number.isFinite(plotTop) || !Number.isFinite(plotBottom) ||
        typeof toX !== "function") return;
    ctx.save();
    ctx.strokeStyle = "rgba(163, 230, 53, 0.48)";
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 5]);
    ctx.beginPath();
    for (const value of [xmin, xmax]) {
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
    ctx.setLineDash(dashed ? [8, 6] : []);
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

function drawGraph() {
    const width = canvasSize.width;
    const height = canvasSize.height;
    if (!width || !height) return;
    ctx.clearRect(0, 0, width, height);
    if (!Number.isFinite(view.xmin) || !Number.isFinite(view.xmax) ||
        !Number.isFinite(view.xmax - view.xmin) || view.xmin >= view.xmax) return;

    const hasCurrentData = currentData && Array.isArray(currentData.points);
    const values = hasCurrentData ? getValidYValues(currentData.points) : [];
    if (gData && Array.isArray(gData.points)) {
        values.push(...getValidYValues(gData.points));
    }
    if (showDerivativeInput.checked && hasCurrentData &&
        Array.isArray(currentData.derivativePoints)) {
        values.push(...getValidYValues(currentData.derivativePoints));
    }
    derivativeLegend.classList.toggle("is-hidden", !showDerivativeInput.checked);
    gLegend.classList.toggle("is-hidden", !gData);
    let ymin = values.length ? Math.min(...values) : -10;
    let ymax = values.length ? Math.max(...values) : 10;
    if (ymax - ymin < 1e-9) {
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
    const toX = x => plotBounds.left + ((x - view.xmin) / (view.xmax - view.xmin)) * plotWidth;
    const toY = y => plotBounds.top + plotHeight - ((y - ymin) / (ymax - ymin)) * plotHeight;
    const xAxisY = Math.max(plotBounds.top, Math.min(plotBounds.top + plotHeight, toY(0)));
    const yAxisX = view.xmin <= 0 && view.xmax >= 0 ? toX(0) : plotBounds.left;

    ctx.font = "12px Consolas, monospace";
    ctx.textBaseline = "middle";
    ctx.lineWidth = 1;

    if (hasCurrentData && Number.isFinite(currentData.integral)) {
        drawIntegralArea(currentData.points, view.xmin, view.xmax, xAxisY, toX, toY, plotWidth, plotHeight);
    }

    const xTicks = getTicks(view.xmin, view.xmax, Math.max(3, Math.floor(plotWidth / 90)));
    const yTicks = getTicks(ymin, ymax, Math.max(3, Math.floor(plotHeight / 55)));
    ctx.strokeStyle = "rgba(148, 163, 184, 0.075)";
    drawMinorGrid(view.xmin, view.xmax, xTicks.step, toX, false, plotWidth, plotHeight);
    drawMinorGrid(ymin, ymax, yTicks.step, toY, true, plotWidth, plotHeight);

    ctx.strokeStyle = "rgba(148, 163, 184, 0.15)";
    ctx.fillStyle = "#8996a6";
    for (const tick of xTicks.ticks) {
        const px = toX(tick);
        ctx.beginPath();
        ctx.moveTo(px, plotBounds.top);
        ctx.lineTo(px, plotBounds.top + plotHeight);
        ctx.stroke();
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
        ctx.beginPath();
        ctx.moveTo(plotBounds.left, py);
        ctx.lineTo(plotBounds.left + plotWidth, py);
        ctx.stroke();
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

    if (hasCurrentData && Number.isFinite(currentData.integral)) {
        drawIntegralBoundaries(view.xmin, view.xmax, toX, plotBounds.top, plotBounds.top + plotHeight);
    }

    if (hasCurrentData) {
        drawSeries(currentData.points, "#a3e635", 2.5, false, true);
    }
    if (gData && Array.isArray(gData.points)) {
        drawSeries(gData.points, "#38bdf8", 2.5);
    }
    if (showDerivativeInput.checked && hasCurrentData &&
        Array.isArray(currentData.derivativePoints)) {
        drawSeries(currentData.derivativePoints, "#38bdf8", 2, true);
        ctx.setLineDash([8, 6]);
        ctx.strokeStyle = "#38bdf8";
        ctx.beginPath();
        ctx.moveTo(width - 135, 18);
        ctx.lineTo(width - 110, 18);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.fillStyle = "#38bdf8";
        ctx.textAlign = "left";
        ctx.fillText("f'(x)", width - 104, 18);
    }

    if (hoverPoint && hoverPoint.y !== null &&
        hoverPoint.x >= view.xmin && hoverPoint.x <= view.xmax) {
        const px = toX(hoverPoint.x);
        const py = toY(hoverPoint.y);
        ctx.save();
        ctx.strokeStyle = "rgba(226, 232, 240, 0.55)";
        ctx.lineWidth = 1;
        ctx.setLineDash([4, 5]);
        ctx.beginPath();
        ctx.moveTo(px, plotBounds.top);
        ctx.lineTo(px, plotBounds.top + plotHeight);
        ctx.moveTo(plotBounds.left, py);
        ctx.lineTo(plotBounds.left + plotWidth, py);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.fillStyle = "#a3e635";
        ctx.beginPath();
        ctx.arc(px, py, 4, 0, Math.PI * 2);
        ctx.fill();
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

function canvasPoint(event) {
    const rect = canvas.getBoundingClientRect();
    return {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
        clientX: event.clientX,
        clientY: event.clientY
    };
}

function requestHover(point) {
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
    hoverTimer = setTimeout(async () => {
        try {
            const fetchValue = expression => fetch(
                makeRequestUrl(view.xmin, view.xmax, x, true, expression)
            ).then(response => {
                if (!response.ok) throw new Error(`HTTP ${response.status}`);
                return response.json();
            });
            const requests = [fetchValue(exprInput.value.trim())];
            const gExpression = gData ? gExprInput.value.trim() : "";
            if (gExpression) requests.push(fetchValue(gExpression));
            const [data, gValue] = await Promise.all(requests);
            if (requestId !== hoverRequestId || drag || touchGesture) return;
            hoverPoint = { x: data.xval, y: data.yval };
            const wrapperRect = canvas.parentElement.getBoundingClientRect();
            const mouseX = point.clientX - wrapperRect.left;
            const mouseY = point.clientY - wrapperRect.top;
            const fValue = data.yval === null
                ? `(${formatNumber(data.xval, 6)}, Indéfini)`
                : `(${formatNumber(data.xval, 6)}, ${formatNumber(data.yval, 6)})`;
            const gValueText = gValue
                ? `\ng(${formatNumber(gValue.xval, 6)}) = ${formatNumber(gValue.yval, 6)}`
                : "";
            tooltip.textContent = `${fValue}${gValueText}`;
            tooltip.style.left = `${Math.max(4, Math.min(mouseX, wrapperRect.width - 210))}px`;
            tooltip.style.top = `${Math.max(4, Math.min(mouseY, wrapperRect.height - (gValue ? 60 : 42)))}px`;
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
    setView(initialView.xmin, initialView.xmax);
    fetchAndPlot();
});
document.getElementById("exportBtn").addEventListener("click", () => {
    const link = document.createElement("a");
    link.download = "math-graph.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
});
addGButton.addEventListener("click", () => {
    gExpressionRow.style.removeProperty("display");
    gExpressionRow.hidden = false;
    addGButton.style.removeProperty("display");
    addGButton.hidden = true;
    addGButton.setAttribute("aria-expanded", "true");
    updateGResultPending();
    focusExpression(gExprInput, true);
});
removeGButton.addEventListener("click", () => {
    gExpressionRow.style.removeProperty("display");
    gExpressionRow.hidden = true;
    addGButton.style.removeProperty("display");
    addGButton.hidden = false;
    addGButton.setAttribute("aria-expanded", "false");
    gExprInput.value = "";
    gData = null;
    gResultItem.classList.add("is-hidden");
    gResult.textContent = "";
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
showDerivativeInput.addEventListener("change", drawGraph);
keypadToggle.addEventListener("click", () => {
    const isExpanded = keypadToggle.getAttribute("aria-expanded") === "true";
    keypadToggle.setAttribute("aria-expanded", String(!isExpanded));
    mathKeyboard.hidden = isExpanded;
});
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
            insertAtExpressionSelection(button.dataset.insert, Number(button.dataset.caret || button.dataset.insert.length));
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

[exprInput, gExprInput].forEach(input => {
    input.addEventListener("focus", () => {
        activeInput = input;
        rememberExpressionSelection(input);
    });
    ["click", "keyup", "select", "input", "blur"].forEach(eventName => {
        input.addEventListener(eventName, () => rememberExpressionSelection(input));
    });
});
gExprInput.addEventListener("input", updateGResultPending);
exprInput.addEventListener("keydown", event => {
    if (event.key === "Enter") fetchAndPlot();
});
[gExprInput, xminInput, xmaxInput, xvalInput].forEach(input => {
    input.addEventListener("keydown", event => {
        if (event.key === "Enter") fetchAndPlot();
    });
});

window.addEventListener("resize", resizeCanvas);
if (typeof ResizeObserver !== "undefined") {
    new ResizeObserver(resizeCanvas).observe(canvas.parentElement);
}
resizeCanvas();
