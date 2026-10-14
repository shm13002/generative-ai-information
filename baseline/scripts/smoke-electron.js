// Launches the real Electron app under Xvfb (if needed) with BRIM_SMOKE=1; exits 0 when the overlay rendered.
import { spawn } from 'node:child_process'; import electron from 'electron';
const args = ['.', '--no-sandbox', '--disable-gpu']; const env = { ...process.env, BRIM_SMOKE: '1' };
const useX = process.platform === 'linux' && !process.env.DISPLAY;
const p = useX ? spawn('xvfb-run', ['-a', electron, ...args], { env, stdio: 'inherit' }) : spawn(electron, args, { env, stdio: 'inherit' });
p.on('exit', (c) => process.exit(c ?? 1));
