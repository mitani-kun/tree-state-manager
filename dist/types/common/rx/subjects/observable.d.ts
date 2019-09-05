export declare type IUnsubscribe = () => void;
export declare type ISubscriber<T> = (value: T) => void;
export interface IObservable<T> {
    subscribe(subscriber: ISubscriber<T>): IUnsubscribe;
}
export declare abstract class Observable<T = any> implements IObservable<T> {
    call(func: (observable: this) => any): any;
    abstract subscribe(subscriber: ISubscriber<T>): IUnsubscribe;
}
