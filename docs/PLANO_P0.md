# Plano P0 — Cálculos Modulares

## Primeiro incremento — 2026-11-05

| Entrega | Estado | Evidência |
|---|---|---|
| Repositório Git isolado | ✅ feito | /home/vinicius/Projetos/CalculosModulares |
| MMU original V0.0.12 íntegro | ✅ feito | docs/MMU_ORIGINAL_V0.0.12.zip; 580 arquivos, 501 SVGs |
| Biblioteca de quadros | ✅ código implementado | src/App.tsx |
| Meta financeira | ✅ código implementado | src/App.tsx e src/domain/math.ts |
| Calculadora | ✅ código implementado | src/App.tsx e src/domain/math.ts |
| Campos pt-BR e decimais seguros | ✅ código implementado | src/components/AmountInput.tsx; numbers.ts |
| Autosave IndexedDB | ✅ código implementado | src/storage/db.ts e writeQueue.ts |
| PWA offline — artefatos | ✅ gerados | dist/sw.js; manifest.webmanifest |
| Testes unitários | ✅ 21/21 aprovados | npm test |
| Build de produção | ✅ aprovado | npm run build |
| HTTP local | ✅ verificado | http://127.0.0.1:4173/ = HTTP 200 |
| Teste visual Safari/iPhone | ⚠️ pendente | precisa validação no aparelho |
| Prova de persistência após fechar no iPhone | ⚠️ pendente | não declarada como concluída |
| Prova de offline instalado no iPhone | ⚠️ pendente | requer origem segura / HTTPS |
| Matriz personalizada V0.0.1 no MacBook | ⚠️ pendente | ZIP gerado no chat, não copiado ao notebook |
| Backup automático | ⚠️ P3 | não implementado |

## Regras de cálculo
- Arredondamento de exibição BRL: 2 casas decimais, HALF_UP; operações com Decimal.
- Meta <= 0: percentual indisponível, total ainda exibido.
- Barra: valor visual entre 0 e 100%, mas percentual exibido verdadeiro.
- Entradas vazias/invalidas: cálculo indisponível, nunca zero silencioso.
- Inversão de operandos: mantém operação e demais configurações.

## Limites
Não existe drag-and-drop, editor de módulos, conexões entre blocos, backup automático,
login ou nuvem. Nenhuma publicação externa. SVGs do MMU sem licença de distribuição verificada.

## Próximo passo mínimo
Abrir prévia pelo iPhone na rede Wi-Fi do MacBook, testar meta/calculadora
e verificar reabertura. Depois registrar achados, garantir proteção de dados e
integrar Matriz personalizada antes de expandir P1.

## Correção de interação HTTP local — 2026-11-06
- Causa identificada: src/domain/boards.ts e src/App.tsx dependiam diretamente de crypto.randomUUID(), disponível apenas em contextos seguros; HTTP pelo IP 192.168.15.5 não é origem segura.
- Correção aplicada: função newId() usa crypto.randomUUID quando disponível e fallback criptograficamente seguro crypto.getRandomValues em HTTP, com UUID v4 compatível.
- Testes: 21/21 aprovados, incluindo simulação de navegador HTTP sem randomUUID. npm run build aprovado, Vite preview HTTP 200 servindo novo bundle.
- Validação de toque no Safari real: pendente de confirmação do usuário; não considerar concluída.
