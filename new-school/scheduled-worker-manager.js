/*
  Pipes the result of an input resolver to the
  HSL Worker at the specified interval, when an
  external condition is met, then pipe the result
  of the processing to an external process.
  It waits `msBetweenRuns` to run. It returns
  methods and identifiers sufficient for stopping
  or restarting the run loop.
*/
export default function scheduledWorkerManager ({
  receiveData,
  msBetweenRuns,
  getInput,
  getShouldRun
} = { }) {
  const worker = new Worker('js/hslWorker.js')

  worker.addEventListener('message', ({ data }) => receiveData(data))

  const shouldRun    = () => !getShouldRun || getShouldRun()
  const maybeRun     = () => {
    if(shouldRun()) {
      worker.postMessage(getInput())
    }
  }
  const startRunLoop = () => setInterval(maybeRun, msBetweenRuns)

  const intervalID = startRunLoop()

  maybeRun()

  return {
    intervalID,
    maybeRun,
    startRunLoop,
    worker // You can call `terminate`, `onerror` etc. on this
  }
}
