/* tslint:disable:no-construct use-primitive-type no-shadowed-variable no-duplicate-string no-empty max-line-length */
import {delay} from '../../../../../../main/common/helpers/helpers'
import {VALUE_PROPERTY_DEFAULT} from '../../../../../../main/common/rx/deep-subscribe/contracts/constants'
import {RuleBuilder} from '../../../../../../main/common/rx/deep-subscribe/RuleBuilder'
import {ObservableObjectBuilder} from '../../../../../../main/common/rx/object/ObservableObjectBuilder'
import {createObject, IObject, Tester} from './helpers/Tester'

describe('common > main > rx > deep-subscribe > deep-subscribe', function() {
	const check = createObject()

	it('object', function() {
		const object1 = createObject()
		new Tester(
			{
				object: object1.observableObject,
				immediate: true,
			},
			b => b.path(o => o.observableObjectPrototype.observableObject.valueObject),
			b => b.path(o => o.valueObject),
			b => b.path(o => o.observableObject['@last'].valueObject),
			b => b.path(o => o.observableObjectPrototype.observableObject.valueObject['@last']),
			b => b.path(o => o.observableObject.observableObject.valueObject),
		)
			.subscribe(o => [o.valueObject])
			.unsubscribe(o => [o.valueObject])
			.subscribe(o => [o.valueObject])
			.change(o => o.valueObject = new Number(1) as any,
				[object1.valueObject], [new Number(1) as any])
			.unsubscribe([new Number(1) as any])

		new Tester(
			{
				object: createObject().observableObject,
				immediate: true,
				doNotSubscribeNonObjectValues: true,
			},
			b => b.path(o => o.observableObjectPrototype.valueObjectWritable),
			b => b.path(o => o.observableObject.observableObjectPrototype.valueObjectWritable),
			b => b.path(o => o.observableObjectPrototype.observableObject.observableObjectPrototype.valueObjectWritable),
			b => b.path(o => o.observableObject.observableObject.observableObjectPrototype.valueObjectWritable),
		)
			.subscribe([])
			.unsubscribe([])
			.subscribe([])
			.change(o => o.observableObjectPrototype.valueObjectWritable = new Number(1) as any,
				[], [new Number(1) as any])
			.unsubscribe([new Number(1) as any])

		new Tester(
			{
				object: createObject().object,
				immediate: true,
			},
			b => b.path(o => o.object),
			// b => b.path(o => o.object.object),
			// b => b.path(o => o.object.object.object),
		)
			.subscribe(o => [o.object])
			.change(o => o.object = null, o => [], [])

		new Tester(
			{
				object: createObject().object,
				immediate: true,
			},
			b => b.nothing(),
			b => b.path(o => o.object).nothing(),
			b => b.path(o => o.object).nothing().path(o => o.object),
			b => b.nothing().nothing(),
			b => b.nothing().nothing().path(o => o.object.object),
			b => b.nothing().nothing().path(o => o.object).nothing().nothing().path(o => o.object).nothing().nothing(),
			b => b.path(o => o.object),
			b => b.path(o => o.object.object),
			b => b.path(o => o.object.object.object),
		)
			.subscribe([check.object])
			.unsubscribe([check.object])

		new Tester(
			{
				object: createObject().object,
				immediate: true,
				doNotSubscribeNonObjectValues: true,
			},
			b => b.nothing().nothing().path(o => o.observableObject.object),
			b => b.path(o => o.observableObject.object),
			b => b.path(o => o.object.observableObject.object),
			// b => b.path(o => o.object.observableObject.object.object),
			// b => b.path(o => o.object.object.observableObject.object.object),
			// b => b
			// 	.repeat(3, 3, b => b
			// 		.path(o => o.object)
			// 		.repeat(3, 3, b => b
			// 			.path(o => o.observableObject)))
			// 	.path(o => o.observableObject.object),
		)
			.subscribe([check.object])
			.change(o => o.observableObject.object = 1 as any,
				o => [o.object], [])
			.change(o => o.observableObject.object = new Number(1) as any,
				[], [new Number(1) as any])
			.change(o => o.observableObject.object = new Number(2) as any,
				[new Number(1) as any], [new Number(2) as any])
			.unsubscribe([new Number(2) as any])

		new Tester(
			{
				object: createObject().object,
				immediate: true,
				doNotSubscribeNonObjectValues: true,
			},
			b => b.path(o => o.object.observableObject.object.object),
			b => b.path(o => o.object.object.observableObject.object.object),
			b => b
				.repeat(3, 3, b => b
					.path(o => o.object)
					.repeat(3, 3, b => b
						.path(o => o.observableObject)))
				.path(o => o.object.object),
		)
			.subscribe([check.object])
			.change(o => o.observableObject.object = 1 as any,
				o => [o.object], [])
			.change(o => o.observableObject.object = new Number(1) as any,
				[], [])
			.change(o => o.observableObject.object = new Number(2) as any,
				[], [])
			.unsubscribe([])

		new Tester(
			{
				object: createObject().object,
				immediate: true,
				doNotSubscribeNonObjectValues: true,
			},
			b => b
				.repeat(0, 2, b => b
					.path(o => o.object))
				.path(o => o.observableObject.object),
		)
			.subscribe([
				check.object,
			])
			.change(o => o.observableObject.object = 1 as any,
				o => [o.object], [])
			.change(o => o.observableObject.object = new Number(1) as any,
				[], [new Number(1) as any])
			.change(o => o.observableObject.object = new Number(2) as any,
				[new Number(1) as any], [new Number(2) as any])
			.unsubscribe([
				new Number(2) as any,
			])

		// new Tester(
		// 	{
		// 		object: createObject().object,
		// 		immediate: false,
		// 	},
		// 	b => b
		// 		.repeat(1, 3, b => b
		// 			.any(
		// 				b => b.propertyRegexp(/object|observableObject/),
		// 				b => b.path(o => o['list|set|map|observableList|observableSet|observableMap']['#']),
		// 			),
		// 		),
		// )
		// 	.subscribe([])
	})

	it('chain of same objects', function() {
		new Tester(
			{
				object: createObject().observableObject,
				immediate: true,
			},
			// b => b.path(o => o.observableObject),
			b => b.path(o => o.observableObject.observableObject),
			b => b.path(o => o.observableObject.observableObject.observableObject),
		)
			.subscribe(o => [o.observableObject])
			.change(
				o => o.observableObject = new Number(1) as any,
				o => [o.observableObject],
				o => [],
			)
			.unsubscribe([])

		new Tester(
			{
				object: createObject().observableObject,
				immediate: true,
			},
			// b => b.path(o => o.object),
			b => b.path(o => o.object.observableObject.object),
			b => b.path(o => o.object.observableObject.object.observableObject.object),
		)
			.subscribe(o => [o.object])
			.change(
				o => o.object = new Number(1) as any,
				o => [o.object],
				o => [],
			)
			.unsubscribe([])

		const observableList = createObject().observableList
		observableList.clear()
		observableList.add(observableList)
		new Tester(
			{
				object: observableList,
				immediate: true,
			},
			b => b.path(o => o['#']['#']),
			b => b.path(o => o['#']['#']['#']),
		)
			.subscribe(o => [...o])
			.change(
				o => o.set(0, new Number(1) as any),
				o => [o.get(0)],
				o => [],
			)
			.unsubscribe([])

		const observableSet = createObject().observableSet
		observableSet.clear()
		observableSet.add(observableSet)
		new Tester(
			{
				object: observableSet,
				immediate: true,
			},
			b => b.path(o => o['#']['#']),
			b => b.path(o => o['#']['#']['#']),
		)
			.subscribe(o => [...o])
			.change(
				o => {
					o.clear()
					o.add(new Number(1) as any)
				},
				o => [Array.from(o.values())[0]],
				o => [],
			)
			.unsubscribe([])

		new Tester(
			{
				object: createObject().observableMap,
				immediate: true,
			},
			b => b.path(o => o['#observableMap']['#observableMap']),
			b => b.path(o => o['#observableMap']['#observableMap']['#observableMap']),
		)
			.subscribe(o => [o.get('observableMap')])
			.change(
				o => o.set('observableMap', new Number(1) as any),
				o => [o.get('observableMap')],
				o => [],
			)
			.unsubscribe([])

		new Tester(
			{
				object: createObject().observableMap,
				immediate: true,
			},
			b => b.path(o => o['#observableMap']['#object'].observableMap['#observableMap']['#object']),
			b => b.path(o => o['#observableMap']['#object'].observableMap['#observableMap']['#object'].observableMap['#observableMap']['#object']),
		)
			.subscribe(o => [o.get('object')])
			.change(
				o => o.set('object', new Number(1) as any),
				o => [o.get('object')],
				o => [],
			)
			.unsubscribe([])

		new Tester(
			{
				object: createObject().observableObject,
				immediate: true,
			},
			b => b.path(o => o.object),
			b => b.path(o => o.observableObject.object),
		)
			.subscribe(o => [o.object])
			.change(
				o => o.object = new Number(1) as any,
				o => [o.object],
				o => [new Number(1) as any],
			)
			.unsubscribe([new Number(1) as any])
	})

	it('any', function() {
		new Tester(
			{
				object: createObject().object,
				immediate: true,
				doNotSubscribeNonObjectValues: true,
			},
			b => b
				.path((o: any) => o['object|observableObject'].value),
		)
			.subscribe([])
			.change(o => {}, [], [])

		new Tester(
			{
				object: createObject().observableObject,
				immediate: true,
				doNotSubscribeNonObjectValues: true,
			},
			b => b
				.any(
					o => o.path((o: any) => o['map|set']),
					o => o.path((o: any) => o['map|set']),
					o => o.path((o: any) => o['map|set'].object.observableObject),
				),
		)
			.subscribe(o => [o.map, o.set])
			.change(o => { o.set = o.observableObject as any }, o => [o.set], o => [o.observableObject])
			.unsubscribe(o => [o.map, o.set])

		new Tester(
			{
				object: createObject().observableObject,
				immediate: true,
				doNotSubscribeNonObjectValues: true,
			},
			b => b
				// .path((o: any) => o['map|set']),
				.any(
					o => o.nothing(),
					o => o.path((o: any) => o['map|set']),
				),
		)
			.subscribe(o => [o, o.map, o.set])
			.change(o => { o.set = o.observableObject as any }, o => [o.set], o => [])
			.unsubscribe(o => [o, o.map])

		// new Tester(
		// 	{
		// 		object: createObject().observableObject,
		// 		immediate: true,
		// 		doNotSubscribeNonObjectValues: true,
		// 	},
		// 	b => b
		// 		.path((o: any) => o['map||set']),
		// )
		// 	.subscribe(o => [o, o.map, o.set])
		// 	.change(o => { o.set = o.observableMap as any }, o => [o.set], o => [o.observableMap])
		// 	.unsubscribe(o => [o, o.map, o.observableMap])
	})

	it('value properties', async function() {
		new Tester(
			{
				object: createObject().observableObject,
				immediate: true,
			},
			b => b.path(o => o.property as any),
		)
			.subscribe(o => [o.observableObject])
			.change(o => o.property[VALUE_PROPERTY_DEFAULT] = new Number(1) as any,
				o => [o.observableObject], [new Number(1)])
			.change(o => o.property = new Number(2) as any,
				[new Number(1)], [new Number(2)])
			.change(o => o.property = o.object.property,
				[new Number(2)], [new Number(1)])
			.unsubscribe([new Number(1)])

		new Tester(
			{
				object: createObject().observableObject,
				immediate: true,
			},
			b => b.path(o => o.property['@value_observableObject']),
		)
			.subscribe(o => [o.observableObject])
			.change(o => o.property.value_observableObject = new Number(1) as any,
				o => [o.observableObject], [new Number(1)])
			.change(o => o.property = new Number(2) as any,
				[new Number(1)], [new Number(2)])
			.change(o => o.property = o.object.property,
				[new Number(2)], [new Number(1)])
			.unsubscribe([new Number(1)])

		{
			const object = createObject()
			new ObservableObjectBuilder(object.property).delete(VALUE_PROPERTY_DEFAULT)
			new Tester(
				{
					object,
					immediate: true,
					doNotSubscribeNonObjectValues: true,
				},
				b => b.path((o: any) => o.property['@value_map|value_set|value_list']),
			)
				.subscribe(o => [o.property])
				.change(o => {new ObservableObjectBuilder(o.property).writable(VALUE_PROPERTY_DEFAULT, null, null) }, o => [o.property], o => [o.map])
				.change(o => { o.property.value_map = null }, o => [o.map], o => [])
				.change(o => { new ObservableObjectBuilder(o.property).delete('value_map') }, o => [], o => [o.set])
				.change(o => { new ObservableObjectBuilder(o.property).delete('value_set') }, o => [o.set], o => [o.list])
				.change(o => { o.property.value_list = o.map as any }, o => [o.list], o => [o.map])
				.change(o => { new ObservableObjectBuilder(o.property).delete('value_list') }, o => [o.map], o => [])
				.change(o => { o.property[VALUE_PROPERTY_DEFAULT] = void 0 }, o => [], o => [])
				.change(o => { o.property[VALUE_PROPERTY_DEFAULT] = o as any }, o => [], o => [o])
				.change(o => { new ObservableObjectBuilder(o.property).writable('value_map', null, null) }, o => [o], o => [])
				.change(o => { new ObservableObjectBuilder(o.property).delete('value_map') }, o => [], o => [o])
				.change(o => { new ObservableObjectBuilder(o.property).writable('value_list', null, o.list) }, o => [o], o => [o.list])
				.change(o => { new ObservableObjectBuilder(o.property).delete(VALUE_PROPERTY_DEFAULT) }, o => [o.list], o => [o.property])
				.unsubscribe(o => [o.property])
		}

		new Tester(
			{
				object: createObject().observableObject,
				immediate: true,
				doNotSubscribeNonObjectValues: true,
			},
			b => b.path((o: any) => o.property['@value_map|value_set|value_list']),
		)
			.subscribe(o => [o.map])
			.change(o => { o.property.value_map = null }, o => [o.map], o => [])
			.change(o => { new ObservableObjectBuilder(o.property).delete('value_map') }, o => [], o => [o.set])
			.change(o => { new ObservableObjectBuilder(o.property).delete('value_set') }, o => [o.set], o => [o.list])
			.change(o => { o.property.value_list = o.map as any }, o => [o.list], o => [o.map])
			.change(o => { new ObservableObjectBuilder(o.property).delete('value_list') }, o => [o.map], o => [o])
			.change(o => { new ObservableObjectBuilder(o.property).writable('value_map', null, null) }, o => [o], o => [])
			.change(o => { new ObservableObjectBuilder(o.property).delete('value_map') }, o => [], o => [o])
			.change(o => { new ObservableObjectBuilder(o.property).writable('value_list', null, o.list) }, o => [o], o => [o.list])
			.unsubscribe(o => [o.list])

		new Tester(
			{
				object: createObject().observableObject,
				immediate: true,
				doNotSubscribeNonObjectValues: true,
			},
			b => b
				.any(
					o => o.path((o: any) => o.property['@value_observableObject']['map|set']),
					o => o.path((o: any) => o.property['@value_observableObject']['map|set']),
					o => o.path((o: any) => o.property['@value_observableObject']['map|set'].object.observableObject),
				),
			b => b
				.any(
					o => o.path((o: any) => o.property['map|set']),
					o => o.path((o: any) => o.property['map|set']),
					o => o.path((o: any) => o.property['map|set'].object.observableObject),
				),
		)
			.subscribe(o => [o.map, o.set])
			.change(o => { o.set = o.observableObject as any }, o => [o.set], o => [o.observableObject])
			.unsubscribe(o => [o.map, o.set])
	})

	it('promises', async function() {
		const object = createObject()
		object.observableObject.value = new Number(1)

		const tester = new Tester(
			{
				object: object.promiseSync as any,
				immediate: true,
				doNotSubscribeNonObjectValues: true,
			},
			b => b
				.path((o: any) => o.promiseAsync.value),
		)

		await tester.subscribeAsync([new Number(1)])

		await delay(20)

		await tester.changeAsync(
			o => object.observableObject.value = new Number(2) as any,
			[new Number(1)],
			[new Number(2)],
		)

		await delay(20)

		await tester.unsubscribe([new Number(2)])

		await delay(100)
	})

	xit('promises throw', async function() {
		const object = createObject()
		object.observableObject.value = new Number(1)

		const tester = new Tester(
			{
				object: object.promiseSync as any,
				immediate: true,
				doNotSubscribeNonObjectValues: true,
				useIncorrectUnsubscribe: true,
			},
			b => b
				.path((o: any) => o.promiseAsync.value),
		)

		await tester.subscribeAsync([new Number(1)])

		await delay(20)

		await tester.changeAsync(
			o => object.observableObject.value = new Number(2) as any,
			[],
			[new Number(2)],
			Error,
			/Value is not a function or null\/undefined/,
		)

		await delay(20)

		await tester.unsubscribe([])

		await delay(100)
	})

	it('lists', function() {
		const value = new Number(1)

		new Tester(
			{
				object: createObject().object,
				immediate: true,
				ignoreSubscribeCount: true,
				doNotSubscribeNonObjectValues: true,
			},
			b => b
				.repeat(1, 3, b => b
					.any(
						b => b.propertyRegexp(/object|observableObject/),
						b => b.path(o => o['list|set|map|observableList|observableSet|observableMap']['#']),
					),
				)
				.path(o => o.value),
		)
			.subscribe([])
			.change(o => (o.observableObject as any).target = value,
				[], [value])
			.change(o => o.observableList.add(value as any),
				[], [])
			.change(o => o.observableSet.add(value as any),
				[], [])
			.change(o => o.observableMap.set('value', value as any),
				[], [])
			.unsubscribe([value])

		new Tester(
			{
				object: createObject().object,
				immediate: true,
				ignoreSubscribeCount: true,
				doNotSubscribeNonObjectValues: true,
			},
			b => b
				.repeat(1, 3, b => b
					.any(
						b => b.propertyRegexp(/object|observableObject/),
						b => b.path(o => o['list|set|map|observableList|observableSet|observableMap']['#']),
					),
				)
				.path(o => o['#value']),
		)
			.subscribe([])
			.change(o => (o.observableObject as any).target = value,
				[], [])
			.change(o => o.observableList.add(value as any),
				[], [])
			.change(o => o.observableSet.add(value as any),
				[], [])
			.change(o => o.observableMap.set('value', value as any),
				[], [value])
			.unsubscribe([value])

		// new Tester(
		// 	{
		// 		object: createObject().object,
		// 		immediate: true,
		// 		ignoreSubscribeCount: true,
		// 	},
		// 	b => b
		// 		.repeat(1, 3, b => b
		// 			.any(
		// 				b => b.propertyRegexp(/object|observableObject/),
		// 				b => b.path(o => o['list|set|map|observableList|observableSet|observableMap']['#']),
		// 			),
		// 		)
		// 		.path(o => o['#']),
		// )
		// 	.subscribe([])
			// .change(o => {
			// 	o.observableObject.value = value
			// 	return [[], []]
			// })
			// .change(o => {
			// 	o.observableList.add(value as any)
			// 	return [[], [value]]
			// })
			// .change(o => {
			// 	o.observableSet.add(value as any)
			// 	return [[], [value]]
			// })
			// .change(o => {
			// 	o.observableMap.set('value', value as any)
			// 	return [[], [value]]
			// })
			// .unsubscribe([value])
	})

	it('throws', function() {
		new Tester(
			{
				object: createObject().observableObject,
				immediate: true,
			},
			b => b.path(o => o.object),
		)
			.subscribe(o => [o.object])
			.change(
				o => o.object = 1 as any,
				o => [o.object, 1 as any],
				o => [1 as any],
				Error,
				/unsubscribe function for non Object value/,
			)

		new Tester(
			{
				object: createObject().object,
				immediate: true,
			},
			b => b.path(o => o.value),
			b => b.path(o => o.object.object.object.value),
			b => b.path(o => o.observableObject.observableObject.observableObject.value),
			b => b.path(o => (o.observableList['#'] as IObject).observableList['#'].observableList['#'].value),
			b => {
				b = b.path(o => o.object.object.object.value)
				delete b.result.description
				delete b.result.next.next.description
				return b
			},
		)
			.subscribe(
				["value"], ["value"],
				Error,
				/unsubscribe function for non Object value/,
			)
	})

	it('throws incorrect Unsubscribe', function() {
		new Tester(
			{
				object: createObject().object,
				immediate: true,
				doNotSubscribeNonObjectValues: true,
				useIncorrectUnsubscribe: true,
			},
			b => b
				.path((o: any) => o.object),
		)
			.subscribe(
				o => [o.object], [],
				Error,
				/Value is not a function or null\/undefined/,
			)

		new Tester(
			{
				object: createObject().object,
				immediate: true,
				// doNotSubscribeNonObjectValues: true,
				useIncorrectUnsubscribe: true,
			},
			b => b
				.path((o: any) => o.object.value),
		)
			.subscribe(
				["value"], [],
				Error,
				/Value is not a function or null\/undefined/,
			)
	})
})
