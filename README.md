# Anamnese por voz

Você faz a pergunta em voz alta, o paciente responde, e a fala dele é transcrita na resposta da pergunta. No final, gera um relatório TXT.

## Como usar
1. Abra `index.html` no Google Chrome ou no Microsoft Edge (ou use o link do GitHub Pages).
2. Escolha o roteiro e clique em **Novo atendimento**.
3. Faça a pergunta, clique em **Gravar resposta do paciente**, depois **Próxima**.
4. Clique em **Gerar relatório TXT** quando terminar.

Os atendimentos ficam salvos no navegador deste aparelho. Use **Exportar backup** de vez em quando e **Importar backup** para levar para outro aparelho.

## Adicionar um roteiro
1. Copie `roteiros/modelo.js`, mude o `id` e o `nome` e edite as perguntas.
2. Em `index.html`, adicione a linha `<script src="roteiros/seu-arquivo.js"></script>` antes de `app.js`.

Também dá para carregar um roteiro em `.json` pelo botão **Carregar roteiro** (vale até recarregar a página). Formato: `{"nome":"...","secoes":[["Título","Objetivo","Anotação",["Pergunta"]]]}`.

## Publicar no GitHub Pages
Settings → Pages → Deploy from a branch → `main` / root. O repositório precisa ser público no plano gratuito.

## Privacidade
- Nenhum dado de paciente vai para o repositório: o `.gitignore` bloqueia os TXT e os backups.
- Para não publicar o roteiro RB7, descomente `roteiros/rb7.js` no `.gitignore` antes do primeiro commit e carregue o roteiro só no seu computador.
- Chrome e Edge enviam o áudio ao serviço de voz deles para transcrever. Avise o paciente e peça consentimento.
