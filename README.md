# PDF Web Tools

A modern, full-featured web application for manipulating PDF files directly in your browser. Built with React, TypeScript, and pdf-lib.

## Features

### Organize PDFs
- **Merge PDF** - Combine multiple PDF files into one document
- **Split PDF** - Split PDF into separate pages
- **Extract Pages** - Extract specific pages from a PDF
- **Delete Pages** - Remove unwanted pages from a PDF
- **Rotate PDF** - Rotate PDF pages in any direction (90°, 180°, 270°)

### Edit PDFs
- **Add Watermark** - Add text watermarks to your PDF documents
- **Page Numbers** - Add page numbers to PDF pages
- **Sign PDF** - Add digital signatures to PDF documents
- **Edit Metadata** - Modify PDF document properties and metadata

### Optimize & Convert
- **Compress PDF** - Reduce PDF file size while maintaining quality
- **Image to PDF** - Convert images (JPG, PNG, etc.) to PDF documents

### Security
- **Protect PDF** - Add password protection to secure your PDF files

## Tech Stack

- **Frontend Framework**: React 18.2
- **Language**: TypeScript 5.7
- **Build Tool**: Vite 6.3
- **Styling**: Tailwind CSS 4.1
- **PDF Library**: pdf-lib
- **UI Components**: 
  - Framer Motion (animations)
  - Lucide React (icons)
  - @dnd-kit (drag and drop)
- **State Management**: React Hooks
- **Routing**: React Router DOM

## Getting Started

### Prerequisites

- Node.js (v16 or higher recommended)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd pdf-web
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Build production-ready bundle |
| `npm run typecheck` | Run TypeScript type checking |

## Project Structure

```
pdf-web/
├── src/
│   ├── components/      # Reusable UI components
│   │   ├── Layout.tsx   # Main app layout with sidebar
│   │   └── HomePage.tsx # Landing page with tool grid
│   ├── tools/           # PDF tool implementations
│   │   ├── MergePDF.tsx
│   │   ├── SplitPDF.tsx
│   │   ├── CompressPDF.tsx
│   │   ├── ImageToPDF.tsx
│   │   ├── RotatePDF.tsx
│   │   ├── WatermarkPDF.tsx
│   │   ├── PageNumbers.tsx
│   │   ├── ProtectPDF.tsx
│   │   ├── ExtractPages.tsx
│   │   ├── SignPDF.tsx
│   │   ├── MetadataPDF.tsx
│   │   └── DeletePages.tsx
│   ├── App.tsx          # Main application component
│   ├── main.tsx         # Entry point
│   └── index.css        # Global styles
├── index.html
├── package.json
├── tsconfig.json
└── vite.config.js
```

## Usage

All PDF operations are performed client-side in your browser. Your files never leave your device, ensuring complete privacy and security.

1. Select a tool from the homepage or sidebar
2. Upload your PDF file(s) or images
3. Configure the tool options as needed
4. Process the file(s)
5. Download the result

## Browser Support

Modern browsers with ES2020+ support:
- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.