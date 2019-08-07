/* tslint:disable:no-duplicate-string no-shadowed-variable */
import {
	IDeSerializeValue,
	ISerializable,
	ISerializedObject,
	ISerializeValue,
} from '../../../../../../main/common/extensions/serialization/contracts'
import {
	ObjectSerializer,
	registerSerializable,
	TypeMetaSerializerCollection,
} from '../../../../../../main/common/extensions/serialization/serializers'
import {SortedList} from '../../../../../../main/common/lists/SortedList'
import {CircularClass, createComplexObject, IComplexObjectOptions} from '../../src/helpers/helpers'

declare const assert

describe('common > extensions > serialization > serializers', function() {
	// function testSerializer(
	// 	type: TClass,
	// 	constructorProps: string[],
	// 	serializableProps: string[],
	// 	notSerializableProps: string[],
	// ) {
	// 	const obj = new type(constructorProps.map(o => o + '_ctor changed'))
	// 	for (let i = 0; i < constructorProps.length; i++) {
	// 		assert.strictEqual(obj[constructorProps[i]], constructorProps[i] + '_ctor changed')
	// 	}
	//
	// 	const constructorPropsChanged = [...constructorProps]
	//
	// 	for (let i = 0; i < notSerializableProps.length; i++) {
	// 		const ctorIndex = constructorPropsChanged.indexOf(notSerializableProps[i])
	// 		if (ctorIndex >= 0) {
	// 			constructorPropsChanged[ctorIndex] = notSerializableProps[i] + ' changed'
	// 		}
	// 		obj[notSerializableProps[i]] = notSerializableProps[i] + ' changed'
	// 		assert.strictEqual(obj[notSerializableProps[i]], notSerializableProps[i] + ' changed')
	// 	}
	//
	// 	for (let i = 0; i < serializableProps.length; i++) {
	// 		obj[serializableProps[i]] = serializableProps[i] + ' changed'
	// 		assert.strictEqual(obj[serializableProps[i]], serializableProps[i] + ' changed')
	// 	}
	//
	// 	const serialized = ObjectSerializer.default.serialize(obj)
	// 	const result = ObjectSerializer.default.deSerialize(
	// 		serialized,
	// 		() => new type(constructorProps.map(o => o + '_ctor changed 2')),
	// 	)
	//
	// 	for (let i = 0; i < constructorProps.length; i++) {
	// 		if (serializableProps.indexOf(constructorProps[i]) < 0) {
	// 			assert.strictEqual(obj[constructorProps[i]], constructorProps[i] + '_ctor changed 2')
	// 			assert.strictEqual(obj[constructorProps[i]], constructorProps[i] + '_ctor changed 2')
	// 		}
	// 	}
	//
	// 	for (let i = 0; i < notSerializableProps.length; i++) {
	// 		const ctorIndex = constructorPropsChanged.indexOf(notSerializableProps[i])
	// 		if (ctorIndex >= 0) {
	// 			constructorPropsChanged[ctorIndex] = notSerializableProps[i] + ' changed'
	// 		}
	// 		obj[notSerializableProps[i]] = notSerializableProps[i] + ' changed'
	// 		assert.strictEqual(obj[notSerializableProps[i]], notSerializableProps[i] + ' changed')
	// 	}
	//
	// 	delete obj.prop1
	//
	// 	assert.notStrictEqual(result, obj)
	// 	assert.deepStrictEqual(result, obj)
	// }

	const serializeValue = ObjectSerializer.default.serialize.bind(ObjectSerializer.default)
	const deSerializeValue = ObjectSerializer.default.deSerialize.bind(ObjectSerializer.default)

	function testComplexObject(options: IComplexObjectOptions, prepare?: (object) => any, log?: boolean) {
		let object = createComplexObject({
			undefined: true,
			...options,
		})
		let checkObject = createComplexObject({
			...options,
			undefined: false,
		})

		if (prepare) {
			object = prepare(object)
			checkObject = prepare(checkObject)
		}

		const serialized = serializeValue(object)
		const result = deSerializeValue(serialized)

		assert.notStrictEqual(result, object)
		if (log) {
			console.log(object)
			console.log(result)
		}
		assert.circularDeepStrictEqual(result, checkObject)
	}

	it('primitives', function() {
		function testPrimitive(value: any) {
			assert.strictEqual(deSerializeValue(serializeValue(value)), value)
		}

		testPrimitive(null)
		testPrimitive(undefined)
		testPrimitive(123)
		assert.isOk(Number.isNaN(deSerializeValue(serializeValue(NaN))))
		testPrimitive(Infinity)
		testPrimitive(true)
		testPrimitive(false)
		testPrimitive('')
		testPrimitive('str')
	})

	// const array = []
	//
	// const obj: any = {
	// 	p1: 'p1',
	// 	p2: 123,
	// 	p3: true,
	// 	p4: null,
	// 	p5: undefined,
	// 	p6: new Date(),
	// 	// p7: new CircularClass(array),
	// }
	// obj.p8 = {
	// 	...obj,
	// }
	// // obj.p8.value = obj
	// // obj.p9 = obj
	// obj.p10 = Object.values(obj)

	it('simple circular', function() {
		const array = []
		const object = new CircularClass(array)
		array[0] = object
		const serialized = serializeValue(object)
		const result = deSerializeValue(serialized)

		assert.notStrictEqual(result, object)
		assert.notStrictEqual(result.array, object.array)
		assert.circularDeepStrictEqual(result, object)
	})

	it('Object', function() {
		testComplexObject({})
	})

	it('Array', function() {
		testComplexObject({}, o => o.array)
	})

	it('Map', function() {
		const map = new Map()
		const arr = createComplexObject().array
		for (let i = 1; i < arr.length; i++) {
			map.set(arr[i - 1], arr[i])
		}

		const serialized = serializeValue(map)
		const result = deSerializeValue(serialized)

		assert.notStrictEqual(result, map)
		assert.circularDeepStrictEqual(result, map)
	})

	it('Set', function() {
		const arr = createComplexObject().array
		const set = new Set(arr)

		const serialized = serializeValue(set)
		const result = deSerializeValue(serialized)

		assert.notStrictEqual(result, set)
		assert.circularDeepStrictEqual(result, set)
	})

	it('Date', function() {
		const date = new Date()

		const serialized = serializeValue(date)
		const result = deSerializeValue(serialized)

		assert.notStrictEqual(result, date)
		assert.circularDeepStrictEqual(result, date)
	})

	class Class1 {
		public prop1: string
	}

	it('Class: Simple', function() {
		const obj1 = new Class1()
		obj1.prop1 = 'p1'

		assert.throws(() => serializeValue(obj1), Error)

		const serializer = new ObjectSerializer()

		assert.throws(() => serializer.serialize(obj1), Error)

		serializer.typeMeta.putType(Class1, {
			uuid: 'Class1 uuid',
			serializer: TypeMetaSerializerCollection.default.getMeta(Object).serializer,
			valueFactory: () => new Class1(),
		})

		assert.throws(() => serializeValue(obj1), Error)

		const serialized = serializer.serialize(obj1)
		assert.throws(() => deSerializeValue(obj1), Error)
		const result = serializer.deSerialize(serialized)

		assert.notStrictEqual(result, obj1)
		assert.circularDeepStrictEqual(result, obj1)
	})

	class Class2 extends Class1 implements ISerializable {
		public prop2: string
		public prop3: string = 'prop3'

		constructor(prop2: string) {
			super()
			this.prop2 = prop2
		}

		public static uuid: string = '3cd34642-9e19-4a0d-8a57-ff526b445100'

		public serialize(serialize: ISerializeValue): ISerializedObject {
			return {
				prop3: serialize(this.prop3),
			}
		}

		public deSerialize(deSerialize: IDeSerializeValue, serializedValue: ISerializedObject) {
			deSerialize(serializedValue.prop3, o => { this.prop3 = o })
		}
	}

	it('Class: Serializable', function() {
		const obj2 = new Class2('p_2')
		obj2.prop1 = 'p1'
		obj2.prop2 = 'p2'
		obj2.prop3 = 'p3'

		assert.throws(() => serializeValue(obj2), Error)
		registerSerializable(Class2, {
			valueFactory: () => new Class2('prop2'),
		})
		const serialized = serializeValue(obj2)
		const result = deSerializeValue(serialized, null, null, () => new Class2('p2'))

		delete obj2.prop1

		assert.notStrictEqual(result, obj2)
		assert.circularDeepStrictEqual(result, obj2)
	})

	class Class3 extends Class2 implements ISerializable {
		public prop4: string

		constructor(prop2: string) {
			super(prop2)
		}

		public static uuid: string = 'c2a26bc9-1cc5-4249-9f10-f8e087fd6a1b'

		public serialize(serialize: ISerializeValue): ISerializedObject {
			return {
				...super.serialize(serialize),
				prop4: serialize(this.prop4),
			}
		}

		public *deSerialize(deSerialize: IDeSerializeValue, serializedValue: ISerializedObject) {
			super.deSerialize(deSerialize, serializedValue)
			this.prop4 = yield deSerialize(serializedValue.prop4)
		}
	}

	it('Class: Serializable inherit', function() {
		const obj3 = new Class3('prop2')
		obj3.prop1 = 'p1'
		obj3.prop2 = 'p2'
		obj3.prop3 = 'p3'
		obj3.prop4 = 'p4'

		assert.throws(() => serializeValue(obj3), Error)
		registerSerializable(Class3, {
			valueFactory: () => new Class3('prop2'),
		})
		const serialized = serializeValue(obj3)
		const result = deSerializeValue(serialized)

		delete obj3.prop1
		obj3.prop2 = 'prop2'

		assert.notStrictEqual(result, obj3)
		assert.circularDeepStrictEqual(result, obj3)
	})

	it('SortedList circular', function() {
		const sortedList = new SortedList()
		sortedList.add(sortedList)

		const serialized = serializeValue(sortedList)
		const result = deSerializeValue(serialized)

		assert.notStrictEqual(result, sortedList)
		console.log(sortedList)
		console.log(result)
		assert.circularDeepStrictEqual(result, sortedList)
	})

	it('complex object', function() {
		testComplexObject({
			circular: true,

			circularClass: true,

			sortedList: true,

			set: true,
			arraySet: true, // error
			objectSet: true,
			observableSet: true,

			map: true,
			arrayMap: true, // error
			objectMap: true,
			observableMap: true,
		}, null, false)
	})

})
