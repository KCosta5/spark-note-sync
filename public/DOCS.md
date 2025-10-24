# Spark Note Sync — Documentação

Bem-vindo à documentação do Spark Note Sync.

## Visão geral

O Spark Note Sync é um gerenciador de notas com sincronização remota. A aplicação usa Tailwind CSS para estilização e Radix primitives para componentes acessíveis. O tema agora é aplicado via CSS customizado.

## Editor de Tema (CSS)

- Abra Configurações → Editor de Tema (CSS).
- Cole seu CSS customizado (recomendado: declarar variáveis em :root ou regras globais).
- Clique em Aplicar para injetar o CSS.
- Use Exportar/Importar para presets.

## Componentes usados (resumo)

- FolderManager — gerencia pastas
- NoteEditor — editor de notas
- NotesList — lista de notas
- SettingsDialog — painel de configurações
- SyncIndicator — indicador de sincronização
- ThemeCssEditor — editor para CSS do tema

### Primitives (em src/components/ui)

Uma grande parte dos componentes reutilizáveis fica em `src/components/ui` (ex: `button`, `dialog`, `input`, `select`, `tabs`, `toast`, etc.). Prefira estender esses componentes para consistência visual.

## Boas práticas

- Mantenha componentes pequenos e testáveis.
- Use classes Tailwind em vez de CSS inline quando possível.
- Mantenha a lógica visual em componentes UI e a lógica de negócio em hooks.

Para mais perguntas, adicione um issue no repositório ou entre em contato com o mantenedor.
