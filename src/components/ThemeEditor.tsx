import { useState, useEffect, useRef } from 'react';
import type { UseCustomThemeReturn } from '@/hooks/useCustomTheme';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useCustomTheme } from '@/hooks/useCustomTheme';

function parseVarsText(text: string) {
  // Accept JSON or CSS variable lines like "--primary: 220 50% 50%" or "primary: 220 50% 50%"
  text = text.trim();
  if (!text) return {} as Record<string, string>;
  try {
    const parsed = JSON.parse(text);
    if (typeof parsed === 'object' && parsed !== null) return parsed as Record<string, string>;
  } catch (e) {
    // not JSON, try parse lines
  }

  const out: Record<string, string> = {};
  text.split(/\r?\n/).forEach((line) => {
    const cleaned = line.trim();
    if (!cleaned) return;
    const m = cleaned.match(/^(--?[\w-]+)\s*:\s*(.+)$/);
    if (m) {
      out[m[1].replace(/^--/, '')] = m[2].trim();
    } else {
      // fallback: try key value separated by whitespace
      const parts = cleaned.split(/\s+/);
      if (parts.length >= 2) {
        out[parts[0].replace(/^--/, '')] = parts.slice(1).join(' ');
      }
    }
  });
  return out;
}

export function ThemeEditor() {
  const { customVars, setCustomVars, setCustomVar, resetCustomVars, presets, savePreset, loadPreset, deletePreset } = useCustomTheme() as UseCustomThemeReturn;
  const fileRef = useRef<HTMLInputElement | null>(null);

  const [primary, setPrimary] = useState('');
  const [background, setBackground] = useState('');
  const [textColor, setTextColor] = useState('');
  const [raw, setRaw] = useState('');

  useEffect(() => {
    // hydrate fields from current customVars
    setPrimary(customVars['primary'] || customVars['--primary'] || '');
    setBackground(customVars['background'] || customVars['--background'] || '');
    setTextColor(customVars['text'] || customVars['--text'] || '');
    setRaw(JSON.stringify(customVars || {}, null, 2));
  }, [customVars]);

  const handleApply = () => {
    const combined: Record<string, string> = { ...customVars };
    if (primary) combined['primary'] = primary;
    if (background) combined['background'] = background;
    if (textColor) combined['text'] = textColor;
    try {
      setCustomVars(combined);
      setRaw(JSON.stringify(combined, null, 2));
    } catch (e) {}
  };

  const handleSaveRaw = () => {
    const parsed = parseVarsText(raw);
    setCustomVars({ ...customVars, ...parsed });
  };

  const handleReset = () => {
    resetCustomVars();
  };

  const handleExport = () => {
    const data = JSON.stringify(customVars || {}, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'theme-vars.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImportClick = () => fileRef.current?.click();

  const handleFileChange: React.ChangeEventHandler<HTMLInputElement> = async (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const txt = await f.text();
    try {
      const parsed = JSON.parse(txt);
      setCustomVars(parsed);
      setRaw(JSON.stringify(parsed, null, 2));
    } catch (e) {
      // ignore
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        <div>
          <Label>Primário (HSL / CSS value)</Label>
          <Input value={primary} onChange={(e) => setPrimary(e.target.value)} placeholder="ex: 217 91% 60% or #3b82f6" />
        </div>
        <div>
          <Label>Fundo</Label>
          <Input value={background} onChange={(e) => setBackground(e.target.value)} placeholder="ex: 0 0% 10% or #0b0b0b" />
        </div>
        <div>
          <Label>Texto</Label>
          <Input value={textColor} onChange={(e) => setTextColor(e.target.value)} placeholder="ex: 210 16% 98% or #fff" />
        </div>
      </div>

      <div>
        <Label>Editor de variáveis (JSON ou linhas CSS)</Label>
        <Textarea value={raw} onChange={(e) => setRaw(e.target.value)} className="h-40 font-mono text-sm" />
      </div>

      <div className="flex gap-2 justify-end">
        <Button variant="outline" onClick={handleReset}>Resetar</Button>
        <Button onClick={handleExport}>Exportar</Button>
        <input ref={fileRef} type="file" accept="application/json" onChange={handleFileChange} className="hidden" />
        <Button variant="ghost" onClick={handleImportClick}>Importar</Button>
        <Button variant="secondary" onClick={handleApply}>Aplicar campos</Button>
        <Button onClick={handleSaveRaw}>Aplicar do editor</Button>
      </div>

      <div className="pt-2 border-t border-border space-y-2">
        <Label>Presets</Label>
        <div className="flex gap-2 flex-wrap">
          {presets.filter((p: any) => p.type === 'vars').length === 0 && <div className="text-sm text-muted-foreground">Nenhum preset</div>}
          {presets.filter((p: any) => p.type === 'vars').map((p: any) => (
            <div key={p.name} className="flex items-center gap-2">
              <Button size="sm" variant="outline" onClick={() => loadPreset(p.name)}>{p.name}</Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  const newName = window.prompt('Nome do preset', p.name);
                  if (newName && newName !== p.name) {
                    // save under new name then delete old
                    savePreset(newName, 'vars', p.data);
                    deletePreset(p.name);
                  }
                }}
              >
                Renomear
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  const dupName = window.prompt('Nome do preset duplicado', `${p.name} copy`);
                  if (dupName) {
                    savePreset(dupName, 'vars', p.data);
                  }
                }}
              >
                Duplicar
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  try {
                    const blob = new Blob([JSON.stringify(p, null, 2)], { type: 'application/json' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `${p.name}.preset.json`;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    URL.revokeObjectURL(url);
                  } catch (e) {}
                }}
              >
                Exportar
              </Button>
              <Button size="sm" variant="ghost" onClick={() => deletePreset(p.name)}>Excluir</Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default ThemeEditor;
