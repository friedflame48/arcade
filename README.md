# FRIViu-Jogou

FRIViu-Jogou é uma página estilo arcade feita com HTML, CSS e JavaScript. Ela reúne três jogos clássicos em uma interface responsiva:

- Jogo da Cobrinha
- Jogo da Velha
- Pong para dois jogadores

## Link de produção

`https://friedflame48.github.io/arcade/`

## Descrição

O projeto funciona como uma aplicação web estática. O navegador recebe os arquivos HTML, CSS e JavaScript diretamente do GitHub Pages e executa os jogos localmente no dispositivo do usuário.

Não há banco de dados, backend, API ou dados enviados a um servidor da aplicação.

## Arquitetura

```text
Usuário
   |
   | HTTPS
   v
GitHub Pages
   |
   | HTML, CSS e JavaScript
   v
Navegador do usuário
   |
   `-- Jogos executados no navegador
```

Não são necessárias instalações adicionais no servidor de produção.

## Tecnologias e serviços

- **HTML5:** estrutura das páginas.
- **CSS3:** aparência, layout responsivo e animações.
- **JavaScript:** regras, controles e pontuação dos jogos.
- **Canvas API:** desenho da Cobrinha e do Pong.
- **Git e GitHub:** versionamento e hospedagem do código.
- **GitHub Pages:** publicação gratuita da aplicação estática com HTTPS.

O GitHub Pages foi escolhido porque o projeto não usa backend nem banco de dados e pode ser publicado diretamente a partir do repositório.

## Variáveis de ambiente

O projeto não utiliza variáveis de ambiente, backend ou arquivos `.env`.

Não há senhas, tokens, chaves de API ou dados pessoais armazenados no projeto.

## Jogos

### Jogo da Cobrinha

Controle a cobra pelas paredes e evite colidir com o próprio corpo.

- Controles: teclas `W`, `A`, `S`, `D` ou setas direcionais
- Cada comida coletada adiciona 10 pontos

### Jogo da Velha

Jogue com um amigo em turnos locais.

- Jogador `X`
- Jogador `O`
- O jogo detecta vitória e empate
- Use o botão **Reiniciar Jogo** para começar uma nova partida

### Pong

Jogo local para dois jogadores. O primeiro jogador a marcar cinco pontos vence.

- Jogador 1: teclas `W` e `S`
- Jogador 2: setas `CIMA` e `BAIXO`

## Tecnologias

- HTML5
- CSS3
- JavaScript
- Canvas API

Nenhuma biblioteca ou dependência externa é necessária.

## Estrutura do projeto

```text
.
|-- index.html
|-- README.md
|-- arcade/
|   |-- index.html
|   |-- style.css
|   |-- jogoDaCobra 2/
|   |   |-- cobra.html
|   |   |-- scriptCobra.js
|   |   `-- styleCobra.css
|   |-- jogo_da_velha2/
|   |   |-- index_velha.html
|   |   |-- jogo_da_velha.js
|   |   `-- style_velha.css
|   `-- pong/
|       |-- pong.html
|       |-- scriptPong.js
|       `-- stylePong.css
|-- assets/
|-- Untitled.glb
`-- outros arquivos do site anterior
```

## Como executar localmente

1. Baixe ou clone o projeto.
2. Abra o arquivo `arcade/index.html` diretamente no navegador.

Como alternativa, execute um servidor local na pasta do projeto:

```bash
python -m http.server 8000
```

Depois, acesse:

```text
http://localhost:8000
```

## Publicação no GitHub Pages

1. Envie os arquivos para um repositório no GitHub.
2. Abra **Settings** no repositório.
3. Entre em **Pages**.
4. Em **Build and deployment**, selecione **Deploy from a branch**.
5. Escolha a branch principal e a pasta raiz `/ (root)`.
6. Salve e aguarde a publicação.
7. Abra o endereço exibido na seção Pages e confirme que o menu e os três jogos carregam corretamente.
8. Mantenha o repositório público ou disponibilize acesso ao professor.

Depois de ativar o Pages, novas alterações enviadas para a branch configurada são publicadas automaticamente pelo GitHub Pages.

## Pipeline e verificações

O GitHub Pages realiza o processo principal de publicação a partir da branch selecionada.

Antes da entrega, também é possível criar um workflow no GitHub Actions que valida o projeto a cada push na branch principal. Para esta aplicação estática, uma verificação adequada pode checar os links internos e confirmar a presença dos arquivos HTML e JavaScript.

O pipeline pode ser disparado em cada `push` ou `pull_request` para a branch principal.

## Verificação da aplicação

Para confirmar o funcionamento após o deploy:

1. Acesse a URL pública fornecida pelo GitHub Pages.
2. Confirme que a página inicial abre por HTTPS.
3. Abra o Jogo da Cobrinha e teste iniciar e reiniciar uma partida.
4. Abra o Jogo da Velha e faça algumas jogadas.
5. Abra o Pong e confirme os controles e o placar.
6. Teste os botões **Retornar** em todas as páginas.
7. Teste em uma tela pequena para confirmar o layout responsivo.

Como não existe backend, não é necessária uma rota `/health` ou banco de dados.

## Versionamento e rollback

Crie uma release marcada com uma tag antes da entrega:

```bash
git add .
git commit -m "Preparar versão 1.0.0"
git tag -a v1.0.0 -m "Versão 1.0.0"
git push origin main
git push origin v1.0.0
```

Se um novo deploy apresentar problemas:

1. Revertendo um commit específico:

```bash
git revert CODIGO_DO_COMMIT_COM_PROBLEMA
git push origin main
```

2. Ou restaurando uma versão anterior no repositório:

```bash
git checkout v1.0.0
```

O GitHub Pages publicará novamente a branch principal após o envio da correção.

## Problemas encontrados e soluções

- Os links absolutos `/index.html` não eram adequados para a URL do GitHub Pages em um subdiretório. Eles foram substituídos por links relativos `../index.html`.
- A pasta do Jogo da Cobrinha contém espaço no nome. Os arquivos foram mantidos, e os links foram escritos com a referência relativa correta.
- O projeto não possui dependências externas, banco ou backend, evitando erros comuns de configuração em produção.

## Compatibilidade

O projeto pode ser executado em navegadores modernos em computadores com Windows, Linux ou macOS.
