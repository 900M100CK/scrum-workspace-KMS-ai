import { spawn } from 'child_process';
import readline from 'readline';
import fs from 'fs';
import path from 'path';

class NotebookLMClient {
  constructor() {
    this.proc = null;
    this.rl = null;
    this.id = 1;
    this.pending = new Map();
  }

  async start() {
    const compatibilityModule = new URL('./notebooklm-domain-compat.mjs', import.meta.url).href;
    const env = {
      ...process.env,
      HEADLESS: 'false',
      NODE_OPTIONS: `${process.env.NODE_OPTIONS || ''} --import=${compatibilityModule}`.trim(),
    };
    // Attempt local npx cache first for fast start, fallback to npx
    const localCachePath = 'C:/Users/MCK/AppData/Local/npm-cache/_npx/0d29dd9f4e472da9/node_modules/notebooklm-mcp/dist/index.js';
    if (fs.existsSync(localCachePath)) {
      this.proc = spawn(process.execPath, [localCachePath], {
        stdio: ['pipe', 'pipe', 'inherit'],
        env
      });
    } else {
      this.proc = spawn('cmd.exe', ['/c', 'npx', '-y', 'notebooklm-mcp@2.0.0'], {
        stdio: ['pipe', 'pipe', 'inherit'],
        env
      });
    }

    const rejectPending = (error) => {
      for (const { reject } of this.pending.values()) reject(error);
      this.pending.clear();
    };
    this.proc.on('error', rejectPending);
    this.proc.on('exit', (code, signal) => {
      rejectPending(new Error(`NotebookLM MCP stopped (code=${code}, signal=${signal}).`));
    });
    this.proc.stdin.on('error', rejectPending);
    this.rl = readline.createInterface({ input: this.proc.stdout });
    this.rl.on('line', (line) => {
      try {
        const msg = JSON.parse(line);
        if (msg.id && this.pending.has(msg.id)) {
          const { resolve, reject } = this.pending.get(msg.id);
          this.pending.delete(msg.id);
          if (msg.error) reject(new Error(msg.error.message || JSON.stringify(msg.error)));
          else resolve(msg.result);
        }
      } catch (e) {
        // Non-JSON logging
      }
    });

    // Initialize MCP handshake
    await this.request('initialize', {
      protocolVersion: '2024-11-05',
      capabilities: {},
      clientInfo: { name: 'notebooklm-sync-cli', version: '1.0.0' }
    });
    this.proc.stdin.write(JSON.stringify({ jsonrpc: '2.0', method: 'notifications/initialized' }) + '\n');
  }

  request(method, params = {}) {
    return new Promise((resolve, reject) => {
      const reqId = this.id++;
      this.pending.set(reqId, { resolve, reject });
      const payload = JSON.stringify({
        jsonrpc: '2.0',
        id: reqId,
        method,
        params
      });
      this.proc.stdin.write(payload + '\n');
    });
  }

  async callTool(name, args = {}) {
    const res = await this.request('tools/call', {
      name,
      arguments: args
    });
    if (res?.isError) {
      throw new Error(res.content?.filter((item) => item.type === 'text').map((item) => item.text).join('\n') || `MCP tool failed: ${name}`);
    }
    if (res?.content?.[0]?.text) {
      try {
        return JSON.parse(res.content[0].text);
      } catch {
        return res.content[0].text;
      }
    }
    return res;
  }

  async getHealth() {
    return await this.callTool('get_health', {});
  }

  async setupAuth() {
    return await this.callTool('setup_auth', { show_browser: true });
  }

  async addSource(options) {
    return await this.callTool('add_source', options);
  }

  close() {
    if (this.proc) {
      this.proc.kill();
    }
  }
}

// Find Markdown files in directory recursively
function getMarkdownFiles(dir) {
  if (fs.statSync(dir).isFile()) {
    if (!/\.(md|mmd)$/i.test(dir)) throw new Error('Expected a Markdown or Mermaid file.');
    return [dir];
  }
  let results = [];
  const list = fs.readdirSync(dir, { withFileTypes: true });
  for (const item of list) {
    const fullPath = path.join(dir, item.name);
    if (item.isDirectory()) {
      if (item.name !== 'node_modules' && item.name !== '.git') {
        results = results.concat(getMarkdownFiles(fullPath));
      }
    } else if (item.isFile() && (item.name.endsWith('.md') || item.name.endsWith('.mmd'))) {
      results.push(fullPath);
    }
  }
  return results;
}

async function main() {
  const args = process.argv.slice(2);
  const command = args[0] || '--help';

  const client = new NotebookLMClient();

  if (command === '--help') {
    console.log(`
NotebookLM Sync Utility
Usage:
  node scripts/notebooklm_sync.mjs --check
    Kiểm tra trạng thái xác thực Google / NotebookLM

  node scripts/notebooklm_sync.mjs --auth
    Mở trình duyệt Chrome để đăng nhập tài khoản Google vào NotebookLM

  node scripts/notebooklm_sync.mjs --upload <NOTEBOOK_URL> [TARGET_DIR_OR_FILE]
    Đẩy toàn bộ file tài liệu (.md, .mmd) lên notebook cụ thể
    Ví dụ:
      node scripts/notebooklm_sync.mjs --upload "https://notebooklm.google.com/notebook/xxxxxxxx" docs
    `);
    process.exit(0);
  }

  console.log('🔄 Đang kết nối tới NotebookLM MCP Server...');

  try {
    await client.start();
    if (command === '--check') {
      const health = await client.getHealth();
      console.log('Kết quả kiểm tra:', JSON.stringify(health, null, 2));
      if (health?.data?.authenticated) {
        console.log('✅ Đã xác thực thành công với Google NotebookLM.');
      } else {
        console.log('⚠️ Chưa xác thực. Hãy chạy: node scripts/notebooklm_sync.mjs --auth');
        process.exitCode = 1;
      }
    } else if (command === '--auth') {
      console.log('🌐 Đang mở trình duyệt để đăng nhập Google...');
      console.log('Vui lòng đăng nhập tài khoản Google trên cửa sổ Chrome vừa mở.');
      console.log('Sau khi đăng nhập xong và chuyển tới trang NotebookLM, cửa sổ sẽ tự động đóng và lưu session.');
      const res = await client.setupAuth();
      console.log('Kết quả setup_auth:', res);
      if (!res?.success || !res?.data?.authenticated) {
        throw new Error(res?.error || 'Authentication was not saved. Keep the login browser open until setup completes.');
      }
      const health = await client.getHealth();
      if (!health?.data?.authenticated) throw new Error('Login completed, but the saved authentication state is missing or expired.');
    } else if (command === '--upload') {
      const notebookUrl = args[1];
      const targetDir = args[2] || 'docs';
      if (!notebookUrl) {
        console.error('❌ Thiếu Notebook URL! Cần truyền URL dạng: https://notebooklm.google.com/notebook/<uuid>');
        process.exitCode = 1;
        return;
      }

      const health = await client.getHealth();
      if (!health?.data?.authenticated) {
        console.error('❌ Chưa đăng nhập Google NotebookLM! Vui lòng chạy --auth trước.');
        process.exitCode = 1;
        return;
      }

      const files = getMarkdownFiles(targetDir);
      console.log(`📚 Tìm thấy ${files.length} tài liệu trong thư mục "${targetDir}".`);
      console.log(`🎯 Notebook mục tiêu: ${notebookUrl}`);

      let successCount = 0;
      let failCount = 0;

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const relativeName = path.relative(process.cwd(), file).replace(/\\/g, '/');
        const content = fs.readFileSync(file, 'utf8');

        console.log(`\n[${i + 1}/${files.length}] Đang tải lên: ${relativeName} (${content.length} bytes)...`);

        try {
          const res = await client.addSource({
            type: 'text',
            title: relativeName,
            content: content,
            notebook_url: notebookUrl,
            show_browser: false
          });

          if (res?.success === true && res?.data?.result?.success === true) {
            console.log(`✅ Thành công: ${relativeName}`);
            successCount++;
          } else {
            console.error(`❌ Thất bại: ${relativeName} -`, res?.error || res?.data?.result?.message || res);
            failCount++;
          }
        } catch (err) {
          console.error(`❌ Lỗi khi gửi file: ${relativeName} -`, err.message);
          failCount++;
        }

        if (failCount > 0) {
          process.exitCode = 1;
          console.error('Upload stopped at the first failure. Inspect the notebook before retrying; an unconfirmed upload may already exist.');
          break;
        }

        // Space out source submissions.
        await new Promise((r) => setTimeout(r, 2000));
      }

      console.log('\n=============================');
      console.log(`🏁 Hoàn tất: ${successCount} thành công, ${failCount} thất bại.`);
      console.log('=============================');
    } else {
      console.error('Lệnh không hợp lệ. Dùng --help để xem hướng dẫn.');
    }
  } finally {
    client.close();
  }
}

main().catch((err) => {
  console.error('Lỗi thực thi:', err);
  process.exit(1);
});
