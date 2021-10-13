export type Resolve<T> = (value?: T | PromiseLike<T>) => void;
type PromiseAndResolve<T> = [Promise<T>, Resolve<T>];

export function resolveLater<T = void>(): PromiseAndResolve<T> {
  let resolve;
  const promise = new Promise<T>(resolveCallback => {
    resolve = resolveCallback;
  });
  return [promise, resolve];
}

function onlyOnce<V>(fn: (...args) => V) {
    let invoked = false;
    let result: V;
    return (...args) => {
      if (!invoked) {
        result = fn(...args);
        invoked = true;
      }
      return result;
    };
  }
  
  export function iterateLater<T>(): [AsyncIterable<T>, Resolve<T>, () => void] {
    const queue = [resolveLater<T>()];
    let resolveIndex = -1;
    let [nextAssigned, flagNextAssigned] = resolveLater<boolean>();
    const next: Resolve<T> = value => {
      const [[_, resolve]] = queue.slice(resolveIndex);
      resolve(value);
      queue.unshift(resolveLater<T>());
      flagNextAssigned(true);
      [nextAssigned, flagNextAssigned] = resolveLater<boolean>();
    };
    const iterate = async function* () {
      while ((await nextAssigned) || queue.length > 0) {
        const [nextValue] = queue.pop() as PromiseAndResolve<T>;
        yield await nextValue;
        resolveIndex--;
      }
    };
    const complete = () => {
      queue.shift();
      flagNextAssigned(false);
    };
    return [iterate(), next, onlyOnce(complete)];
  }
  
  interface ObservableLike<T> {
    subscribe(next: (value?: T) => void, error: (error: any) => void, complete: () => void);
  }
  
  export function asyncIterableFromObservable<T>(observable: ObservableLike<T>) {
    const [iterable, next, complete] = iterateLater<T>();
    observable.subscribe(next, error => next(Promise.reject(error)), complete);
    return iterable;
  }
  
  export function toAsyncIterable<T>(value: T | Promise<T> | T[] | Promise<T>[]): AsyncIterable<T> {
    let iterate: () => AsyncIterable<T>;
    if (Array.isArray(value)) {
      iterate = async function* () {
        for (const element of value) {
          yield await element;
        }
      };
    } else {
      iterate = async function* () {
        yield await value;
      };
    }
    return iterate();
  }
  
  export function partition<T>(index: number, iterable: AsyncIterable<T>) {
    let current = 0;
    const [partitionFirst, nextFirst, completeFirst] = iterateLater<T>();
    const [partitionSecond, nextSecond, completeSecond] = iterateLater<T>();
    const iterate = async () => {
      for await (const value of iterable) {
        if (current == index) {
          completeFirst();
        }
        if (current < index) {
          nextFirst(value);
        } else {
          nextSecond(value);
        }
        current++;
      }
      completeFirst();
      completeSecond();
    };
    iterate();
    return [partitionFirst, partitionSecond];
  }