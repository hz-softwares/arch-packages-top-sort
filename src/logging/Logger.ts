export class Logger {
  constructor() {
    console.log('creae logger')
  }
  log(value: string) { console.log(value) }
}

export const logger = new Logger();
