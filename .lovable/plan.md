## Objetivo

Duas features novas, ambas 100% client-side (sem backend, alinhado com a memória do projeto):

1. **Editor avançado** — diagramas Mermaid, fórmulas matemáticas KaTeX e mais atalhos de teclado
2. **Backup/restauração + lixeira** — exportar/importar tudo em JSON e recuperar notas excluídas

---

## Parte 1 — Editor avançado

### 1.1 Diagramas Mermaid
Renderizar blocos ```` ```mermaid ```` como diagramas SVG no preview.

- Adicionar `mermaid` como dependência
- Criar componente `MermaidBlock` que recebe o código, inicializa o mermaid uma vez (tema `default`/`dark` conforme `next-themes`) e renderiza o SVG via `mermaid.render`
- Estado de erro amigável quando a sintaxe é inválida
- Plugar no `ReactMarkdown` pelo prop `components.code` — quando `className === "language-mermaid"`, usa `MermaidBlock`; senão, fallback para o `<code>` atual

### 1.2 Fórmulas KaTeX
Suporte a `$inline$` e `$$bloco$$` no preview.

- Adicionar `remark-math`, `rehype-katex` e `katex`
- Importar `katex/dist/katex.min.css` uma vez (em `main.tsx` ou `index.css`)
- Acrescentar os plugins ao `ReactMarkdown` em `NoteEditor.tsx`

### 1.3 Atalhos de teclado expandidos
Hoje só existem Ctrl+B/I/K/`. Adicionar:

| Atalho | Ação |
|---|---|
| Ctrl/Cmd+Shift+H | Highlight `==texto==` |
| Ctrl/Cmd+Shift+1/2/3 | Heading 1/2/3 |
| Ctrl/Cmd+Shift+L | Lista não ordenada |
| Ctrl/Cmd+Shift+O | Lista ordenada |
| Ctrl/Cmd+Shift+C | Checklist `- [ ]` |
| Ctrl/Cmd+Shift+Q | Bloco de citação |
| Ctrl/Cmd+Shift+E | Bloco de código ```` ``` ```` |
| Ctrl/Cmd+P | Alternar Preview/Edit |
| Ctrl/Cmd+S | Forçar save imediato (sem esperar debounce) |
| Ctrl/Cmd+/ | Abrir modal "Atalhos de teclado" |

- Estender o switch dentro de `handleKeyDown` em `NoteEditor.tsx`
- Novo componente `KeyboardShortcutsDialog` (lista todos os atalhos) acessível pelo Ctrl+/ e por um botão de ícone (`Keyboard`) no toolbar

### 1.4 Toolbar — novos botões
Adicionar dois botões ao toolbar do editor:
- `GitBranch` → insere snippet inicial de Mermaid (` ```mermaid\ngraph TD\n  A --> B\n``` `)
- `Sigma` → insere snippet KaTeX (`$$\n\\sum_{i=1}^{n} i\n$$`)

---

## Parte 2 — Backup/restauração + Lixeira

### 2.1 Lixeira (Trash)
Notas excluídas já viram `deleted: true` no IndexedDB mas somem da UI. Aproveitar isso para criar uma visão de lixeira real.

- Novas funções em `src/lib/db.ts`:
  - `getDeletedNotes()` — retorna notas com `deleted: true`
  - `restoreNote(id)` — seta `deleted: false`, atualiza `updatedAt`
  - `permanentlyDeleteNote(id)` — remove do IndexedDB de verdade + remove imagens vinculadas (já existe `deleteImagesByNote`)
  - `emptyTrash()` — apaga permanentemente todas as notas com `deleted: true`
- Novo item "Lixeira" no `NotesList` (ícone `Trash2`), abaixo das pastas, que ao selecionar mostra as notas deletadas em vez das ativas
- Quando uma nota da lixeira está selecionada: header mostra botões **Restaurar** e **Excluir permanentemente** em vez do editor de prioridade/save
- Botão "Esvaziar lixeira" no topo da lista da lixeira (com `AlertDialog` de confirmação)
- Auto-purge opcional: notas há mais de 30 dias na lixeira são removidas automaticamente no boot (`getDB` ou no `useEffect` inicial do `Index`)

### 2.2 Backup completo (export JSON)
Botão "Exportar backup" no `SettingsDialog`.

- Coleta: todas as notas (incluindo lixeira) + todas as pastas + todas as imagens (convertidas Blob → Base64 dataURL)
- Gera arquivo `caderno-escolar-backup-YYYY-MM-DD.json` com schema:
  ```json
  {
    "version": 1,
    "exportedAt": 1234567890,
    "notes": [...],
    "folders": [...],
    "images": [{ "id": "...", "noteId": "...", "name": "...", "createdAt": 0, "dataUrl": "data:image/..." }]
  }
  ```
- Download via `Blob` + `URL.createObjectURL`

### 2.3 Restauração (import JSON)
Botão "Restaurar backup" no `SettingsDialog`.

- `<input type="file" accept="application/json">` oculto
- Modal de confirmação com 2 estratégias:
  - **Mesclar** (mantém dados existentes, adiciona/atualiza por ID)
  - **Substituir tudo** (limpa stores antes de inserir — exige segunda confirmação)
- Validação de schema (`version`, presença de arrays); erro amigável se inválido
- Reconverte `dataUrl` → `Blob` ao reinserir imagens
- Toast com totais importados (`X notas, Y pastas, Z imagens`)
- Recarrega listas via `loadNotes` + `loadFolders` após import

---

## Detalhes técnicos

### Dependências novas
```
mermaid
remark-math
rehype-katex
katex
```

### Arquivos a criar
- `src/components/MermaidBlock.tsx`
- `src/components/KeyboardShortcutsDialog.tsx`
- `src/components/TrashView.tsx` (ou integrar no `NotesList` via prop)
- `src/lib/backup.ts` — `exportBackup()`, `importBackup(file, mode)`
- `src/lib/trash.ts` (opcional) ou adicionar helpers em `src/lib/db.ts`

### Arquivos a editar
- `src/components/NoteEditor.tsx` — plugins markdown, novos atalhos, novos botões toolbar
- `src/components/NotesList.tsx` — item "Lixeira" + contador
- `src/components/SettingsDialog.tsx` — seções "Backup" e atalhos
- `src/pages/Index.tsx` — estado de "visualizando lixeira" + handlers de restaurar/purgar
- `src/lib/db.ts` — novas operações de lixeira e helpers Blob↔Base64
- `src/main.tsx` ou `src/index.css` — import do `katex.min.css`

### Não vai mudar
- Esquema do IndexedDB (já tem campo `deleted`)
- Service worker / PWA
- Tokens de design

---

## Diagrama de fluxo (backup)

```text
┌──────────────┐   exportBackup()    ┌─────────────────┐
│ SettingsDlg  │ ──────────────────► │  src/lib/backup │
└──────────────┘                     │   .ts           │
                                     │                 │
                                     │ getAllNotes +   │
                                     │ getAllFolders + │
                                     │ getAllImages    │
                                     │ → Blob→base64   │
                                     │ → JSON file     │
                                     └────────┬────────┘
                                              │
                                              ▼
                                       download .json

┌──────────────┐  importBackup(file) ┌─────────────────┐
│ <input file> │ ──────────────────► │  src/lib/backup │
└──────────────┘                     │   .ts           │
                                     │ validate schema │
                                     │ merge|replace   │
                                     │ base64→Blob     │
                                     │ db.put(...)     │
                                     └────────┬────────┘
                                              │
                                              ▼
                                     reload UI + toast
```
