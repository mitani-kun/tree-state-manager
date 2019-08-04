import {IMergeable, IMergeOptions, IMergeValue} from '../extensions/merge/contracts'
import {mergeMaps} from '../extensions/merge/merge-maps'
import {createMergeSetWrapper} from '../extensions/merge/merge-sets'
import {registerMergeable} from '../extensions/merge/mergers'
import {
	IDeSerializeValue,
	ISerializable,
	ISerializedObject,
	ISerializeValue,
} from '../extensions/serialization/contracts'
import {registerSerializable, registerSerializer} from '../extensions/serialization/serializers'
import {SetChangedObject} from './base/SetChangedObject'
import {IObservableSet, SetChangedType} from './contracts/ISetChanged'
import {fillSet} from './helpers/set'

export class ObservableSet<T> extends SetChangedObject<T> implements
	IObservableSet<T>,
	IMergeable<ObservableSet<T>, T[] | Iterable<T>>,
	ISerializable
{
	private readonly _set: Set<T>

	constructor(set?: Set<T>) {
		super()
		this._set = set || new Set<T>()
	}

	public add(value: T): this {
		const {_set} = this
		const oldSize = _set.size

		this._set.add(value)

		const size = _set.size
		if (size > oldSize) {
			const {_setChangedIfCanEmit} = this
			if (_setChangedIfCanEmit) {
				_setChangedIfCanEmit.emit({
					type: SetChangedType.Added,
					newItems: [value],
				})
			}

			this.onPropertyChanged({
				name: 'size',
				oldValue: oldSize,
				newValue: size,
			})
		}

		return this
	}

	public delete(value: T): boolean {
		const {_set} = this
		const oldSize = _set.size

		this._set.delete(value)

		const size = _set.size
		if (size < oldSize) {
			const {_setChangedIfCanEmit} = this
			if (_setChangedIfCanEmit) {
				_setChangedIfCanEmit.emit({
					type: SetChangedType.Removed,
					oldItems: [value],
				})
			}

			this.onPropertyChanged({
				name: 'size',
				oldValue: oldSize,
				newValue: size,
			})

			return true
		}

		return false
	}

	public clear(): void {
		const {size} = this
		if (size === 0) {
			return
		}

		const {_setChangedIfCanEmit} = this
		if (_setChangedIfCanEmit) {
			const oldItems = Array.from(this)

			this._set.clear()

			_setChangedIfCanEmit.emit({
				type: SetChangedType.Removed,
				oldItems,
			})
		} else {
			this._set.clear()
		}

		this.onPropertyChanged({
			name: 'size',
			oldValue: size,
			newValue: 0,
		})
	}

	// region Unchanged Set methods

	public readonly [Symbol.toStringTag]: string = 'Set'

	public get size(): number {
		return this._set.size
	}

	public [Symbol.iterator](): IterableIterator<T> {
		return this._set[Symbol.iterator]()
	}

	public entries(): IterableIterator<[T, T]> {
		return this._set.entries()
	}

	public forEach(callbackfn: (value: T, value2: T, set: Set<T>) => void, thisArg?: any): void {
		this._set.forEach((k, v, s) => callbackfn.call(thisArg, k, v, this))
	}

	public has(value: T): boolean {
		return this._set.has(value)
	}

	public keys(): IterableIterator<T> {
		return this._set.keys()
	}

	public values(): IterableIterator<T> {
		return this._set.values()
	}

	// endregion

	// region IMergeable

	public _canMerge(source: ObservableSet<T>): boolean {
		const {_set} = this
		if ((_set as any).canMerge) {
			return (_set as any).canMerge(source)
		}

		if (source.constructor === ObservableSet
			&& this._set === (source as ObservableSet<T>)._set
		) {
			return null
		}

		return source.constructor === Object
			|| source[Symbol.toStringTag] === 'Set'
			|| Array.isArray(source)
			|| Symbol.iterator in source
	}

	public _merge(
		merge: IMergeValue,
		older: ObservableSet<T> | T[] | Iterable<T>,
		newer: ObservableSet<T> | T[] | Iterable<T>,
		preferCloneOlder?: boolean,
		preferCloneNewer?: boolean,
		options?: IMergeOptions,
	): boolean {
		return mergeMaps(
			(target, source) => createMergeSetWrapper(
				target,
				source,
				arrayOrIterable => fillSet(new (this._set.constructor as any)(), arrayOrIterable)),
			merge,
			this,
			older,
			newer,
			preferCloneOlder,
			preferCloneNewer,
			options,
		)
	}

	// endregion

	// region ISerializable

	public static uuid: string = '91539dfb-55f4-4bfb-9dbf-bff7f6ab800d'

	public serialize(serialize: ISerializeValue): ISerializedObject {
		return {
			set: serialize(this._set),
		}
	}

	// tslint:disable-next-line:no-empty
	public deSerialize(deSerialize: IDeSerializeValue, serializedValue: ISerializedObject) {

	}

	// endregion
}

registerMergeable(ObservableSet)

registerSerializable(ObservableSet, {
	serializer: {
		deSerialize<T>(
			deSerialize: IDeSerializeValue,
			serializedValue: ISerializedObject,
			valueFactory?: (set?: Set<T>) => ObservableSet<T>,
		): ObservableSet<T> {
			const innerSet = deSerialize<Set<T>>(serializedValue.set)
			const value = valueFactory
				? valueFactory(innerSet)
				: new ObservableSet<T>(innerSet)
			value.deSerialize(deSerialize, serializedValue)
			return value
		},
	},
})
