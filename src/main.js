const canvas = document.getElementById("drawingCanvas");
const ctx = canvas.getContext("2d");
const gridToggle = document.getElementById("gridToggle");

let drawing = false;
let startX, startY;
let brushColor = document.getElementById("colorPicker").value;
let brushSize = document.getElementById("brushSize").value;
let currentTool = "pen";
let useGrid = false; // ✅ 모눈종이 여부

// 🔹 전체 화면 사이즈로 캔버스 자동 설정
function resizeCanvas() {
  canvas.width = window.innerWidth - 40;
  canvas.height = window.innerHeight - 150;
  redrawBackground();
}
window.addEventListener("resize", resizeCanvas);
resizeCanvas();

// 🔹 모눈종이 그리기 함수
function drawGrid(spacing = 25) {
  ctx.strokeStyle = "#e0e0e0";
  ctx.lineWidth = 1;
  for (let x = 0; x < canvas.width; x += spacing) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, canvas.height);
    ctx.stroke();
  }
  for (let y = 0; y < canvas.height; y += spacing) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(canvas.width, y);
    ctx.stroke();
  }
}

// 🔹 배경 다시 그리기 (모눈 종이 적용/해제 포함)
function redrawBackground() {
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  if (useGrid) drawGrid();
}

// ✅ 모눈종이 체크박스 이벤트
gridToggle.addEventListener("change", (e) => {
  useGrid = e.target.checked;
  redrawBackground();
});

// 🖊 드로잉
canvas.addEventListener("mousedown", (e) => {
  drawing = true;
  startX = e.offsetX;
  startY = e.offsetY;

  if (currentTool === "pen" || currentTool === "eraser") {
    ctx.beginPath();
    ctx.moveTo(startX, startY);
  }
});

canvas.addEventListener("mousemove", (e) => {
  if (!drawing) return;

  if (currentTool === "pen" || currentTool === "eraser") {
    ctx.lineWidth = brushSize;
    ctx.lineCap = "round";
    ctx.strokeStyle = currentTool === "eraser" ? "#ffffff" : brushColor;
    ctx.lineTo(e.offsetX, e.offsetY);
    ctx.stroke();
  }
});

canvas.addEventListener("mouseup", (e) => {
  if (!drawing) return;
  drawing = false;

  const endX = e.offsetX;
  const endY = e.offsetY;

  ctx.lineWidth = brushSize;
  ctx.strokeStyle = brushColor;
  ctx.fillStyle = brushColor;

  if (currentTool === "line") {
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(endX, endY);
    ctx.stroke();
  } else if (currentTool === "rect") {
    ctx.strokeRect(startX, startY, endX - startX, endY - startY);
  } else if (currentTool === "circle") {
    const radius = Math.sqrt(Math.pow(endX - startX, 2) + Math.pow(endY - startY, 2));
    ctx.beginPath();
    ctx.arc(startX, startY, radius, 0, Math.PI * 2);
    ctx.stroke();
  }
});

// 색상 선택
document.getElementById("colorPicker").addEventListener("input", (e) => {
  brushColor = e.target.value;
});

// 브러시 크기 변경
document.getElementById("brushSize").addEventListener("input", (e) => {
  brushSize = e.target.value;
});

// 도구 선택
document.getElementById("toolSelect").addEventListener("change", (e) => {
  currentTool = e.target.value;
});

// Clear 버튼
document.getElementById("clearBtn").addEventListener("click", () => {
  redrawBackground();
});

// 이미지 저장 (PNG/JPG)
function saveCanvas(type = "png") {
  const link = document.createElement("a");
  link.download = `drawing.${type}`;
  link.href = canvas.toDataURL(`image/${type}`);
  link.click();
}
document.getElementById("savePngBtn").addEventListener("click", () => saveCanvas("png"));
document.getElementById("saveJpgBtn").addEventListener("click", () => saveCanvas("jpeg"));
