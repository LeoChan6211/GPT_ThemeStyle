(() => {
  const g = (globalThis.GPTGT = globalThis.GPTGT || {});

  g.CODE_THEME_PRESETS = {
    "github-dark": {
      bg: "#0d1117",
      fg: "#c9d1d9",
      keyword: "#ff7b72",
      func: "#d2a8ff",
      constant: "#79c0ff",
      string: "#a5d6ff",
      number: "#79c0ff",
      comment: "#8b949e",
      type: "#ffa657"
    },
    "github-dark-dimmed": {
      bg: "#22272e",
      fg: "#adbac7",
      keyword: "#f47067",
      func: "#dcbdfb",
      constant: "#6cb6ff",
      string: "#96d0ff",
      number: "#6cb6ff",
      comment: "#768390",
      type: "#f69d50"
    },
    github: {
      bg: "#ffffff",
      fg: "#24292e",
      keyword: "#d73a49",
      func: "#6f42c1",
      constant: "#005cc5",
      string: "#032f62",
      number: "#005cc5",
      comment: "#6a737d",
      type: "#e36209"
    },
    "atom-one-dark": {
      bg: "#282c34",
      fg: "#abb2bf",
      keyword: "#c678dd",
      func: "#61aeee",
      constant: "#d19a66",
      string: "#98c379",
      number: "#d19a66",
      comment: "#5c6370",
      type: "#e6c07b"
    },
    "atom-one-light": {
      bg: "#fafafa",
      fg: "#383a42",
      keyword: "#a626a4",
      func: "#4078f2",
      constant: "#986801",
      string: "#50a14f",
      number: "#986801",
      comment: "#a0a1a7",
      type: "#c18401"
    },
    dracula: {
      bg: "#282a36",
      fg: "#f8f8f2",
      keyword: "#ff79c6",
      func: "#50fa7b",
      constant: "#bd93f9",
      string: "#f1fa8c",
      number: "#bd93f9",
      comment: "#6272a4",
      type: "#8be9fd"
    },
    nord: {
      bg: "#2e3440",
      fg: "#d8dee9",
      keyword: "#81a1c1",
      func: "#88c0d0",
      constant: "#8fbcbb",
      string: "#a3be8c",
      number: "#b48ead",
      comment: "#616e88",
      type: "#d08770"
    },
    "tokyo-night": {
      bg: "#1a1b26",
      fg: "#c0caf5",
      keyword: "#7aa2f7",
      func: "#bb9af7",
      constant: "#2ac3de",
      string: "#9ece6a",
      number: "#ff9e64",
      comment: "#565f89",
      type: "#2ac3de"
    },
    "gruvbox-dark": {
      bg: "#282828",
      fg: "#ebdbb2",
      keyword: "#fb4934",
      func: "#b8bb26",
      constant: "#83a598",
      string: "#b8bb26",
      number: "#d3869b",
      comment: "#928374",
      type: "#fabd2f"
    },
    "gruvbox-light": {
      bg: "#fbf1c7",
      fg: "#3c3836",
      keyword: "#9d0006",
      func: "#79740e",
      constant: "#076678",
      string: "#79740e",
      number: "#8f3f71",
      comment: "#928374",
      type: "#b57614"
    },
    "solarized-dark": {
      bg: "#002b36",
      fg: "#93a1a1",
      keyword: "#268bd2",
      func: "#b58900",
      constant: "#2aa198",
      string: "#859900",
      number: "#d33682",
      comment: "#586e75",
      type: "#cb4b16"
    },
    "solarized-light": {
      bg: "#fdf6e3",
      fg: "#586e75",
      keyword: "#268bd2",
      func: "#b58900",
      constant: "#2aa198",
      string: "#859900",
      number: "#d33682",
      comment: "#93a1a1",
      type: "#cb4b16"
    },
    "material-ocean": {
      bg: "#0f111a",
      fg: "#a6accd",
      keyword: "#c792ea",
      func: "#82aaff",
      constant: "#89ddff",
      string: "#c3e88d",
      number: "#f78c6c",
      comment: "#546e7a",
      type: "#ffcb6b"
    },
    "catppuccin-mocha": {
      bg: "#1e1e2e",
      fg: "#cdd6f4",
      keyword: "#cba6f7",
      func: "#89b4fa",
      constant: "#94e2d5",
      string: "#a6e3a1",
      number: "#fab387",
      comment: "#6c7086",
      type: "#f9e2af"
    },
    "catppuccin-latte": {
      bg: "#eff1f5",
      fg: "#4c4f69",
      keyword: "#8839ef",
      func: "#1e66f5",
      constant: "#179299",
      string: "#40a02b",
      number: "#fe640b",
      comment: "#9ca0b0",
      type: "#df8e1d"
    },
    "vscode-dark": {
      bg: "#1e1e1e",
      fg: "#d4d4d4",
      keyword: "#c586c0",
      func: "#dcdcaa",
      constant: "#9cdcfe",
      string: "#ce9178",
      number: "#b5cea8",
      comment: "#6a9955",
      type: "#4ec9b0"
    },
    "vscode-light": {
      bg: "#ffffff",
      fg: "#000000",
      keyword: "#0000ff",
      func: "#795e26",
      constant: "#001080",
      string: "#a31515",
      number: "#098658",
      comment: "#008000",
      type: "#267f99"
    },
    monokai: {
      bg: "#272822",
      fg: "#f8f8f2",
      keyword: "#f92672",
      func: "#a6e22e",
      constant: "#66d9ef",
      string: "#e6db74",
      number: "#ae81ff",
      comment: "#75715e",
      type: "#a6e22e"
    },
    "monokai-sublime": {
      bg: "#23241f",
      fg: "#f8f8f2",
      keyword: "#f92672",
      func: "#a6e22e",
      constant: "#66d9ef",
      string: "#e6db74",
      number: "#ae81ff",
      comment: "#75715e",
      type: "#a6e22e"
    },

    // Extra themes (so the options menu can offer 30+ choices).
    "night-owl": {
      bg: "#011627",
      fg: "#d6deeb",
      keyword: "#c792ea",
      func: "#82aaff",
      constant: "#7fdbca",
      string: "#ecc48d",
      number: "#f78c6c",
      comment: "#637777",
      type: "#addb67"
    },
    "palenight": {
      bg: "#292d3e",
      fg: "#a6accd",
      keyword: "#c792ea",
      func: "#82aaff",
      constant: "#89ddff",
      string: "#c3e88d",
      number: "#f78c6c",
      comment: "#676e95",
      type: "#ffcb6b"
    },
    "ayu-dark": {
      bg: "#0f1419",
      fg: "#e6e1cf",
      keyword: "#ff8f40",
      func: "#ffb454",
      constant: "#59c2ff",
      string: "#aad94c",
      number: "#ff8f40",
      comment: "#5c6773",
      type: "#73d0ff"
    },
    "ayu-mirage": {
      bg: "#1f2430",
      fg: "#cbccc6",
      keyword: "#ffad66",
      func: "#ffd173",
      constant: "#5ccfe6",
      string: "#d5ff80",
      number: "#ffad66",
      comment: "#707a8c",
      type: "#73d0ff"
    },
    "ayu-light": {
      bg: "#fafafa",
      fg: "#5c6166",
      keyword: "#fa8d3e",
      func: "#f2ae49",
      constant: "#399ee6",
      string: "#86b300",
      number: "#a37acc",
      comment: "#abb0b6",
      type: "#55b4d4"
    },
    "tomorrow-night": {
      bg: "#1d1f21",
      fg: "#c5c8c6",
      keyword: "#b294bb",
      func: "#81a2be",
      constant: "#de935f",
      string: "#b5bd68",
      number: "#de935f",
      comment: "#969896",
      type: "#8abeb7"
    },
    "tomorrow": {
      bg: "#ffffff",
      fg: "#4d4d4c",
      keyword: "#8959a8",
      func: "#4271ae",
      constant: "#f5871f",
      string: "#718c00",
      number: "#f5871f",
      comment: "#8e908c",
      type: "#3e999f"
    },
    "zenburn": {
      bg: "#3f3f3f",
      fg: "#dcdccc",
      keyword: "#f0dfaf",
      func: "#93e0e3",
      constant: "#8cd0d3",
      string: "#cc9393",
      number: "#8cd0d3",
      comment: "#7f9f7f",
      type: "#dfdfbf"
    },
    "xcode": {
      bg: "#ffffff",
      fg: "#000000",
      keyword: "#a90d91",
      func: "#0f68a0",
      constant: "#1c00cf",
      string: "#c41a16",
      number: "#1c00cf",
      comment: "#007400",
      type: "#0f68a0"
    },
    "darcula": {
      bg: "#2b2b2b",
      fg: "#a9b7c6",
      keyword: "#cc7832",
      func: "#ffc66d",
      constant: "#9876aa",
      string: "#6a8759",
      number: "#6897bb",
      comment: "#808080",
      type: "#a9b7c6"
    },
    "one-dark-pro": {
      bg: "#282c34",
      fg: "#abb2bf",
      keyword: "#c678dd",
      func: "#61afef",
      constant: "#56b6c2",
      string: "#98c379",
      number: "#d19a66",
      comment: "#5c6370",
      type: "#e5c07b"
    },
    "github-dark-high-contrast": {
      bg: "#010409",
      fg: "#ffffff",
      keyword: "#ff7b72",
      func: "#d2a8ff",
      constant: "#79c0ff",
      string: "#a5d6ff",
      number: "#79c0ff",
      comment: "#8b949e",
      type: "#ffa657"
    },
    "github-light-high-contrast": {
      bg: "#ffffff",
      fg: "#0a0a0a",
      keyword: "#b62324",
      func: "#6f42c1",
      constant: "#005cc5",
      string: "#0a3069",
      number: "#005cc5",
      comment: "#57606a",
      type: "#953800"
    },
    "tokyo-night-storm": {
      bg: "#24283b",
      fg: "#c0caf5",
      keyword: "#7aa2f7",
      func: "#bb9af7",
      constant: "#2ac3de",
      string: "#9ece6a",
      number: "#ff9e64",
      comment: "#565f89",
      type: "#2ac3de"
    },
    "tokyo-night-day": {
      bg: "#e1e2e7",
      fg: "#3760bf",
      keyword: "#2e7de9",
      func: "#9854f1",
      constant: "#006a83",
      string: "#587539",
      number: "#b15c00",
      comment: "#848cb5",
      type: "#8c6c3e"
    },
    "solarized-osaka": {
      bg: "#001a1d",
      fg: "#c9d1d9",
      keyword: "#2aa198",
      func: "#b58900",
      constant: "#268bd2",
      string: "#859900",
      number: "#d33682",
      comment: "#657b83",
      type: "#cb4b16"
    },
    "cobalt": {
      bg: "#002240",
      fg: "#ffffff",
      keyword: "#ff9d00",
      func: "#ffc600",
      constant: "#80ffbb",
      string: "#3ad900",
      number: "#ff628c",
      comment: "#0088ff",
      type: "#9effff"
    },
    "stackoverflow-dark": {
      bg: "#1c1b1b",
      fg: "#ffffff",
      keyword: "#c586c0",
      func: "#dcdcaa",
      constant: "#4ec9b0",
      string: "#ce9178",
      number: "#b5cea8",
      comment: "#6a9955",
      type: "#9cdcfe"
    },
    "stackoverflow-light": {
      bg: "#ffffff",
      fg: "#2f3337",
      keyword: "#7b2c83",
      func: "#005cc5",
      constant: "#267f99",
      string: "#a31515",
      number: "#098658",
      comment: "#6a737d",
      type: "#267f99"
    },
    "gruvbox-material-dark": {
      bg: "#1d2021",
      fg: "#d4be98",
      keyword: "#ea6962",
      func: "#a9b665",
      constant: "#7daea3",
      string: "#a9b665",
      number: "#d3869b",
      comment: "#928374",
      type: "#e78a4e"
    },
    "gruvbox-material-light": {
      bg: "#fbf1c7",
      fg: "#654735",
      keyword: "#c14a4a",
      func: "#6c782e",
      constant: "#45707a",
      string: "#6c782e",
      number: "#945e80",
      comment: "#928374",
      type: "#b47109"
    }
  };
})();
