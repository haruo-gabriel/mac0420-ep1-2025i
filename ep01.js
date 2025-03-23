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

// ==================================================================
// Classes

class Equation {
    constructor() {
        this.num1 = 0;
        this.num2 = 0;
        this.operator = '';
        this.result = 0;
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

    displayEquation(origin, width, height) {
        const x = origin.x;
        const y = origin.y;

        // Desenha o background em cinza
        gCtx.fillStyle = COR_CINZA;
        gCtx.fillRect(x + 5, y + 5, width - 10, height - 10);

        // Desenha o texto da equação em preto
        gCtx.fillStyle = 'black';
        gCtx.font = BG_FONT;
        gCtx.textAlign = "center";
        gCtx.textBaseline = "middle";
        gCtx.fillText(this.toString(), x + width / 2, y + height / 2);
    }

    displayResult() {
        const numberPool = document.getElementById("numberPool");
        const resultDiv = document.createElement('div');
        resultDiv.classList.add('number');
        resultDiv.textContent = this.result;

        numberPool.appendChild(resultDiv);
    }
}



// ==================================================================

window.onload = main;

var gCanvas;
var gCtx;

var interface = {
    equationsArray : [],
    resultsArray : []
}

function main() {
    gCanvas = document.getElementById("gridCanvas");
    gCtx = gCanvas.getContext("2d");

    // Setup do botão de recriar tabuleiro
    interface.bRegenerate = document.getElementById("bRegenerate");
    interface.bRegenerate.onclick = bRegenerateCallback;

    // Setup do botão de enviar respostas
    interface.bCheck = document.getElementById("bCheck");
    interface.bCheck.onclick = bCheckCallback;
}

function bRegenerateCallback(e) {
    console.log("Recriando tabuleiro.");

    let nRows = parseInt(document.getElementById("nRows").value);
    let nColumns = parseInt(document.getElementById("nCols").value);
    let nEquations = nRows * nColumns;

    let cellWidth = gCanvas.width / nColumns;
    let cellHeight = gCanvas.height / nRows;


    // Limpa o array de equações
    interface.equationsArray = [];

    // Recria as equações e insere no array
    for (let i = 0; i < nEquations; i++) {
        let equation = new Equation();
        equation.generateRandomEquation();
        interface.equationsArray.push(equation);
    }

    console.log("Equações geradas: ", interface.equationsArray);

    // Limpa o canvas
    console.log("Limpando o canvas.");
    gCtx.clearRect(0, 0, gCanvas.width, gCanvas.height);

    // Pinta as equações no canvas
    console.log("Gerando equações no canvas.");

    for (let i = 0; i < nRows; i++) {
        for (let j = 0; j < nColumns; j++) {
            let x = j * cellWidth;
            let y = i * cellHeight;
            let equationIndex = i * nColumns + j;
            interface.equationsArray[equationIndex].displayEquation({ x, y }, cellWidth, cellHeight);
        }
    }

    console.log("Equações renderizadas no canvas.");

    // Limpa o array dos resultados
    interface.resultsArray = [];
    
    // Limpa o div dos resultados
    const numberPool = document.getElementById("numberPool");
    numberPool.innerHTML = "";

    // Pinta as bolinhas dos resultados
    console.log("Gerando as bolinhas dos resultados");

    for (let i = 0; i < nEquations; i++) {
        interface.equationsArray[i].displayResult();
    }
}

function bCheckCallback(e) {
}