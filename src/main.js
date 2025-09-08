// 🎨 main.js

// 캔버스 참조
const bgCanvas = document.getElementById("backgroundCanvas");
const bgCtx = bgCanvas.getContext("2d");
const drawCanvas = document.getElementById("drawingCanvas");
const drawCtx = drawCanvas.getContext("2d");

// 컨트롤 요소
const gridToggle = document.getElementById("gridToggle");
const colorPicker = document.getElementById("colorPicker");
const brushSizeInput = document.getElementById("brushSize");
const toolSelect = document.getElementById("toolSelect");

// 상태 변수
let drawing = false;
let startX, startY;
let brushColor = colorPicker.value;
let brushSize = brushSizeInput.value;
let currentTool = "pen";
let useGrid = false;

// 🔹 캔버스 크기 자동 조정
function resizeCanvas() {
  const width = window.innerWidth - 40;
  const height = window.innerHeight - 150;

  bgCanvas.width = drawCanvas.width = width;
  bgCanvas.height = drawCanvas.height = height;


  console.log(" width -- " + width);
  console.log(" bgCanvas.height -- " + bgCanvas.height);

  redrawBackground();
}
window.addEventListener("resize", resizeCanvas);
resizeCanvas();

// 🔹 모눈종이 그리기
function drawGrid(spacing = 25) {
  bgCtx.strokeStyle = "#e0e0e0";
  bgCtx.lineWidth = 1;

  for (let x = 0; x < bgCanvas.width; x += spacing) {
    bgCtx.beginPath();
    bgCtx.moveTo(x, 0);
    bgCtx.lineTo(x, bgCanvas.height);
    bgCtx.stroke();
  }
  for (let y = 0; y < bgCanvas.height; y += spacing) {
    bgCtx.beginPath();
    bgCtx.moveTo(0, y);
    bgCtx.lineTo(bgCanvas.width, y);
    bgCtx.stroke();
  }
}

// 🔹 배경 다시 그리기
function redrawBackground() {
  bgCtx.fillStyle = "#ffffff";
  bgCtx.fillRect(0, 0, bgCanvas.width, bgCanvas.height);
  if (useGrid) drawGrid();
}

// ✅ 모눈종이 토글 이벤트
gridToggle.addEventListener("change", (e) => {
  useGrid = e.target.checked;
  redrawBackground();
});

// 🖊 드로잉 이벤트
drawCanvas.addEventListener("mousedown", (e) => {
  drawing = true;
  startX = e.offsetX;
  startY = e.offsetY;

  console.log(" startX -- " + startX);

  if (currentTool === "pen" || currentTool === "eraser") {
    drawCtx.beginPath();
    drawCtx.moveTo(startX, startY);
  }
});

drawCanvas.addEventListener("mousemove", (e) => {
  if (!drawing) return;

  if (currentTool === "pen" || currentTool === "eraser") {
    drawCtx.lineWidth = brushSize;
    drawCtx.lineCap = "round";
    drawCtx.strokeStyle = currentTool === "eraser" ? "#ffffff" : brushColor;
    drawCtx.lineTo(e.offsetX, e.offsetY);
    drawCtx.stroke();
  }
});

drawCanvas.addEventListener("mouseup", (e) => {
  if (!drawing) return;
  drawing = false;

  const endX = e.offsetX;
  const endY = e.offsetY;

  drawCtx.lineWidth = brushSize;
  drawCtx.strokeStyle = brushColor;
  drawCtx.fillStyle = brushColor;

  if (currentTool === "line") {
    drawCtx.beginPath();
    drawCtx.moveTo(startX, startY);
    drawCtx.lineTo(endX, endY);
    drawCtx.stroke();
  } else if (currentTool === "rect") {
    drawCtx.strokeRect(startX, startY, endX - startX, endY - startY);
  } else if (currentTool === "circle") {
    const radius = Math.sqrt(Math.pow(endX - startX, 2) + Math.pow(endY - startY, 2));
    drawCtx.beginPath();
    drawCtx.arc(startX, startY, radius, 0, Math.PI * 2);
    drawCtx.stroke();
  }
});

// 색상 선택
colorPicker.addEventListener("input", (e) => {
  brushColor = e.target.value;
});

// 브러시 크기 선택
brushSizeInput.addEventListener("input", (e) => {
  brushSize = e.target.value;
});

// 도구 선택
toolSelect.addEventListener("change", (e) => {
  currentTool = e.target.value;
});

// Clear 버튼 (드로잉만 초기화, 배경 유지)
document.getElementById("clearBtn").addEventListener("click", () => {
  drawCtx.clearRect(0, 0, drawCanvas.width, drawCanvas.height);
});

// 이미지 저장 (PNG/JPG) → 배경 + 드로잉 합쳐서 저장
function saveCanvas(type = "png") {
  // 임시 캔버스에 두 레이어 합치기
  const tempCanvas = document.createElement("canvas");
  const tempCtx = tempCanvas.getContext("2d");
  tempCanvas.width = bgCanvas.width;
  tempCanvas.height = bgCanvas.height;

  tempCtx.drawImage(bgCanvas, 0, 0);
  tempCtx.drawImage(drawCanvas, 0, 0);

  const link = document.createElement("a");
  link.download = `drawing.${type}`;
  link.href = tempCanvas.toDataURL(`image/${type}`);
  link.click();
}
document.getElementById("savePngBtn").addEventListener("click", () => saveCanvas("png"));
document.getElementById("saveJpgBtn").addEventListener("click", () => saveCanvas("jpeg"));
