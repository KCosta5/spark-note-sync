import { useState, useEffect, useRef } from 'react';
import type { UseCustomThemeReturn } from '@/hooks/useCustomTheme';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useCustomTheme } from '@/hooks/useCustomTheme';

export function ThemeCssEditor() {
  const { customCss, setCustomCss, resetCustomCss, presets, savePreset, loadPreset, deletePreset } = useCustomTheme() as UseCustomThemeReturn;
  const [text, setText] = useState('');
  const [presetName, setPresetName] = useState('');
  const fileRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    setText(customCss || '');
  }, [customCss]);

  const handleApply = () => {
    setCustomCss(text || '');
  };

  const handleReset = () => {
    resetCustomCss();
  };

  const handleExport = () => {
    const blob = new Blob([text || ''], { type: 'text/css' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `theme.css`;
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
    setText(txt);
    setCustomCss(txt);
  };

  const handleSavePreset = () => {
    if (!presetName) return;
    savePreset(presetName, 'css', text || '');
    setPresetName('');
  };

  return (
    <div className="space-y-3">
      <Label>CSS Customizado</Label>
      <Textarea className="h-56 font-mono text-sm" value={text} onChange={(e) => setText(e.target.value)} />

      <div className="flex gap-2">
        <Button onClick={handleApply}>Aplicar</Button>
        <Button variant="outline" onClick={handleReset}>Resetar</Button>
        <Button variant="secondary" onClick={handleExport}>Exportar (.css)</Button>
        <input ref={fileRef} type="file" accept=".css,text/css" onChange={handleFileChange} className="hidden" />
        <Button variant="ghost" onClick={handleImportClick}>Importar (.css)</Button>
      </div>

      <div className="pt-2 border-t border-border space-y-2">
        <Label>Presets</Label>
        <div className="flex gap-2">
          <input value={presetName} onChange={(e) => setPresetName(e.target.value)} placeholder="Nome do preset" className="input" />
          <Button onClick={handleSavePreset} disabled={!presetName}>Salvar preset</Button>
        </div>
        <div className="flex gap-2 flex-wrap">
          {presets.filter((p: any) => p.type === 'css').length === 0 && <div className="text-sm text-muted-foreground">Nenhum preset</div>}
          {presets.filter((p: any) => p.type === 'css').map((p: any) => (
            <div key={p.name} className="flex items-center gap-2">
              <Button size="sm" variant="outline" onClick={() => loadPreset(p.name)}>{p.name}</Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  const newName = window.prompt('Nome do preset', p.name);
                  if (newName && newName !== p.name) {
                    savePreset(newName, 'css', p.data);
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
                    savePreset(dupName, 'css', p.data);
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

export default ThemeCssEditor;
