# Liftly — correções de 01/10/2026

## O que mudou
- Divisões, grupos, históricos e mensagens usam uma chave de envio para que tentativas repetidas retornem o mesmo registro. O banco serializa requisições com a mesma chave, inclusive entre instâncias da API.
- Botões de salvar e finalizar ficam bloqueados durante o envio. A confirmação do treino não abre várias vezes.
- Cadastro, alterações de peso e entrada em grupos possuem bloqueios de transação para evitar duplicação por requisições simultâneas.
- Exercícios repetidos na divisão são recusados também pela API. IDs de exercícios não se repetem dentro da mesma ficha.
- Consultas de coleções do histórico evitam multiplicação de exercícios e séries por junções de listas.
- Chat combina mensagens pelo ID e preserva mensagens recebidas durante uma atualização, sem duplicá-las.
- Fotos podem ser enviadas com ou sem legenda. Há prévia, remoção antes do envio e ampliação em modal.
- JPEG, PNG ou WebP de até 10 MB são convertidos no aplicativo para JPEG, reduzidos para até 1280 px e limitados a 500 KB. A API confere o formato, o tamanho e o conteúdo real da imagem.
- Fotos são armazenadas no PostgreSQL junto à mensagem. Não dependem de uma pasta temporária do servidor.
- Balões, área de conversa, nomes longos, campo de mensagem, botões e margens foram ajustados para telas pequenas e grandes, mantendo os temas existentes.

## Como usar
Atualize o frontend e a API juntos. O aplicativo antigo continua podendo enviar texto, mas não fornece a proteção de reenvio dos novos clientes.

### API
Requisitos originais: Java 21, Maven Wrapper e PostgreSQL.
Configure DATABASE_URL (URL JDBC PostgreSQL), DATABASE_USERNAME e DATABASE_PASSWORD no ambiente. O application.properties original foi preservado.
No Windows: `mvnw.cmd spring-boot:run`. Em Linux/macOS: `bash mvnw spring-boot:run`.
Com DDL_AUTO=update, a coluna mensagem_grupo.imagem (TEXT) será criada pelo Hibernate. Se usar validate/none, crie a coluna antes de iniciar: `ALTER TABLE mensagem_grupo ADD COLUMN IF NOT EXISTS imagem TEXT;`.

Testes das mudanças: `mvnw.cmd -Dtest=ImagemChatServiceTests,MensagemGrupoControllerTests test` (ou `bash mvnw` no Linux).

### Aplicativo
Na pasta do frontend: `npm ci`, depois `npm start -- --host 0.0.0.0 --port 8100`.
O ambiente de desenvolvimento usa localhost:8080/api. Para acessar pelo celular na rede, ajuste environment.ts para o IP do computador.
Para produção: `npm run build`. O endereço original do Render em environment.prod.ts foi preservado; atualize se a API mudar.

## Duplicações já existentes no banco
Não houve acesso ao seu banco real. Nenhum registro existente foi apagado.
A pasta manutencao da API inclui:
- diagnosticar_duplicacoes.sql: consulta associações de membros, e-mails e possíveis históricos repetidos sem alterar dados.
- corrigir_membros_repetidos.sql: após backup e com a API parada, remove apenas associações idênticas de membros e cria um índice único. Execute manualmente se o diagnóstico mostrar esse problema.
Históricos ou contas repetidos precisam ser revisados antes de qualquer exclusão, porque podem ter dados relacionados ou sessões legítimas.

## Validação realizada
- Build de produção do Angular/Ionic: aprovado.
- API: compilação e 7 testes novos aprovados. O ambiente disponibilizava Java 17, portanto a validação usou -Djava.version=17 sem alterar o requisito Java 21 no projeto.
- Lógica real do chat verificada com respostas simuladas: clique duplo, atualização concorrente, mensagens únicas, limpeza do campo, foto sem legenda, chave preservada na tentativa após erro e bloqueio de mensagem vazia.
- Não foi possível executar o navegador de testes; inspeção visual final em 320/390/1280 px ficou pendente.
- Integração e concorrência com um PostgreSQL real e execução no aparelho ficaram pendentes.

## Observação de uso
O chat exibe as últimas 100 mensagens e atualiza a cada 5 segundos, como no projeto original. Como fotos são guardadas e retornadas junto às mensagens, conversas com muitas imagens consomem mais tráfego e espaço no banco.

## Ajuste solicitado depois da entrega
- Removido o botão com ✓ do canto superior da tela de criar/editar divisão. O botão Salvar divisão no final da página permanece.
- Removida a opção Sistema. Agora há apenas Claro e Escuro.
- Escuro é o padrão para novos acessos e para quem usava Sistema. A escolha explícita de Claro continua salva.
- Nenhum novo teste ou build foi executado nesta alteração, conforme solicitado.
