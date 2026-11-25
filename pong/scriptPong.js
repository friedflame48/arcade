// ==========================================
// CONFIGURAÇÃO INICIAL DO PONG (2 JOGADORES)
// ==========================================

var canvas = document.getElementById("gameCanvas");
var ctx = canvas.getContext("2d");

// Placares da tela (agora Jogador 1 e Jogador 2)
var placarP1 = document.getElementById("playerScore");
var placarP2 = document.getElementById("aiScore");

// Menus e botões
var telaInicio = document.getElementById("startScreen");
var telaFim = document.getElementById("gameOverScreen");
var botaoIniciar = document.getElementById("startBtn");
var botaoReiniciar = document.getElementById("restartBtn");
var textoVencedor = document.getElementById("winnerText");

var relogioJogo = null;
var pontosParaVencer = 5;

// Objeto da Bolinha
var bola = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    tamanho: 12,
    velocidadeX: 4,
    velocidadeY: 3
};

// Raquete do Jogador 1 (Esquerda - Controlado por W e S)
var jogador1 = {
    x: 20,
    y: canvas.height / 2 - 40,
    largura: 12,
    altura: 80
};

// Raquete do Jogador 2 (Direita - Controlado por Setas)
var jogador2 = {
    x: canvas.width - 32,
    y: canvas.height / 2 - 40,
    largura: 12,
    altura: 80
};

var pontosP1 = 0;
var pontosP2 = 0;

// Controle de teclas do Jogador 1 (W e S)
var p1Sobe = false;
var p1Desce = false;

// Controle de teclas do Jogador 2 (Setas)
var p2Sobe = false;
var p2Desce = false;


// ==========================================
// EVENTOS DE BOTÕES E TECLADO
// ==========================================

botaoIniciar.onclick = comecarJogo;
botaoReiniciar.onclick = comecarJogo;

// Fica de olho quando aperta a tecla
document.onkeydown = function(evento) {
    // Controles do Jogador 1 (W e S)
    if (evento.key === "w" || evento.key === "W") p1Sobe = true;
    if (evento.key === "s" || evento.key === "S") p1Desce = true;

    // Controles do Jogador 2 (Setas Cima/Baixo)
    if (evento.key === "ArrowUp") p2Sobe = true;
    if (evento.key === "ArrowDown") p2Desce = true;
};

// Fica de olho quando solta a tecla
document.onkeyup = function(evento) {
    // Controles do Jogador 1 (W e S)
    if (evento.key === "w" || evento.key === "W") p1Sobe = false;
    if (evento.key === "s" || evento.key === "S") p1Desce = false;

    // Controles do Jogador 2 (Setas Cima/Baixo)
    if (evento.key === "ArrowUp") p2Sobe = false;
    if (evento.key === "ArrowDown") p2Desce = false;
};


// ==========================================
// FUNÇÕES DO JOGO
// ==========================================

function comecarJogo() {
    telaInicio.classList.add("hidden");
    telaFim.classList.add("hidden");
    
    pontosP1 = 0;
    pontosP2 = 0;
    placarP1.innerText = pontosP1;
    placarP2.innerText = pontosP2;
    
    reiniciarRodada();
    
    if (relogioJogo) clearInterval(relogioJogo);
    relogioJogo = setInterval(principal, 1000 / 60);
}

function principal() {
    atualizar();
    desenharTudo();
}

function atualizar() {
    // Move a bolinha
    bola.x += bola.velocidadeX;
    bola.y += bola.velocidadeY;

    // Rebater nas paredes de cima e de baixo
    if (bola.y - bola.tamanho / 2 < 0) {
        bola.y = bola.tamanho / 2;
        bola.velocidadeY = -bola.velocidadeY;
    }
    if (bola.y + bola.tamanho / 2 > canvas.height) {
        bola.y = canvas.height - bola.tamanho / 2;
        bola.velocidadeY = -bola.velocidadeY;
    }

    // Movimentação do Jogador 1 (Teclas W e S)
    if (p1Sobe && jogador1.y > 0) {
        jogador1.y -= 6;
    }
    if (p1Desce && jogador1.y + jogador1.altura < canvas.height) {
        jogador1.y += 6;
    }

    // Movimentação do Jogador 2 (Setas Cima/Baixo)
    if (p2Sobe && jogador2.y > 0) {
        jogador2.y -= 6;
    }
    if (p2Desce && jogador2.y + jogador2.altura < canvas.height) {
        jogador2.y += 6;
    }

    var bolaEsquerda = bola.x - bola.tamanho / 2;
    var bolaDireita = bola.x + bola.tamanho / 2;
    var bolaTopo = bola.y - bola.tamanho / 2;
    var bolaBaixo = bola.y + bola.tamanho / 2;

    // Colisão com a raquete do Jogador 1 (Esquerda)
    if (
        bolaEsquerda <= jogador1.x + jogador1.largura &&
        bolaEsquerda >= jogador1.x - 5 &&
        bolaBaixo >= jogador1.y &&
        bolaTopo <= jogador1.y + jogador1.altura
    ) {
        bola.x = jogador1.x + jogador1.largura + bola.tamanho / 2;
        bola.velocidadeX = -bola.velocidadeX;
        
        // Aumenta a velocidade progressivamente
        if (Math.abs(bola.velocidadeX) < 12) {
            bola.velocidadeX *= 1.05;
            bola.velocidadeY *= 1.05;
        }
    }

    // Colisão com a raquete do Jogador 2 (Direita)
    if (
        bolaDireita >= jogador2.x &&
        bolaDireita <= jogador2.x + jogador2.largura + 5 &&
        bolaBaixo >= jogador2.y &&
        bolaTopo <= jogador2.y + jogador2.altura
    ) {
        bola.x = jogador2.x - bola.tamanho / 2;
        bola.velocidadeX = -bola.velocidadeX;
        
        if (Math.abs(bola.velocidadeX) < 12) {
            bola.velocidadeX *= 1.05;
            bola.velocidadeY *= 1.05;
        }
    }

    // Se a bola passou da esquerda, ponto do Jogador 2
    if (bola.x < 0) {
        pontosP2++;
        placarP2.innerText = pontosP2;
        verificarFimDeJogo();
    }

    // Se a bola passou da direita, ponto do Jogador 1
    if (bola.x > canvas.width) {
        pontosP1++;
        placarP1.innerText = pontosP1;
        verificarFimDeJogo();
    }
}

function desenharTudo() {
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Linha pontilhada no meio
    ctx.strokeStyle = "#333333";
    ctx.lineWidth = 4;
    ctx.setLineDash([10, 10]);
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, 0);
    ctx.lineTo(canvas.width / 2, canvas.height);
    ctx.stroke();
    ctx.setLineDash([]);

    // Desenha a Bolinha
    ctx.fillStyle = "white";
    ctx.fillRect(bola.x - bola.tamanho / 2, bola.y - bola.tamanho / 2, bola.tamanho, bola.tamanho);

    // Desenha a Raquete do Jogador 1 (Azul)
    ctx.fillStyle = "#64B5F6";
    ctx.fillRect(jogador1.x, jogador1.y, jogador1.largura, jogador1.altura);

    // Desenha a Raquete do Jogador 2 (Vermelha)
    ctx.fillStyle = "#FF5252";
    ctx.fillRect(jogador2.x, jogador2.y, jogador2.largura, jogador2.altura);
}

function reiniciarRodada() {
    bola.x = canvas.width / 2;
    bola.y = canvas.height / 2;
    bola.velocidadeX = (Math.random() > 0.5 ? 1 : -1) * 4;
    bola.velocidadeY = (Math.random() * 2 - 1) * 3;
}

function verificarFimDeJogo() {
    if (pontosP1 >= pontosParaVencer) {
        clearInterval(relogioJogo);
        textoVencedor.innerText = "Jogador 1 Venceu! 🎉";
        telaFim.classList.remove("hidden");
    } else if (pontosP2 >= pontosParaVencer) {
        clearInterval(relogioJogo);
        textoVencedor.innerText = "Jogador 2 Venceu! 🏆";
        telaFim.classList.remove("hidden");
    } else {
        reiniciarRodada();
    }
}