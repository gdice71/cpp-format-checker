# C++ Format Checker Web App

A beautiful, modern web application for checking C++ code formatting against ME 101 style guidelines. Built with Next.js, TypeScript, and Tailwind CSS.

## 🚀 Features

- **Real-time Code Analysis**: Paste your C++ code and get instant feedback
- **Comprehensive Checks**: Validates against all ME 101 formatting rules
- **Beautiful UI**: Modern, animated interface with dark theme
- **Detailed Reports**: Clear warnings and suggestions with line numbers
- **Zero Installation**: Just deploy and use in your browser

## 📋 What It Checks

- ✅ Line length (80 character limit)
- ✅ Variable naming conventions
- ✅ Magic numbers (suggests named constants)
- ✅ Constant naming (ALL_CAPS)
- ✅ Variable initialization
- ✅ Expression spacing
- ✅ Code structure (conditions on separate lines)
- ✅ Brace placement
- ✅ Indentation (spaces vs tabs)
- ✅ File stream error checking

## 🛠️ Tech Stack

- **Next.js 14** - React framework with App Router
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Custom Animations** - Smooth, polished UI

## 🚀 Deploy to Vercel

### One-Click Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/YOUR_USERNAME/cpp-format-checker-web)

### Manual Deploy

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Run locally:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000)

3. **Deploy to Vercel:**
   ```bash
   # Install Vercel CLI
   npm i -g vercel

   # Deploy
   vercel
   ```

   Or push to GitHub and import in Vercel dashboard.

## 📁 Project Structure

```
cpp-format-checker-web/
├── app/
│   ├── page.tsx          # Main application component
│   ├── layout.tsx        # Root layout
│   └── globals.css       # Global styles
├── public/               # Static assets
├── package.json          # Dependencies
├── tsconfig.json         # TypeScript config
├── tailwind.config.js    # Tailwind config
└── next.config.js        # Next.js config
```

## 🎨 Design Features

- **Gradient Backgrounds**: Animated cyan/pink gradients
- **Custom Typography**: JetBrains Mono + Syne fonts
- **Smooth Animations**: Staggered reveals and transitions
- **Dark Theme**: Code editor aesthetic
- **Responsive Design**: Works on all screen sizes

## 🔧 Local Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## 📝 Environment Variables

No environment variables needed! This is a client-side only application.

## 🌐 Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)

## 📄 License

MIT

## 🤝 Contributing

Feel free to open issues or submit PRs!

---

Made with ❤️ for ME 101 students
