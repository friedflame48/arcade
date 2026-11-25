// Equivalente a: tabuleiro = [" " for _ in range(9)]
let tabuleiro = Array(9).fill(" ");

const x = "X";
const y = "O"; // Mantido como '0' igual ao seu código original
let jogadorAtual = x;
let jogadas = 0;
let jogoAtivo = true;

// Selecionando elementos da tela
const celulas = document.querySelectorAll(".celula");
const statusTexto = document.getElementById("status");
const btnReiniciar = document.getElementById("btn-reiniciar");

// Equivalente à função verificar_vitoria(jogador)
function verificarVitoria(jogador) {
    const vitorias = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8], // Linhas
        [0, 3, 6], [1, 4, 7], [2, 5, 8], // Colunas
        [0, 4, 8], [2, 4, 6]             // Diagonais
    ];

    for (let condicao of vitorias) {
        if (
            tabuleiro[condicao[0]] === jogador &&
            tabuleiro[condicao[1]] === jogador &&
            tabuleiro[condicao[2]] === jogador
        ) {
            return true;
        }
    }
    return false;
}

// Função executada ao clicar em uma casa do tabuleiro
function lidarComClique(evento) {
    const celulaClicada = evento.target;
    const escolha = parseInt(celulaClicada.getAttribute("data-index"));

    // Verifica se o jogo acabou ou se a posição já está ocupada
    if (!jogoAtivo || tabuleiro[escolha] !== " ") {
        return;
    }

    // Atualiza o array e a interface
    tabuleiro[escolha] = jogadorAtual;
    celulaClicada.textContent = jogadorAtual;
    celulaClicada.classList.add(jogadorAtual === x ? "x" : "o");
    jogadas++;

    // Checa vitória
    if (verificarVitoria(jogadorAtual)) {
        statusTexto.textContent = `Parabéns! O jogador '${jogadorAtual}' venceu o jogo! 🎉`;
        statusTexto.style.color = "#4caf50";
        jogoAtivo = false;
        return;
    }

    // Checa empate (9 jogadas sem vencedor)
    if (jogadas === 9) {
        statusTexto.textContent = "Deu velha! O jogo terminou empatado. 🤝";
        statusTexto.style.color = "#ffb74d";
        jogoAtivo = false;
        return;
    }

    // Alterna o jogador
    jogadorAtual = jogadorAtual === x ? y : x;
    statusTexto.textContent = `Vez do jogador '${jogadorAtual}'`;
}

// Reseta todas as variáveis para uma nova partida
function reiniciarJogo() {
    tabuleiro = Array(9).fill(" ");
    jogadorAtual = x;
    jogadas = 0;
    jogoAtivo = true;

    statusTexto.textContent = `Vez do jogador '${jogadorAtual}'`;
    statusTexto.style.color = "#bbbbbb";

    celulas.forEach(celula => {
        celula.textContent = "";
        celula.classList.remove("x", "o");
    });
}

// Adiciona os eventos de clique
celulas.forEach(celula => celula.addEventListener("click", lidarComClique));
btnReiniciar.addEventListener("click", reiniciarJogo);