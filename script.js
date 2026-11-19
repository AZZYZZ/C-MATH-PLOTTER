const canvas = document.getElementById("graph");
const ctx = canvas.getContext("2d");
const exprInput = document.getElementById("expr");
const gExprInput = document.getElementById("gExpr");
const xminInput = document.getElementById("xmin");
const xmaxInput = document.getElementById("xmax");
const xvalInput = document.getElementById("xval");
const showDerivativeInput = document.getElementById("showDerivative");
const showGDerivativeInput = document.getElementById("showGDerivative");
const gDerivativeToggle = document.getElementById("gDerivativeToggle");
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
const fLegend = document.querySelector(".f-legend");
const fDerivativeLegend = document.querySelector(".f-derivative-legend");
const gLegend = document.querySelector(".g-legend");
const gDerivativeLegend = document.querySelector(".g-derivative-legend");
const zoomInButton = document.getElementById("zoomInBtn");
const zoomOutButton = document.getElementById("zoomOutBtn");
const guideDialog = document.getElementById("guideDialog");
const guideOpenButton = document.getElementById("guideOpenButton");
const guideCloseButton = document.getElementById("guideCloseButton");

const initialView = { xmin: -10, xmax: 10 };
const plotBounds = { left: 58, right: 18, top: 20, bottom: 42 };
let currentData = null;
let gData = null;
let displayMode = "both";
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
    gDerivativeResultItem.classList.toggle("is-hidden", !hasExpression);
    gIntegralResultItem.classList.toggle("is-hidden", !hasExpression);
    gResult.textContent = hasExpression ? "..." : "";
    gDerivativeResult.textContent = hasExpression ? "..." : "";
    gIntegralResult.textContent = hasExpression ? "..." : "";
    updateDisplayModeUI();
}

function updateDisplayModeUI() {
    const hasGExpression = !gExpressionRow.hidden && Boolean(gExprInput.value.trim());
    graphModeSwitch.hidden = !hasGExpression;
    graphModeButtons.forEach(button => {
        const isActive = button.dataset.mode === displayMode;
        button.classList.toggle("is-active", isActive);
        button.setAttribute("aria-pressed", String(isActive));
    });
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
    xminInput.value = Number(xmin.toPrecision(10));
    xmaxInput.value = Number(xmax.toPrecision(10));
    hoverPoint = null;
    ++hoverRequestId;
    clearTimeout(hoverTimer);
    tooltip.style.display = "none";
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
        drawGraph();
    } catch (error) {
        if (requestId !== plotRequestId) return;
        fResult.textContent = "Erreur : démarrez server.exe puis réessayez";
        derivativeResult.textContent = "—";
        integralResult.textContent = "—";
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

    const showF = displayMode !== "g";
    const showG = displayMode !== "f";
    const hasCurrentData = showF && currentData && Array.isArray(currentData.points);
    const hasGData = showG && gData && Array.isArray(gData.points);
    const hasFDerivative = showDerivativeInput.checked && hasCurrentData &&
        Array.isArray(currentData.derivativePoints);
    const hasGDerivative = showGDerivativeInput.checked && hasGData &&
        Array.isArray(gData.derivativePoints);
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
    fLegend.classList.toggle("is-mode-hidden", !showF);
    fDerivativeLegend.classList.toggle("is-mode-hidden", !showF);
    fDerivativeLegend.classList.toggle("is-hidden", !showDerivativeInput.checked);
    gLegend.classList.toggle("is-hidden", !hasGData);
    gDerivativeLegend.classList.toggle("is-mode-hidden", !hasGData);
    gDerivativeLegend.classList.toggle("is-hidden", !showGDerivativeInput.checked);
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
        drawIntegralArea(
            currentData.points, view.xmin, view.xmax, xAxisY, toX, toY,
            plotWidth, plotHeight, "rgba(163, 230, 53, 0.18)"
        );
    }
    if (hasGData && Number.isFinite(gData.integral)) {
        drawIntegralArea(
            gData.points, view.xmin, view.xmax, xAxisY, toX, toY,
            plotWidth, plotHeight, "rgba(56, 189, 248, 0.14)"
        );
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
        drawIntegralBoundaries(
            view.xmin, view.xmax, toX, plotBounds.top, plotBounds.top + plotHeight,
            "rgba(163, 230, 53, 0.48)"
        );
    }
    if (hasGData && Number.isFinite(gData.integral)) {
        drawIntegralBoundaries(
            view.xmin, view.xmax, toX, plotBounds.top, plotBounds.top + plotHeight,
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
    setView(initialView.xmin, initialView.xmax);
    fetchAndPlot();
});
document.getElementById("exportBtn").addEventListener("click", () => {
    const link = document.createElement("a");
    link.download = "math-graph.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
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
    updateGResultPending();
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
showGDerivativeInput.addEventListener("change", drawGraph);
graphModeButtons.forEach(button => {
    button.addEventListener("click", () => setDisplayMode(button.dataset.mode));
});
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
gExprInput.addEventListener("input", () => {
    gData = null;
    if (!gExprInput.value.trim()) displayMode = "both";
    updateGResultPending();
    ++hoverRequestId;
    clearTimeout(hoverTimer);
    tooltip.style.display = "none";
    drawGraph();
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
if (typeof ResizeObserver !== "undefined") {
    new ResizeObserver(resizeCanvas).observe(canvas.parentElement);
}
resizeCanvas();
