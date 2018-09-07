export function snooze(ms?: number) {
    new Promise(resolve => setImmediate(resolve))
}