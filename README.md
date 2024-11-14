# Open Invaders

A modern, open-source implementation of the classic Space Invaders game built with Next.js, TypeScript, and Tailwind CSS. Play it now at [openinvaders.vercel.app](https://openinvaders.vercel.app/)!

![Open Invaders Screenshot](public/screenshot.png)

## Features

- 🎮 Classic Space Invaders gameplay with modern controls
- 🎨 Retro pixel art styling with modern UI
- 🔊 8-bit style sound effects
- 📱 Responsive design with touch controls for mobile
- ⌨️ Keyboard and mouse support
- 🏆 High score tracking
- 🌊 Progressive wave system
- 🛡️ Destructible barriers
- 🎯 Collision detection system
- 🔄 Animation system

## Technology Stack

- [Next.js 14](https://nextjs.org/) - React Framework
- [TypeScript](https://www.typescriptlang.org/) - Type Safety
- [Tailwind CSS](https://tailwindcss.com/) - Styling
- [Shadcn/ui](https://ui.shadcn.com/) - UI Components
- [Framer Motion](https://www.framer.com/motion/) - Animations
- HTML5 Canvas - Game Rendering

## Getting Started

### Prerequisites

- Node.js 18.17 or later
- npm or yarn package manager

### Installation

1. Clone the repository:

```bash
git clone https://github.com/brown2020/openinvaders.git
cd openinvaders
```

2. Install dependencies:

```bash
npm install
# or
yarn install
```

3. Run the development server:

```bash
npm run dev
# or
yarn dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser to play!

## Game Controls

### Desktop

- Arrow Keys / WASD: Move left/right
- Space: Shoot
- P: Pause/Resume
- R: Restart game
- M: Mute/Unmute sound

### Mobile

- Touch buttons for movement and shooting
- On-screen controls for pause, sound, and help

## Project Structure

```
openinvaders/
├── src/
│   ├── app/                   # Next.js app directory
│   ├── components/            # React components
│   │   ├── game/             # Game-specific components
│   │   └── ui/               # UI components
│   ├── lib/                  # Game logic and utilities
│   │   ├── entities/         # Game entity classes
│   │   ├── sound/           # Sound management
│   │   └── constants/       # Game constants
│   └── types/               # TypeScript type definitions
├── public/                  # Static assets
└── tailwind.config.js      # Tailwind configuration
```

## Game Features

### Entities

- Player ship with movement and shooting
- Multiple types of aliens with different point values
- Destructible barriers for cover
- Projectile system with collision detection

### Game Mechanics

- Progressive difficulty increase
- Score tracking and high score system
- Lives system
- Wave progression
- Sound effects
- Particle effects

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/AmazingFeature`
3. Commit your changes: `git commit -m 'Add some AmazingFeature'`
4. Push to the branch: `git push origin feature/AmazingFeature`
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Contact

Have questions or suggestions? Contact us at [info@ignitechannel.com](mailto:info@ignitechannel.com)

## Acknowledgments

- Original Space Invaders game by Tomohiro Nishikado
- Inspired by the classic arcade game
- Built with modern web technologies
- Special thanks to the open-source community

## Deployment

The game is deployed on Vercel at [openinvaders.vercel.app](https://openinvaders.vercel.app/). The deployment process is automated through GitHub integration with Vercel.

To deploy your own instance:

1. Fork this repository
2. Create a new project on Vercel
3. Connect your fork to Vercel
4. Deploy!

## Support

If you found this project helpful or fun, please consider:

- Starring the [GitHub repository](https://github.com/brown2020/openinvaders)
- Sharing it with friends
- Contributing to the project
- Reporting any issues you find
