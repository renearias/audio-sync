const WORKER_ENABLED = !!(URL && Blob && Worker);

export class InlineWorker extends Worker {

  constructor(func: any) {
    let functionBody;

    if (WORKER_ENABLED) {
      const funcString = func.toString().trim();
      functionBody = funcString.slice(
        funcString.indexOf('{') + 1,
        funcString.lastIndexOf('}')
      );

      super(
        URL.createObjectURL(
          new Blob([functionBody], { type: 'text/javascript' })
        )
      );
    }
  }

  // postMessage(data: MessageEvent) {
  //   setTimeout(() => {
  //     this.onmessage(data);
  //   }, 0);
  // }
}
