export const assetsManifest = {
  bundles: [
    {
      name: 'game',
      assets: {
        numbers: 'game/numbers.png',
        font: 'game/font.png',
        font2: 'game/og-font.png',
        [`8px_numbers`]: 'game/8px-numbers.png',
        [`gamer_numbers`]: 'game/gamer-numbers.png',
        background: 'game/background.png',
        player_pepper: 'game/player-pepper.png',
        'flump/atlas': 'game/game/atlas0.png',
        'flump/json': 'game/game/library.json',
      },
    },
    {
      name: 'splash',
      assets: {
        'splash/background': 'game/splash/background.png',
        'splash/start': 'game/splash/start.png',
        'splash/logo': 'game/splash/logo.png',
      },
    },
  ],
};
