const mol1 = document.getElementById('mol1');
const mol2 = document.getElementById('mol2');
const startBtn = document.getElementById('startBtn');
const resetBtn = document.getElementById('resetBtn');
const messageDiv = document.getElementById('message');
const questionBox = document.getElementById('questionBox');
const questionText = document.getElementById('questionText');
const optionsDiv = document.getElementById('options');
const turnInfo = document.getElementById('turnInfo');
const speed1Bar = document.getElementById('speed1Bar');
const speed2Bar = document.getElementById('speed2Bar');
const track = document.getElementById('track');

let pos1 = 0, pos2 = 0;
let speed1 = 1, speed2 = 1;
let raceInterval = null;
let questionActive = false;
let currentPlayer = 1;
let correct1 = 0, correct2 = 0;

const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
const maxPos = () => track.clientWidth - mol1.clientWidth - 10;

const questions = [
  { question: 'O que acontece quando a temperatura aumenta?',
    options: [
      { text: 'As moléculas ficam mais rápidas e colidem mais.', correct: true },
      { text: 'As moléculas param de se mover.', correct: false },
      { text: 'A reação fica mais lenta.', correct: false }
    ]
  },
  { question: 'O que um catalisador faz numa reação?',
    options: [
      { text: 'Aumenta a energia de ativação.', correct: false },
      { text: 'Diminui a energia de ativação.', correct: true },
      { text: 'Remove reagentes.', correct: false }
    ]
  },
  { question: 'Por que a orientação das moléculas é importante?',
    options: [
      { text: 'Porque precisam colidir no ângulo certo para reagir.', correct: true },
      { text: 'Porque define a cor dos produtos.', correct: false },
      { text: 'Porque controla a pressão.', correct: false }
    ]
  },
  { question: 'Por que reações entre íons opostamente carregados são rápidas?',
    options: [
      { text: 'Porque não exigem orientação específica e há atração eletrostática direta', correct: true },
      { text: 'Porque usam catalisadores naturais', correct: false },
      { text: 'Porque formam ligações covalentes rapidamente', correct: false }
    ]
  },
  { question: 'Maior concentração de reagentes implica:',
    options: [
      { text: 'Menos colisões por segundo.', correct: false },
      { text: 'Mais colisões por segundo.', correct: true },
      { text: 'Nenhuma mudança.', correct: false }
    ]
  },
  { question: 'Efeito de aumentar a temperatura em geral é:',
    options: [
      { text: 'Aumentar a velocidade da reação.', correct: true },
      { text: 'Diminuir a energia cinética.', correct: false },
      { text: 'Congelar as moléculas.', correct: false }
    ]
  },
  { question: 'Em reações multietapas, a etapa determinante da velocidade está associada a:',
    options: [
      { text: 'A etapa mais lenta, geralmente com maior energia de ativação.', correct: true },
      { text: 'A etapa que apresenta a menor energia de ativação.', correct: false },
      { text: 'A etapa com maior liberação de energia.', correct: false }
    ]
  },
  { question: 'A teoria das colisões pode falhar em prever corretamente a velocidade de reações porque:',
    options: [
      { text: 'Ela desconsidera a influência de fatores como entropia e complexidade molecular.', correct: true },
      { text: 'Ela considera que todas as colisões são eficazes.', correct: false },
      { text: 'Ela não se aplica a reações gasosas.', correct: false }
    ]
  },
  { question: 'Em reações reversíveis, o equilíbrio químico é alcançado quando:',
    options: [
      { text: 'A frequência de colisões eficazes nos dois sentidos se torna igual.', correct: true },
      { text: 'A concentração dos produtos é maior que a dos reagentes.', correct: false },
      { text: 'A energia de ativação da reação direta é menor.', correct: false }
    ]
  },
  { question: 'Desempate: Qual fator mais influencia a taxa de colisão em gases?',
    options: [
      { text: 'Volume do recipiente', correct: false },
      { text: 'Energia de ativação', correct: false },
      { text: 'Concentração das moléculas (densidade)', correct: true }
    ]
  }
];

function setPositions() {
  mol1.style.left = pos1 + 'px';
  mol2.style.left = pos2 + 'px';
  speed1Bar.style.width = (speed1 * 20) + '%';
  speed2Bar.style.width = (speed2 * 20) + '%';
}

function announce(msg) {
  messageDiv.textContent = msg;
}

function moveMolecules() {
  const limit = maxPos();
  pos1 = clamp(pos1 + speed1, 0, limit);
  pos2 = clamp(pos2 + speed2, 0, limit);
  setPositions();

  if ((pos1 >= limit || pos2 >= limit) && !questionActive) {
    stopRace();

    if (pos1 >= limit && pos2 >= limit) {
      if (correct1 > correct2) announce("🏆 Molécula 1 venceu por desempenho!");
      else if (correct2 > correct1) announce("🏆 Molécula 2 venceu por desempenho!");
      else askTieBreaker();
    } else {
      const winner = pos1 >= limit ? 'Molécula 1' : 'Molécula 2';
      announce(`🏁 ${winner} venceu a corrida!`);
    }

    startBtn.disabled = false;
    return;
  }

  if (!questionActive && Math.random() < 0.03) {
    questionActive = true;
    pauseRace();
    askQuestion(currentPlayer);
  }
}

function startRace() {
  if (raceInterval) return;
  raceInterval = setInterval(moveMolecules, 60);
}

function pauseRace() {
  clearInterval(raceInterval);
  raceInterval = null;
}

function stopRace() {
  pauseRace();
}

function resetRace() {
  pos1 = pos2 = 0;
  speed1 = speed2 = 1;
  correct1 = correct2 = 0;
  currentPlayer = 1;
  questionActive = false;
  setPositions();
  questionBox.style.display = 'none';
  messageDiv.textContent = '';
  startBtn.disabled = false;
  clearInterval(raceInterval);
  raceInterval = null;
}

function askQuestion(player) {
  const q = questions[Math.floor(Math.random() * questions.length)];
  turnInfo.textContent = `Vez da molécula ${player}`;
  questionText.textContent = q.question;
  optionsDiv.innerHTML = '';

  q.options.forEach(opt => {
    const btn = document.createElement('button');
    btn.textContent = opt.text;
    btn.onclick = () => {
      if (opt.correct) {
        announce(`✅ Correto! Molécula ${player} avança!`);
        if (player === 1) {
          speed1 += 0.4;
          pos1 += 40;
          correct1++;
        } else {
          speed2 += 0.4;
          pos2 += 40;
          correct2++;
        }
      } else {
        announce(`❌ Errado! Molécula ${player} recua.`);
        if (player === 1) {
          speed1 = Math.max(0.5, speed1 - 0.5);
          pos1 = clamp(pos1 - 20, 0, maxPos());
        } else {
          speed2 = Math.max(0.5, speed2 - 0.5);
          pos2 = clamp(pos2 - 20, 0, maxPos());
        }
      }

      questionBox.style.display = 'none';
      questionActive = false;
      currentPlayer = player === 1 ? 2 : 1;
      startRace();
    };
    optionsDiv.appendChild(btn);
  });

  questionBox.style.display = 'block';
}

function askTieBreaker() {
  announce("⚖️ Empate! Pergunta de desempate...");
  pauseRace();
  currentPlayer = 1;
  askQuestion(1);
}

startBtn.addEventListener('click', () => {
  if (!raceInterval) {
    setPositions();
    startBtn.disabled = true;
    announce('🚀 Corrida iniciada!');
    startRace();
  }
});

resetBtn.addEventListener('click', resetRace);
window.addEventListener('resize', () => {
  pos1 = clamp(pos1, 0, maxPos());
  pos2 = clamp(pos2, 0, maxPos());
  setPositions();
});
resetRace();
