/**
 * Secret Sauce - Recipe Labs
 * AI-Powered UI Component Generator using Gemini
 * Your secret ingredient for stunning UI designs
 */

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { UserProfile } from '../types.ts';
import {
  Send, Sparkles, Code, Grid3X3, ArrowLeft, ArrowRight,
  ArrowUp, Loader2, X, Wand2, Palette, Layers, Download, Image, FileCode, Copy, Check
} from 'lucide-react';

// Types
interface FlashArtifact {
  id: string;
  styleName: string;
  html: string;
  status: 'streaming' | 'complete' | 'error';
}

interface FlashSession {
  id: string;
  prompt: string;
  timestamp: number;
  artifacts: FlashArtifact[];
}

interface ComponentVariation {
  name: string;
  html: string;
}

interface FlashUIModuleProps {
  user: UserProfile;
}

// Recipe Labs Brand Colors
const BRAND = {
  gold: '#F5D547',
  goldLight: '#F7E07A',
  goldDark: '#D4B83A',
  forest: '#4A7C4E',
  bgPrimary: '#0a0a0a',
  bgSecondary: '#111111',
  border: 'rgba(255,255,255,0.1)',
};

// Recipe Labs flavored placeholders
const INITIAL_PLACEHOLDERS = [
  "Design a premium pricing card",
  "Create a client testimonial slider",
  "Build a lead capture form",
  "Design an agency services grid",
  "Create a campaign metrics dashboard",
  "Build a sleek contact section",
  "Design a portfolio showcase",
];

// Helpers
const generateId = () => Date.now().toString(36) + Math.random().toString(36).substring(2);

const FlashUIModule: React.FC<FlashUIModuleProps> = ({ user }) => {
  const [sessions, setSessions] = useState<FlashSession[]>([]);
  const [currentSessionIndex, setCurrentSessionIndex] = useState<number>(-1);
  const [focusedArtifactIndex, setFocusedArtifactIndex] = useState<number | null>(null);

  const [inputValue, setInputValue] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [copied, setCopied] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const [drawerState, setDrawerState] = useState<{
    isOpen: boolean;
    mode: 'code' | 'variations' | 'download' | null;
    title: string;
    data: any;
  }>({ isOpen: false, mode: null, title: '', data: null });

  const [componentVariations, setComponentVariations] = useState<ComponentVariation[]>([]);

  const inputRef = useRef<HTMLInputElement>(null);
  const gridScrollRef = useRef<HTMLDivElement>(null);
  const previewIframeRef = useRef<HTMLIFrameElement>(null);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Cycle placeholders
  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholderIndex(prev => (prev + 1) % INITIAL_PLACEHOLDERS.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Download code as HTML file
  const handleDownloadCode = useCallback((html: string, filename: string) => {
    const fullHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${filename} - Recipe Labs Secret Sauce</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; }
  </style>
</head>
<body>
${html}
</body>
</html>`;

    const blob = new Blob([fullHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename.replace(/[^a-z0-9]/gi, '-').toLowerCase()}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, []);

  // Download preview as PNG image
  const handleDownloadPreview = useCallback(async (html: string, filename: string) => {
    setIsDownloading(true);
    try {
      // Create a temporary iframe to render the HTML
      const iframe = document.createElement('iframe');
      iframe.style.position = 'fixed';
      iframe.style.left = '-9999px';
      iframe.style.width = '800px';
      iframe.style.height = '600px';
      iframe.style.border = 'none';
      document.body.appendChild(iframe);

      // Write the HTML content
      const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
      if (!iframeDoc) throw new Error('Could not access iframe document');

      iframeDoc.open();
      iframeDoc.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: 'Inter', -apple-system, sans-serif; background: #0a0a0a; min-height: 100vh; display: flex; align-items: center; justify-content: center; }
          </style>
        </head>
        <body>${html}</body>
        </html>
      `);
      iframeDoc.close();

      // Wait for content to render
      await new Promise(resolve => setTimeout(resolve, 500));

      // Use html2canvas if available, otherwise use native canvas approach
      try {
        // Try to capture using canvas
        const canvas = document.createElement('canvas');
        canvas.width = 800;
        canvas.height = 600;
        const ctx = canvas.getContext('2d');

        if (ctx) {
          // Draw background
          ctx.fillStyle = '#0a0a0a';
          ctx.fillRect(0, 0, 800, 600);

          // Create SVG from HTML
          const svgData = `
            <svg xmlns="http://www.w3.org/2000/svg" width="800" height="600">
              <foreignObject width="100%" height="100%">
                <div xmlns="http://www.w3.org/1999/xhtml" style="font-family: Inter, sans-serif; background: #0a0a0a; width: 800px; height: 600px; display: flex; align-items: center; justify-content: center;">
                  ${html}
                </div>
              </foreignObject>
            </svg>
          `;

          const img = new window.Image();
          const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
          const svgUrl = URL.createObjectURL(svgBlob);

          await new Promise<void>((resolve, reject) => {
            img.onload = () => {
              ctx.drawImage(img, 0, 0);
              URL.revokeObjectURL(svgUrl);
              resolve();
            };
            img.onerror = () => {
              URL.revokeObjectURL(svgUrl);
              reject(new Error('Failed to load SVG'));
            };
            img.src = svgUrl;
          });

          // Download the canvas as PNG
          canvas.toBlob((blob) => {
            if (blob) {
              const url = URL.createObjectURL(blob);
              const link = document.createElement('a');
              link.href = url;
              link.download = `${filename.replace(/[^a-z0-9]/gi, '-').toLowerCase()}-preview.png`;
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
              URL.revokeObjectURL(url);
            }
          }, 'image/png');
        }
      } catch (canvasError) {
        console.log('Canvas capture failed, falling back to HTML download');
        // Fallback: Download as HTML with screenshot instructions
        handleDownloadCode(html, filename + '-preview');
      }

      document.body.removeChild(iframe);
    } catch (error) {
      console.error('Preview download error:', error);
      // Fallback to downloading HTML
      handleDownloadCode(html, filename);
    } finally {
      setIsDownloading(false);
    }
  }, [handleDownloadCode]);

  // Copy code to clipboard
  const handleCopyCode = useCallback(async (html: string) => {
    try {
      await navigator.clipboard.writeText(html);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  }, []);

  // Show download options
  const handleShowDownload = useCallback(() => {
    const currentSession = sessions[currentSessionIndex];
    if (currentSession && focusedArtifactIndex !== null) {
      const artifact = currentSession.artifacts[focusedArtifactIndex];
      setDrawerState({
        isOpen: true,
        mode: 'download',
        title: 'Download Options',
        data: { html: artifact.html, name: artifact.styleName, prompt: currentSession.prompt }
      });
    }
  }, [sessions, currentSessionIndex, focusedArtifactIndex]);

  // Generate variations
  const handleGenerateVariations = useCallback(async () => {
    const currentSession = sessions[currentSessionIndex];
    if (!currentSession || focusedArtifactIndex === null) return;
    const currentArtifact = currentSession.artifacts[focusedArtifactIndex];

    setIsLoading(true);
    setComponentVariations([]);
    setDrawerState({ isOpen: true, mode: 'variations', title: 'Variations', data: currentArtifact.id });

    try {
      const response = await fetch('/api/v1/agent/flash-variations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: currentSession.prompt,
          currentHtml: currentArtifact.html,
        })
      });

      if (!response.ok) throw new Error('Failed to generate variations');

      const data = await response.json();
      if (data.variations) {
        setComponentVariations(data.variations);
      }
    } catch (e: any) {
      console.error("Error generating variations:", e);
      setComponentVariations([{ name: 'Current Design', html: currentArtifact.html }]);
    } finally {
      setIsLoading(false);
    }
  }, [sessions, currentSessionIndex, focusedArtifactIndex]);

  const applyVariation = (html: string) => {
    if (focusedArtifactIndex === null) return;
    setSessions(prev => prev.map((sess, i) =>
      i === currentSessionIndex ? {
        ...sess,
        artifacts: sess.artifacts.map((art, j) =>
          j === focusedArtifactIndex ? { ...art, html, status: 'complete' } : art
        )
      } : sess
    ));
    setDrawerState(s => ({ ...s, isOpen: false }));
  };

  const handleShowCode = () => {
    const currentSession = sessions[currentSessionIndex];
    if (currentSession && focusedArtifactIndex !== null) {
      const artifact = currentSession.artifacts[focusedArtifactIndex];
      setDrawerState({ isOpen: true, mode: 'code', title: 'Source Code', data: artifact.html });
    }
  };

  // Main generation function
  const handleSendMessage = useCallback(async (manualPrompt?: string) => {
    const promptToUse = manualPrompt || inputValue;
    const trimmedInput = promptToUse.trim();

    if (!trimmedInput || isLoading) return;
    if (!manualPrompt) setInputValue('');

    setIsLoading(true);
    const baseTime = Date.now();
    const sessionId = generateId();

    const placeholderArtifacts: FlashArtifact[] = Array(3).fill(null).map((_, i) => ({
      id: `${sessionId}_${i}`,
      styleName: 'Designing...',
      html: '',
      status: 'streaming',
    }));

    const newSession: FlashSession = {
      id: sessionId,
      prompt: trimmedInput,
      timestamp: baseTime,
      artifacts: placeholderArtifacts
    };

    setSessions(prev => [...prev, newSession]);
    setCurrentSessionIndex(sessions.length);
    setFocusedArtifactIndex(null);

    try {
      const response = await fetch('/api/v1/agent/flash-generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: trimmedInput,
          user: user.name,
          styles: 3,
        })
      });

      if (!response.ok) throw new Error('Generation failed');

      const data = await response.json();

      if (data.styles && Array.isArray(data.styles)) {
        setSessions(prev => prev.map(s => {
          if (s.id !== sessionId) return s;
          return {
            ...s,
            artifacts: s.artifacts.map((art, i) => ({
              ...art,
              styleName: data.styles[i]?.name || `Style ${i + 1}`,
              html: data.styles[i]?.html || '',
              status: data.styles[i]?.html ? 'complete' : 'error'
            }))
          };
        }));
      }
    } catch (e) {
      console.error("Secret Sauce Error:", e);
      const fallbackStyles = [
        { name: 'Minimal Gold', html: generateFallbackHTML(trimmedInput, 'minimal') },
        { name: 'Bold Forest', html: generateFallbackHTML(trimmedInput, 'bold') },
        { name: 'Glass Premium', html: generateFallbackHTML(trimmedInput, 'glass') },
      ];

      setSessions(prev => prev.map(s => {
        if (s.id !== sessionId) return s;
        return {
          ...s,
          artifacts: s.artifacts.map((art, i) => ({
            ...art,
            styleName: fallbackStyles[i]?.name || `Style ${i + 1}`,
            html: fallbackStyles[i]?.html || '',
            status: 'complete'
          }))
        };
      }));
    } finally {
      setIsLoading(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [inputValue, isLoading, sessions.length, user.name]);

  // Fallback HTML generator
  const generateFallbackHTML = (prompt: string, style: string) => {
    const styles: Record<string, string> = {
      minimal: `
        <div style="font-family: 'Inter', sans-serif; padding: 40px; background: linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%); min-height: 300px; display: flex; align-items: center; justify-content: center;">
          <div style="text-align: center; max-width: 400px;">
            <div style="width: 60px; height: 60px; background: #F5D547; border-radius: 12px; margin: 0 auto 24px; display: flex; align-items: center; justify-content: center;">
              <span style="font-size: 24px;">&#10024;</span>
            </div>
            <h2 style="color: white; font-size: 24px; margin: 0 0 12px; font-weight: 600;">${prompt}</h2>
            <p style="color: #888; font-size: 14px; margin: 0 0 24px;">Recipe Labs UI Component</p>
            <button style="background: #F5D547; color: black; border: none; padding: 12px 32px; border-radius: 8px; font-weight: 600; cursor: pointer;">Get Started</button>
          </div>
        </div>
      `,
      bold: `
        <div style="font-family: 'Inter', sans-serif; padding: 40px; background: #4A7C4E; min-height: 300px; display: flex; align-items: center; justify-content: center;">
          <div style="background: white; border-radius: 24px; padding: 40px; max-width: 400px; box-shadow: 0 20px 40px rgba(0,0,0,0.3);">
            <h2 style="color: #0a0a0a; font-size: 28px; margin: 0 0 12px; font-weight: 800;">${prompt}</h2>
            <p style="color: #666; font-size: 14px; margin: 0 0 24px;">Powered by Recipe Labs</p>
            <div style="display: flex; gap: 12px;">
              <button style="flex: 1; background: #0a0a0a; color: white; border: none; padding: 14px 24px; border-radius: 12px; font-weight: 600; cursor: pointer;">Primary</button>
              <button style="flex: 1; background: transparent; color: #0a0a0a; border: 2px solid #0a0a0a; padding: 14px 24px; border-radius: 12px; font-weight: 600; cursor: pointer;">Secondary</button>
            </div>
          </div>
        </div>
      `,
      glass: `
        <div style="font-family: 'Inter', sans-serif; padding: 40px; background: linear-gradient(135deg, #F5D547 0%, #4A7C4E 100%); min-height: 300px; display: flex; align-items: center; justify-content: center;">
          <div style="background: rgba(255,255,255,0.15); backdrop-filter: blur(20px); border-radius: 24px; padding: 40px; max-width: 400px; border: 1px solid rgba(255,255,255,0.2);">
            <h2 style="color: white; font-size: 24px; margin: 0 0 12px; font-weight: 700; text-shadow: 0 2px 4px rgba(0,0,0,0.2);">${prompt}</h2>
            <p style="color: rgba(255,255,255,0.8); font-size: 14px; margin: 0 0 24px;">Premium glass morphism design</p>
            <button style="background: white; color: #0a0a0a; border: none; padding: 14px 32px; border-radius: 12px; font-weight: 600; cursor: pointer; box-shadow: 0 4px 12px rgba(0,0,0,0.2);">Explore &#8594;</button>
          </div>
        </div>
      `,
    };
    return styles[style] || styles.minimal;
  };

  const handleSurpriseMe = () => {
    const currentPrompt = INITIAL_PLACEHOLDERS[placeholderIndex];
    setInputValue(currentPrompt);
    handleSendMessage(currentPrompt);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' && !isLoading) {
      event.preventDefault();
      handleSendMessage();
    } else if (event.key === 'Tab' && !inputValue && !isLoading) {
      event.preventDefault();
      setInputValue(INITIAL_PLACEHOLDERS[placeholderIndex]);
    }
  };

  const nextItem = useCallback(() => {
    if (focusedArtifactIndex !== null) {
      if (focusedArtifactIndex < 2) setFocusedArtifactIndex(focusedArtifactIndex + 1);
    } else {
      if (currentSessionIndex < sessions.length - 1) setCurrentSessionIndex(currentSessionIndex + 1);
    }
  }, [currentSessionIndex, sessions.length, focusedArtifactIndex]);

  const prevItem = useCallback(() => {
    if (focusedArtifactIndex !== null) {
      if (focusedArtifactIndex > 0) setFocusedArtifactIndex(focusedArtifactIndex - 1);
    } else {
      if (currentSessionIndex > 0) setCurrentSessionIndex(currentSessionIndex - 1);
    }
  }, [currentSessionIndex, focusedArtifactIndex]);

  const hasStarted = sessions.length > 0 || isLoading;
  const currentSession = sessions[currentSessionIndex];
  const isLoadingDrawer = isLoading && drawerState.mode === 'variations' && componentVariations.length === 0;

  let canGoBack = false;
  let canGoForward = false;

  if (hasStarted) {
    if (focusedArtifactIndex !== null) {
      canGoBack = focusedArtifactIndex > 0;
      canGoForward = focusedArtifactIndex < (currentSession?.artifacts.length || 0) - 1;
    } else {
      canGoBack = currentSessionIndex > 0;
      canGoForward = currentSessionIndex < sessions.length - 1;
    }
  }

  return (
    <div className="relative h-full w-full overflow-hidden bg-[#0a0a0a]">
      {/* Side Drawer */}
      {drawerState.isOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex justify-end"
          onClick={() => setDrawerState(s => ({ ...s, isOpen: false }))}
        >
          <div
            className="w-full max-w-md bg-black/90 backdrop-blur-xl border-l border-white/10 flex flex-col animate-slideInRight"
            onClick={e => e.stopPropagation()}
          >
            <div className="p-6 border-b border-white/10 flex items-center justify-between">
              <h2 className="text-lg font-bold text-white">{drawerState.title}</h2>
              <button
                onClick={() => setDrawerState(s => ({ ...s, isOpen: false }))}
                className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              {isLoadingDrawer && (
                <div className="flex items-center justify-center gap-3 py-12 text-gray-400">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Designing variations...
                </div>
              )}

              {/* Code View */}
              {drawerState.mode === 'code' && (
                <div className="space-y-4">
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleCopyCode(drawerState.data)}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-white/10 border border-white/10 text-white rounded-xl text-sm font-medium hover:bg-white/20 transition-all touch-manipulation"
                    >
                      {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                      {copied ? 'Copied!' : 'Copy Code'}
                    </button>
                    <button
                      onClick={() => handleDownloadCode(drawerState.data, currentSession?.prompt || 'component')}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-brand-gold text-black rounded-xl text-sm font-medium hover:bg-brand-gold/90 transition-all touch-manipulation"
                    >
                      <FileCode className="w-4 h-4" />
                      Download HTML
                    </button>
                  </div>
                  <pre className="bg-black/50 p-4 rounded-xl border border-white/10 text-xs text-green-400 overflow-x-auto whitespace-pre-wrap">
                    <code>{drawerState.data}</code>
                  </pre>
                </div>
              )}

              {/* Download Options */}
              {drawerState.mode === 'download' && (
                <div className="space-y-4">
                  <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
                    <div className="h-48 bg-black overflow-hidden">
                      <iframe
                        srcDoc={drawerState.data.html}
                        title="Preview"
                        sandbox="allow-scripts allow-same-origin"
                        className="w-[200%] h-[200%] border-none pointer-events-none origin-top-left scale-50"
                      />
                    </div>
                    <div className="p-4 border-t border-white/10 bg-black/20">
                      <p className="text-sm text-white font-medium">{drawerState.data.name}</p>
                      <p className="text-xs text-gray-500 mt-1 truncate">{drawerState.data.prompt}</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <button
                      onClick={() => handleDownloadCode(drawerState.data.html, drawerState.data.name)}
                      className="w-full flex items-center gap-4 p-4 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 hover:border-white/20 transition-all touch-manipulation"
                    >
                      <div className="w-12 h-12 bg-brand-gold/20 rounded-xl flex items-center justify-center">
                        <FileCode className="w-6 h-6 text-brand-gold" />
                      </div>
                      <div className="flex-1 text-left">
                        <p className="text-white font-medium">Download HTML</p>
                        <p className="text-xs text-gray-500">Complete HTML file with inline styles</p>
                      </div>
                      <Download className="w-5 h-5 text-gray-400" />
                    </button>

                    <button
                      onClick={() => handleDownloadPreview(drawerState.data.html, drawerState.data.name)}
                      disabled={isDownloading}
                      className="w-full flex items-center gap-4 p-4 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 hover:border-white/20 transition-all touch-manipulation disabled:opacity-50"
                    >
                      <div className="w-12 h-12 bg-brand-forest/20 rounded-xl flex items-center justify-center">
                        {isDownloading ? (
                          <Loader2 className="w-6 h-6 text-brand-forest animate-spin" />
                        ) : (
                          <Image className="w-6 h-6 text-brand-forest" />
                        )}
                      </div>
                      <div className="flex-1 text-left">
                        <p className="text-white font-medium">Download Preview</p>
                        <p className="text-xs text-gray-500">PNG image of the component</p>
                      </div>
                      <Download className="w-5 h-5 text-gray-400" />
                    </button>

                    <button
                      onClick={() => handleCopyCode(drawerState.data.html)}
                      className="w-full flex items-center gap-4 p-4 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 hover:border-white/20 transition-all touch-manipulation"
                    >
                      <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center">
                        {copied ? (
                          <Check className="w-6 h-6 text-green-400" />
                        ) : (
                          <Copy className="w-6 h-6 text-gray-400" />
                        )}
                      </div>
                      <div className="flex-1 text-left">
                        <p className="text-white font-medium">{copied ? 'Copied!' : 'Copy to Clipboard'}</p>
                        <p className="text-xs text-gray-500">Copy HTML code to clipboard</p>
                      </div>
                    </button>
                  </div>
                </div>
              )}

              {/* Variations */}
              {drawerState.mode === 'variations' && (
                <div className="space-y-4">
                  {componentVariations.map((v, i) => (
                    <div
                      key={i}
                      className="bg-white/5 border border-white/10 rounded-xl overflow-hidden cursor-pointer hover:border-brand-gold/50 transition-all"
                      onClick={() => applyVariation(v.html)}
                    >
                      <div className="h-40 bg-black overflow-hidden">
                        <iframe
                          srcDoc={v.html}
                          title={v.name}
                          sandbox="allow-scripts allow-same-origin"
                          className="w-[400%] h-[400%] border-none pointer-events-none origin-top-left scale-[0.25]"
                        />
                      </div>
                      <div className="p-3 text-center text-sm font-medium text-white border-t border-white/10 bg-black/20">
                        {v.name}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Main Stage */}
      <div className={`absolute inset-0 flex items-center justify-center transition-all duration-500 ${focusedArtifactIndex !== null ? '' : ''}`}>

        {/* Empty State */}
        {!hasStarted && (
          <div className="text-center space-y-8 animate-fadeIn px-4">
            <div className="space-y-4">
              <div className="w-20 h-20 mx-auto bg-brand-gold/10 border border-brand-gold/20 rounded-2xl flex items-center justify-center">
                <Wand2 className="w-10 h-10 text-brand-gold" />
              </div>
              <h1 className="text-4xl sm:text-6xl font-bold text-white bg-gradient-to-br from-brand-gold to-brand-gold/70 bg-clip-text text-transparent">
                Secret Sauce
              </h1>
              <p className="text-lg text-gray-400 max-w-md mx-auto">
                Your secret ingredient for stunning UI designs
              </p>
            </div>
            <button
              onClick={handleSurpriseMe}
              disabled={isLoading}
              className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 border border-white/20 text-white rounded-full font-medium hover:bg-white/20 hover:scale-105 transition-all touch-manipulation"
            >
              <Sparkles className="w-4 h-4" />
              Surprise Me
            </button>
          </div>
        )}

        {/* Sessions */}
        {sessions.map((session, sIndex) => {
          let positionClass = 'opacity-0 pointer-events-none';
          if (sIndex === currentSessionIndex) positionClass = 'opacity-100 z-10';
          else if (sIndex < currentSessionIndex) positionClass = 'opacity-0 -translate-x-full';
          else positionClass = 'opacity-0 translate-x-full';

          return (
            <div
              key={session.id}
              className={`absolute inset-0 flex items-center justify-center transition-all duration-700 ${positionClass}`}
            >
              <div
                ref={sIndex === currentSessionIndex ? gridScrollRef : null}
                className={`grid gap-4 sm:gap-6 w-[95%] max-w-6xl px-4 transition-all duration-500 ${
                  focusedArtifactIndex !== null
                    ? 'grid-cols-1'
                    : 'grid-cols-1 md:grid-cols-3'
                }`}
                style={{ maxHeight: '70vh' }}
              >
                {session.artifacts.map((artifact, aIndex) => {
                  const isFocused = focusedArtifactIndex === aIndex;
                  const isHidden = focusedArtifactIndex !== null && !isFocused;

                  return (
                    <div
                      key={artifact.id}
                      className={`bg-[#111] rounded-xl border overflow-hidden cursor-pointer transition-all duration-500 ${
                        isFocused
                          ? 'fixed inset-4 sm:inset-8 z-50 border-brand-gold/30'
                          : isHidden
                            ? 'opacity-0 scale-90 pointer-events-none'
                            : 'border-white/10 hover:border-white/30 hover:-translate-y-1'
                      }`}
                      onClick={() => !isFocused && setFocusedArtifactIndex(aIndex)}
                    >
                      {/* Header */}
                      {!isFocused && (
                        <div className="px-4 py-3 border-b border-white/10 bg-black/30">
                          <span className="text-xs font-medium text-gray-400 uppercase tracking-wider bg-white/5 px-2 py-1 rounded">
                            {artifact.styleName}
                          </span>
                        </div>
                      )}

                      {/* Content */}
                      <div className={`relative bg-white ${isFocused ? 'h-full' : 'h-64 sm:h-80'}`}>
                        {artifact.status === 'streaming' && (
                          <div className="absolute inset-0 bg-black/90 z-10 flex flex-col justify-end overflow-hidden">
                            <pre className="p-4 text-xs text-green-400 font-mono whitespace-pre-wrap overflow-hidden opacity-80">
                              {artifact.html || 'Generating...'}
                            </pre>
                          </div>
                        )}
                        <iframe
                          ref={isFocused ? previewIframeRef : null}
                          srcDoc={artifact.html}
                          title={artifact.id}
                          sandbox="allow-scripts allow-forms allow-modals allow-popups allow-same-origin"
                          className={`w-full h-full border-none ${isFocused ? 'pointer-events-auto' : 'pointer-events-none'}`}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Navigation Arrows */}
      {canGoBack && (
        <button
          className="absolute left-4 top-1/2 -translate-y-1/2 p-4 text-gray-500 hover:text-white transition-colors z-20 touch-manipulation"
          onClick={prevItem}
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
      )}
      {canGoForward && (
        <button
          className="absolute right-4 top-1/2 -translate-y-1/2 p-4 text-gray-500 hover:text-white transition-colors z-20 touch-manipulation"
          onClick={nextItem}
        >
          <ArrowRight className="w-6 h-6" />
        </button>
      )}

      {/* Action Bar (when focused) */}
      {focusedArtifactIndex !== null && (
        <div className="absolute bottom-24 left-1/2 -translate-x-1/2 z-40 flex flex-col items-center gap-3 animate-fadeIn">
          <div className="text-sm text-gray-400 bg-black/50 backdrop-blur-sm px-4 py-2 rounded-full max-w-xs truncate">
            {currentSession?.prompt}
          </div>
          <div className="flex gap-2 sm:gap-3 flex-wrap justify-center">
            <button
              onClick={() => setFocusedArtifactIndex(null)}
              className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/10 text-white rounded-full text-sm font-medium hover:bg-white/20 transition-all touch-manipulation"
            >
              <Grid3X3 className="w-4 h-4" /> Grid
            </button>
            <button
              onClick={handleGenerateVariations}
              disabled={isLoading}
              className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/10 text-white rounded-full text-sm font-medium hover:bg-white/20 transition-all touch-manipulation disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4" /> Variations
            </button>
            <button
              onClick={handleShowCode}
              className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/10 text-white rounded-full text-sm font-medium hover:bg-white/20 transition-all touch-manipulation"
            >
              <Code className="w-4 h-4" /> Code
            </button>
            <button
              onClick={handleShowDownload}
              className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-brand-gold text-black rounded-full text-sm font-medium hover:bg-brand-gold/90 transition-all touch-manipulation"
            >
              <Download className="w-4 h-4" /> Download
            </button>
          </div>
        </div>
      )}

      {/* Input Bar */}
      <div className="absolute bottom-6 left-0 right-0 flex justify-center px-4 z-30">
        <div className={`w-full max-w-xl bg-white/5 backdrop-blur-xl border border-white/10 rounded-full p-2 pl-6 flex items-center gap-3 transition-all ${isLoading ? 'border-brand-gold/30' : ''}`}>
          {!inputValue && !isLoading && (
            <div className="absolute left-6 text-gray-500 pointer-events-none flex items-center gap-3">
              <span className="animate-fadeIn" key={placeholderIndex}>
                {INITIAL_PLACEHOLDERS[placeholderIndex]}
              </span>
              <span className="text-[10px] uppercase bg-white/10 px-2 py-0.5 rounded font-medium hidden sm:inline">Tab</span>
            </div>
          )}

          {!isLoading ? (
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={e => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isLoading}
              className="flex-1 bg-transparent text-white text-sm placeholder-transparent focus:outline-none min-h-[40px]"
              placeholder=""
            />
          ) : (
            <div className="flex-1 flex items-center gap-3 text-gray-400 text-sm">
              <span className="truncate">{currentSession?.prompt}</span>
              <Loader2 className="w-4 h-4 animate-spin flex-shrink-0" />
            </div>
          )}

          <button
            onClick={() => handleSendMessage()}
            disabled={isLoading || !inputValue.trim()}
            className="w-10 h-10 bg-brand-gold text-black rounded-full flex items-center justify-center hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all touch-manipulation"
          >
            <ArrowUp className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Keyboard hint */}
      {!isLoading && hasStarted && (
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-[10px] text-gray-600 hidden sm:block">
          Enter to generate • Tab to use suggestion
        </div>
      )}

      {/* CSS for animations */}
      <style>{`
        @keyframes slideInRight {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        .animate-slideInRight {
          animation: slideInRight 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default FlashUIModule;
