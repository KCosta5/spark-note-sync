# Modo Foco / Tela Cheia no Editor

Adicionar um modo distração-zero ao `NoteEditor`, com tela cheia, contador de palavras/caracteres e temporizador de leitura (cronômetro de sessão + estimativa baseada no texto).

## O que o usuário vê

- Novo botão na barra do editor: ícone "Foco" (Maximize2). Atalho: `F11` ou `Ctrl/Cmd + .`.
- Ao ativar:
  - Editor ocupa a tela inteira (overlay fixed, fundo `bg-background`), escondendo sidebar e header do app.
  - Tipografia mais ampla, coluna centralizada (máx ~720px) para leitura/escrita confortável.
  - Toolbar minimalista no topo: sair do foco, alternar preview, indicadores.
  - Rodapé fixo com métricas: **palavras**, **caracteres**, **tempo estimado de leitura** (200 wpm) e **cronômetro da sessão** (mm:ss).
- Cronômetro começa ao entrar no foco; pausa se aba perder visibilidade (`visibilitychange`) e retoma ao voltar. Botão para resetar.
- `Esc` ou clique no botão sair fecha o modo foco.

## Métricas

- Palavras: `content.trim().split(/\s+/).filter(Boolean).length` (ignora markdown bruto — simples e previsível).
- Caracteres: `content.length` (e variação sem espaços).
- Leitura: `Math.max(1, Math.ceil(palavras / 200))` min.
- Sessão: incremento por `setInterval` de 1s, pausado por `document.hidden`.

## Mudanças técnicas

- `src/components/NoteEditor.tsx`:
  - Estado `focusMode: boolean`, `sessionSeconds: number`.
  - Novo botão na toolbar principal (ícone `Maximize2` / `Minimize2`).
  - Atalho `Ctrl/Cmd + .` e `F11` em `handleKeyDown` + listener global para `Esc` quando em foco.
  - Quando `focusMode`, renderiza o editor dentro de um wrapper `fixed inset-0 z-50` com classes do design system (sem cores hardcoded).
  - `useEffect` para cronômetro + `visibilitychange`.
- `src/components/KeyboardShortcutsDialog.tsx`: adicionar entradas "Modo foco" (`Ctrl/Cmd + .`) e "Sair do foco" (`Esc`).
- Sem mudanças em `db.ts`, sem novas dependências (ícones já vêm de `lucide-react`).

## Fora de escopo

- Persistir estatísticas de tempo por nota (poderia virar a feature "estatísticas de estudo" depois).
- Pomodoro — feature separada já listada.
