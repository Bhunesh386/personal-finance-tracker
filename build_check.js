const { execSync } = require('child_process');
try {
  const r = execSync('npx vite build', { cwd: '.', stdio: 'pipe', encoding: 'utf8' });
  require('fs').writeFileSync('build_result.txt', 'SUCCESS\n' + r, 'utf8');
} catch(e) {
  require('fs').writeFileSync('build_result.txt', 'FAILED\n' + (e.stdout || '') + (e.stderr || ''), 'utf8');
}
