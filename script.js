const canvas = document.getElementById("graph");
const ctx = canvas.getContext("2d");
const exprInput = document.getElementById("expr");
const xminInput = document.getElementById("xmin");
const xmaxInput = document.getElementById("xmax");
const xvalInput = document.getElementById("xval");
const showDerivativeInput = document.getElementById("showDerivative");
const tooltip = document.getElementById("graphTooltip");
const fResult = document.getElementById("fResult");
const derivativeResult = document.getElementById("derivativeResult");
const integralResult = document.getElementById("integralResult");
const backendStatus = document.getElementById("backendStatus");
const backendStatusText = document.getElementById("backendStatusText");
const canvasLoading = document.getElementById("canvasLoading");
const keypadToggle = document.getElementById("keypadToggle");
const mathKeyboard = document.getElementById("mathKeyboard");
const derivativeLegend = document.querySelector(".derivative-legend");
const guideDialog = document.getElementById("guideDialog");
const guideOpenButton = document.getElementById("guideOpenButton");
const guideCloseButton = document.getElementById("guideCloseButton");

const initialView = { xmin: -10, xmax: 10 };
const plotBounds = { left: 58, right: 18, top: 20, bottom: 42 };
let currentData = null;
let view = { ...initialView };
let hoverPoint = null;
let hoverTimer = null;
let hoverRequestId = 0;
let plotRequestId = 0;
let zoomTimer = null;
let drag = null;
let savedSelection = { start: exprInput.value.length, end: exprInput.value.length };
let pixelRatio = 1;
const canvasSize = { width: 0, height: 0 };
let resizeScheduled = false;

function formatNumber(value, digits = 5) {
    return value === null || !Number.isFinite(Number(value))
        ? "Indéfini"
        : Number(value).toFixed(digits);
}

function setBackendStatus(state) {
    backendStatus.classList.remove("is-online", "is-offline", "is-checking");
    backendStatus.classList.add(`is-${state}`);
    backendStatusText.textContent = state === "online"
        ? "C Engine online"
        : state === "offline"
            ? "C Engine offline"
            : "C Engine waking up...";
}

function setLoading(isLoading) {
    canvasLoading.classList.toggle("is-visible", isLoading);
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
    if (!Number.isFinite(xmin) || !Number.isFinite(xmax) || xmin >= xmax ||
        !Number.isFinite(xval)) {
        fResult.textContent = "Vérifiez les valeurs saisies";
        return;
    }

    setView(xmin, xmax);
    const requestId = ++plotRequestId;
    setLoading(true);
    if (!currentData) setBackendStatus("checking");
    try {
        const response = await fetch(makeRequestUrl(xmin, xmax, xval));
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = await response.json();
        if (requestId !== plotRequestId) return;

        currentData = data;
        fResult.textContent = `f(${formatNumber(data.xval)}) = ${formatNumber(data.yval, 6)}`;
        derivativeResult.textContent = formatNumber(data.derivative, 6);
        integralResult.textContent = formatNumber(data.integral, 6);
        setBackendStatus("online");
        drawGraph();
    } catch (error) {
        if (requestId !== plotRequestId) return;
        fResult.textContent = "Erreur : démarrez server.exe puis réessayez";
        derivativeResult.textContent = "—";
        integralResult.textContent = "—";
        setBackendStatus("offline");
    } finally {
        if (requestId === plotRequestId) setLoading(false);
    }
}

async function checkBackend() {
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 3000);
    try {
        const response = await fetch(makeRequestUrl(-1, 1, 0, true, "0"), {
            cache: "no-store",
            signal: controller.signal
        });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = await response.json();
        if (!data || !Object.prototype.hasOwnProperty.call(data, "yval")) {
            throw new Error("Unexpected backend response");
        }
        setBackendStatus("online");
    } catch (error) {
        setBackendStatus("offline");
    } finally {
        window.clearTimeout(timeout);
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
    const step = niceStep(max - min, targetTicks);
    const ticks = [];
    for (let value = Math.ceil(min / step) * step; value <= max + step * 1e-8; value += step) {
        ticks.push(Math.abs(value) < step * 1e-9 ? 0 : value);
    }
    return { step, ticks };
}

function getValidYValues(points) {
    return points
        .filter(point => point.y !== null && Number.isFinite(point.y) && Math.abs(point.y) < 1e6)
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

function drawSeries(points, color, lineWidth, dashed = false, glow = false) {
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
        if (point.y === null || !Number.isFinite(point.y) || Math.abs(point.y) > 1e6) {
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
    if (!currentData || !currentData.points) return;

    const values = getValidYValues(currentData.points);
    if (showDerivativeInput.checked && currentData.derivativePoints) {
        values.push(...getValidYValues(currentData.derivativePoints));
    }
    derivativeLegend.classList.toggle("is-hidden", !showDerivativeInput.checked);
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
    const xAxisY = ymin <= 0 && ymax >= 0 ? toY(0) : plotBounds.top + plotHeight;
    const yAxisX = view.xmin <= 0 && view.xmax >= 0 ? toX(0) : plotBounds.left;

    ctx.font = "12px Consolas, monospace";
    ctx.textBaseline = "middle";
    ctx.lineWidth = 1;

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

    drawSeries(currentData.points, "#a3e635", 2.5, false, true);
    if (showDerivativeInput.checked && currentData.derivativePoints) {
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
            const response = await fetch(makeRequestUrl(view.xmin, view.xmax, x, true));
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            const data = await response.json();
            if (requestId !== hoverRequestId || drag) return;
            hoverPoint = { x: data.xval, y: data.yval };
            const wrapperRect = canvas.parentElement.getBoundingClientRect();
            const mouseX = point.clientX - wrapperRect.left;
            const mouseY = point.clientY - wrapperRect.top;
            tooltip.textContent = data.yval === null
                ? `(${formatNumber(data.xval, 6)}, Indéfini)`
                : `(${formatNumber(data.xval, 6)}, ${formatNumber(data.yval, 6)})`;
            tooltip.style.left = `${Math.max(4, Math.min(mouseX, wrapperRect.width - 190))}px`;
            tooltip.style.top = `${Math.max(4, Math.min(mouseY, wrapperRect.height - 42))}px`;
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

function rememberExpressionSelection() {
    savedSelection = {
        start: exprInput.selectionStart,
        end: exprInput.selectionEnd
    };
}

function focusExpression() {
    exprInput.focus({ preventScroll: true });
}

function insertAtExpressionSelection(text, caretOffset = text.length) {
    const selection = document.activeElement === exprInput
        ? { start: exprInput.selectionStart, end: exprInput.selectionEnd }
        : savedSelection;
    const start = Math.max(0, Math.min(selection.start, exprInput.value.length));
    const end = Math.max(start, Math.min(selection.end, exprInput.value.length));
    exprInput.setRangeText(text, start, end, "end");
    focusExpression();
    const caret = start + caretOffset;
    exprInput.setSelectionRange(caret, caret);
    exprInput.dispatchEvent(new Event("input", { bubbles: true }));
    rememberExpressionSelection();
}

function backspaceExpression() {
    const selection = document.activeElement === exprInput
        ? { start: exprInput.selectionStart, end: exprInput.selectionEnd }
        : savedSelection;
    let { start, end } = selection;
    if (start === end && start > 0) start--;
    if (start !== end) {
        exprInput.setRangeText("", start, end, "start");
        exprInput.dispatchEvent(new Event("input", { bubbles: true }));
    }
    focusExpression();
    exprInput.setSelectionRange(start, start);
    rememberExpressionSelection();
}

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
    if (event.button !== 0) return;
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

function finishDrag() {
    if (!drag) return;
    drag = null;
    canvas.style.cursor = "crosshair";
    fetchAndPlot();
}

canvas.addEventListener("pointerup", finishDrag);
canvas.addEventListener("pointercancel", finishDrag);
canvas.addEventListener("pointerleave", () => {
    if (drag) return;
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
            exprInput.setRangeText("", 0, exprInput.value.length, "start");
            exprInput.dispatchEvent(new Event("input", { bubbles: true }));
            focusExpression();
            exprInput.setSelectionRange(0, 0);
            rememberExpressionSelection();
        } else if (action === "plot") {
            focusExpression();
            fetchAndPlot();
        } else {
            insertAtExpressionSelection(button.dataset.insert, Number(button.dataset.caret || button.dataset.insert.length));
        }
    });
});
document.querySelectorAll(".preset").forEach(button => {
    button.addEventListener("click", () => {
        exprInput.value = button.dataset.fn;
        savedSelection = { start: exprInput.value.length, end: exprInput.value.length };
        fetchAndPlot();
    });
});

["click", "keyup", "select", "input", "blur"].forEach(eventName => {
    exprInput.addEventListener(eventName, rememberExpressionSelection);
});
exprInput.addEventListener("keydown", event => {
    if (event.key === "Enter") fetchAndPlot();
});
[xminInput, xmaxInput, xvalInput].forEach(input => {
    input.addEventListener("keydown", event => {
        if (event.key === "Enter") fetchAndPlot();
    });
});

window.addEventListener("resize", resizeCanvas);
if (typeof ResizeObserver !== "undefined") {
    new ResizeObserver(resizeCanvas).observe(canvas.parentElement);
}
resizeCanvas();
fetchAndPlot();
window.setInterval(() => {
    if (!document.hidden) checkBackend();
}, 15000);
