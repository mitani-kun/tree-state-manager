import {ISubscriber, IUnsubscribe} from './subject'

export interface IObservable<T> {
	subscribe(subscriber: ISubscriber<T>): IUnsubscribe
}

export abstract class Observable<T = any> implements IObservable<T> {
	public call(func: (observable: this) => any): any {
		return func(this)
	}

	public abstract subscribe(subscriber: ISubscriber<T>): IUnsubscribe
}
