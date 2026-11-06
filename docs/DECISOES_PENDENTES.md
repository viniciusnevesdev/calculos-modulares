# Decisões e pendências

## Confirmado pelo usuário
- Desenvolvimento isolado no MacBook via Desktop Commander e Codex CLI.
- Arquitetura aprovada em 2026-11-05: React, TypeScript, Vite, Dexie,
  decimal.js-light, vite-plugin-pwa, Vitest.
- P0: Biblioteca, Meta e Calculadora; mobile-first; autosave e offline.
- Sem publicações externas/deploy, sem alterações em projetos vizinhos.
- MMU como fonte documental oficial; SVGs exclusivamente da biblioteca interna.

## Pendentes
- Nome final e cor principal (azul atual é PROVISÓRIO).
- Validação da interface no iPhone: teclado, rolagem, toque, edição persistente.
- Instalação e offline real exigem HTTPS/origem segura; LAN HTTP só para prévia.
- Matriz personalizada V0.0.1 do chat ainda não transferida ao MacBook; integrar e
  registrar código-fonte/histórico Git nela antes de considerá-la sincronizada.
- Backup: IndexedDB não garante preservação indefinida. Não depender só dele com
  dados importantes; export/import e proteção automática estão planejados.
- Verificar licença de redistribuição dos SVGs relacionados a SF Symbols.
- Definir arredondamento para divisões monetárias recorrentes, múltiplas moedas
  (não incluídas no P0) e porcentagem negativa em UX.

## Decisões técnicas provisórias nesta entrega
- Exibir reais em 2 casas decimais com HALF_UP; motor Decimal mantém precisão.
- Botões de operações usam glifos matemáticos (não ícones da interface).
- Logo PNG provisório "CM" criado apenas para manifest/instalação, não é
  ícone SVG da biblioteca; identidade definitiva pendente.
- Cinco SVGs de ação copiados sem modificar do MMU original.
- Theme light/dark automático via prefers-color-scheme.

## Estado real dos testes (2026-11-05)
18 testes automatizados aprovados; build aprovado; HTTP local 200.
Browser screenshot Firefox headless capturou a tela inicial de carregamento,
não valida o fluxo visual após IndexedDB. Sem teste Safari/iPhone ainda.

## Codex CLI
Codex gerou os módulos centrais e bases do projeto. Duas sessões pararam sem
finalizar interface após erro de rede na instalação dentro do sandbox.
Desktop Commander instalou dependências fora do sandbox e concluiu frontend,
testes e compilação. Nenhuma afirmação de Codex ter feito tudo.

## Correção de interação HTTP local — 2026-11-06
- Causa identificada: src/domain/boards.ts e src/App.tsx dependiam diretamente de crypto.randomUUID(), disponível apenas em contextos seguros; HTTP pelo IP 192.168.15.5 não é origem segura.
- Correção aplicada: função newId() usa crypto.randomUUID quando disponível e fallback criptograficamente seguro crypto.getRandomValues em HTTP, com UUID v4 compatível.
- Testes: 21/21 aprovados, incluindo simulação de navegador HTTP sem randomUUID. npm run build aprovado, Vite preview HTTP 200 servindo novo bundle.
- Validação de toque no Safari real: pendente de confirmação do usuário; não considerar concluída.
