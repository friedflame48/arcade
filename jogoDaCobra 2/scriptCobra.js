// ==========================================
// CONFIGURAÇÃO INICIAL DO JOGO
// ==========================================

// Pega a tela do jogo (o canvas) e prepara o pincel para desenhar
var canvas = document.getElementById("gameCanvas");
var ctx = canvas.getContext("2d");

// Pega o local onde a pontuação aparece na tela
var placar = document.getElementById("score");

// Pega as telas de menu (início e fim de jogo)
var telaInicio = document.getElementById("startScreen");
var telaFim = document.getElementById("gameOverScreen");
var botaoIniciar = document.getElementById("startBtn");
var botaoReiniciar = document.getElementById("restartBtn");
var placarFinal = document.getElementById("finalScore");

// Tamanho de cada quadradinho do jogo (20 pixels)
var tamanhoBloco = 20;
var quantidadeBlocos = canvas.width / tamanhoBloco;

// A cobrinha começa com 3 quadradinhos em linha reta
var cobra = [
    { x: 10, y: 10 },
    { x: 9, y: 10 },
    { x: 8, y: 10 }
];

// Posição inicial da comida
var comida = { x: 5, y: 5 };

// Direção que a cobra está andando (começa parada)
var dx = 0;
var dy = 0;

// Pontuação inicial
var pontos = 0;

// Variável que guarda o relógio do jogo
var relogioJogo = null;


// ==========================================
// BOTÕES E TECLADO
// ==========================================

// Quando clica no botão de iniciar ou reiniciar, o jogo começa
botaoIniciar.onclick = comecarJogo;
botaoReiniciar.onclick = comecarJogo;

// Fica de olho no teclado para ver qual seta o jogador aperta
document.onkeydown = controlarTeclado;


// ==========================================
// FUNÇÕES PRINCIPAIS DO JOGO
// ==========================================

// Função que liga o jogo
function comecarJogo() {
    // Esconde as telas de menu
    telaInicio.style.display = "none";
    telaFim.style.display = "none";
    
    // Reseta tudo para o início
    reiniciarVariaveis();
    
    // Limpa o relógio anterior se já existia um rodando
    if (relogioJogo) {
        clearInterval(relogioJogo);
    }
    
    // Faz o jogo atualizar a cada 100 milissegundos (velocidade da cobra)
    relogioJogo = setInterval(principal, 100);
}

// O "coração" do jogo: roda sem parar atualizando a tela
function principal() {
    moverCobra();
    
    // Se bateu na parede ou no próprio rabo, o jogo acaba!
    if (verificarFimDeJogo()) {
        clearInterval(relogioJogo);
        placarFinal.innerText = pontos;
        telaFim.style.display = "flex";
        return;
    }
    
    desenharTudo();
}

// Faz a cobra andar para frente
function moverCobra() {
    if (dx === 0 && dy === 0) return; // Se estiver parada, não faz nada

    // Cria a nova cabeça da cobra na direção que ela está indo
    var cabeca = { x: cobra[0].x + dx, y: cobra[0].y + dy };
    cobra.unshift(cabeca); // Coloca a nova cabeça na frente

    // Verifica se a cabeça da cobra encostou na comida
    if (cabeca.x === comida.x && cabeca.y === comida.y) {
        pontos = pontos + 10;
        placar.innerText = pontos;
        criarComida(); // Joga a comida em outro lugar
    } else {
        cobra.pop(); // Remove o último rabo se não comeu (para ela não crescer à toa)
    }
}

// Desenha tudo na tela preta (fundo, comida e cobra)
function desenharTudo() {
    // Pinta o fundo de preto
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Desenha a comida (vermelha)
    ctx.fillStyle = "red";
    ctx.fillRect(comida.x * tamanhoBloco, comida.y * tamanhoBloco, tamanhoBloco - 2, tamanhoBloco - 2);

    // Desenha a cobra (verde)
    ctx.fillStyle = "green";
    for (var i = 0; i < cobra.length; i++) {
        var parte = cobra[i];
        ctx.fillRect(parte.x * tamanhoBloco, parte.y * tamanhoBloco, tamanhoBloco - 2, tamanhoBloco - 2);
    }
}

// Sorteia uma nova posição para a comida na tela
function criarComida() {
    comida.x = Math.floor(Math.random() * quantidadeBlocos);
    comida.y = Math.floor(Math.random() * quantidadeBlocos);
}

// Verifica se o jogador perdeu
function verificarFimDeJogo() {
    if (dx === 0 && dy === 0) return false;

    var cabeca = cobra[0];

    // Bateu nas paredes do fundo?
    var bateuNaEsquerda = cabeca.x < 0;
    var bateuNaDireita = cabeca.x >= quantidadeBlocos;
    var bateuEmCima = cabeca.y < 0;
    var bateuEmbaixo = cabeca.y >= quantidadeBlocos;

    if (bateuNaEsquerda || bateuNaDireita || bateuEmCima || bateuEmbaixo) {
        return true;
    }

    // Bateu no próprio corpo? (Começa a verificação a partir do pedaço 1)
    for (var i = 1; i < cobra.length; i++) {
        if (cabeca.x === cobra[i].x && cabeca.y === cobra[i].y) {
            return true;
        }
    }

    return false;
}

// Reseta os valores para começar uma partida nova do zero
function reiniciarVariaveis() {
    cobra = [
        { x: 10, y: 10 },
        { x: 9, y: 10 },
        { x: 8, y: 10 }
    ];
    dx = 1; // Começa andando para a direita
    dy = 0;
    pontos = 0;
    placar.innerText = pontos;
    criarComida();
}

// Controla para onde a cobra vai quando você aperta as teclas
function controlarTeclado(evento) {
    var tecla = evento.key;

    // Seta para esquerda ou tecla A
    if ((tecla === "ArrowLeft" || tecla === "a" || tecla === "A") && dx === 0) {
        dx = -1;
        dy = 0;
    }
    // Seta para cima ou tecla W
    if ((tecla === "ArrowUp" || tecla === "w" || tecla === "W") && dy === 0) {
        dx = 0;
        dy = -1;
    }
    // Seta para direita ou tecla D
    if ((tecla === "ArrowRight" || tecla === "d" || tecla === "D") && dx === 0) {
        dx = 1;
        dy = 0;
    }
    // Seta para baixo ou tecla S
    if ((tecla === "ArrowDown" || tecla === "s" || tecla === "S") && dy === 0) {
        dx = 0;
        dy = 1;
    }
}