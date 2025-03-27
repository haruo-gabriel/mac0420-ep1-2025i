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
    resultsArray : []
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
        this.hasBall = false;
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

    displayEquation(origin) {
        const x = origin.x;
        const y = origin.y;

        // Desenha o background em cinza
        gCtx.fillStyle = COR_CINZA;
        gCtx.fillRect(x + 5, y + 5, gCellWidth - 10, gCellHeight - 10);

        // Desenha o texto da equação em preto
        gCtx.fillStyle = 'black';
        gCtx.font = BG_FONT;
        gCtx.textAlign = "center";
        gCtx.textBaseline = "middle";
        gCtx.fillText(this.toString(), x + gCellWidth / 2, y + gCellHeight / 2);
    }
}

class ResultBall {
    constructor(value, index) {
        this.value = value;
        this.index = 
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

    stopDrag() {
        this.element.style.cursor = "grab";

        // Remove the duplicate ball
        if (this.draggingElement) {
            document.body.removeChild(this.draggingElement);
            this.draggingElement = null;
        }

        // Remove the event listeners to stop dragging
        document.removeEventListener("mousemove", this.dragHandler);
        document.removeEventListener("mouseup", this.stopDragHandler);
    }

    display() {
        UI.numberPool.appendChild(this.element);
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

function bRegenerateCallback(e) {
    console.log("Recriando tabuleiro.");

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

    UI.resultsArray = [];
    UI.numberPool.innerHTML = "";

    console.log("Gerando as bolinhas dos resultados.");

    // Embaralha o valor dos resultados
    let shuffledResults = UI.equationsArray
        .map(equation => equation.result)
        .sort(() => Math.random() - 0.5);

    for (let i = 0; i < shuffledResults.length; i++) {
        const resultBall = new ResultBall(shuffledResults[i], i);
        resultBall.display();
    }

    console.log("Bolinhas dos resultados geradas.");
    console.log("numberPool: ", UI.numberPool);
}

function bCheckCallback(e) {
}