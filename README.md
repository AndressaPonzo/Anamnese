# Anamnese por voz

Você faz a pergunta em voz alta, o paciente responde, e a fala dele é transcrita na resposta. No final, gera um relatório TXT.

## Fluxo
1. Abra `index.html` no Google Chrome ou no Microsoft Edge (ou use o link do GitHub Pages).
2. **Novo paciente:** nome, demanda, sexo e idade (opcionais) e a confirmação do consentimento por escrito.
3. **Copie o comando** `MODO PERGUNTAS — ...` e rode no projeto Mapeamento RB7, na conversa deste paciente. O nome não vai no comando.
4. Cole a resposta da IA no site e clique em **Ler perguntas**. Na prévia, desmarque as que repetem a sua base.
5. **Montar roteiro e iniciar:** abertura, dados básicos, 3 primeiras perguntas da queixa, perguntas da IA, exploração do muro e fechamento.
6. Faça a anamnese por voz e clique em **Gerar relatório TXT**. O TXT identifica o paciente só pela inicial.

Os atendimentos ficam salvos no navegador deste aparelho. Use **Exportar backup** de vez em quando.

## Arquivos
- `roteiros/base.js`: as perguntas fixas (antes e depois das geradas). Edite aqui para mudar a sua base.
- `parser.js`: lê a resposta do MODO PERGUNTAS.
- `app.js`, `index.html`, `estilo.css`: o site.

## Publicar no GitHub Pages
Settings → Pages → Deploy from a branch → `main` / root. No plano gratuito o repositório precisa ser público.

## Privacidade
- O `.gitignore` bloqueia TXT e backups. Nunca suba dados de pacientes.
- O site não contém o manual nem o prompt do RB7, só as perguntas de `roteiros/base.js`. Se não puder divulgá-las, descomente essa linha no `.gitignore`.
- Chrome e Edge enviam o áudio ao serviço de voz deles para transcrever. Avise o paciente.
