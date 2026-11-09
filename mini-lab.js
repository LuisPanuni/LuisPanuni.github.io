(() => {
  "use strict";

  const root = document.querySelector(".mini-pc");
  if (!root) return;

  const startButton = root.querySelector("#pc-start");
  const startMenu = root.querySelector("#pc-start-menu");
  const views = [...root.querySelectorAll("[data-pc-view]")];
  const appButtons = [...root.querySelectorAll("[data-mini-app]")];
  const editor = root.querySelector("#python-editor");
  const runButton = root.querySelector("#python-run");
  const output = root.querySelector("#python-output");
  const pythonStatus = root.querySelector("#python-status");
  const paletteApp = root.querySelector("#palette-app");
  const snakeApp = root.querySelector("#snake-app");
  if (!startButton || !startMenu) return;

  const say = (spanish, english) => document.documentElement.lang.toLowerCase().startsWith("es") ? spanish : english;
  let activeApp = "desktop";

  function closeStartMenu() {
    startMenu.hidden = true;
    startButton.setAttribute("aria-expanded", "false");
    root.classList.remove("is-start-open");
  }

  function openApp(name, focus = false) {
    if (!views.some((view) => view.dataset.pcView === name)) return;
    activeApp = name;
    for (const view of views) view.hidden = view.dataset.pcView !== name;
    for (const button of appButtons) {
      const current = button.dataset.miniApp === name;
      if (button.classList.contains("pc-app")) button.setAttribute("aria-pressed", String(current));
      else button.setAttribute("aria-current", current ? "page" : "false");
      button.classList.toggle("is-active", current);
    }
    closeStartMenu();
    if (name !== "snake") stopSnake();
    if (focus) root.querySelector(`[data-pc-view="${name}"]`)?.focus({ preventScroll: true });
  }

  startButton.addEventListener("click", () => {
    const opening = startMenu.hidden;
    startMenu.hidden = !opening;
    startButton.setAttribute("aria-expanded", String(opening));
    root.classList.toggle("is-start-open", opening);
  });

  root.addEventListener("click", (event) => {
    const appButton = event.target.closest("[data-mini-app]");
    if (appButton && root.contains(appButton)) {
      openApp(appButton.dataset.miniApp, appButton.hasAttribute("data-app-focus"));
      return;
    }
    const closeButton = event.target.closest("[data-app-close], [data-app-back]");
    if (closeButton && root.contains(closeButton)) {
      openApp("desktop", true);
      return;
    }
    if (startMenu.contains(event.target) && event.target.closest("a")) closeStartMenu();
  });

  document.addEventListener("click", (event) => {
    if (!startMenu.hidden && !root.contains(event.target)) closeStartMenu();
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !startMenu.hidden) {
      closeStartMenu();
      startButton.focus({ preventScroll: true });
      return;
    }
    if (activeApp !== "snake" || !snakeRunning || snakePaused || document.hidden || !snakeApp?.contains(document.activeElement)) return;
    const direction = ({ ArrowUp: "up", w: "up", ArrowDown: "down", s: "down", ArrowLeft: "left", a: "left", ArrowRight: "right", d: "right" })[event.key];
    if (direction) {
      event.preventDefault();
      setSnakeDirection(direction);
    }
  });

  // Tiny, deliberately limited teaching console. It is not a Python interpreter.
  function parsePrintArgument(argument) {
    const source = argument.trim();
    const quote = source[0];
    if (quote === "\"" || quote === "'") {
      if (source[source.length - 1] !== quote) throw new Error(say("Cadena sin cerrar.", "Unclosed string."));
      let value = "";
      for (let index = 1; index < source.length - 1; index += 1) {
        const character = source[index];
        if (character !== "\\") { value += character; continue; }
        index += 1;
        const escaped = source[index];
        const escapes = { n: "\n", t: "\t", r: "\r", "\\": "\\", "\"": "\"", "'": "'" };
        if (!(escaped in escapes)) throw new Error(say("Solo se admiten escapes simples (\\n, \\t, \\r, \\\\ y comillas).", "Only basic escapes are supported (\\n, \\t, \\r, \\\\ and quotes)."));
        value += escapes[escaped];
      }
      return value;
    }
    if (/^-?\d+(?:\.\d+)?$/.test(source)) return source;
    throw new Error(say("print() admite texto entre comillas o un número.", "print() accepts quoted text or a number."));
  }

  function runPythonDemo() {
    if (!editor || !output || !pythonStatus) return;
    const code = editor.value;
    if (code.length > 500) {
      output.textContent = say("Límite: 500 caracteres por ejemplo.", "Limit: 500 characters per example.");
      pythonStatus.textContent = say("Ejemplo demasiado largo.", "Example is too long.");
      return;
    }
    const lines = code.split(/\r?\n/);
    if (lines.length > 12) {
      output.textContent = say("Límite: 12 líneas por ejemplo.", "Limit: 12 lines per example.");
      pythonStatus.textContent = say("Ejemplo demasiado largo.", "Example is too long.");
      return;
    }
    const result = [];
    let requestedApp = "";
    try {
      for (const rawLine of lines) {
        const line = rawLine.trim();
        if (!line || line.startsWith("#")) continue;
        if (line === "show_palette()") { requestedApp = "palette"; continue; }
        if (line === "start_snake()") { requestedApp = "snake"; continue; }
        const printMatch = line.match(/^print\((.*)\)$/);
        if (printMatch) { result.push(parsePrintArgument(printMatch[1])); continue; }
        throw new Error(say(`Instrucción no disponible: ${line}`, `Unsupported statement: ${line}`));
      }
      output.textContent = result.join("\n") || say("Programa ejecutado sin salida de texto.", "Program ran with no text output.");
      pythonStatus.textContent = say("Ejemplo ejecutado · subconjunto educativo de Python", "Example ran · educational Python subset");
      if (requestedApp) {
        openApp(requestedApp, true);
        if (requestedApp === "snake") resetSnake();
      }
    } catch (error) {
      output.textContent = error.message;
      pythonStatus.textContent = say("Revisa la sintaxis del ejemplo.", "Check the example syntax.");
    }
  }

  runButton?.addEventListener("click", runPythonDemo);
  root.querySelectorAll("[data-demo-code]").forEach((button) => {
    button.addEventListener("click", () => {
      if (!editor) return;
      editor.value = button.dataset.demoCode || "";
      runPythonDemo();
    });
  });

  function renderPalette() {
    if (!paletteApp) return;
    let swatches = paletteApp.querySelector("#palette-swatches");
    if (!swatches) {
      swatches = document.createElement("div");
      swatches.id = "palette-swatches";
      swatches.className = "palette-swatches";
      paletteApp.append(swatches);
    }
    const colors = ["#315B83", "#5B7897", "#93A6B8", "#A1AD8D", "#E7EBF1"];
    const status = paletteApp.querySelector("[data-palette-status]");
    swatches.replaceChildren();
    for (const color of colors) {
      const swatch = document.createElement("button");
      swatch.type = "button";
      swatch.className = "palette-swatch";
      swatch.style.setProperty("--swatch-color", color);
      swatch.setAttribute("aria-label", say(`Copiar color ${color}`, `Copy color ${color}`));
      swatch.title = say(`Copiar ${color}`, `Copy ${color}`);
      const value = document.createElement("span");
      value.textContent = color;
      swatch.append(value);
      swatch.addEventListener("click", async () => {
        let copied = false;
        try {
          await navigator.clipboard.writeText(color);
          copied = true;
        } catch {
          const field = document.createElement("textarea");
          field.value = color;
          field.setAttribute("readonly", "");
          field.style.position = "fixed";
          field.style.opacity = "0";
          document.body.append(field);
          field.select();
          try { copied = document.execCommand("copy"); } catch { copied = false; }
          field.remove();
        }
        if (status) status.textContent = copied
          ? say(`${color} copiado al portapapeles.`, `${color} copied to clipboard.`)
          : say(`Copia este valor: ${color}`, `Copy this value: ${color}`);
      });
      swatches.append(swatch);
    }
  }
  renderPalette();

  // Snake only runs after a deliberate Start press and only while its app is open.
  const snakeCanvas = snakeApp?.querySelector("#snake-canvas");
  const snakeContext = snakeCanvas?.getContext("2d");
  const snakeScore = snakeApp?.querySelector("#snake-score");
  const snakeStatus = snakeApp?.querySelector("#snake-status");
  const snakeStart = snakeApp?.querySelector("#snake-start");
  const snakePause = snakeApp?.querySelector("#snake-pause");
  const snakeReset = snakeApp?.querySelector("#snake-reset");
  const gridSize = 16;
  let snake = [];
  let food = { x: 10, y: 8 };
  let currentDirection = "right";
  let queuedDirection = "right";
  let snakeTimer = 0;
  let snakeRunning = false;
  let snakePaused = false;
  let score = 0;

  function setSnakeStatus(message, englishMessage = message) {
    if (snakeStatus) snakeStatus.textContent = say(message, englishMessage);
  }

  function randomFood() {
    let next;
    do { next = { x: Math.floor(Math.random() * gridSize), y: Math.floor(Math.random() * gridSize) }; }
    while (snake.some((part) => part.x === next.x && part.y === next.y));
    food = next;
  }

  function drawSnake() {
    if (!snakeCanvas || !snakeContext) return;
    const tile = snakeCanvas.width / gridSize;
    snakeContext.clearRect(0, 0, snakeCanvas.width, snakeCanvas.height);
    snakeContext.fillStyle = "#09111c";
    snakeContext.fillRect(0, 0, snakeCanvas.width, snakeCanvas.height);
    snakeContext.strokeStyle = "rgba(145,166,187,.08)";
    snakeContext.lineWidth = 1;
    for (let index = 1; index < gridSize; index += 1) {
      snakeContext.beginPath(); snakeContext.moveTo(index * tile, 0); snakeContext.lineTo(index * tile, snakeCanvas.height); snakeContext.stroke();
      snakeContext.beginPath(); snakeContext.moveTo(0, index * tile); snakeContext.lineTo(snakeCanvas.width, index * tile); snakeContext.stroke();
    }
    snakeContext.fillStyle = "#a1ad8d";
    snakeContext.beginPath(); snakeContext.arc((food.x + .5) * tile, (food.y + .5) * tile, tile * .27, 0, Math.PI * 2); snakeContext.fill();
    snake.forEach((part, index) => {
      snakeContext.fillStyle = index === 0 ? "#a8bfd4" : "#5b7897";
      snakeContext.fillRect(part.x * tile + 1.5, part.y * tile + 1.5, tile - 3, tile - 3);
    });
  }

  function resetSnake() {
    clearInterval(snakeTimer);
    snakeTimer = 0;
    snakeRunning = false;
    snakePaused = false;
    score = 0;
    snake = [{ x: 5, y: 8 }, { x: 4, y: 8 }, { x: 3, y: 8 }];
    currentDirection = queuedDirection = "right";
    randomFood();
    if (snakeScore) snakeScore.textContent = "0";
    if (snakePause) snakePause.setAttribute("aria-pressed", "false");
    setSnakeStatus("Listo · pulsa Iniciar y usa flechas o WASD.", "Ready · press Start and use arrows or WASD.");
    drawSnake();
  }

  function stopSnake() {
    clearInterval(snakeTimer);
    snakeTimer = 0;
    snakeRunning = false;
    snakePaused = false;
    if (snakePause) snakePause.setAttribute("aria-pressed", "false");
  }

  function finishSnake() {
    stopSnake();
    setSnakeStatus("Fin del juego · reinicia para volver a jugar.", "Game over · reset to play again.");
  }

  const oppositeDirection = { up: "down", down: "up", left: "right", right: "left" };
  function setSnakeDirection(direction) {
    if (oppositeDirection[currentDirection] !== direction) queuedDirection = direction;
  }

  function moveSnake() {
    currentDirection = queuedDirection;
    const delta = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] }[currentDirection];
    const head = { x: snake[0].x + delta[0], y: snake[0].y + delta[1] };
    const ate = head.x === food.x && head.y === food.y;
    const body = ate ? snake : snake.slice(0, -1);
    if (head.x < 0 || head.y < 0 || head.x >= gridSize || head.y >= gridSize || body.some((part) => part.x === head.x && part.y === head.y)) {
      finishSnake();
      return;
    }
    snake.unshift(head);
    if (ate) {
      score += 1;
      if (snakeScore) snakeScore.textContent = String(score);
      randomFood();
    } else snake.pop();
    drawSnake();
  }

  function beginSnake() {
    if (!snakeCanvas || activeApp !== "snake" || snakeRunning) return;
    if (!snake.length) resetSnake();
    snakeRunning = true;
    snakePaused = false;
    snakePause?.setAttribute("aria-pressed", "false");
    setSnakeStatus("En marcha · flechas o WASD para moverte.", "Running · use arrows or WASD to move.");
    snakeCanvas.focus({ preventScroll: true });
    snakeTimer = window.setInterval(moveSnake, 150);
  }

  function togglePause() {
    if (!snakeRunning) return;
    snakePaused = !snakePaused;
    if (snakePaused) {
      clearInterval(snakeTimer);
      snakeTimer = 0;
      setSnakeStatus("En pausa.", "Paused.");
    } else {
      snakeTimer = window.setInterval(moveSnake, 150);
      setSnakeStatus("En marcha · flechas o WASD para moverte.", "Running · use arrows or WASD to move.");
    }
    snakePause?.setAttribute("aria-pressed", String(snakePaused));
  }

  snakeStart?.addEventListener("click", beginSnake);
  snakePause?.addEventListener("click", togglePause);
  snakeReset?.addEventListener("click", resetSnake);
  snakeApp?.querySelectorAll("[data-snake-direction]").forEach((button) => {
    button.addEventListener("click", () => setSnakeDirection(button.dataset.snakeDirection));
  });
  if (snakeCanvas) {
    snakeCanvas.tabIndex = 0;
    snakeCanvas.setAttribute("aria-label", say("Tablero del juego Snake. Flechas o WASD para moverte.", "Snake game board. Use arrows or WASD to move."));
  }
  resetSnake();
  document.addEventListener("visibilitychange", () => {
    if (document.hidden && snakeRunning && !snakePaused) {
      clearInterval(snakeTimer);
      snakeTimer = 0;
      snakePaused = true;
      snakePause?.setAttribute("aria-pressed", "true");
      setSnakeStatus("En pausa mientras la pestaña está oculta.", "Paused while the tab is hidden.");
    }
  });
})();
