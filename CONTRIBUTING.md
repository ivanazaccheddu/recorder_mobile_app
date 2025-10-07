# Contributing to Audio Recorder App

Thank you for your interest in contributing to the Audio Recorder App! This document provides guidelines and instructions for contributing to the project.

## Code of Conduct

By participating in this project, you agree to maintain a respectful and inclusive environment for all contributors.

## How to Contribute

### Reporting Bugs

If you find a bug, please create an issue with the following information:

1. **Description**: Clear description of the bug
2. **Steps to Reproduce**: Detailed steps to reproduce the issue
3. **Expected Behavior**: What should happen
4. **Actual Behavior**: What actually happens
5. **Environment**: Device, OS version, app version
6. **Screenshots**: If applicable

### Suggesting Enhancements

Enhancement suggestions are welcome! Please create an issue with:

1. **Description**: Clear description of the enhancement
2. **Use Case**: Why this enhancement would be useful
3. **Proposed Solution**: How you think it should work
4. **Alternatives**: Any alternative solutions considered

### Pull Requests

1. **Fork the Repository**
   ```bash
   git clone https://github.com/ivanazaccheddu/recorder_mobile_app.git
   cd recorder_mobile_app
   ```

2. **Create a Branch**
   ```bash
   git checkout -b feature/your-feature-name
   # or
   git checkout -b fix/your-bug-fix
   ```

3. **Make Your Changes**
   - Follow the existing code style
   - Add tests if applicable
   - Update documentation as needed

4. **Test Your Changes**
   ```bash
   npm run type-check
   npm run lint
   npm test
   ```

5. **Commit Your Changes**
   ```bash
   git add .
   git commit -m "feat: add amazing feature"
   ```

   Use conventional commit messages:
   - `feat:` for new features
   - `fix:` for bug fixes
   - `docs:` for documentation changes
   - `style:` for formatting changes
   - `refactor:` for code refactoring
   - `test:` for adding tests
   - `chore:` for maintenance tasks

6. **Push to Your Fork**
   ```bash
   git push origin feature/your-feature-name
   ```

7. **Create a Pull Request**
   - Go to the original repository
   - Click "New Pull Request"
   - Select your branch
   - Fill in the PR template
   - Submit for review

## Development Guidelines

### Code Style

- Use TypeScript for type safety
- Follow existing naming conventions
- Use meaningful variable and function names
- Add comments for complex logic
- Keep functions small and focused

### Component Structure

- Use functional components with hooks
- Separate business logic from UI components
- Keep components in appropriate directories
- Export components from index files

### State Management

- Use Context API for global state
- Use local state for component-specific state
- Keep state as minimal as possible

### File Organization

```
src/
├── components/     # Reusable UI components
├── screens/        # Screen components
├── services/       # Business logic services
├── storage/        # Data persistence
├── hooks/          # Custom React hooks
├── navigation/     # Navigation configuration
├── context/        # React Context providers
├── types/          # TypeScript type definitions
├── utils/          # Helper functions
└── constants/      # App constants
```

### Testing

- Write unit tests for utilities and services
- Write integration tests for complex features
- Test on both iOS and Android
- Test offline functionality

### Documentation

- Update README.md for major changes
- Add JSDoc comments for complex functions
- Update CHANGELOG.md
- Include inline comments for complex logic

## Development Setup

### Prerequisites

- Node.js 18+
- npm or yarn
- Expo CLI
- iOS Simulator (macOS) or Android Emulator

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm start

# Run on iOS
npm run ios

# Run on Android
npm run android
```

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with coverage
npm test -- --coverage
```

### Code Quality

```bash
# Type check
npm run type-check

# Lint code
npm run lint

# Format code (if configured)
npm run format
```

## Project Structure

### Core Services

- **audioRecorder.ts**: Handles audio recording functionality
- **audioPlayer.ts**: Manages audio playback
- **database.ts**: SQLite database operations
- **fileManager.ts**: File system operations

### Key Components

- **RecordScreen**: Main recording interface
- **RecordingsListScreen**: List and manage recordings
- **PlaybackScreen**: Audio playback interface
- **SettingsScreen**: App configuration

### State Management

- **RecordingsContext**: Global recordings state
- **useAudioRecorder**: Recording hook
- **useAudioPlayer**: Playback hook

## Need Help?

- Check existing issues and PRs
- Ask questions in discussions
- Reach out to maintainers

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing to Audio Recorder App! 🎙️
