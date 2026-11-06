# Relatório de execução — Primeiro incremento P0

Data observada: 2026-11-05 (horário local America/Sao_Paulo).

## Arquivos e fontes
- MMU original do usuário: /home/vinicius/Downloads/MMU_26-11-02_V0.0.12.zip
- SHA-256: ced2aae8aaf04c1f0741a2a2e0f060525d59b572baebb9211cedf0b496ad4e3c
- Cópia íntegra em docs/MMU_ORIGINAL_V0.0.12.zip; extração em docs/MMU_V0.0.12.
- SVGs oficiais extraídos (plus, pencil, ellipsis, trash, chevron-right).
- A Matriz preenchida V0.0.1 está no chat (não na pasta do MacBook).

## Aplicação criada
React/TypeScript + Vite, Dexie/IndexedDB, decimal.js-light, vite-plugin-pwa, Vitest.
Meta, Biblioteca, Calculadora, leitura/escrita local, ícones oficiais, tema auto.
Código não publicado em serviço externo.

## Testes
- npm install: 368 pacotes instalados, saída exit 0; aviso de dependências deprecated.
- npm test: 18 testes aprovados (exit 0).
- npm run build: exit 0; gerou dist/sw.js, dist/workbox-*.js,
  dist/manifest.webmanifest e assets.
- Vite preview: HTTP 200 em /, /sw.js, /manifest.webmanifest,
  /app-icon-192.png e /mmu-icons/plus.svg.
- Firefox headless: screenshot da tela 'Abrindo seus quadros', sem confirmação
  da conclusão de leitura Dexie. Não contar como teste funcional de browser.
- Safari iPhone, persistência após fechar e offline real: NÃO testados.

## Segurança e limites
Sem backend, login, publicação externa ou envio de dados pessoais.
Ícones de interface somente SVGs originais MMU.
A licença dos SVGs para distribuição fora do ecossistema Apple é pendente.
Git local inicializado no repositório exclusivo; não houve push.

## Próximo
Testar a prévia no Safari do iPhone, revisar a experiência visual,
integrar Matriz de projeto com snapshot real e validar seu ZIP.

## Correção de interação HTTP local — 2026-11-06
- Causa identificada: src/domain/boards.ts e src/App.tsx dependiam diretamente de crypto.randomUUID(), disponível apenas em contextos seguros; HTTP pelo IP 192.168.15.5 não é origem segura.
- Correção aplicada: função newId() usa crypto.randomUUID quando disponível e fallback criptograficamente seguro crypto.getRandomValues em HTTP, com UUID v4 compatível.
- Testes: 21/21 aprovados, incluindo simulação de navegador HTTP sem randomUUID. npm run build aprovado, Vite preview HTTP 200 servindo novo bundle.
- Validação de toque no Safari real: pendente de confirmação do usuário; não considerar concluída.
