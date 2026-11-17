/**
 * Prepara o emulador Android e abre o app no Expo Go.
 *  1. `adb reverse` das portas da API (3000) para o emulador alcançar o back-end no PC;
 *  2. `expo start --android`.
 */
const { spawnSync, spawn } = require('child_process');
const path = require('path');

const sdk = process.env.ANDROID_HOME || process.env.ANDROID_SDK_ROOT;
const adb = sdk
  ? path.join(sdk, 'platform-tools', process.platform === 'win32' ? 'adb.exe' : 'adb')
  : 'adb';
const apiPort = (process.env.API_PORT || '3000').toString();

const devices = spawnSync(adb, ['devices'], { encoding: 'utf8' });
if (devices.error || devices.status !== 0) {
  console.warn('[dev-android] adb não encontrado. Defina ANDROID_HOME ou adicione platform-tools ao PATH.');
} else if (!/\tdevice\b/.test(devices.stdout)) {
  console.warn('[dev-android] Nenhum emulador ativo. Abra o AVD no Android Studio (Device Manager) primeiro.');
} else {
  const reverse = spawnSync(adb, ['reverse', `tcp:${apiPort}`, `tcp:${apiPort}`], { encoding: 'utf8' });
  console.log(
    reverse.status === 0
      ? `[dev-android] adb reverse tcp:${apiPort} OK (emulador acessa a API em localhost:${apiPort})`
      : `[dev-android] adb reverse falhou: ${reverse.stderr || reverse.stdout}`,
  );
}

const cmd = process.platform === 'win32' ? 'npx.cmd' : 'npx';
spawn(cmd, ['expo', 'start', '--android'], { stdio: 'inherit', shell: process.platform === 'win32' }).on(
  'exit',
  (code) => process.exit(code ?? 0),
);
