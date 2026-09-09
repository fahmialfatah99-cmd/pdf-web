import { useState } from 'react';
import Layout from './components/Layout';
import HomePage from './components/HomePage';
import MergePDF from './tools/MergePDF';
import SplitPDF from './tools/SplitPDF';
import CompressPDF from './tools/CompressPDF';
import ImageToPDF from './tools/ImageToPDF';
import RotatePDF from './tools/RotatePDF';
import WatermarkPDF from './tools/WatermarkPDF';
import PageNumbers from './tools/PageNumbers';
import ProtectPDF from './tools/ProtectPDF';
import ExtractPages from './tools/ExtractPages';
import SignPDF from './tools/SignPDF';
import MetadataPDF from './tools/MetadataPDF';
import DeletePages from './tools/DeletePages';

export type ToolId = 
  | 'home' 
  | 'merge' 
  | 'split' 
  | 'compress' 
  | 'image-to-pdf' 
  | 'rotate' 
  | 'watermark' 
  | 'page-numbers' 
  | 'protect' 
  | 'extract' 
  | 'sign' 
  | 'metadata'
  | 'delete';

export interface ToolInfo {
  id: ToolId;
  name: string;
  description: string;
  icon: string;
  color: string;
  category: string;
}

export const tools: ToolInfo[] = [
  { id: 'merge', name: 'Merge PDF', description: 'Combine multiple PDFs into one', icon: '📑', color: 'from-blue-500 to-indigo-600', category: 'Organize' },
  { id: 'split', name: 'Split PDF', description: 'Split PDF into separate pages', icon: '✂️', color: 'from-purple-500 to-pink-600', category: 'Organize' },
  { id: 'extract', name: 'Extract Pages', description: 'Extract specific pages from PDF', icon: '📄', color: 'from-cyan-500 to-blue-600', category: 'Organize' },
  { id: 'delete', name: 'Delete Pages', description: 'Remove unwanted pages from PDF', icon: '🗑️', color: 'from-red-500 to-rose-600', category: 'Organize' },
  { id: 'rotate', name: 'Rotate PDF', description: 'Rotate PDF pages in any direction', icon: '🔄', color: 'from-green-500 to-emerald-600', category: 'Organize' },
  { id: 'compress', name: 'Compress PDF', description: 'Reduce PDF file size', icon: '📦', color: 'from-orange-500 to-amber-600', category: 'Optimize' },
  { id: 'image-to-pdf', name: 'Image to PDF', description: 'Convert images to PDF document', icon: '🖼️', color: 'from-pink-500 to-rose-600', category: 'Convert' },
  { id: 'watermark', name: 'Add Watermark', description: 'Add text watermark to PDF', icon: '💧', color: 'from-teal-500 to-cyan-600', category: 'Edit' },
  { id: 'page-numbers', name: 'Page Numbers', description: 'Add page numbers to PDF', icon: '🔢', color: 'from-indigo-500 to-violet-600', category: 'Edit' },
  { id: 'sign', name: 'Sign PDF', description: 'Add signature to PDF document', icon: '✍️', color: 'from-yellow-500 to-orange-600', category: 'Edit' },
  { id: 'protect', name: 'Protect PDF', description: 'Add password protection to PDF', icon: '🔒', color: 'from-slate-500 to-gray-600', category: 'Security' },
  { id: 'metadata', name: 'Edit Metadata', description: 'Edit PDF document properties', icon: '📝', color: 'from-violet-500 to-purple-600', category: 'Edit' },
];

function App() {
  const [currentTool, setCurrentTool] = useState<ToolId>('home');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const renderTool = () => {
    switch (currentTool) {
      case 'home': return <HomePage onSelectTool={setCurrentTool} />;
      case 'merge': return <MergePDF />;
      case 'split': return <SplitPDF />;
      case 'compress': return <CompressPDF />;
      case 'image-to-pdf': return <ImageToPDF />;
      case 'rotate': return <RotatePDF />;
      case 'watermark': return <WatermarkPDF />;
      case 'page-numbers': return <PageNumbers />;
      case 'protect': return <ProtectPDF />;
      case 'extract': return <ExtractPages />;
      case 'sign': return <SignPDF />;
      case 'metadata': return <MetadataPDF />;
      case 'delete': return <DeletePages />;
      default: return <HomePage onSelectTool={setCurrentTool} />;
    }
  };

  return (
    <Layout
      currentTool={currentTool}
      onToolChange={setCurrentTool}
      sidebarOpen={sidebarOpen}
      onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
    >
      {renderTool()}
    </Layout>
  );
}

export default App;
