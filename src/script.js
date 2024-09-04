// Número de linhas e colunas do grid
const rows = 45;
const cols = 45;

// Tamanho de cada item do grid em pixels
const gridItemSize = 10;

// Armazena os pontos selecionados
let selectedPoints = [];
let createdShapes = [];
let createdCircles = [];

// Obtém o input de cor
const colorPicker = document.getElementById('lineColorPicker');

// Obtém o sinal de rasterização de linha
const algorithmSwitch = document.getElementById('algorithmSelector');

// Obtém o coeficiente de rotação
const rotationCoefficientInput = document.getElementById('rotationCoefficient');

// Obtém o elemento para mostrar coordenadas
const coordinateDisplay = document.getElementById('coordinateDisplay');

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
            gridItem.addEventListener('mouseover', handleMouseOver); // Atualiza coordenadas ao passar o mouse
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

// Função que lida com o movimento do mouse sobre o grid para atualizar coordenadas
function handleMouseOver(event) {
    const hoveredItem = event.target;
    const x = parseInt(hoveredItem.dataset.x);
    const y = parseInt(hoveredItem.dataset.y);

    // Atualiza o display das coordenadas
    coordinateDisplay.textContent = `X: ${x}, Y: ${y}`;
}

// Função que decide qual algoritmo de rasterização de linhas será utilizado (DDA ou Bresenham)
function getSelectedAlgorithm() {
    return algorithmSwitch.value;
}

// Função para obter o coeficiente de rotação
function getRotationCoefficient() {
    return parseInt(rotationCoefficientInput.value, 10);
}

// Função para desenhar a linha entre dois pontos usando o algoritmo selecionado
function drawLine(startPoint, endPoint, color) {
    const algorithm = getSelectedAlgorithm();
    if (algorithm === 'dda') {
        drawLineDDA(startPoint, endPoint, color);
    } else if (algorithm === 'bresenham') {
        drawLineBresenham(startPoint, endPoint, color);
    }
}

// Função para desenhar a linha entre dois pontos usando o algoritmo DDA
function drawLineDDA(startPoint, endPoint, color) {
    const { x: x0, y: y0 } = startPoint;
    const { x: x1, y: y1 } = endPoint;

    const dx = x1 - x0;
    const dy = y1 - y0;
    const steps = Math.max(Math.abs(dx), Math.abs(dy));
    const xIncrement = dx / steps;
    const yIncrement = dy / steps;

    let x = x0;
    let y = y0;

    for (let i = 0; i <= steps; i++) {
        setPixel(Math.round(x), Math.round(y), color);
        x += xIncrement;
        y += yIncrement;
    }
}

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

    function scaleShape(shapeIndex, scaleFactor) {
        if (shapeIndex >= createdShapes.length) {
            console.error('Shape index out of bounds');
            return;
        }

        let originalShape = createdShapes[shapeIndex];
        let centerX = originalShape.reduce((sum, point) => sum + point.x, 0) / originalShape.length;
        let centerY = originalShape.reduce((sum, point) => sum + point.y, 0) / originalShape.length;

        let scaledShape = originalShape.map(point => {
            let x = point.x - centerX;
            let y = point.y - centerY;

            let scaledX = x * scaleFactor;
            let scaledY = y * scaleFactor;

            return {
                x: Math.round(scaledX + centerX),
                y: Math.round(scaledY + centerY)
            };
        });

        deleteShape(originalShape);
        connectPoints(scaledShape);
        createdShapes[shapeIndex] = scaledShape;
    }

    // Remove a forma antiga do grid
    deleteShape(originalShape);

    // Desenha a forma rotacionada no grid
    connectPoints(rotatedShape);

    // Atualiza o array de formas
    createdShapes[shapeIndex] = rotatedShape;
}

// Função que aumenta ou diminui as dimensões de uma forma de acordo com o coeficiente de escala
function scaleShape(shapeIndex, scaleFactor) {
    if (shapeIndex >= createdShapes.length) {
        console.error('Shape index out of bounds');
        return;
    }

    let originalShape = createdShapes[shapeIndex];
    let centerX = originalShape.reduce((sum, point) => sum + point.x, 0) / originalShape.length;
    let centerY = originalShape.reduce((sum, point) => sum + point.y, 0) / originalShape.length;

    let scaledShape = originalShape.map(point => {
        let x = point.x - centerX;
        let y = point.y - centerY;

        let scaledX = x * scaleFactor;
        let scaledY = y * scaleFactor;

        return {
            x: Math.round(scaledX + centerX),
            y: Math.round(scaledY + centerY)
        };
    });

    deleteShape(originalShape);
    connectPoints(scaledShape);
    createdShapes[shapeIndex] = scaledShape;
}

// Função que faz o espelhamento da uma forma de acordo com um eixo fornecido
function reflectShape(shapeIndex, axis) {
    if (shapeIndex >= createdShapes.length) {
        console.error('Shape index out of bounds');
        return;
    }

    let originalShape = createdShapes[shapeIndex];
    let reflectedShape = originalShape.map(point => {
        if (axis === 'x') {
            return { x: -point.x, y: point.y };
        } else if (axis === 'y') {
            return { x: point.x, y: -point.y };
        } else if (axis === 'xy') {
            return { x: -point.x, y: -point.y };
        }
    });

    deleteShape(originalShape);
    connectPoints(reflectedShape);
    createdShapes[shapeIndex] = reflectedShape;
}

// Função para recortar uma linha usando o algoritmo Cohen-Sutherland
function cohenSutherlandClip(x0, y0, x1, y1, xmin, ymin, xmax, ymax) {
    // Define os códigos de região
    const INSIDE = 0; // Dentro da janela
    const LEFT = 1; // À esquerda da janela
    const RIGHT = 2; // À direita da janela
    const BOTTOM = 4; // Abaixo da janela
    const TOP = 8; // Acima da janela

    function computeCode(x, y) {
        let code = INSIDE;
        if (x < xmin) code |= LEFT;
        else if (x > xmax) code |= RIGHT;
        if (y < ymin) code |= BOTTOM;
        else if (y > ymax) code |= TOP;
        return code;
    }

    let code0 = computeCode(x0, y0);
    let code1 = computeCode(x1, y1);
    let accept = false;

    while (true) {
        if ((code0 | code1) === 0) {
            // Ambos os pontos estão dentro da janela
            accept = true;
            break;
        } else if ((code0 & code1) !== 0) {
            // Ambos os pontos são fora da mesma região
            break;
        } else {
            let codeOut;
            let x, y;

            // Determina qual ponto está fora da janela
            if (code0 !== 0) codeOut = code0;
            else codeOut = code1;

            // Calcula o ponto de interseção com a janela
            if ((codeOut & TOP) !== 0) {
                x = x0 + (x1 - x0) * (ymax - y0) / (y1 - y0);
                y = ymax;
            } else if ((codeOut & BOTTOM) !== 0) {
                x = x0 + (x1 - x0) * (ymin - y0) / (y1 - y0);
                y = ymin;
            } else if ((codeOut & RIGHT) !== 0) {
                y = y0 + (y1 - y0) * (xmax - x0) / (x1 - x0);
                x = xmax;
            } else if ((codeOut & LEFT) !== 0) {
                y = y0 + (y1 - y0) * (xmin - x0) / (x1 - x0);
                x = xmin;
            }

            // Atualiza o ponto fora da janela
            if (codeOut === code0) {
                x0 = x;
                y0 = y;
                code0 = computeCode(x0, y0);
            } else {
                x1 = x;
                y1 = y;
                code1 = computeCode(x1, y1);
            }
        }
    }

    return accept ? { x0, y0, x1, y1 } : null;
}

function applyClipping(clippingType) {
    if (clippingType === 'cohen-sutherland') {
        const xmin = 10, ymin = 10, xmax = 400, ymax = 400; // Defina sua janela de recorte aqui
        const lines = createdShapes; // Supondo que você queira recortar todas as linhas criadas

        lines.forEach(shape => {
            for (let i = 0; i < shape.length - 1; i++) {
                let { x: x0, y: y0 } = shape[i];
                let { x: x1, y: y1 } = shape[i + 1];
                let clippedLine = cohenSutherlandClip(x0, y0, x1, y1, xmin, ymin, xmax, ymax);

                if (clippedLine) {
                    // Remove a linha antiga e desenha a linha recortada
                    deleteShape([shape[i], shape[i + 1]]);
                    drawLine({ x: clippedLine.x0, y: clippedLine.y0 }, { x: clippedLine.x1, y: clippedLine.y1 }, colorPicker.value);
                }
            }
        });
    }

    if (clippingType === 'liang-barsky') {
        const xmin = 10, ymin = 10, xmax = 400, ymax = 400; // Defina sua janela de recorte aqui
        const lines = createdShapes; // Supondo que você queira recortar todas as linhas criadas

        lines.forEach(shape => {
            for (let i = 0; i < shape.length - 1; i++) {
                let { x: x0, y: y0 } = shape[i];
                let { x: x1, y: y1 } = shape[i + 1];
                let clippedLine = liangBarskyClip(x0, y0, x1, y1, xmin, ymin, xmax, ymax);

                if (clippedLine) {
                    // Remove a linha antiga e desenha a linha recortada
                    deleteShape([shape[i], shape[i + 1]]);
                    drawLine({ x: clippedLine.x0, y: clippedLine.y0 }, { x: clippedLine.x1, y: clippedLine.y1 }, colorPicker.value);
                }
            }
        });
    }
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

// Função para recortar uma linha usando o algoritmo Liang-Barsky
function liangBarskyClip(x0, y0, x1, y1, xmin, ymin, xmax, ymax) {
    const p = [-(x1 - x0), (x1 - x0), -(y1 - y0), (y1 - y0)];
    const q = [x0 - xmin, xmax - x0, y0 - ymin, ymax - y0];
    let t0 = 0, t1 = 1;

    for (let i = 0; i < 4; i++) {
        let r = q[i] / p[i];
        if (p[i] === 0) {
            if (q[i] < 0) return null;
        } else if (p[i] < 0) {
            t0 = Math.max(t0, r);
        } else {
            t1 = Math.min(t1, r);
        }
    }

    if (t0 > t1) return null;

    return {
        x0: x0 + t0 * (x1 - x0),
        y0: y0 + t0 * (y1 - y0),
        x1: x0 + t1 * (x1 - x0),
        y1: y0 + t1 * (y1 - y0)
    };
}

// Cria o grid na inicialização
createGrid(rows, cols);

// Adiciona um event listener para detectar quando uma tecla é pressionada
document.addEventListener('keydown', (event) => {
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
    }
});
