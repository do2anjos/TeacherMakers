const path = require('path');
const { execFileSync, spawn } = require('child_process');
const net = require('node:net');

const projectRoot = path.resolve(__dirname, '..');
const backendRoot = path.join(projectRoot, 'Back');
const frontendRoot = path.join(projectRoot, 'Front', 'public');
// Carrega o .env do backend para que o log reflita a mesma configuração usada pelo servidor.
const dotenvPath = require.resolve('dotenv', { paths: [backendRoot] });
require(dotenvPath).config({ path: path.join(backendRoot, '.env') });
const expressPath = require.resolve('express', { paths: [backendRoot] });
const nodemonPath = require.resolve('nodemon/bin/nodemon.js', { paths: [backendRoot] });
const express = require(expressPath);
const app = express();
const frontendPort = Number(process.env.FRONTEND_PORT || 3000);
const backendPort = Number(process.env.PORT || 5000);
const frontendOnly = process.argv.includes('--frontend-only');

app.use(express.static(frontendRoot, { extensions: ['html'] }));

console.log(JSON.stringify({
  component: 'start-local',
  environment: process.env.NODE_ENV || 'development',
  diagnosticQuestionsConfigured: Boolean(process.env.DIAGNOSTIC_QUESTIONS_FILE),
  draftAuthorizationEnabled: process.env.DIAGNOSTIC_ALLOW_DRAFT_CONTENT === 'true'
}));

let frontendServer;
let backend;
let backendExited = frontendOnly;
let backendExitCode = null;
let backendExitSignal = null;
let frontendClosed = false;
let shuttingDown = false;
let requestedSignal = null;
let forceStopTimer;

function finishIfStopped() {
  if (!frontendClosed || !backendExited) return;
  clearTimeout(forceStopTimer);
  if (requestedSignal && backendExitCode === 0 && !backendExitSignal) {
    process.exitCode = 0;
  } else if (backendExitSignal) {
    process.exitCode = 1;
  } else {
    process.exitCode = backendExitCode ?? 0;
  }
}

function closeFrontend() {
  if (frontendClosed || !frontendServer) return;
  frontendServer.close(() => {
    frontendClosed = true;
    finishIfStopped();
  });
}

function findPortOwner(port) {
  if (process.platform !== 'win32') return null;
  try {
    const lines = execFileSync('netstat.exe', ['-ano', '-p', 'tcp'], {
      encoding: 'utf8', windowsHide: true, timeout: 3000
    }).split(/\r?\n/);
    for (const line of lines) {
      const columns = line.trim().split(/\s+/);
      if (columns.length < 5 || columns[0] !== 'TCP' || columns[3] !== 'LISTENING') continue;
      const localPort = Number(columns[1].slice(columns[1].lastIndexOf(':') + 1));
      const pid = Number(columns[4]);
      if (localPort !== port || !Number.isSafeInteger(pid)) continue;
      let name = 'processo desconhecido';
      try {
        const row = execFileSync('tasklist.exe', ['/FI', `PID eq ${pid}`, '/FO', 'CSV', '/NH'], {
          encoding: 'utf8', windowsHide: true, timeout: 3000
        }).trim();
        name = row.match(/^"([^"]+)"/)?.[1] || name;
      } catch (_) { /* The PID is still useful if tasklist cannot return its name. */ }
      let process = name;
      if (name.toLowerCase() === 'node.exe') {
        try {
          const script = `$owner = Get-CimInstance Win32_Process -Filter "ProcessId = ${pid}"; if ($owner.CommandLine -match '(?i)start-local\.js') { 'scripts/start-local.js' } elseif ($owner.CommandLine -match '(?i)src[/\\\\]server\.js') { 'src/server.js' }`;
          const entrypoint = execFileSync('powershell.exe', ['-NoProfile', '-NonInteractive', '-Command', script], {
            encoding: 'utf8', windowsHide: true, timeout: 3000
          }).trim();
          if (entrypoint) process = `${entrypoint} (${name})`;
        } catch (_) { /* Do not expose the full command line or fail port detection. */ }
      }
      return { pid, name, process };
    }
  } catch (_) { /* Report the occupied port even when Windows process lookup is unavailable. */ }
  return null;
}

function isPortAvailable(port) {
  return new Promise((resolve, reject) => {
    const probe = net.createServer();
    probe.once('error', (error) => {
      if (error.code === 'EADDRINUSE') resolve(false);
      else reject(error);
    });
    probe.listen(port, () => probe.close((error) => error ? reject(error) : resolve(true)));
  });
}

async function checkPort(port, service) {
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    console.error(JSON.stringify({ component: 'start-local', event: 'invalid_port', service, port }));
    return false;
  }
  try {
    if (await isPortAvailable(port)) return true;
  } catch (error) {
    console.error(JSON.stringify({ component: 'start-local', event: 'port_check_failed', service, port, message: error.message }));
    return false;
  }
  const owner = findPortOwner(port);
  console.error(JSON.stringify({
    component: 'start-local', event: 'port_in_use', service, port,
    ...(owner || { pid: null, process: 'não identificado' }),
    action: 'Nenhum processo foi encerrado automaticamente.'
  }));
  return false;
}

function forceStopBackendTree() {
  if (!backend || backendExited) return;
  if (process.platform === 'win32' && backend.pid) {
    const killer = spawn('taskkill.exe', ['/PID', String(backend.pid), '/T', '/F'], {
      stdio: 'ignore', windowsHide: true
    });
    killer.once('error', () => backend?.kill('SIGKILL'));
  } else {
    backend.kill('SIGKILL');
  }
}

function shutdown(signal) {
  if (shuttingDown) return;
  shuttingDown = true;
  requestedSignal = signal;
  closeFrontend();

  if (!backend || backendExited) {
    backendExited = true;
    finishIfStopped();
    return;
  }

  backend.kill(signal);
  forceStopTimer = setTimeout(() => {
    forceStopBackendTree();
  }, 5000);
  forceStopTimer.unref();
}

process.once('SIGINT', () => shutdown('SIGINT'));
process.once('SIGTERM', () => shutdown('SIGTERM'));

async function start() {
  const portsAvailable = await checkPort(frontendPort, 'frontend') &&
    (frontendOnly || await checkPort(backendPort, 'backend'));
  if (!portsAvailable) {
    process.exitCode = 1;
    backendExited = true;
    frontendClosed = true;
    return;
  }

  frontendServer = app.listen(frontendPort);
  frontendServer.once('error', (error) => {
    const owner = error.code === 'EADDRINUSE' ? findPortOwner(frontendPort) : null;
    console.error(JSON.stringify({
      component: 'start-local', event: error.code === 'EADDRINUSE' ? 'port_in_use' : 'frontend_start_failed',
      service: 'frontend', port: frontendPort, code: error.code, message: error.message,
      ...(owner || { pid: null, process: 'não identificado' })
    }));
    process.exitCode = 1;
    backendExited = true;
    closeFrontend();
  });
  frontendServer.once('listening', () => {
    console.log(`Frontend em http://localhost:${frontendPort}`);
    if (frontendOnly) return;

    backend = spawn(process.execPath, [nodemonPath, '--exitcrash', '--config', 'nodemon.json', 'src/server.js'], {
      cwd: backendRoot,
      env: { ...process.env },
      stdio: 'inherit',
      windowsHide: true
    });
    backendExited = false;

    backend.once('error', (error) => {
      console.error(`Falha ao iniciar o backend: ${error.message}`);
      backendExited = true;
      backendExitCode = 1;
      shuttingDown = true;
      closeFrontend();
    });

    backend.once('exit', (code, signal) => {
      backendExited = true;
      backendExitCode = code;
      backendExitSignal = signal;
      if (!shuttingDown) {
        console.error(JSON.stringify({
          component: 'start-local',
          event: 'backend_process_exited',
          exitCode: code,
          signal
        }));
        shuttingDown = true;
        closeFrontend();
      }
      finishIfStopped();
    });
  });
}

start().catch((error) => {
  console.error(`Falha ao iniciar TeacherMakers: ${error.message}`);
  process.exitCode = 1;
  backendExited = true;
  frontendClosed = true;
});
