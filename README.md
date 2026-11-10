# IHS - Instituto Harmonia do Ser

Site com painel de administração (`/admin`) para editar WhatsApp, foto, textos e contatos sem mexer em código.

- `index.html` é o site.
- `admin/index.html` é o painel.
- `api/` são as funções da Vercel (login, leitura e gravação das configurações).
- As configurações e a foto ficam no **Vercel Blob** (armazenamento da própria Vercel).

## Publicar na Vercel

1. Envie este projeto para um repositório no GitHub.
2. Na Vercel: **Add New → Project**, escolha o repositório e clique em **Deploy** (não precisa mudar nenhuma configuração).
3. No projeto, abra **Storage → Create → Blob**, deixe o acesso **Public** e conecte ao projeto. Isso cria a variável `BLOB_READ_WRITE_TOKEN` sozinha.
4. Em **Settings → Environment Variables**, crie:
   - `ADMIN_PASSWORD`: a senha que você vai usar para entrar no painel (escolha uma longa).
   - `SESSION_SECRET` (opcional): qualquer texto longo e aleatório.
5. Em **Deployments**, clique nos três pontinhos do último deploy e em **Redeploy**.
6. Acesse `seusite.com.br/admin`, entre com a senha e preencha WhatsApp, foto e textos.

## Rodar no computador

```bash
npm install
npx vercel dev
```
