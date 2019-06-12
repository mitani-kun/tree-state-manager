import {IDeSerializeValue, ISerializedObject, ISerializeValue} from '../serialization/contracts'
import {registerSerializer} from '../serialization/serializers'
import {getObjectUniqueId} from './helpers/object-unique-id'

export class ObjectHashMap<K, V> implements Map<K, V> {
	private readonly _object: {
		[id: number]: [K, V],
	}

	constructor(object?: { [id: number]: [K, V] }) {
		this._object = object || {} as any
	}

	public set(key: K, value: V): this {
		const id = getObjectUniqueId(key)
		this._object[id] = [key, value]
		return this
	}

	public clear(): this {
		const {_object} = this
		for (const id in _object) {
			if (Object.prototype.hasOwnProperty.call(_object, id)) {
				delete _object[id]
			}
		}

		return this
	}

	public delete(key: K): boolean {
		const {_object} = this
		const id = getObjectUniqueId(key)
		if (!Object.prototype.hasOwnProperty.call(_object, id)) {
			return false
		}

		delete _object[id]

		return true
	}

	public readonly [Symbol.toStringTag]: string = 'Map'
	public get size(): number {
		return Object.keys(this._object).length
	}

	public [Symbol.iterator](): IterableIterator<[K, V]> {
		return this.entries()
	}

	public *entries(): IterableIterator<[K, V]> {
		const {_object} = this
		for (const id in _object) {
			if (Object.prototype.hasOwnProperty.call(_object, id)) {
				yield _object[id]
			}
		}
	}

	public forEach(
		callbackfn: (value: V, key: K, map: Map<K, V>) => void,
		thisArg?: any,
	): void {
		const {_object} = this
		for (const id in _object) {
			if (Object.prototype.hasOwnProperty.call(_object, id)) {
				const entry = _object[id]
				callbackfn.call(thisArg, entry[1], entry[0], this)
			}
		}
	}

	public get(key: K): V | undefined {
		const id = getObjectUniqueId(key)
		const entry = this._object[id]
		return entry && entry[1]
	}

	public has(key: K): boolean {
		const id = getObjectUniqueId(key)
		return Object.prototype.hasOwnProperty.call(this._object, id)
	}

	public *keys(): IterableIterator<K> {
		const {_object} = this
		for (const id in _object) {
			if (Object.prototype.hasOwnProperty.call(_object, id)) {
				const entry = _object[id]
				yield entry[0]
			}
		}
	}

	// tslint:disable-next-line:no-identical-functions
	public *values(): IterableIterator<V> {
		const {_object} = this
		for (const id in _object) {
			if (Object.prototype.hasOwnProperty.call(_object, id)) {
				const entry = _object[id]
				yield entry[1]
			}
		}
	}

	// region ISerializable

	public static uuid: string = '7a5731ae-37ad-4c5b-aee0-25a8f1cd2228'

	public serialize(serialize: ISerializeValue): ISerializedObject {
		return {
			object: serialize(this._object),
		}
	}

	// tslint:disable-next-line:no-empty
	public deSerialize(deSerialize: IDeSerializeValue, serializedValue: ISerializedObject) {

	}

	// endregion
}

registerSerializer(ObjectHashMap, {
	uuid: ObjectHashMap.uuid,
	serializer: {
		serialize(
			serialize: ISerializeValue,
			value: ObjectHashMap<any, any>,
		): ISerializedObject {
			return value.serialize(serialize)
		},
		deSerialize<K, V>(
			deSerialize: IDeSerializeValue,
			serializedValue: ISerializedObject,
			valueFactory?: (map?: { [id: number]: [K, V] }) => ObjectHashMap<K, V>,
		): ObjectHashMap<K, V> {
			const innerMap = deSerialize<{ [id: number]: [K, V] }>(serializedValue.object)
			const value = valueFactory
				? valueFactory(innerMap)
				: new ObjectHashMap<K, V>(innerMap)
			value.deSerialize(deSerialize, serializedValue)
			return value
		},
	},
})
