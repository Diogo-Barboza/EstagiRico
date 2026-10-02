# 📚 Documentação Oficial — EstagiRico

Bem-vindo à pasta `/docs` do repositório **EstagiRico**. Aqui você encontra toda a documentação de arquitetura, segurança, mapeamento de inconsistências e guias operacionais do projeto.

---

## 📑 Índice de Documentos

1. [**Arquitetura e Topologia da Aplicação**](./ARQUITETURA_E_TOPOLOGIA.md)
   - Visão geral da arquitetura SPA + Supabase BaaS.
   - Diagrama de Topologia de Rede e Infraestrutura.
   - Modelagem C4 (Contêineres e Componentes Frontend).
   - Modelo de Dados Relacional (PostgreSQL ERD).
   - Motor de Regras de Negócio e Lógica dos Ciclos de Faturamento Dinâmico (`closing_day`).
   - Stack tecnológica e versões de pacotes.

2. [**Avaliação de Segurança do Projeto**](./AVALIACAO_SEGURANCA.md)
   - Avaliação de segurança em todos os ciclos de vida (Autenticação, Consulta, Modificação, Compartilhamento).
   - Políticas mandatórias de Row Level Security (RLS) no PostgreSQL.
   - Auditoria de chaves de API, credenciais e tokens JWT.
   - Análise de vulnerabilidades (IDOR, BOLA, XSS, integridade de dados).
   - Matriz STRIDE de riscos adaptada ao EstagiRico.
   - Recomendações e checklist de segurança.

3. [**Pontos Fracos e Inconsistências Técnicas**](./PONTOS_FRACOS_E_INCONSISTENCIAS.md)
   - Análise aprofundada da **Issue #5** (Bug da deleção de compras parceladas).
   - Código morto e variáveis estáticas não utilizadas (`selectedMonth = "2026-08"` em `App.tsx`).
   - Dependências não utilizadas no bundle (`@mui/material`).
   - Monolito de estado no componente `App.tsx`.
   - Inconsistência na exclusão de pessoas com despesas associadas.
   - Limitações de UX (uso de diálogos nativos `alert` e `confirm`).

4. [**Contexto de Desenvolvimento Operacional (Tasks 2 e 3)**](./CONTEXTO_DESENVOLVIMENTO_TASKS.md)
   - Guia passo a passo para a correção do bug da **Issue #5** na branch de bugfix.
   - Guia passo a passo para a implementação da feature da **Issue #6** (Link expirável 24h para auditoria de terceiros).
   - Arquitetura do token de auditoria, payload, telas públicas e rotas.

---

*Documentação gerada com conformidade aos padrões de arquitetura de software e segurança de dados.*
