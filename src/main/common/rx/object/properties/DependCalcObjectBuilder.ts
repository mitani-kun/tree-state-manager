import {ThenableOrIteratorOrValue} from '../../../async/async'
import {TClass, NotFunction} from '../../../helpers/typescript'
import {VALUE_PROPERTY_DEFAULT} from '../../../helpers/value-property'
import {depend, dependX} from '../../../rx/depend/core/depend'
import {CallState} from '../../depend/core/CallState'
import {IDeferredOptions} from '../../depend/core/contracts'
import {makeDependPropertySubscriber} from '../helpers'
import {ObservableClass} from '../ObservableClass'
import {ObservableObjectBuilder} from '../ObservableObjectBuilder'
import {CalcObjectBuilder} from './CalcObjectBuilder'
import {calcPropertyFactory} from './CalcPropertyBuilder'
import {ValueKeys} from './contracts'
import {observableClass} from './helpers'
import {Path} from './path/builder'

function createGetValue<TObject, TCalcSource, TValue>(
	calcSourcePath: Path<TObject, TCalcSource>,
	getValue: (this: TCalcSource) => TValue,
): (this: TObject) => TValue {
	if (calcSourcePath == null) {
		return getValue as any
	} else {
		const path = calcSourcePath
			.clone()
			.append(o => getValue.call(o) as TValue)
			.init()

		return function(this: TObject) {
			return path.get(this) as TValue
		}
	}
}

export class DependCalcObjectBuilder<
	TObject extends ObservableClass,
	TConnectorSource = TObject,
	TCalcSource = TObject,
	TValueKeys extends string | number = ValueKeys,
>
	extends CalcObjectBuilder<TObject, TConnectorSource>
{
	public readonly calcSourcePath?: Path<TObject, TCalcSource>

	constructor(
		object?: TObject,
		connectorSourcePath?: Path<TObject, TConnectorSource>,
		calcSourcePath?: Path<TObject, TCalcSource>,
	) {
		super(object, connectorSourcePath)
		this.calcSourcePath = calcSourcePath
	}

	public simpleCalc<
		Name extends keyof TObject,
	>(
		name: Name,
		func: (this: TCalcSource)
			=> ThenableOrIteratorOrValue<TObject[Name]>,
	): this & { object: { readonly [newProp in Name]: TObject[Name] } } {
		return super.readable(name as any, {
			getValue: createGetValue(this.calcSourcePath, func),
		}) as any
	}

	public dependCalc<
		Name extends keyof TObject,
	>(
		name: Name,
		func: (this: TCalcSource)
			=> ThenableOrIteratorOrValue<TObject[Name]>,
		deferredOptions?: IDeferredOptions,
	): this & { object: { readonly [newProp in Name]: TObject[Name] } } {
		return super.readable(name as any, {
			getValue: depend(
				createGetValue(this.calcSourcePath, func),
				deferredOptions,
				makeDependPropertySubscriber(name as any),
			),
		}) as any
	}

	public dependCalcX<
		Name extends keyof TObject,
	>(
		name: Name,
		func: (this: CallState<TObject, any[], TObject[Name]>)
			=> ThenableOrIteratorOrValue<TObject[Name]>,
		deferredOptions?: IDeferredOptions,
	): this & { object: { readonly [newProp in Name]: TObject[Name] } } {
		return super.readable(name as any, {
			getValue: dependX(
				func,
				deferredOptions,
				makeDependPropertySubscriber(name as any),
			),
		}) as any
	}

	public nested<
		Name extends keyof TObject,
		TPropertyClass extends PropertyClass<TObject>,
	>(
		name: Name,
		build: (builder: DependCalcObjectBuilder<PropertyClass<TObject>, TObject>)
			=> { object: TPropertyClass },
	): this & { object: { readonly [newProp in Name]: TObject[Name] } } {
		const propClass = propertyClass(build)
		return super.readable(name as any, {
			factory() {
				return new propClass(this)
			},
		}) as any
	}

	public nestedCalc2<
		TInput,
		Name extends keyof TObject,
	>(
		name: Name,
		inputOrFactory: ((source: TObject, name?: string) => TInput) | NotFunction<TInput>,
		calcFactory: (input: TInput, name?: string) => CalcPropertyClass<TObject[Name], TInput>,
	): this { // & { object: { readonly [newProp in Name]: TObject[Name] } } {
		return (this as ObservableObjectBuilder<TObject>)
			.readable<
				Extract<Name, string|number>,
				CalcPropertyClass<TObject[Name], TInput>
			>(name as Extract<Name, string|number>, {
				factory(this: TObject) {
					let input: TInput
					if (typeof inputOrFactory !== 'undefined') {
						input = typeof inputOrFactory === 'function'
							? (inputOrFactory as (object: TObject, name?: string) => TInput)(
								this,
								name as any != null ? name as any : this.constructor.name,
							)
							: inputOrFactory
					}
					return calcFactory(input, `${this.constructor.name}.${name}`)
				},
			}) as any
	}

	public nestedCalc<
		Name extends keyof TObject,
		TConnector extends PropertyClass<TObject>
	>(
		name: Name,
		build: (builder: DependCalcObjectBuilder<PropertyClass<TObject>, TObject>)
			=> { object: TConnector },
		func: (this: TConnector)
			=> ThenableOrIteratorOrValue<TObject[Name]>,
		deferredOptions?: IDeferredOptions,
	): this & { object: { readonly [newProp in Name]: TObject[Name] } } {
		const inputClass = propertyClass(build)
		const propClass = calcPropertyClass(func, deferredOptions)
		return super.readable(name as any, {
			factory() {
				return new propClass(new inputClass(this))
			},
		}) as any
	}

	public nestedCalcX<
		Name extends keyof TObject,
		TConnector extends PropertyClass<TObject>
	>(
		name: Name,
		build: (builder: DependCalcObjectBuilder<PropertyClass<TObject>, TObject>)
			=> { object: TConnector },
		func: (this: CallState<CalcPropertyClass<TObject[Name], TConnector>, any[], TObject[Name]>)
			=> ThenableOrIteratorOrValue<TObject[Name]>,
		deferredOptions?: IDeferredOptions,
	): this & { object: { readonly [newProp in Name]: TObject[Name] } } {
		const inputClass = propertyClass(build)
		const propClass = calcPropertyClassX(func, deferredOptions)
		return super.readable(name as any, {
			factory() {
				return new propClass(new inputClass(this))
			},
		}) as any
	}
}

// region PropertyClass

export class PropertyClass<TObject> extends ObservableClass {
	/** @internal */
	public $object: TObject
	constructor(object: TObject) {
		super();
		(this as any).$object = object
	}
}

new ObservableObjectBuilder(PropertyClass.prototype)
	.writable('$object', {
		hidden: true,
	})

export function propertyClass<
	TObject,
	TPropertyClass extends TBaseClass,
	TBaseClass extends PropertyClass<TObject> = PropertyClass<TObject>,
>(
	build: (builder: DependCalcObjectBuilder<TBaseClass, TObject>) => { object: TPropertyClass },
	baseClass?: TClass<[TObject], TBaseClass>,
) {
	const objectPath = Path.build<TBaseClass>()(o => o.$object)()

	return observableClass<
		[TObject, string?],
		TBaseClass,
		TPropertyClass
	>(
		object => build(new DependCalcObjectBuilder<TBaseClass, TObject>(object, objectPath as any)).object,
		baseClass != null ? baseClass : PropertyClass as any,
	)
}

// endregion

// region CalcPropertyClass

export class CalcPropertyClass<TValue, TInput> extends ObservableClass {
	public input: TInput
	public readonly name: string

	constructor(input: TInput, name?: string) {
		super()
		this.input = input
		this.name = name
	}

	public [VALUE_PROPERTY_DEFAULT]: TValue
}

new ObservableObjectBuilder(CalcPropertyClass.prototype)
	.writable('input')

export function calcPropertyClassX<
	TInput,
	TValue,
	TCalcPropertyClass extends TBaseClass,
	TBaseClass extends CalcPropertyClass<TValue, TInput>
		= CalcPropertyClass<TValue, TInput>,
>(
	func: (this: CallState<TCalcPropertyClass, any[], TValue>)
		=> ThenableOrIteratorOrValue<TValue>,
	deferredOptions?: IDeferredOptions,
	baseClass?: TClass<[TInput], TBaseClass>,
) {
	// const inputPath = Path.build<TBaseClass>()(o => o.input)()

	return observableClass<
		[TInput, string?],
		TBaseClass,
		TCalcPropertyClass
	>(
		object => new DependCalcObjectBuilder<TBaseClass>(object) // , inputPath, inputPath)
			.dependCalcX(VALUE_PROPERTY_DEFAULT, func, deferredOptions)
			.object as any,
		baseClass != null ? baseClass : CalcPropertyClass as any,
	)
}

export function calcPropertyClass<
	TInput,
	TValue,
	TCalcPropertyClass extends TBaseClass,
	TBaseClass extends CalcPropertyClass<TValue, TInput>
		= CalcPropertyClass<TValue, TInput>,
>(
	func: (this: TInput) => ThenableOrIteratorOrValue<TValue>,
	deferredOptions?: IDeferredOptions,
	baseClass?: TClass<[TInput, string?], TBaseClass>,
) {
	const inputPath = Path.build<TBaseClass>()(o => o.input, true)()

	return observableClass<
		[TInput, string?],
		TBaseClass,
		TCalcPropertyClass
	>(
		object => new DependCalcObjectBuilder<TBaseClass, TInput, TInput>(object, inputPath as any, inputPath as any)
			.dependCalc(VALUE_PROPERTY_DEFAULT, func, deferredOptions)
			.object as any,
		baseClass != null ? baseClass : CalcPropertyClass as any,
	)
}

export function dependCalcPropertyFactory<
	TInput,
	TValue,
	// TCalcPropertyClass extends TBaseClass,
	// TBaseClass extends CalcPropertyClass<TValue, TInput>
	// 	= CalcPropertyClass<TValue, TInput>,
>({
	name,
	calcFunc,
	calcFuncX,
	deferredOptions,
	// baseClass,
}: {
	name?: string,
	calcFunc: (this: TInput) => ThenableOrIteratorOrValue<TValue>,
	calcFuncX?: void,
	deferredOptions?: IDeferredOptions,
	// baseClass?: TClass<[TInput, string?], TBaseClass>,
} | {
	name?: string,
	calcFunc?: void,
	calcFuncX: (this: CallState<CalcPropertyClass<TValue, TInput>, any[], TValue>) => ThenableOrIteratorOrValue<TValue>,
	deferredOptions?: IDeferredOptions,
	// baseClass?: TClass<[TInput, string?], TBaseClass>,
}): (input: TInput, name?: string) => CalcPropertyClass<TValue, TInput> {
	const NewProperty = (calcFuncX != null
		? calcPropertyClass as any
		: calcPropertyClassX as any)
	(
		calcFunc,
		deferredOptions,
		// baseClass,
	)
	return (input: TInput, _name?: string) => new NewProperty(input, _name != null ? _name : name) as any
}

// endregion

class Class extends ObservableClass {
	public prop1: number
	public prop2: string
}

new DependCalcObjectBuilder(new Class())
	.writable('prop1')
	.nestedCalc2(
		'prop2',
		o => o,
		dependCalcPropertyFactory({
			calcFuncX() {
				const x = this._this.input.prop1
				return ''
			},
		}),
	)
