interface Logger {
  log(message: string): void;
}

class ConsoleLogger implements Logger {
  public log(message: string): void {
    console.log(message)
  }
}

let logger: Logger;

class LoggerFactory {
  public static getInstance(): Logger {
    if (!logger)
      logger = new ConsoleLogger()
    return logger;
  }
}

const log = LoggerFactory.getInstance();

export function Log() {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const targetMethod = descriptor.value;

    descriptor.value = function (...args: any[]) { // zapetlamy decorator by wywolywal sie za kazdym razem
      log.log(`Wywołuje funkcje: ${propertyKey}`);
      return targetMethod.apply(this, args);
    }

    //propertyKey nazwa czlonka
    //target to odnosci sie do naszej klasy calej w ktorej jest czlonek
    //descriptor odnosi sie do Object.defineProperty
  }
}