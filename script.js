document.addEventListener('DOMContentLoaded', function () {
  const fileInput = document.getElementById('file-input');
  const canvasContainer = document.getElementById('canvas-container');
  const canvas = document.getElementById('photo-canvas');
  const ctx = canvas.getContext('2d');
  const drawingControls = document.querySelector('.drawing-controls');
  const drawBtn = document.getElementById('draw-btn');
  const eraseBtn = document.getElementById('erase-btn');
  const clearBtn = document.getElementById('clear-btn');
  const saveBtn = document.getElementById('save-btn');
  const resetBtn = document.getElementById('reset-btn');
  const brushSize = document.getElementById('brush-size');
  const colorPicker = document.querySelectorAll('.color');

  let isDrawing = false;
  let currentColor = '#ff0000';
  let currentBrushSize = 5;
  let mode = 'draw';
  let originalImage = null;
  let lastX, lastY;

  // 写真アップロード処理
  fileInput.addEventListener('change', function (e) {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = function (event) {
        const img = new Image();
        img.onload = function () {
          // キャンバスサイズを設定（チェキ風の比率に調整）
          const targetWidth = 400;
          const targetHeight = 500;
          canvas.width = targetWidth;
          canvas.height = targetHeight;

          // 背景を白に
          ctx.fillStyle = 'white';
          ctx.fillRect(0, 0, canvas.width, canvas.height);

          // 画像を中央に配置して描画
          const ratio = Math.min(targetWidth / img.width, (targetHeight - 100) / img.height);
          const newWidth = img.width * ratio;
          const newHeight = img.height * ratio;
          const x = (targetWidth - newWidth) / 2;
          const y = (targetHeight - newHeight - 50) / 2;

          ctx.drawImage(img, x, y, newWidth, newHeight);

          // チェキ風の枠と影を追加
          addChekiStyle();

          // コントロールの表示
          canvasContainer.style.display = 'block';
          drawingControls.style.display = 'flex';

          // 元の画像を保存
          originalImage = ctx.getImageData(0, 0, canvas.width, canvas.height);
        };
        img.src = event.target.result;
      };
      reader.readAsDataURL(file);
    }
  });

  // チェキ風スタイルを追加
  function addChekiStyle() {
    // 画像下部にテキストエリア
    ctx.fillStyle = 'white';
    ctx.fillRect(0, canvas.height - 60, canvas.width, 60);

    // ボーダーラインの追加
    ctx.strokeStyle = '#dddddd';
    ctx.lineWidth = 1;
    ctx.strokeRect(10, 10, canvas.width - 20, canvas.height - 20);

    // 日付スタンプ風
    const now = new Date();
    const dateStr = `${now.getFullYear()}.${(now.getMonth() + 1).toString().padStart(2, '0')}.${now.getDate().toString().padStart(2, '0')}`;
    ctx.fillStyle = '#999999';
    ctx.font = '14px Arial';
    ctx.textAlign = 'right';
    ctx.fillText(dateStr, canvas.width - 20, canvas.height - 20);
  }

  // 描画機能
  canvas.addEventListener('mousedown', startDrawing);
  canvas.addEventListener('mousemove', draw);
  canvas.addEventListener('mouseup', stopDrawing);
  canvas.addEventListener('mouseout', stopDrawing);

  // タッチデバイス対応
  canvas.addEventListener('touchstart', function (e) {
    e.preventDefault();
    const touch = e.touches[0];
    const mouseEvent = new MouseEvent('mousedown', {
      clientX: touch.clientX,
      clientY: touch.clientY
    });
    canvas.dispatchEvent(mouseEvent);
  });

  canvas.addEventListener('touchmove', function (e) {
    e.preventDefault();
    const touch = e.touches[0];
    const mouseEvent = new MouseEvent('mousemove', {
      clientX: touch.clientX,
      clientY: touch.clientY
    });
    canvas.dispatchEvent(mouseEvent);
  });

  canvas.addEventListener('touchend', function (e) {
    e.preventDefault();
    const mouseEvent = new MouseEvent('mouseup');
    canvas.dispatchEvent(mouseEvent);
  });

  function startDrawing(e) {
    isDrawing = true;

    const rect = canvas.getBoundingClientRect();
    lastX = e.clientX - rect.left;
    lastY = e.clientY - rect.top;
  }

  function draw(e) {
    if (!isDrawing) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ctx.lineWidth = currentBrushSize;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    if (mode === 'draw') {
      ctx.strokeStyle = currentColor;
    } else {
      ctx.strokeStyle = 'white';
    }

    ctx.beginPath();
    ctx.moveTo(lastX, lastY);
    ctx.lineTo(x, y);
    ctx.stroke();

    lastX = x;
    lastY = y;
  }

  function stopDrawing() {
    isDrawing = false;
  }

  // ペンボタン
  drawBtn.addEventListener('click', function () {
    mode = 'draw';
    drawBtn.style.backgroundColor = '#ff5252';
    eraseBtn.style.backgroundColor = '#ff6b6b';
  });

  // 消しゴムボタン
  eraseBtn.addEventListener('click', function () {
    mode = 'erase';
    eraseBtn.style.backgroundColor = '#ff5252';
    drawBtn.style.backgroundColor = '#ff6b6b';
  });

  // クリアボタン
  clearBtn.addEventListener('click', function () {
    ctx.putImageData(originalImage, 0, 0);
  });

  // 保存ボタン
  saveBtn.addEventListener('click', function () {
    const link = document.createElement('a');
    link.download = 'cheki-photo-' + new Date().getTime() + '.png';
    link.href = canvas.toDataURL();
    link.click();
  });

  // リセットボタン
  resetBtn.addEventListener('click', function () {
    fileInput.value = '';
    canvasContainer.style.display = 'none';
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  });

  // 色選択
  colorPicker.forEach(color => {
    color.addEventListener('click', function () {
      currentColor = this.getAttribute('data-color');
      document.querySelector('.color.selected').classList.remove('selected');
      this.classList.add('selected');
    });
  });

  // ペンの太さ
  brushSize.addEventListener('input', function () {
    currentBrushSize = this.value;
  });
});