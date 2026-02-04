# Deploy na Vercel

O app Next.js está na **raiz** do repositório (`app/`, `components/`, `package.json`, `next.config.js`, etc.). A Vercel detecta o Next.js e faz o build automaticamente — **não é necessário configurar Root Directory**.

Após conectar o repositório à Vercel, cada push na branch configurada gera um deploy. O site deve responder em **https://habithub-analytics.vercel.app/** (ou no domínio do seu projeto).

Se ainda aparecer 404, confira no painel da Vercel se o último deploy terminou com sucesso (status **Ready**) e se a branch é a correta.
