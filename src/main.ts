import HotkeyRecorder from './hotkeyRecorder';
import OVMSManager from './ovmsManager';

async function main(): Promise<void> {
  const ovmsManager = new OVMSManager();
  let recorder: HotkeyRecorder | undefined;
  let shuttingDown = false;
  const shutdown = async (exitCode: number) => {
    if (shuttingDown) return;
    shuttingDown = true;
    try { await recorder?.unregister(); }
    catch (error) { console.error('Recorder cleanup failed:', error); exitCode = 1; }
    finally { await ovmsManager.stop(); }
    process.exit(exitCode);
  };
  process.on('SIGINT', () => { void shutdown(0); });
  process.on('SIGTERM', () => { void shutdown(0); });
  try {
    recorder = new HotkeyRecorder();
    await ovmsManager.start();
    if (shuttingDown) return;
    await recorder.start();
    console.log('\nPress Ctrl+C to exit...');
  } catch (error) {
    console.error('Fatal error:', (error as Error).message);
    await shutdown(1);
  }
}

void main();
