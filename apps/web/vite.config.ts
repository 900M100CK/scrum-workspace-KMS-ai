import { defineConfig } from 'vite';
import { localHttps } from './dev/https.ts';

export default defineConfig(() => {
 const https = localHttps(process.env);
 return {
  build: { outDir: 'dist', emptyOutDir: true },
  server: {
   ...(https ? {https} : {}),
   fs: { strict: true, deny: ['.env', '.env.*', '*.{crt,pem,key,p12,pfx,cer,der}', '.npmrc', '.yarnrc.yml', '**/.git/**', '**/.tmp/**'] },
   proxy: {'^/api(?:/|$)': {target:'http://127.0.0.1:3001',rewrite:path=>path.replace(/^\/api(?=\/|$)/, '') || '/'}},
  },
 };
});
