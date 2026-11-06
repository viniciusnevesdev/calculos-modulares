# Cálculos Modulares — PWA

**Versão de desenvolvimento:** 0.1.0 (primeiro incremento P0). **Nome:** provisório.
**Estado real em 2026-11-05:** primeiro PWA compilado e testado no MacBook; validação Safari/iPhone ainda pendente.

## Objetivo
Construir quadros visuais para cálculos, sem grade de planilha nem fórmulas digitadas.
Mobile-first, sem login, armazenamento local IndexedDB, funcionamento offline quando o
service worker pode ser instalado em origem segura.

## Entregue no primeiro incremento
- Biblioteca de quadros: criar, abrir, duplicar, excluir com confirmação, renomear.
- Meta financeira: alvo em reais, lista editável de entradas, duplicação/remoção,
  total recebido, restante, excedente, percentual real e barra limitada a 100%.
- Calculadora: +, -, multiplicação, divisão, botão inverter, formato BRL/número.
- Valores pt-BR, prefixo R$ fora do texto, validação de vazio/erro, decimal.js-light.
- Autosave no IndexedDB, PWA manifest, workbox service worker, temas claro/escuro.
- Motor matemático separado da interface; modelos com IDs e versionamento.

## Stack aprovada
React 19, TypeScript, Vite 7, Dexie 4, decimal.js-light,
vite-plugin-pwa e Vitest 4. A arquitetura foi aprovada pelo usuário em 2026-11-05.

## Testes efetivos
- npm test: **21/21** passando (matemática, zeros, negativos, entradas inválidas, progresso e duplicação).
- npm run build: **APROVADO**, PWA gera dist/sw.js e dist/manifest.webmanifest.
- HTTP local: /, /sw.js, /manifest.webmanifest, SVG e ícones PNG retornaram HTTP 200.
- Safari/iPhone: **NÃO TESTADO**. Offline real, persistência depois de fechar e teclado
  móvel ainda precisam de validação manual no dispositivo.

## Rodar localmente
```bash
cd /home/vinicius/Projetos/CalculosModularesGitHub
npm install
npm test
npm run build
npm run preview -- --host 0.0.0.0 --port 4173
```
Na mesma rede Wi-Fi do MacBook, usar o IP local na porta 4173 para prévia.
HTTP em IP LAN não é origem segura para service worker/instalação PWA no iPhone:
para testar essas funções futuramente será necessário HTTPS/localidade adequada,
com autorização antes de qualquer publicação externa.

## MMU
Fonte documental obrigatória: docs/MMU_ORIGINAL_V0.0.12.zip (cópia intacta de Downloads).
A extração completa para consulta está em docs/MMU_V0.0.12, com 501 SVGs.
A Matriz personalizada V0.0.1 gerada na conversa **ainda não foi transferida
integralmente** ao MacBook. Os documentos README, AGENTS e docs/ registram
a primeira implementação; integração da Matriz de projeto permanece pendente.
Biblioteca de ícones SVG restrita ao MMU; licença externa ainda não verificada.

## Próximas etapas
1. Validar no iPhone (abrir quadros, entrada BRL, teclado e persistência após reabrir).
2. Corrigir eventuais problemas reais.
3. Integrar Matriz personalizada com snapshot de código e Git, validar pelo MMU.
4. Implementar exportação/backup e confirmar política antes de confiar valores reais.
5. Apenas depois: construtor modular P1 (sem desenvolvimento nesta etapa).

**Não há publicação externa, backend, login ou sincronização.**

## Correção de interação HTTP local — 2026-11-06
- Causa identificada: src/domain/boards.ts e src/App.tsx dependiam diretamente de crypto.randomUUID(), disponível apenas em contextos seguros; HTTP pelo IP 192.168.15.5 não é origem segura.
- Correção aplicada: função newId() usa crypto.randomUUID quando disponível e fallback criptograficamente seguro crypto.getRandomValues em HTTP, com UUID v4 compatível.
- Testes: 21/21 aprovados, incluindo simulação de navegador HTTP sem randomUUID. npm run build aprovado, Vite preview HTTP 200 servindo novo bundle.
- Validação de toque no Safari real: pendente de confirmação do usuário; não considerar concluída.

## GitHub e organização
Este repositório contém somente o aplicativo, testes e documentação técnica
não sensível. Por precaução, foi inicialmente criado **privado**, pois a licença
de redistribuição dos SVGs relacionados a SF Symbols ainda não foi confirmada.
Não ativar GitHub Pages/deploy sem autorização.

Ambiente de desenvolvimento principal:
`/home/vinicius/Projetos/CalculosModularesGitHub`

O MMU completo e a Matriz oficial continuam no diretório local separado
`/home/vinicius/Projetos/CalculosModulares/docs/`. Atualizações de código
devem gerar commits neste repo e atualização separada da Matriz local.

Correção já incorporada: geração segura de IDs em LAN HTTP (newId, Web Crypto).
Testes automatizados: 21/21 na última execução verificada.
Validação real do app no Safari/iPhone ainda pendente.
