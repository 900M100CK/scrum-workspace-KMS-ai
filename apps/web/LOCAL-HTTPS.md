# Local same-origin HTTPS

P07 transport setup supports the owner-selected `__Host-` cookie direction. It does not implement sessions or relax Secure-cookie settings for HTTP. Plain HTTP remains available for the original UI scaffold; use HTTPS for subsequent cookie integration. The public API base is `/api`; Vite removes that prefix and sends only to Workspace at `127.0.0.1:3001`. Knowledge remains behind Workspace.

Use Node 24+ with the existing root installation. Generate a development-only certificate under the ignored repository `.tmp/local-https/` directory. With OpenSSL available, save this public configuration as `.tmp/local-https/localhost.cnf`:

```ini
[req]
prompt=no
distinguished_name=dn
x509_extensions=ext
[dn]
CN=localhost
[ext]
subjectAltName=DNS:localhost,IP:127.0.0.1
basicConstraints=critical,CA:TRUE
keyUsage=critical,digitalSignature,keyEncipherment,keyCertSign
extendedKeyUsage=serverAuth
```

From the repository root, generate the key/certificate without publishing either file:

```powershell
New-Item -ItemType Directory -Force .tmp/local-https
openssl req -x509 -newkey rsa:2048 -nodes -days 30 -config .tmp/local-https/localhost.cnf -keyout .tmp/local-https/localhost.key -out .tmp/local-https/localhost.crt
$env:SACW_DEV_TLS_KEY = (Resolve-Path .tmp/local-https/localhost.key).Path
$env:SACW_DEV_TLS_CERT = (Resolve-Path .tmp/local-https/localhost.crt).Path
npm run dev:web
```

In another terminal, run `npm run dev:workspace`. Open `https://localhost:5173`. The certificate is self-signed: a browser needs an explicit local trust decision before browser acceptance tests can claim trusted HTTPS. This setup does not install a CA into the operating system or browser. Never use the development key/certificate in deployment. The automated HTTPS client trusts only the supplied public certificate; do not disable certificate verification globally.

With those two environment variables set, `npm run test:foundation` includes the real HTTPS/proxy test against an isolated Workspace port. It serves the UI, checks `/api/healthz`, observes 503 for unconfigured `/api/session`, and denies private-key reads through Vite's filesystem endpoint. Without TLS variables that transport test reports a skip; ordinary component/liveness tests do not replace it. Partial certificate configuration or unreadable files fails explicitly. Existing Vite secret-deny patterns are retained and `.tmp` is also denied.

The session implementation must use same-origin `/api/session`, configured permitted Origin and the selected custom header. Starting values `SESSION_IDLE_SECONDS=1800` and `SESSION_ABSOLUTE_SECONDS=28800` are validated server configuration, not a risk-analysis result. P07 provides only clock/password-verifier ports; it adopts no concrete KDF, time guard, account lock/disable policy, DB driver, migration or session handler. P08/P10 retain their detailed design gates. A same-origin proxy smoke is not browser Secure-cookie or CSRF acceptance.

P09 now implements POST/GET through the Workspace proxy when its runtime DB/origin are explicitly configured; see services/workspace/SESSION-HTTP.md. The web UI remains pending. No startup migration or operator time reset is automatic.

P11 connects the React session UI to POST/GET/DELETE /api/session. Browser TLS warnings require an explicit owner trust decision; the agent cannot bypass them or install a CA as incidental testing. Node HTTPS integration trusts only the fixture certificate and is reported separately from real browser behavior. See the P11 result for current browser disposition.
