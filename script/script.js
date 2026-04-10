const profile = {
  name: 'Thales Karam',
  role: 'Desenvolvedor em formacao',
  intro: 'Portifolio interativo em desenvolvimento. Use os comandos para explorar informacoes em tempo real.',
  about: [
    'Nome: Thales Karam',
    'Perfil: Desenvolvedor focado na construção de APIs e aplicações web.',
    'Experiencia atual: Participando do projeto de extensão universitário InovaFriLab, onde contribuo para o desenvolvimento de soluções inovadoras.'
  ],
  skills: [
    'Java para desenvolvimento backend e logica de negocio',
    'Git para controle de versao e colaboracao',
    'Node.js para desenvolvimento backend e APIs',
    'SQL para gerenciamento de bancos de dados relacionais',
    'HTML semantico',
    'CSS para layout, responsividade e interface visual',
    'JavaScript para interatividade e logica no navegador',
  ],
  projects: [
    'InovaFriHub: Plataforma de mapeamento e conexao entre empreendedores, investidores e mentores, facilitando o ecossistema de inovacao.',
    'Sistema de Pedidos de Software: Aplicacao web para gerenciamento de pedidos de software, desde a solicitacao ate a entrega, com acompanhamento em tempo real. https://aplica-ocorporativanative-production.up.railway.app/login',
  ],
  links: {
    github: 'https://github.com/ThalesKaram',
    linkedin: 'https://www.linkedin.com/in/thales-karam-77741326a/'
  },
  email: 'thaleskaram.contact@gmail.com'
};

function buildHelpLines() {
  return [
    'Comandos disponíveis:',
    '--help   : mostra esta ajuda',
    'sobre    : resumo profissional',
    'skills   : tecnologias e pontos fortes',
    'tech     : alias para skills',
    'projetos : vitrine de projetos',
    'contato  : canais de contato',
    'github   : abre o GitHub',
    'linkedin : abre o LinkedIn',
    'whoami   : identifica o perfil atual',
    'date     : mostra data e hora locais',
    'clear    : limpa o terminal'
  ];
}

function line(text, options = {}) {
  return { text, ...options };
}

function getUnavailableMessage(label, fileHint) {
  return [
    line(`${label} ainda não configurado.`),
    line(`Atualize o valor em ${fileHint}.`, { className: 'terminal-muted' })
  ];
}

function buildContactLines() {
  const lines = [];

  if (profile.links.github) {
    lines.push(line('GitHub: ' + profile.links.github, { href: profile.links.github }));
  }

  if (profile.links.linkedin) {
    lines.push(line('LinkedIn: ' + profile.links.linkedin, { href: profile.links.linkedin }));
  } else {
    lines.push(...getUnavailableMessage('LinkedIn', 'script/script.js'));
  }

  if (profile.email) {
    lines.push(line('Email: ' + profile.email, { href: `mailto:${profile.email}` }));
  } else {
    lines.push(...getUnavailableMessage('Email', 'script/script.js'));
  }

  return lines;
}

function openLinkCommand(label, href) {
  if (!href) {
    return {
      lines: getUnavailableMessage(label, 'script/script.js')
    };
  }

  window.open(href, '_blank', 'noopener,noreferrer');
  return {
    lines: [line(`Abrindo ${label}...`, { href })]
  };
}

const commandHandlers = {
  '--help': () => ({ lines: buildHelpLines().map((item) => line(item)) }),
  help: () => ({ lines: buildHelpLines().map((item) => line(item)) }),
  sobre: () => ({ lines: profile.about.map((item) => line(item)) }),
  skills: () => ({ lines: profile.skills.map((item) => line(item)) }),
  tech: () => ({ lines: profile.skills.map((item) => line(item)) }),
  projetos: () => ({ lines: profile.projects.map((item) => line(item)) }),
  contato: () => ({ lines: buildContactLines() }),
  github: () => openLinkCommand('GitHub', profile.links.github),
  linkedin: () => openLinkCommand('LinkedIn', profile.links.linkedin),
  curriculo: () => openLinkCommand('curriculo', profile.links.curriculo),
  whoami: () => ({ lines: [line(`${profile.name} | ${profile.role}`)] }),
  date: () => ({ lines: [line(new Date().toLocaleString('pt-BR'))] }),
  clear: () => ({ clear: true, lines: [] })
};

function initializeBackground() {
  if (window.VANTA && typeof window.VANTA.HALO === 'function') {
    window.VANTA.HALO({
      el: '#vanta-bg',
      mouseControls: true,
      touchControls: true,
      gyroControls: false,
      minHeight: 200,
      minWidth: 200
    });
  }
}

function initializeTerminal() {
  const terminal = document.getElementById('terminal-output');
  const form = document.getElementById('terminal-form');
  const input = document.getElementById('terminal-input');

  if (!terminal || !form || !input) {
    return;
  }

  const history = [];
  let historyIndex = -1;

  function appendEntry(command, lines) {
    const entry = document.createElement('div');
    entry.className = 'terminal-entry';

    if (command) {
      const commandLine = document.createElement('p');
      commandLine.className = 'terminal-command';
      commandLine.textContent = `thales@portfolio:~$ ${command}`;
      entry.appendChild(commandLine);
    }

    const response = document.createElement('div');
    response.className = 'terminal-response';

    lines.forEach((lineData) => {
      const paragraph = document.createElement('p');

      if (lineData.className) {
        paragraph.classList.add(lineData.className);
      }

      if (lineData.href) {
        const anchor = document.createElement('a');
        anchor.href = lineData.href;
        anchor.target = '_blank';
        anchor.rel = 'noopener noreferrer';
        anchor.textContent = lineData.text;
        paragraph.appendChild(anchor);
      } else {
        paragraph.textContent = lineData.text;
      }

      response.appendChild(paragraph);
    });

    entry.appendChild(response);
    terminal.appendChild(entry);
    terminal.scrollTop = terminal.scrollHeight;
  }

  function runCommand(rawValue) {
    const command = rawValue.trim();

    if (!command) {
      return;
    }

    history.push(command);
    historyIndex = history.length;

    const normalizedCommand = command.toLowerCase().split(/\s+/)[0];
    const handler = commandHandlers[normalizedCommand];

    if (!handler) {
      appendEntry(command, [
        line(`Comando não reconhecido: ${command}`),
        line('Digite --help para ver os comandos disponíveis.')
      ]);
      return;
    }

    const result = handler();

    if (result.clear) {
      terminal.innerHTML = '';
      appendEntry('', [line('Terminal limpo.'), line('Digite --help para continuar.')]);
      return;
    }

    appendEntry(command, result.lines);
  }

  appendEntry('', [
    line(`Olá, eu sou ${profile.name}.`),
    line(profile.intro),
    line('Digite --help para listar os comandos disponíveis.')
  ]);

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    runCommand(input.value);
    input.value = '';
  });

  input.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowUp') {
      event.preventDefault();
      if (!history.length) {
        return;
      }

      historyIndex = Math.max(historyIndex - 1, 0);
      input.value = history[historyIndex];
    }

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      if (!history.length) {
        return;
      }

      historyIndex = Math.min(historyIndex + 1, history.length);
      input.value = history[historyIndex] || '';
    }
  });

  document.querySelector('.introduction')?.addEventListener('click', () => {
    input.focus();
  });

  input.focus();
}

initializeBackground();
initializeTerminal();