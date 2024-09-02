// Número de linhas e colunas do grid
const rows = 85;
const cols = 70;

// Tamanho de cada item do grid em pixels
const gridItemSize = 10;

// Armazena os pontos selecionados
let selectedPoints = [];
let createdShapes = [];
let createdCircles = [];

// Obtém o input de cor
const colorPicker = document.getElementById('lineColorPicker');

// Seleciona o contêiner do grid
const gridContainer = document.querySelector('.grid-container');

// Função para criar o grid
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
            gridItem.dataset.x = x; // Coordenada x
            gridItem.dataset.y = y; // Coordenada y
            gridItem.addEventListener('click', handleClick); // Adiciona o Event Listener para capturar cliques
            gridContainer.appendChild(gridItem);
        }
    }
}

function clearGrid() {
    const gridItems = document.querySelectorAll('.grid-item');
    gridItems.forEach(item => {
        setPixel(parseInt(item.dataset.x), parseInt(item.dataset.y), 'white');
    });

    // Limpa os pontos selecionados e formas criadas
    selectedPoints = [];
    createdShapes = [];
}

// Função para preencher um gridItem com uma cor
function setPixel(x, y, color) {
    const gridItem = document.querySelector(`.grid-item[data-x="${x}"][data-y="${y}"]`);
    if (gridItem) {
        gridItem.style.backgroundColor = color;
    }
}

// Função que lida com o clique nos pontos do grid
function handleClick(event) {
    const clickedPoint = event.target;
    const x = parseInt(clickedPoint.dataset.x);
    const y = parseInt(clickedPoint.dataset.y);

    // Adiciona o ponto selecionado
    const lastClickedPoint = { x, y };
    if (!selectedPoints.some(point => point.x === x && point.y === y)) {
        selectedPoints.push(lastClickedPoint);
        setPixel(x, y, selectedPoints.length === 1 ? 'red' : 'blue');
    }
}

// Função que lida com o clique continuo nos pontos do grid
function handleClickAndHold(event) {}

// Função para desenhar a linha entre dois pontos usando o algoritmo de Bresenham
function drawLineBresenham(startPoint, endPoint, color) {
    const { x: x0, y: y0 } = startPoint;
    const { x: x1, y: y1 } = endPoint;

    const dx = Math.abs(x1 - x0);
    const dy = Math.abs(y1 - y0);
    const sx = (x0 < x1) ? 1 : -1;
    const sy = (y0 < y1) ? 1 : -1;
    let err = dx - dy;

    let x = x0;
    let y = y0;

    while (true) {
        setPixel(x, y, color); // Usa a cor selecionada
        if (x === x1 && y === y1) break;
        const e2 = err * 2;
        if (e2 > -dy) {
            err -= dy;
            x += sx;
        }
        if (e2 < dx) {
            err += dx;
            y += sy;
        }
    }
}

// Função que conecta os pontos de uma forma, usando a cor selecionada
function connectPoints(points) {
    const selectedColor = colorPicker.value; // Obtém a cor selecionada

    for (let i = 0; i < points.length - 1; i++) {
        drawLineBresenham(points[i], points[i + 1], selectedColor);
    }
    drawLineBresenham(points[points.length - 1], points[0], selectedColor);

    if (selectedPoints.length > 2) {
        createdShapes.push([...selectedPoints]); // Adiciona a forma criada ao array de formas
    }
    selectedPoints = []; // Limpa os pontos selecionados para a próxima forma
}

// Função que cria um circunferência com base nas coordenadas do centro e raio
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
        drawLineBresenham(points[i], points[i + 1], "white");
    }
    drawLineBresenham(points[points.length - 1], points[0], "white");
}

// Função para destacar a forma
function highlightShape(index) {
    // Implementação da função para destacar uma forma
    // Pode usar uma cor diferente para destacar ou outro estilo
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
    deleteShape(originalShape)

    // Desenha a nova forma no grid
    connectPoints(movedShape);

    // Atualiza o array de formas
    createdShapes[shapeIndex] = movedShape;
}

// Função para rotacionar uma forma
function rotateShape(shapeIndex, angleInDegrees) {
    if (shapeIndex >= createdShapes.length) {
        console.error('Shape index out of bounds');
        return;
    }

    let originalShape = createdShapes[shapeIndex];

    // Converte o ângulo de graus para radianos
    let angleInRadians = angleInDegrees * (Math.PI / 180);

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
    deleteShape(originalShape)

    // Desenha a forma rotacionada no grid
    connectPoints(rotatedShape);

    // Atualiza o array de formas
    createdShapes[shapeIndex] = rotatedShape;
}

// Função para logar as coordenadas da forma
function logShapeCoordinates(points) {
    points.forEach(point => {
        console.log(`X: ${point.x}, Y: ${point.y}`);
    });
}

// Função para obter a lista de formas criadas
function listCreatedShapes() {
    console.log("Formas Criadas:");
    createdShapes.forEach((shape, index) => {
        console.log(`Forma ${index + 1}:`);
        logShapeCoordinates(shape);
    });
}

// Função para obter a lista de círculos criados
function listCreatedCircles() {
    console.log("Círculos Criados:");
    createdCircles.forEach((circle, index) => {
        console.log(`Círculo ${index + 1}: Centro (${circle.center.x}, ${circle.center.y}), Raio: ${circle.radius}`);
    });
}

// Cria o grid na inicialização
createGrid(rows, cols);


// Adiciona um event listener para detectar quando uma tecla é pressionada
document.addEventListener('keydown', (event) => {
    switch (event.key) {
        case 'ArrowUp':
            // Chame a função desejada para mover a forma para cima, por exemplo:
            event.ctrlKey ? rotateShape(createdShapes.length - 1, 15) : shiftShape(createdShapes.length - 1, 0, -1); // Mover para cima
            break;
        case 'ArrowDown':
            event.ctrlKey ? rotateShape(createdShapes.length - 1, -15) :
                shiftShape(createdShapes.length - 1, 0, 1); // Mover para baixo
            break;
        case 'ArrowLeft':
            shiftShape(createdShapes.length - 1, -1, 0); // Mover para a esquerda
            break;
        case 'ArrowRight':
            shiftShape(createdShapes.length - 1, 1, 0); // Mover para a direita
            break;
    }
});