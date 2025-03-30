/* ==================================================
    EP01 - Exercício programa de MAC0420/MAC5744

    Nome: Gabriel Haruo Hanai Takeucji
    NUSP: 13671636

    Ao preencher esse cabeçalho com o meu nome e o meu número USP,
    declaro que todas as partes originais desse exercício programa (EP)
    foram desenvolvidas e implementadas por mim e que portanto não 
    constituem desonestidade acadêmica ou plágio.
    Declaro também que sou responsável por todas as cópias desse
    programa e que não distribui ou facilitei a sua distribuição.
    Estou ciente que os casos de plágio e desonestidade acadêmica
    serão tratados segundo os critérios divulgados na página da 
    disciplina.
    Entendo que EPs sem assinatura devem receber nota zero e, ainda
    assim, poderão ser punidos por desonestidade acadêmica.

    Abaixo descreva qualquer ajuda que você recebeu para fazer este
    EP.  Inclua qualquer ajuda recebida por pessoas (inclusive
    monitores e colegas). Com exceção de material da disciplina, caso
    você tenha utilizado alguma informação, trecho de código,...
    indique esse fato abaixo para que o seu programa não seja
    considerado plágio ou irregular.

    Exemplo:

        A minha função quicksort() foi baseada na descrição encontrada na 
        página https://www.ime.usp.br/~pf/algoritmos/aulas/quick.html.

    Descrição de ajuda ou indicação de fonte:



================================================== */

// ALGUMAS CONSTANTES USADAS NO EP01 DEMO
const BG_COLOR = 'black';
const BG_FONT  = '14px Arial';
const COR_CINZA = '#d0d0d0';
const COR_CERTA = '#00FF00';
const COR_ERRADA = '#FF0000';

const MAX_NUM = 99; // usado nas equações
const MIN_NUM = 10;

// Variáveis globais

var gCanvas;
var gCtx;
var gCellWidth;
var gCellHeight;

var UI = {
    bCheck : document.getElementById("bCheck"),
    bRegenerate : document.getElementById("bRegenerate"),
    numberPool : document.getElementById("numberPool"),
    equationsArray : [],
}

// ==================================================================
// Classes

class Equation {
    constructor() {
        this.num1 = 0;
        this.num2 = 0;
        this.operator = '';
        this.result = 0;
        this.position = { x: 0, y: 0 };
        this.ball = null;
    }

    generateRandomEquation() {
        this.num1 = Math.floor(Math.random() * (MAX_NUM - MIN_NUM + 1)) + MIN_NUM;
        this.num2 = Math.floor(Math.random() * (MAX_NUM - MIN_NUM + 1)) + MIN_NUM;
        this.operator = Math.random() < 0.5 ? '+' : '-';

        if (this.operator === '+') {
            this.result = this.num1 + this.num2;
        } else {
            this.result = this.num1 - this.num2;
        }
    }

    toString() {
        return `${this.num1} ${this.operator} ${this.num2}`;
    }

    hasBall() {
        if (this.ball === null || this.ball === undefined) {
            return false;
        } else {
            return true;
        }
    }

    displayEquation(origin) {
        this.position.x = origin.x;
        this.position.y = origin.y;

        // Desenha o background em cinza
        gCtx.fillStyle = COR_CINZA;
        gCtx.fillRect(this.position.x + 5, this.position.y + 5, gCellWidth - 10, gCellHeight - 10);

        // Desenha o texto da equação em preto
        gCtx.fillStyle = 'black';
        gCtx.font = BG_FONT;
        gCtx.textAlign = "center";
        gCtx.textBaseline = "middle";
        gCtx.fillText(this.toString(), this.position.x + gCellWidth / 2, this.position.y + gCellHeight / 2);
    }

}

class ResultBall {
    constructor(value) {
        this.value = value;
        this.element = this.createElement(value);
        this.dragHandler = this.drag.bind(this);
        this.stopDragHandler = this.stopDrag.bind(this);
        this.addEventListeners();
    }

    createElement(value) {
        let div = document.createElement("div");
        div.classList.add("number");
        div.textContent = value;
        return div;
    }

    addEventListeners() {
        this.element.onmousedown = this.startDrag.bind(this);
    }

    startDrag(event) {
        console.log("Arrastando bola ", this.value);

        this.offsetX = event.clientX - this.element.offsetLeft;
        this.offsetY = event.clientY - this.element.offsetTop;
        this.element.style.cursor = "grabbing";

        // Create a duplicate ball for dragging
        this.draggingElement = this.createElement(this.value);
        this.draggingElement.style.position = "absolute";
        this.draggingElement.style.pointerEvents = "none"; // Prevent interaction with the duplicate
        this.draggingElement.style.left = `${event.clientX - this.offsetX}px`;
        this.draggingElement.style.top = `${event.clientY - this.offsetY}px`;
        document.body.appendChild(this.draggingElement);

        // Add event listeners for dragging and stopping the drag
        document.addEventListener("mousemove", this.dragHandler);
        document.addEventListener("mouseup", this.stopDragHandler);
    }

    drag(event) {
        // Move the duplicate ball with the cursor
        this.draggingElement.style.left = `${event.clientX - this.offsetX}px`;
        this.draggingElement.style.top = `${event.clientY - this.offsetY}px`;
    }

    stopDrag(event) {
        const canvasRect = gCanvas.getBoundingClientRect();
        const relativeX = event.clientX - canvasRect.left;
        const relativeY = event.clientY - canvasRect.top;

        this.element.style.cursor = "grab";

        // Checa se a bola caiu em algum retângulo de equação
        let snapped = false;
        for (let equation of UI.equationsArray) {
            const eqX = equation.position.x;
            const eqY = equation.position.y;

            if (this.isInsideEquation(relativeX, relativeY, eqX, eqY) && !equation.hasBall()) {
                this.element.style.position = "absolute";
                this.element.style.left = `${canvasRect.left + eqX}px`;
                this.element.style.top = `${canvasRect.top + eqY}px`;

                snapped = true;

                // Adiciona a bola na equação
                equation.ball = this;
                console.log("Largando bola ", this.value, " na equação ", equation);

                // Fixa a bola na equação
                this.element.onmousedown = null;

                break;
            }
        }

        // If the ball is not snapped to any equation, return it to the numberPool
        if (!snapped) {
            console.log("Bola não foi largada em nenhuma equação. Retornando ao numberPool.");
            this.element.style.position = "relative";
            this.element.style.left = "0px";
            this.element.style.top = "0px";
        }

        // Remove the duplicate ball
        if (this.draggingElement) {
            document.body.removeChild(this.draggingElement);
            this.draggingElement = null;
        }

        // Remove the event listeners to stop dragging
        document.removeEventListener("mousemove", this.dragHandler);
        document.removeEventListener("mouseup", this.stopDragHandler);

        // Check if all balls are placed
        if (allBallsPlaced()) {
            console.log("Todas as bolas foram posicionadas.");
        } else {
            console.log("Ainda há bolas soltas.");
        }
    }

    displayOnNumberPool() {
        UI.numberPool.appendChild(this.element);
    }

    isInsideEquation(relativeX, relativeY, eqX, eqY) {
        return (
                relativeX >= eqX &&
                relativeX <= eqX + gCellWidth &&
                relativeY >= eqY &&
                relativeY <= eqY + gCellHeight
                );
    }
}
// ==================================================================

window.onload = main;


function main() {
    gCanvas = document.getElementById("gridCanvas");
    gCtx = gCanvas.getContext("2d");

    // Setup do botão de recriar tabuleiro
    UI.bRegenerate.onclick = bRegenerateCallback;

    // Setup do botão de enviar respostas
    UI.bCheck.onclick = bCheckCallback;
}

function bRegenerateCallback(event) {
    console.log("Recriando tabuleiro.");

    UI.bCheck.disabled = true;

    let nRows = parseInt(document.getElementById("nRows").value);
    let nColumns = parseInt(document.getElementById("nCols").value);
    let nEquations = nRows * nColumns;

    gCellWidth = gCanvas.width / nColumns;
    gCellHeight = gCanvas.height / nRows;

    // Limpa o array de equações
    UI.equationsArray = [];

    // Recria as equações e insere no array
    for (let i = 0; i < nEquations; i++) {
        let equation = new Equation();
        equation.generateRandomEquation();
        UI.equationsArray.push(equation);
    }

    console.log("Equações geradas: ", UI.equationsArray);

    // Limpa o canvas
    console.log("Limpando o canvas.");
    gCtx.clearRect(0, 0, gCanvas.width, gCanvas.height);

    // Pinta as equações no canvas
    console.log("Gerando equações no canvas.");

    for (let i = 0; i < nRows; i++) {
        for (let j = 0; j < nColumns; j++) {
            let x = j * gCellWidth;
            let y = i * gCellHeight;
            let equationIndex = i * nColumns + j;
            UI.equationsArray[equationIndex].displayEquation({ x, y });
        }
    }

    console.log("Equações renderizadas no canvas.");

    UI.numberPool.innerHTML = "";

    console.log("Gerando as bolinhas dos resultados.");

    // Embaralha o valor dos resultados
    let shuffledResults = UI.equationsArray
        .map(equation => equation.result)
        .sort(() => Math.random() - 0.5);

    for (let result of shuffledResults) {
        const resultBall = new ResultBall(result);
        resultBall.displayOnNumberPool();
    }

    console.log("Bolinhas dos resultados geradas.");
    // console.log("numberPool: ", UI.numberPool);
}

function allBallsPlaced() {
    for (let equation of UI.equationsArray) {
        if (!equation.hasBall()){
            return false;
        }
    }
    UI.bCheck.disabled = false;
    return true;
}

function checkEquationAndBall(equation) {
    if (equation.ball) {
        let equationResult = equation.result;
        let ballValue = equation.ball.value;
        let equationString = equation.toString();

        if (ballValue === equationResult) {
            console.log("A bola", ballValue, "confere com a equação", equationString, "=", equationResult);
            return true;
        } else {
            console.error("Erro: A bola", ballValue, "não confere com a equação", equationString, "=", equationResult);
            return false;
        }
    } else {
        console.error("Erro: Nenhuma bola foi associada à equação", equation.toString());
        return false;
    }
}

// Called when the "Check" button is clicked.
// It runs the check on every equation and logs the final count of correct matches.
function bCheckCallback(event) {
    // If the button is disabled, do nothing.
    if (UI.bCheck.disabled) {
        return;
    }
    
    let correctCount = 0;
    for (let equation of UI.equationsArray) {
        if (checkEquationAndBall(equation)) {
            correctCount++;
        }
    }
    
    console.log(`You got ${correctCount} out of ${UI.equationsArray.length} correct.`);
    // Optionally disable further checking after a submission:
    UI.bCheck.disabled = true;
}