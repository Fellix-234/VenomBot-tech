# Contributing to VenomBot Tech

We love contributions! Whether it's bug reports, feature requests, or code improvements, your help is appreciated.

## How to Contribute

### 1. Fork the Repository
Click the "Fork" button on GitHub to create your own copy.

### 2. Clone Your Fork
```bash
git clone https://github.com/YOUR-USERNAME/VenomBot-Tech.git
cd VenomBot-Tech
```

### 3. Create a Feature Branch
```bash
git checkout -b feature/your-feature-name
# or for bug fixes:
git checkout -b fix/your-bug-fix
```

### 4. Make Your Changes
- Keep code clean and readable
- Follow the existing code style
- Add comments for complex logic
- Test your changes locally

### 5. Commit with Clear Messages
```bash
git commit -m "feat: add new command for X functionality"
git commit -m "fix: resolve issue with Y feature"
```

### 6. Push and Create a Pull Request
```bash
git push origin feature/your-feature-name
```
Then create a Pull Request on GitHub with:
- Clear title describing the change
- Description of what was changed and why
- Reference to any related issues

## Code Style Guidelines

### JavaScript
- Use ES6+ syntax (const, let, arrow functions)
- Use meaningful variable names
- Add JSDoc comments for functions
- 2-space indentation

### Commands
When adding new commands, follow this structure:

```javascript
export default {
  name: 'commandname',
  aliases: ['alias1', 'alias2'],
  category: 'general', // general, group, media, fun, utility, owner
  description: 'What this command does',
  usage: '!commandname [options]',
  ownerOnly: false,
  groupOnly: false,
  
  execute: async ({ sock, fromJid, msg, args, source, sender, user }) => {
    // Your command logic here
  }
};
```

## Reporting Issues

When reporting a bug, include:
1. Your Node.js version (`node --version`)
2. Steps to reproduce the issue
3. Expected behavior vs actual behavior
4. Error messages or logs
5. Your OS (Windows, Linux, macOS)

## Adding New Features

Good candidates for contributions:
- New commands (games, utilities, media tools)
- Database improvements
- Error handling enhancements
- Documentation improvements
- Performance optimizations
- Testing and CI/CD setup

## Commit Message Format

Use conventional commits:
- `feat:` for new features
- `fix:` for bug fixes
- `docs:` for documentation
- `style:` for formatting
- `refactor:` for code reorganization
- `test:` for adding tests
- `chore:` for maintenance

Example:
```
feat: add weather command with location support

- Integrates OpenWeatherMap API
- Provides 5-day forecast
- Shows temperature, humidity, wind speed
```

## Pull Request Process

1. Update README.md if needed
2. Ensure no console errors
3. Test all existing commands
4. Include a clear description
5. Reference related issues with #number
6. Wait for review and feedback

## Questions?

Feel free to open an issue for questions or discussions!

---

Thank you for contributing to VenomBot Tech! 🎉
