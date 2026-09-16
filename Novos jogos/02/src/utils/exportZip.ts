import JSZip from 'jszip';

export async function downloadProjectZip(onProgress?: (percent: number) => void): Promise<void> {
  // First, try direct download from static pre-bundled zip in /public or root
  try {
    const res = await fetch('/bancada-simulator-bandeirao.zip');
    if (res.ok) {
      const blob = await res.blob();
      if (blob.size > 1000) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'bancada-simulator-bandeirao.zip';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(() => URL.revokeObjectURL(url), 2000);
        return;
      }
    }
  } catch {
    // Fallback below
  }

  // Fallback: Use dynamic glob if available, or generate a simple zip structure
  const zip = new JSZip();

  try {
    const metaWithGlob = import.meta as unknown as {
      glob?: (patterns: string[], opts: unknown) => Record<string, string>;
    };

    if (typeof metaWithGlob?.glob === 'function') {
      const sourceFiles = metaWithGlob.glob(
        [
          '/src/**/*.{ts,tsx,css,d.ts}',
          '/index.html',
          '/package.json',
          '/package-lock.json',
          '/.npmrc',
          '/tsconfig.json',
          '/vite.config.ts',
          '/metadata.json',
          '/.env.example',
        ],
        { query: '?raw', import: 'default', eager: true }
      );

      for (const [filePath, content] of Object.entries(sourceFiles || {})) {
        const cleanPath = filePath.startsWith('/') ? filePath.slice(1) : filePath;
        zip.file(cleanPath, content as string);
      }
    }
  } catch (err) {
    console.warn('Could not glob files dynamically:', err);
  }

  const readmeContent = `# Bancada Simulator - Minigame Tremular Bandeirão

Minigame estilo 'Trace the Path' focado em controle por toque (Touch/Drag) simulando o movimento de tremular um bandeirão de estádio na arquibancada, com cálculo de precisão e saída de pontuação para o Bancada Simulator.

## 🚀 Como Executar

Requisitos: Node.js 18+ (ou 20/22)

1. Instale as dependências:
\`\`\`bash
npm install
\`\`\`

2. Inicie o servidor:
\`\`\`bash
npm run dev
# ou
npm start
\`\`\`

3. Acesse no navegador:
\`\`\`
http://localhost:3000
\`\`\`
`;

  zip.file('README.md', readmeContent);

  const zipBlob = await zip.generateAsync(
    {
      type: 'blob',
      compression: 'DEFLATE',
      compressionOptions: { level: 6 },
    },
    (metadata) => {
      if (onProgress) {
        onProgress(Math.round(metadata.percent));
      }
    }
  );

  const url = URL.createObjectURL(zipBlob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'bancada-simulator-bandeirao.zip';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}
