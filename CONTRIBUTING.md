# Contributing to Alerta Segura

Thank you for your interest in contributing! This document provides guidelines and instructions for contributing.

## 🚀 How to Contribute

### 1. Fork & Clone
```bash
# Fork the repository on GitHub
# Clone your fork
git clone https://github.com/YOUR_USERNAME/security-alert.git
cd security-alert/alerta-segura
```

### 2. Create a Branch
```bash
# Create a new branch for your feature/fix
git checkout -b feature/your-feature-name
# or for bug fixes:
git checkout -b fix/bug-description
```

**Branch naming conventions:**
- `feature/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation
- `test/` - Tests
- `refactor/` - Code refactoring

### 3. Make Changes

#### Backend Changes
```bash
cd backend
source venv/bin/activate  # or venv\Scripts\activate on Windows
pip install -r requirements.txt
# Make your changes
# Test locally: uvicorn server:app --reload
```

#### Frontend Changes
```bash
cd frontend
npm install
# Make your changes
# Test locally: npx expo start
```

### 4. Commit with Clear Messages
```bash
# Use descriptive commit messages
git commit -m "feat: Add phishing detection algorithm"
git commit -m "fix: Resolve URL analysis timeout issue"
git commit -m "docs: Update API documentation"
```

**Commit format:**
```
<type>: <subject>

<body (optional)>
```

**Types:**
- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation
- `test:` Tests
- `refactor:` Code refactoring
- `perf:` Performance improvement
- `style:` Code style changes

### 5. Push & Create Pull Request
```bash
# Push your branch
git push origin feature/your-feature-name

# Create a Pull Request on GitHub
# Fill out the PR template with:
# - Description of changes
# - Related issues
# - Testing notes
```

---

## 📋 Code Standards

### Python (Backend)
- Follow [PEP 8](https://www.python.org/dev/peps/pep-0008/)
- Use type hints
- Write docstrings for functions
- Max line length: 100 characters

```python
def analyze_message(message: str) -> dict[str, Any]:
    """Analyze message for security threats.
    
    Args:
        message: The message text to analyze
        
    Returns:
        Dictionary with threat classification and details
    """
    pass
```

### TypeScript (Frontend)
- Use TypeScript strict mode
- Add type annotations
- Follow [ESLint config](./frontend/.eslintrc.json)
- Max line length: 100 characters

```typescript
interface AnalysisResult {
  risk_level: 'safe' | 'suspicious' | 'dangerous';
  confidence: number;
  details: string;
}

async function analyzeMessage(message: string): Promise<AnalysisResult> {
  // Implementation
}
```

---

## 🧪 Testing

### Before submitting a PR:

**Backend:**
```bash
cd backend
source venv/bin/activate
# Run tests (when available)
pytest
# Check code style
flake8 .
```

**Frontend:**
```bash
cd frontend
# Run tests (when available)
npm test
# Check TypeScript
npx tsc --noEmit
```

---

## 📝 Documentation

- Update `README.md` if you add features
- Update `README-PORTFOLIO.md` for architecture changes
- Add docstrings/comments for complex logic
- Update API docs if endpoints change

---

## 🐛 Reporting Bugs

When opening an issue, include:
- Clear title
- Description of the bug
- Steps to reproduce
- Expected vs actual behavior
- Environment (OS, versions)

**Example:**
```markdown
## Bug: Message analyzer crashes with emojis

**Steps to reproduce:**
1. Open analyze-message screen
2. Enter text with emojis: "Hey 👋 check this"
3. Click analyze

**Expected:** Should analyze message normally
**Actual:** App crashes with error

**Environment:** Android 12, Expo 52.0.0
```

---

## 🎯 Feature Requests

Include:
- Clear title
- Use case/motivation
- Proposed solution (optional)
- Alternatives considered

---

## ✅ Review Process

1. Maintainer reviews your PR
2. Request changes or approve
3. Address feedback
4. Merge when approved

---

## 💡 Tips for Success

✅ Start with small contributions  
✅ Communicate before big changes  
✅ Test your code thoroughly  
✅ Keep commits clean and focused  
✅ Be respectful and patient  

---

## 📞 Questions?

- Open a discussion on GitHub
- Check existing issues/PRs first
- Read README-PORTFOLIO.md for architecture

---

## 🙏 Thank You!

Your contributions help make Alerta Segura better for everyone. We appreciate your effort!

---

**Happy coding!** 🛡️
