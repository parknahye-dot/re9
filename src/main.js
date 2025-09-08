class DrawingTool {
  constructor() {
    this.canvas = document.getElementById('drawingCanvas');
    this.ctx = this.canvas.getContext('2d');
    this.gridCanvas = document.getElementById('gridCanvas');
    this.gridCtx = this.gridCanvas.getContext('2d');
    
    this.isDrawing = false;
    this.currentTool = 'pen';
    this.currentColor = '#000000';
    this.currentSize = 5;
    this.showGrid = false;
    
    this.startX = 0;
    this.startY = 0;
    this.imageData = null;
    
    this.init();
  }
  
  init() {
    this.setupCanvas();
    this.setupEventListeners();
    this.setupResizeHandler();
  }
  
  setupCanvas() {
    // 캔버스 크기를 사용 가능한 공간에 맞게 설정
    const canvasArea = this.canvas.parentElement;
    const sidebarWidth = 300;
    const padding = 40;
    
    const maxWidth = window.innerWidth - sidebarWidth - padding;
    const maxHeight = window.innerHeight - padding;
    
    this.canvas.width = Math.min(800, maxWidth);
    this.canvas.height = Math.min(600, maxHeight);
    
    // 그리드 캔버스도 같은 크기로 설정
    this.gridCanvas.width = this.canvas.width;
    this.gridCanvas.height = this.canvas.height;
    this.gridCanvas.style.width = this.canvas.width + 'px';
    this.gridCanvas.style.height = this.canvas.height + 'px';
    
    // 캔버스 배경을 흰색으로 초기화
    this.ctx.fillStyle = 'white';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
    this.ctx.lineCap = 'round';
    this.ctx.lineJoin = 'round';
    
    // 이미지 데이터 저장
    this.saveImageData();
  }
  
  setupEventListeners() {
    // 캔버스 이벤트
    this.canvas.addEventListener('mousedown', (e) => this.startDrawing(e));
    this.canvas.addEventListener('mousemove', (e) => this.draw(e));
    this.canvas.addEventListener('mouseup', () => this.stopDrawing());
    this.canvas.addEventListener('mouseout', () => this.stopDrawing());
    
    // 컨트롤 이벤트
    document.getElementById('colorPicker').addEventListener('change', (e) => {
      this.currentColor = e.target.value;
    });
    
    document.getElementById('brushSize').addEventListener('input', (e) => {
      this.currentSize = parseInt(e.target.value);
      document.getElementById('brushSizeDisplay').textContent = this.currentSize + 'px';
    });
    
    document.getElementById('toolSelect').addEventListener('change', (e) => {
      this.currentTool = e.target.value;
      this.canvas.style.cursor = e.target.value === 'eraser' ? 'grab' : 'crosshair';
    });
    
    document.getElementById('gridToggle').addEventListener('change', (e) => {
      this.showGrid = e.target.checked;
      this.toggleGrid();
    });
    
    document.getElementById('clearBtn').addEventListener('click', () => {
      if (confirm('정말로 모든 그림을 지우시겠습니까?')) {
        this.clearCanvas();
      }
    });
    
    document.getElementById('savePngBtn').addEventListener('click', () => this.saveImage('png'));
    document.getElementById('saveJpgBtn').addEventListener('click', () => this.saveImage('jpg'));
  }
  
  setupResizeHandler() {
    window.addEventListener('resize', () => {
      // 리사이즈 시 이미지 데이터 저장
      const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
      
      // 새로운 크기로 캔버스 설정
      this.setupCanvas();
      
      // 저장된 이미지 데이터 복원
      this.ctx.putImageData(imageData, 0, 0);
      
      // 그리드 다시 그리기
      if (this.showGrid) {
        this.drawGrid();
      }
    });
  }
  
  saveImageData() {
    this.imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
  }
  
  restoreImageData() {
    if (this.imageData) {
      this.ctx.putImageData(this.imageData, 0, 0);
    }
  }
  
  getMousePos(e) {
    const rect = this.canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  }
  
  startDrawing(e) {
    console.log('그리기 시작!');
    this.isDrawing = true;
    const pos = this.getMousePos(e);
    this.startX = pos.x;
    this.startY = pos.y;
    
    console.log('시작 위치:', pos.x, pos.y);
    
    this.ctx.lineWidth = this.currentSize;
    
    if (this.currentTool === 'pen') {
      this.ctx.globalCompositeOperation = 'source-over';
      this.ctx.strokeStyle = this.currentColor;
      this.ctx.beginPath();
      this.ctx.moveTo(pos.x, pos.y);
      console.log('펜 도구로 시작');
    } else if (this.currentTool === 'eraser') {
      this.ctx.globalCompositeOperation = 'destination-out';
      this.ctx.beginPath();
      this.ctx.moveTo(pos.x, pos.y);
      console.log('지우개 도구로 시작');
    } else {
      // 도형 도구의 경우 현재 상태 저장
      this.imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
      console.log('도형 도구로 시작:', this.currentTool);
    }
  }
  
  draw(e) {
    if (!this.isDrawing) return;
    
    const pos = this.getMousePos(e);
    
    switch (this.currentTool) {
      case 'pen':
      case 'eraser':
        this.ctx.lineTo(pos.x, pos.y);
        this.ctx.stroke();
        break;
        
      case 'line':
        if (this.imageData) {
          this.ctx.putImageData(this.imageData, 0, 0);
        }
        this.ctx.globalCompositeOperation = 'source-over';
        this.ctx.strokeStyle = this.currentColor;
        this.ctx.beginPath();
        this.ctx.moveTo(this.startX, this.startY);
        this.ctx.lineTo(pos.x, pos.y);
        this.ctx.stroke();
        break;
        
      case 'rect':
        if (this.imageData) {
          this.ctx.putImageData(this.imageData, 0, 0);
        }
        this.ctx.globalCompositeOperation = 'source-over';
        this.ctx.strokeStyle = this.currentColor;
        this.ctx.beginPath();
        this.ctx.rect(this.startX, this.startY, pos.x - this.startX, pos.y - this.startY);
        this.ctx.stroke();
        break;
        
      case 'circle':
        if (this.imageData) {
          this.ctx.putImageData(this.imageData, 0, 0);
        }
        this.ctx.globalCompositeOperation = 'source-over';
        this.ctx.strokeStyle = this.currentColor;
        const radius = Math.sqrt(Math.pow(pos.x - this.startX, 2) + Math.pow(pos.y - this.startY, 2));
        this.ctx.beginPath();
        this.ctx.arc(this.startX, this.startY, radius, 0, 2 * Math.PI);
        this.ctx.stroke();
        break;
    }
  }
  
  stopDrawing() {
    if (this.isDrawing) {
      console.log('그리기 종료!');
      this.isDrawing = false;
      this.ctx.beginPath();
    }
  }
  
  toggleGrid() {
    if (this.showGrid) {
      this.drawGrid();
    } else {
      this.clearGrid();
    }
  }
  
  drawGrid() {
    const gridSize = 20;
    this.gridCtx.clearRect(0, 0, this.gridCanvas.width, this.gridCanvas.height);
    this.gridCtx.strokeStyle = '#e0e0e0';
    this.gridCtx.lineWidth = 1;
    
    // 세로선
    for (let x = 0; x <= this.gridCanvas.width; x += gridSize) {
      this.gridCtx.beginPath();
      this.gridCtx.moveTo(x, 0);
      this.gridCtx.lineTo(x, this.gridCanvas.height);
      this.gridCtx.stroke();
    }
    
    // 가로선
    for (let y = 0; y <= this.gridCanvas.height; y += gridSize) {
      this.gridCtx.beginPath();
      this.gridCtx.moveTo(0, y);
      this.gridCtx.lineTo(this.gridCanvas.width, y);
      this.gridCtx.stroke();
    }
  }
  
  clearGrid() {
    this.gridCtx.clearRect(0, 0, this.gridCanvas.width, this.gridCanvas.height);
  }
  
  clearCanvas() {
    this.ctx.fillStyle = 'white';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    this.saveImageData();
  }
  
  saveImage(format) {
    // 임시 캔버스 생성하여 흰색 배경과 그림 합성
    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d');
    tempCanvas.width = this.canvas.width;
    tempCanvas.height = this.canvas.height;
    
    // 흰색 배경 채우기
    tempCtx.fillStyle = 'white';
    tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
    
    // 기존 캔버스 내용 복사
    tempCtx.drawImage(this.canvas, 0, 0);
    
    const link = document.createElement('a');
    const mimeType = format === 'png' ? 'image/png' : 'image/jpeg';
    link.download = `drawing_${new Date().getTime()}.${format}`;
    link.href = tempCanvas.toDataURL(mimeType, 0.9);
    link.click();
  }
}

// 앱 초기화
window.addEventListener('DOMContentLoaded', () => {
  new DrawingTool();
});