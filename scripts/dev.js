// #!/usr/bin/env node
/**
 * 开发模式 - 直接运行源码，简单快速
 */

import { exec } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.dirname(__dirname);

console.log('🚀 启动开发模式...\n');

// 直接使用 tsx 运行
const command = `npx tsx src/entrypoints/cli.tsx ${process.argv.slice(2).join(' ')}`;
console.log(`执行命令: ${command}\n`);

exec(command, {
  cwd: rootDir,
  stdio: 'inherit'
}, (error) => {
  if (error) {
    process.exit(1);
  }
});