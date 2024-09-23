// Número de linhas e colunas do grid
const rows = 80;
const cols = 120;

// Tamanho de cada item do grid em pixels
const gridItemSize = 10;

// Armazena os pontos selecionados e as formas criadas
let selectedPoints = [];
let createdShapes = [];
let createdCircles = [];

// Cache para todos os grid items
let gridCache = {};

// Obtenção dos elementos HTML uma vez
const colorPicker = document.getElementById('lineColorPicker');
const lineAlgorithmSwitch = document.getElementById('lineAlgorithmSelector');
const clipAlgorithmSwitch = document.getElementById('clipAlgorithmSelector');
const rotationCoefficientInput = document.getElementById('rotationCoefficient');
const coordinateDisplay = document.getElementById('coordinateDisplay');
const gridContainer = document.querySelector('.grid-container');
const scaleFactorInput = document.getElementById('scaleFactor'); // Seletor de escala

// Função para criar o grid e preencher o cache
function createGrid(rows, cols) {
    gridContainer.innerHTML = '';
    gridContainer.style.gridTemplateColumns = `repeat(${cols}, ${gridItemSize}px)`;
    gridContainer.style.gridTemplateRows = `repeat(${rows}, ${gridItemSize}px)`;

    for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
            const gridItem = document.createElement('div');
            gridItem.classList.add('grid-item');
            gridItem.style.width = `${gridItemSize}px`;
            gridItem.style.height = `${gridItemSize}px`;
            gridItem.dataset.x = x;
            gridItem.dataset.y = y;

            // Armazena os itens do grid no cache
            gridCache[`${x}-${y}`] = gridItem;

            // Event Listeners
            gridItem.addEventListener('click', handleClick);
            gridItem.addEventListener('mouseover', debounce(handleMouseOver, 50));
            gridContainer.appendChild(gridItem);
        }
    }
}

// Função de debounce
function debounce(func, delay) {
    let timeout;
    return function (...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), delay);
    };
}

// Função para limpar o grid
function clearGrid() {
    Object.values(gridCache).forEach(item => {
        item.style.backgroundColor = 'white';
    });
    selectedPoints = [];
    createdShapes = [];
}

// Função para definir a cor de um pixel
function setPixel(x, y, color) {
    const gridItem = gridCache[`${x}-${y}`];
    if (gridItem) {
        gridItem.style.backgroundColor = color;
    }
}

// Função que lida com o clique nos pontos do grid
function handleClick(event) {
    const clickedPoint = event.target;
    const x = parseInt(clickedPoint.dataset.x);
    const y = parseInt(clickedPoint.dataset.y);

    // Adiciona o ponto se ele não estiver já selecionado
    if (!selectedPoints.some(point => point.x === x && point.y === y)) {
        selectedPoints.push({ x, y });
        setPixel(x, y, selectedPoints.length === 1 ? 'red' : 'blue');
    }
}

// Função para lidar com o mouseover
function handleMouseOver(event) {
    const x = parseInt(event.target.dataset.x);
    const y = parseInt(event.target.dataset.y);
    coordinateDisplay.textContent = `X: ${x}, Y: ${y}`;
}

// Função para desenhar uma linha entre dois pontos
function drawLine(startPoint, endPoint, color) {
    const lineAlgorithm = lineAlgorithmSwitch.value;
    if (lineAlgorithm === 'dda') {
        drawLineDDA(startPoint, endPoint, color);
    } else {
        drawLineBresenham(startPoint, endPoint, color);
    }
}

// Função para desenhar usando o algoritmo DDA
function drawLineDDA(startPoint, endPoint, color) {
    const dx = endPoint.x - startPoint.x;
    const dy = endPoint.y - startPoint.y;
    const steps = Math.max(Math.abs(dx), Math.abs(dy));
    const xIncrement = dx / steps;
    const yIncrement = dy / steps;

    let x = startPoint.x, y = startPoint.y;

    for (let i = 0; i <= steps; i++) {
        setPixel(Math.round(x), Math.round(y), color);
        x += xIncrement;
        y += yIncrement;
    }
}

// Função para desenhar usando o algoritmo de Bresenham
function drawLineBresenham(startPoint, endPoint, color) {
    let { x: x0, y: y0 } = startPoint;
    let { x: x1, y: y1 } = endPoint;
    const dx = Math.abs(x1 - x0), dy = Math.abs(y1 - y0);
    const sx = x0 < x1 ? 1 : -1, sy = y0 < y1 ? 1 : -1;
    let err = dx - dy;

    while (true) {
        setPixel(x0, y0, color);
        if (x0 === x1 && y0 === y1) break;
        const e2 = 2 * err;
        if (e2 > -dy) { err -= dy; x0 += sx; }
        if (e2 < dx) { err += dx; y0 += sy; }
    }
}

// Resto do código permanece o mesmo...
createGrid(rows, cols);


// Função que conecta os pontos de uma forma, usando a cor selecionada
function connectPoints(points) {
    const selectedColor = colorPicker.value; // Obtém a cor selecionada

    for (let i = 0; i < points.length - 1; i++) {
        drawLine(points[i], points[i + 1], selectedColor);
    }
    drawLine(points[points.length - 1], points[0], selectedColor);

    if (selectedPoints.length > 2) {
        createdShapes.push([...selectedPoints]); // Adiciona a forma criada ao array de formas
    }
    selectedPoints = []; // Limpa os pontos selecionados para a próxima forma
}

// Função que cria um círculo com base nas coordenadas do centro e raio
function createCircle(center, edge) {
    const { x: cx, y: cy } = center;
    const { x: ex, y: ey } = edge;
    const radius = Math.sqrt((ex - cx) ** 2 + (ey - cy) ** 2); // Calcula o raio a partir das coordenadas do centro e da borda
    const selectedColor = colorPicker.value; // Obtém a cor selecionada

    let x = Math.floor(radius); // Inicializa x como o valor do raio
    let y = 0;
    let err = 1 - x; // Ajuste inicial do erro

    // Limpando os pixels selecionados
    setPixel(cx, cy, 'white');
    setPixel(ex, ey, 'white');

    // Algoritmo de Bresenham para círculos
    while (x >= y) {
        setPixel(cx + x, cy + y, selectedColor);
        setPixel(cx + y, cy + x, selectedColor);
        setPixel(cx - y, cy + x, selectedColor);
        setPixel(cx - x, cy + y, selectedColor);
        setPixel(cx - x, cy - y, selectedColor);
        setPixel(cx - y, cy - x, selectedColor);
        setPixel(cx + y, cy - x, selectedColor);
        setPixel(cx + x, cy - y, selectedColor);

        y += 1;

        if (err < 0) {
            err += 2 * y + 1;
        } else {
            x -= 1;
            err += 2 * (y - x + 1);
        }
    }

    // Adiciona o círculo ao array de círculos criados
    createdCircles.push({ center, radius });
    selectedPoints = []
}

// Função para apagar uma forma
function deleteShape(points) {
    for (let i = 0; i < points.length - 1; i++) {
        drawLine(points[i], points[i + 1], "white");
    }
    drawLine(points[points.length - 1], points[0], "white");
}

// Função para mover uma forma selecionada
function shiftShape(shapeIndex, xShift, yShift) {
    if (shapeIndex >= createdShapes.length) {
        console.error('Shape index out of bounds');
        return;
    }

    let originalShape = createdShapes[shapeIndex];
    let movedShape = [];

    for (let i = 0; i < originalShape.length; i++) {
        let newX = originalShape[i].x + xShift;
        let newY = originalShape[i].y + yShift;
        let newPoint = { x: newX, y: newY };

        movedShape.push(newPoint);
    }

    // Remove a antiga forma do grid
    deleteShape(originalShape);

    // Desenha a nova forma no grid
    connectPoints(movedShape);

    // Atualiza o array de formas
    createdShapes[shapeIndex] = movedShape;
}

// Função para rotacionar uma forma
function rotateShape(shapeIndex) {
    if (shapeIndex >= createdShapes.length) {
        console.error('Shape index out of bounds');
        return;
    }

    let originalShape = createdShapes[shapeIndex];
    const rotationCoefficient = getRotationCoefficient();

    // Converte o ângulo de graus para radianos
    let angleInRadians = rotationCoefficient * (Math.PI / 180);

    // Calcula o centro da forma (centroide)
    let centerX = originalShape.reduce((sum, point) => sum + point.x, 0) / originalShape.length;
    let centerY = originalShape.reduce((sum, point) => sum + point.y, 0) / originalShape.length;

    // Aplica a rotação a cada ponto da forma
    let rotatedShape = originalShape.map(point => {
        let x = point.x - centerX;
        let y = point.y - centerY;

        // Fórmula de rotação
        let rotatedX = x * Math.cos(angleInRadians) - y * Math.sin(angleInRadians);
        let rotatedY = x * Math.sin(angleInRadians) + y * Math.cos(angleInRadians);

        // Reposiciona o ponto para a posição correta no grid
        return {
            x: Math.round(rotatedX + centerX),
            y: Math.round(rotatedY + centerY)
        };
    });

    // Remove a forma antiga do grid
    deleteShape(originalShape);

    // Desenha a forma rotacionada no grid
    connectPoints(rotatedShape);

    // Atualiza o array de formas
    createdShapes[shapeIndex] = rotatedShape;
}

// Função para escalar a última forma criada
function scaleShape(shapeIndex, scaleFactor) {
    if (shapeIndex >= createdShapes.length) {
        console.error('Shape index out of bounds');
        return;
    }

    let originalShape = createdShapes[shapeIndex];

    // Calcula o centro da forma
    let centerX = originalShape.reduce((sum, point) => sum + point.x, 0) / originalShape.length;
    let centerY = originalShape.reduce((sum, point) => sum + point.y, 0) / originalShape.length;

    // Escala cada ponto em relação ao centro
    let scaledShape = originalShape.map(point => {
        let x = point.x - centerX;
        let y = point.y - centerY;
        return {
            x: Math.round(centerX + x * scaleFactor),
            y: Math.round(centerY + y * scaleFactor)
        };
    });

    // Remove a forma antiga do grid
    deleteShape(originalShape);

    // Desenha a forma escalada no grid
    connectPoints(scaledShape);

    // Atualiza o array de formas
    createdShapes[shapeIndex] = scaledShape;
}

// Função para espelhar a última forma no eixo X
function mirrorShapeX(shapeIndex) {
    if (shapeIndex >= createdShapes.length) {
        console.error('Shape index out of bounds');
        return;
    }

    let originalShape = createdShapes[shapeIndex];

    // Calcula o centro da forma
    let centerX = originalShape.reduce((sum, point) => sum + point.x, 0) / originalShape.length;

    // Espelha os pontos em relação ao centro no eixo X
    let mirroredShape = originalShape.map(point => {
        let x = centerX - (point.x - centerX);
        return { x: Math.round(x), y: point.y };
    });

    // Remove a forma antiga do grid
    deleteShape(originalShape);

    // Desenha a forma espelhada no grid
    connectPoints(mirroredShape);

    // Atualiza o array de formas
    createdShapes[shapeIndex] = mirroredShape;
}

// Função para espelhar a última forma no eixo Y
function mirrorShapeY(shapeIndex) {
    if (shapeIndex >= createdShapes.length) {
        console.error('Shape index out of bounds');
        return;
    }

    let originalShape = createdShapes[shapeIndex];

    // Calcula o centro da forma
    let centerY = originalShape.reduce((sum, point) => sum + point.y, 0) / originalShape.length;

    // Espelha os pontos em relação ao centro no eixo Y
    let mirroredShape = originalShape.map(point => {
        let y = centerY - (point.y - centerY);
        return { x: point.x, y: Math.round(y) };
    });

    // Remove a forma antiga do grid
    deleteShape(originalShape);

    // Desenha a forma espelhada no grid
    connectPoints(mirroredShape);

    // Atualiza o array de formas
    createdShapes[shapeIndex] = mirroredShape;
}

// Constantes para os limites da janela de recorte
const xMin = 0;
const xMax = cols - 1;
const yMin = 0;
const yMax = rows - 1;

// Códigos de região para Cohen-Sutherland
const INSIDE = 0; // 0000
const LEFT = 1;   // 0001
const RIGHT = 2;  // 0010
const BOTTOM = 4; // 0100
const TOP = 8;    // 1000

// Função para calcular o código de região de um ponto (Cohen-Sutherland)
function computeRegionCode(x, y) {
    let code = INSIDE;

    if (x < xMin) code |= LEFT;
    else if (x > xMax) code |= RIGHT;
    if (y < yMin) code |= BOTTOM;
    else if (y > yMax) code |= TOP;

    return code;
}

function lineClip(startPoint, endPoint) {
    const clipAlgorithm = clipAlgorithmSwitch.value;
    if (clipAlgorithm === "cohen") {
        cohenSutherlandClip(startPoint, endPoint)
    } else {
        liangBarskyClip(startPoint, endPoint)
    }
}

// Implementação do algoritmo de recorte de linha Cohen-Sutherland
function cohenSutherlandClip(startPoint, endPoint) {
    let { x: x0, y: y0 } = startPoint;
    let { x: x1, y: y1 } = endPoint;

    let code0 = computeRegionCode(x0, y0);
    let code1 = computeRegionCode(x1, y1);
    let accept = false;

    while (true) {
        if (!(code0 | code1)) {
            // Se ambos os pontos estão dentro da janela
            accept = true;
            break;
        } else if (code0 & code1) {
            // Se ambos os pontos estão fora da mesma região
            break;
        } else {
            // Pelo menos um ponto está fora, então recorte a linha
            let codeOut = code0 ? code0 : code1;
            let x, y;

            if (codeOut & TOP) {
                x = x0 + ((x1 - x0) * (yMax - y0)) / (y1 - y0);
                y = yMax;
            } else if (codeOut & BOTTOM) {
                x = x0 + ((x1 - x0) * (yMin - y0)) / (y1 - y0);
                y = yMin;
            } else if (codeOut & RIGHT) {
                y = y0 + ((y1 - y0) * (xMax - x0)) / (x1 - x0);
                x = xMax;
            } else if (codeOut & LEFT) {
                y = y0 + ((y1 - y0) * (xMin - x0)) / (x1 - x0);
                x = xMin;
            }

            if (codeOut === code0) {
                x0 = x;
                y0 = y;
                code0 = computeRegionCode(x0, y0);
            } else {
                x1 = x;
                y1 = y;
                code1 = computeRegionCode(x1, y1);
            }
        }
    }
    if (accept) {
        drawLineBresenham({ x: Math.round(x0), y: Math.round(y0) }, { x: Math.round(x1), y: Math.round(y1) }, "white");
    }
}

// Função para recortar uma linha usando o algoritmo Liang-Barsky
function liangBarskyClip(startPoint, endPoint) {
    let { x: x0, y: y0 } = startPoint;
    let { x: x1, y: y1 } = endPoint;

    let dx = x1 - x0;
    let dy = y1 - y0;

    let p = [-dx, dx, -dy, dy];
    let q = [x0 - xMin, xMax - x0, y0 - yMin, yMax - y0];

    let u1 = 0;
    let u2 = 1;

    for (let i = 0; i < 4; i++) {
        if (p[i] === 0) {
            if (q[i] < 0) return; // Linha fora da borda paralela
        } else {
            let t = q[i] / p[i];
            if (p[i] < 0) {
                if (t > u2) return; // Fora da janela
                if (t > u1) u1 = t; // Atualiza u1
            } else {
                if (t < u1) return; // Fora da janela
                if (t < u2) u2 = t; // Atualiza u2
            }
        }
    }

    let newX0 = x0 + u1 * dx;
    let newY0 = y0 + u1 * dy;
    let newX1 = x0 + u2 * dx;
    let newY1 = y0 + u2 * dy;

    // Desenha a linha recortada
    drawLineBresenham(
        { x: Math.round(newX0), y: Math.round(newY0) },
        { x: Math.round(newX1), y: Math.round(newY1) },
        "white"
    );
}


// Cria o grid na inicialização
createGrid(rows, cols);

// Adiciona um event listener para detectar quando uma tecla é pressionada
document.addEventListener('keydown', (event) => {
    const scaleFactor = parseFloat(scaleFactorInput.value);
    switch (event.key) {
        case 'ArrowUp':
            // Chame a função desejada para mover a forma para cima, por exemplo:
            event.ctrlKey ? rotateShape(createdShapes.length - 1) : shiftShape(createdShapes.length - 1, 0, -1); // Mover para cima
            break;
        case 'ArrowDown':
            event.ctrlKey ? rotateShape(createdShapes.length - 1) :
                shiftShape(createdShapes.length - 1, 0, 1); // Mover para baixo
            break;
        case 'ArrowLeft':
            shiftShape(createdShapes.length - 1, -1, 0); // Mover para a esquerda
            break;
        case 'ArrowRight':
            shiftShape(createdShapes.length - 1, 1, 0); // Mover para a direita
            break;
        case '+':
            scaleShape(createdShapes.length - 1, scaleFactor); // Aumenta a forma
            event.preventDefault();
            break;
        case '-':
            scaleShape(createdShapes.length - 1, 1 / scaleFactor); // Diminui a forma
            event.preventDefault();
            break;
        case 'x':
            mirrorShapeX(createdShapes.length - 1);
            break;
        case 'y':
            mirrorShapeY(createdShapes.length - 1);
            break;
    }
});
