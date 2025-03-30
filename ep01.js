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

    - Uso de classes no javascript: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes
    - Algumas perguntas no stack overflow de javascript



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
    bRegenerate : document.getElementById("bRegenerate"),
    numberPool : document.getElementById("numberPool"),
    bCheck : document.getElementById("bCheck"),
    pFinalResult : document.getElementById("pFinalResult"),
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

    // Gera uma equação de soma ou subtração aleatoriamente
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

    // Checa se alguma bola foi arrastada e presa na equação
    hasBall() {
        if (this.ball === null || this.ball === undefined) {
            return false;
        } else {
            return true;
        }
    }

    // Desenha o texto da equação em preto
    drawEquationText(origin) {
        gCtx.fillStyle = 'black';
        gCtx.font = BG_FONT;
        gCtx.textAlign = "center";
        gCtx.textBaseline = "middle";
        gCtx.fillText(this.toString(), this.position.x + gCellWidth / 2, this.position.y + gCellHeight / 2);
    }

    displayEquation(origin) {
        this.position.x = origin.x;
        this.position.y = origin.y;

        // Desenha o background em cinza
        gCtx.fillStyle = COR_CINZA;
        gCtx.fillRect(this.position.x + 5, this.position.y + 5, gCellWidth - 10, gCellHeight - 10);

        this.drawEquationText()
    }

    changeBgColorOnCheck(correct) {
        let color = correct ? COR_CERTA : COR_ERRADA;

        gCtx.fillStyle = color;
        gCtx.fillRect(this.position.x + 5, this.position.y + 5, gCellWidth - 10, gCellHeight - 10);

        this.drawEquationText(origin);
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

    // Cria o elemento HTML da bolinha
    createElement(value) {
        let div = document.createElement("div");
        div.classList.add("number");
        div.textContent = value;
        return div;
    }

    // Adiciona os event listeners de arrastar
    addEventListeners() {
        this.element.onmousedown = this.startDrag.bind(this);
    }

    startDrag(event) {
        console.log("Arrastando bola ", this.value);

        // Calcula o deslocamento inicial entre o mouse e a posição da bolinha
        this.offsetX = event.clientX - this.element.offsetLeft;
        this.offsetY = event.clientY - this.element.offsetTop;
        this.element.style.cursor = "grabbing";

        // Cria uma cópia da bolinha para ser arrastada
        this.draggingElement = this.createElement(this.value);
        this.draggingElement.style.position = "absolute";
        this.draggingElement.style.pointerEvents = "none";
        this.draggingElement.style.left = `${event.clientX - this.offsetX}px`;
        this.draggingElement.style.top = `${event.clientY - this.offsetY}px`;
        document.body.appendChild(this.draggingElement);

        // Adiciona event listeners para acompanhar o movimento do mouse e parar o movimento
        document.addEventListener("mousemove", this.dragHandler);
        document.addEventListener("mouseup", this.stopDragHandler);
    }

    drag(event) {
        this.draggingElement.style.left = `${event.clientX - this.offsetX}px`;
        this.draggingElement.style.top = `${event.clientY - this.offsetY}px`;
    }

    stopDrag(event) {
        const canvasRect = gCanvas.getBoundingClientRect();
        const relativeX = event.clientX - canvasRect.left;
        const relativeY = event.clientY - canvasRect.top;

        this.element.style.cursor = "grab";

        // Checa se a bolinha caiu em algum retângulo de equação
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
                console.log("Largando bola ", this.value, " na equação ", equation.toString());

                // Fixa a bola na equação
                this.element.onmousedown = null;

                break;
            }
        }

        // Se a bolinha não for encaixada em nenhuma equação, retorne-a para o numberPool
        if (!snapped) {
            console.log("Bola não foi largada em nenhuma equação. Retornando ao numberPool.");
            this.element.style.position = "relative";
            this.element.style.left = "0px";
            this.element.style.top = "0px";
        }

        // Remove a bolinha duplicada
        if (this.draggingElement) {
            document.body.removeChild(this.draggingElement);
            this.draggingElement = null;
        }

        // Remove os event listeners para parar de arrastar
        document.removeEventListener("mousemove", this.dragHandler);
        document.removeEventListener("mouseup", this.stopDragHandler);

        // Verifica se todas as bolas foram posicionadas em alguma equação
        if (allBallsPlaced()) {
            console.log("Todas as bolas foram posicionadas.");
        } else {
            console.log("Ainda há bolas soltas.");
        }
    }

    // Mostra a bolinha gerada na tela
    displayOnNumberPool() {
        UI.numberPool.appendChild(this.element);
    }

    // Retorna true se a bola foi movida para dentro da área de uma equação,
    // ou false, caso contrário.
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
    // Setup do canvas 2d
    gCanvas = document.getElementById("gridCanvas");
    gCtx = gCanvas.getContext("2d");

    // Setup do botão de recriar tabuleiro
    UI.bRegenerate.onclick = bRegenerateCallback;

    // Setup do botão de enviar respostas
    UI.bCheck.onclick = bCheckCallback;
}

function bRegenerateCallback(event) {
    console.log("Recriando tabuleiro.");

    // Limpa o parágrafo de resultado final 
    UI.pFinalResult.textContent = "";

    // Desabilita o botão de Enviar
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

    // Desenha as equações no canvas
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

    // Limpa o numberPool para alocar as novas bolinhas
    UI.numberPool.innerHTML = "";

    console.log("Gerando as bolinhas dos resultados.");

    // Embaralha o valor dos resultados e cria as bolinhas
    let shuffledResults = UI.equationsArray
        .map(equation => equation.result)
        .sort(() => Math.random() - 0.5);

    for (let result of shuffledResults) {
        const resultBall = new ResultBall(result);
        resultBall.displayOnNumberPool();
    }

    console.log("Bolinhas dos resultados geradas.");
}

// Checa se todas as bolas estão posicionadas em uma equação
function allBallsPlaced() {
    for (let equation of UI.equationsArray) {
        if (!equation.hasBall()){
            return false;
        }
    }
    UI.bCheck.disabled = false;
    return true;
}

// Checa se a bola posicionada na equação bate com o resultado esperado
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

function bCheckCallback(event) {
    // Checa se todas as equações batem com as bolinhas
    let correctCount = 0;
    for (let equation of UI.equationsArray) {
        let correct = checkEquationAndBall(equation);
        if (correct) correctCount++;
        equation.changeBgColorOnCheck(correct);
    }
    
    console.log(`Você acertou ${correctCount} de ${UI.equationsArray.length}.`);

    // Mostra o resultado final abaixo do botão de enviar resposta
    UI.pFinalResult.textContent = `Você ganhou ${correctCount} pontos.`;

    UI.bCheck.disabled = true;
}