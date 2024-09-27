
# Aplicação de Geração de Linhas e Recortes em Electron

Esta aplicação permite criar e manipular formas em um grid interativo, utilizando algoritmos de geração de linhas (DDA e Bresenham) e recorte de linhas (Cohen-Sutherland e Liang-Barsky). Além disso, é possível criar círculos, mover, rotacionar, escalar e espelhar formas, tudo através de controles de teclado intuitivos.

## Funcionalidades
- **Geração de linhas**: Utilize os algoritmos DDA ou Bresenham para desenhar linhas entre dois pontos.
- **Recorte de linhas**: Aplique os algoritmos Cohen-Sutherland ou Liang-Barsky para realizar o recorte de linhas no grid.
- **Criação de círculos**: Desenhe círculos utilizando o algoritmo de Bresenham.
- **Manipulação de formas**: Mova, rotacione, escale e espelhe as formas criadas no grid.
- **Escolha de cores**: Selecione cores personalizadas para as formas.
- **Visualização dinâmica**: Visualize as coordenadas do grid em tempo real enquanto manipula as formas.

## Pré-requisitos

Certifique-se de ter o [Node.js](https://nodejs.org/) e o [Electron](https://www.electronjs.org/) instalados em sua máquina para rodar a aplicação.

### Instalação do Electron

Se ainda não tiver o Electron instalado globalmente, use o seguinte comando:

```bash
npm install -g electron
```

## Instruções de Uso

### Executavel
O arquivo executavel esta localizado em "dist\rasterization-win32-x64\rasterization.exe" caso prefira, também é possivel executalo a partir das instruções abaixo

### Clonando o repositório
Para começar, clone o repositório para sua máquina local:

```bash
git clone <URL-do-repositório>
cd <nome-do-repositório>
```

### Instalando as Dependências
Dentro do diretório do projeto, instale todas as dependências necessárias com:

```bash
npm install
```

### Executando a Aplicação
Após a instalação, execute o comando abaixo para iniciar a aplicação:

```bash
npm start
```

A aplicação será aberta em uma janela Electron, onde você pode criar, mover e manipular formas no grid.

## Controles de Teclado

- **Seta para Cima/Seta para Baixo**: Move a última forma criada para cima/baixo.
- **Seta para Esquerda/Seta para Direita**: Move a última forma criada para a esquerda/direita.
- **Ctrl + Seta**: Rotaciona a última forma criada no grid.
- **Esc**: Limpa o grid.

## Funcionalidades Avançadas

- **Escolha de Algoritmo de Linhas**: Selecione entre DDA e Bresenham para a geração de linhas.
- **Escolha de Algoritmo de Recorte**: Escolha entre Cohen-Sutherland e Liang-Barsky para o recorte de linhas.
- **Escala e Rotação**: Ajuste a escala e rotação das formas utilizando fatores específicos.
- **Espelhamento**: Espelhe a última forma criada nos eixos X ou Y.

## Contribuição

Se você deseja contribuir para o projeto, sinta-se à vontade para abrir issues ou enviar pull requests. Toda contribuição é bem-vinda!

---

