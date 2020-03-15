import {isThenable, Thenable, ThenableIterator, ThenableOrIteratorOrValue} from '../../async/async'
import {resolveAsync} from '../../async/ThenableSync'
import {isIterator} from '../../helpers/helpers'
import {Func, FuncCallStatus, IFuncCallState, TCall} from './contracts'
import {InternalError} from './helpers'
import {_subscribe, unsubscribeDependencies} from './subscribeDependency'
import {getSubscriberLink, releaseSubscriberLink} from './subscriber-link-pool'

// region FuncCallStatus

// region Types

type Flag_None = 0

type Flag_Invalidating = 1
type Flag_Invalidated = 2
type Mask_Invalidate = (0 | Flag_Invalidating | Flag_Invalidated)

type Flag_Invalidate_Self = 4

type Flag_Calculating = 8
type Flag_Calculating_Async = 24
type Flag_Calculated = 32
type Mask_Calculate = (0 | Flag_Calculating | Flag_Calculating_Async | Flag_Calculated)

type Flag_HasValue = 64

type Flag_HasError = 128

type Update_Invalidating = Flag_Invalidating
type Update_Invalidated = Flag_Invalidated
type Update_Invalidating_Self = 5
type Update_Invalidated_Self = 6
type Update_Calculating = Flag_Calculating
type Update_Calculating_Async = Flag_Calculating_Async
type Update_Calculated_Value = 96
type Update_Calculated_Error = 160

type Mask_Update_Invalidate =
	Update_Invalidating
	| Update_Invalidated
	| Update_Invalidating_Self
	| Update_Invalidated_Self

type Mask_Update =
	Mask_Update_Invalidate
	| Update_Calculating
	| Update_Calculating_Async
	| Update_Calculated_Value
	| Update_Calculated_Error

// endregion

// region Flags

const Flag_None: Flag_None = 0

const Flag_Invalidating: Flag_Invalidating = 1
const Flag_Invalidated: Flag_Invalidated = 2
const Mask_Invalidate = 3

const Flag_Invalidate_Self: Flag_Invalidate_Self = 4

const Flag_Calculating: Flag_Calculating = 8
const Flag_Calculating_Async: Flag_Calculating_Async = 24
const Flag_Calculated: Flag_Calculated = 32
const Mask_Calculate = 56

const Flag_HasValue: Flag_HasValue = 64

const Flag_HasError: Flag_HasError = 128

const Update_Invalidating = Flag_Invalidating
const Update_Invalidated = Flag_Invalidated
const Update_Invalidating_Self = 5
const Update_Invalidated_Self = 6
const Update_Calculating = Flag_Calculating
const Update_Calculating_Async = Flag_Calculating_Async
const Update_Calculated_Value = 96
const Update_Calculated_Error = 160

const Mask_Update_Invalidate =
	Update_Invalidating
	| Update_Invalidated
	| Update_Invalidating_Self
	| Update_Invalidated_Self

const Mask_Update =
	Mask_Update_Invalidate
	| Update_Calculating
	| Update_Calculating_Async
	| Update_Calculated_Value
	| Update_Calculated_Error

// endregion

// region Properties

// region Invalidate

function getInvalidate(status: FuncCallStatus): Mask_Invalidate {
	return (status & Mask_Invalidate) as any
}

function setInvalidate(status: FuncCallStatus, value: Mask_Invalidate | Flag_None): FuncCallStatus {
	return (status & ~Mask_Invalidate) | value
}

function isInvalidating(status: FuncCallStatus): boolean {
	return (status & Flag_Invalidating) !== 0
}

function isInvalidated(status: FuncCallStatus): boolean {
	return (status & Flag_Invalidated) !== 0
}

// endregion

// region InvalidateSelf

function isInvalidateSelf(status: FuncCallStatus): boolean {
	return (status & Flag_Invalidate_Self) !== 0
}

function setInvalidateSelf(status: FuncCallStatus, value: boolean): FuncCallStatus {
	return value
		? status | Flag_Invalidate_Self
		: status & ~Flag_Invalidate_Self
}

// endregion

// region Calculate

function getCalculate(status: FuncCallStatus): Mask_Calculate {
	return (status & Mask_Calculate) as any
}

function setCalculate(status: FuncCallStatus, value: Mask_Calculate | Flag_None): FuncCallStatus {
	return (status & ~Mask_Calculate) | value
}

function isCalculating(status: FuncCallStatus): boolean {
	return (status & Flag_Calculating) !== 0
}

function isCalculated(status: FuncCallStatus): boolean {
	return (status & Flag_Calculated) !== 0
}

// endregion

// region HasValue

function isHasValue(status: FuncCallStatus): boolean {
	return (status & Flag_HasValue) !== 0
}

function setHasValue(status: FuncCallStatus, value: boolean): FuncCallStatus {
	return value
		? status | Flag_HasValue
		: status & ~Flag_HasValue
}

// endregion

// region HasError

function isHasError(status: FuncCallStatus): boolean {
	return (status & Flag_HasError) !== 0
}

function setHasError(status: FuncCallStatus, value: boolean): FuncCallStatus {
	return value
		? status | Flag_HasError
		: status & ~Flag_HasError
}

// endregion

// endregion

// endregion

export function checkStatus(status: FuncCallStatus): boolean {
	if ((status & Mask_Invalidate) === Mask_Invalidate) {
		return false
	}

	if ((status & Flag_Invalidate_Self) !== 0 && (status & Mask_Invalidate) === 0) {
		return false
	}

	if ((status & Flag_Calculated) !== 0) {
		if ((status & Mask_Invalidate) !== 0) {
			return false
		}
		if ((status & Flag_Calculating) !== 0) {
			return false
		}
	}

	if ((status & Flag_Calculating) === 0 && (status & (Flag_Calculating_Async & ~Flag_Calculating)) !== 0) {
		return false
	}

	if ((status & (Mask_Invalidate | Mask_Calculate)) === 0) {
		return false
	}

	return true
}

export function statusToString(status: FuncCallStatus): string {
	const buffer = []

	if ((status & Flag_Invalidating) !== 0) {
		buffer.push('Invalidating')
	}
	if ((status & Flag_Invalidated) !== 0) {
		buffer.push('Invalidated')
	}
	if ((status & Flag_Invalidate_Self) !== 0) {
		buffer.push('Self')
	}
	if ((status & Flag_Calculating) !== 0) {
		buffer.push('Calculating')
	}
	if ((status & (Flag_Calculating_Async & ~Flag_Calculating)) !== 0) {
		buffer.push('Async')
	}
	if ((status & Flag_Calculated) !== 0) {
		buffer.push('Calculated')
	}
	if ((status & Flag_HasError) !== 0) {
		buffer.push('HasError')
	}
	if ((status & Flag_HasValue) !== 0) {
		buffer.push('HasValue')
	}

	const remain = status & ~(
		Flag_Invalidating | Flag_Invalidated | Flag_Invalidate_Self
		| Flag_Calculating | (Flag_Calculating_Async & ~Flag_Calculating) | Flag_Calculated
		| Flag_HasError | Flag_HasValue
	)

	if (remain !== 0) {
		buffer.push(remain)
	}

	return buffer.join(' | ')
}

export function invalidateParents<
	TThis,
	TArgs extends any[],
	TValue,
>(
	state: IFuncCallState<TThis, TArgs, TValue>,
	status: Mask_Update_Invalidate,
) {
	if (state._subscribersFirst != null) {
		for (let link = state._subscribersFirst; link;) {
			const next = link.next
			const childState = link.value
			const childStatus = childState.status & Mask_Update_Invalidate
			if (childStatus === 0
				|| status !== Update_Invalidating
				&& childStatus !== Update_Invalidated_Self
				&& status !== childStatus
			) {
				updateInvalidate(childState, status)
			}
			link = next
		}
	}
}

export function updateInvalidate<
	TThis,
	TArgs extends any[],
	TValue,
>(
	state: IFuncCallState<TThis, TArgs, TValue>,
	status: Mask_Update_Invalidate,
) {
	const prevStatus = state.status

	if (status === Update_Invalidating || status === Update_Invalidating_Self) {
		if (isInvalidated(prevStatus)) {
			if (!isInvalidateSelf(prevStatus) && status === Update_Invalidating_Self) {
				state.status = setInvalidateSelf(prevStatus, true)
			}
			return
		}

		state.status = (prevStatus & (~(Mask_Invalidate | Flag_Calculated) | Flag_Invalidate_Self))
			| status

		invalidateParents(state, Update_Invalidating)
	} else if (status === Update_Invalidated || status === Update_Invalidated_Self) {
		if (!isInvalidating(prevStatus)) {
			if (!isInvalidateSelf(prevStatus) && status === Update_Invalidated_Self) {
				state.status = setInvalidateSelf(prevStatus, true)
			}
			return
		}

		state.status = (prevStatus & (~(Mask_Invalidate | Flag_Calculated) | Flag_Invalidate_Self))
			| status

		invalidateParents(state, Update_Invalidated)
	} else {
		throw new InternalError('Unknown status: ' + status)
	}
}

export function updateCalculating<
	TThis,
	TArgs extends any[],
	TValue,
>(
	state: IFuncCallState<TThis, TArgs, TValue>,
) {
	const prevStatus = state.status

	if (getInvalidate(prevStatus) === 0) {
		throw new InternalError(`Set status ${Update_Calculating} called when current status is ${prevStatus}`)
	}

	state.status = (prevStatus & ~(Mask_Invalidate | Flag_Invalidate_Self | Mask_Calculate)) | Flag_Calculating
}

export function updateCalculatingAsync<
	TThis,
	TArgs extends any[],
	TValue,
>(
	state: IFuncCallState<TThis, TArgs, TValue>,
	valueAsync: Thenable<TValue>,
) {
	const prevStatus = state.status

	if (!isCalculating(prevStatus)) {
		throw new InternalError(`Set status ${Update_Calculating_Async} called when current status is ${prevStatus}`)
	}
	state.valueAsync = valueAsync

	state.status = setCalculate(prevStatus, Update_Calculating_Async)
}

export function updateCalculated<
	TThis,
	TArgs extends any[],
	TValue,
>(
	state: IFuncCallState<TThis, TArgs, TValue>,
) {
	const prevStatus = state.status

	if (!isCalculating(prevStatus)) {
		throw new InternalError(`Set status ${Update_Calculated_Value} called when current status is ${prevStatus}`)
	}

	state.status = (prevStatus & (Flag_HasValue | Flag_HasError)) | Flag_Calculated

	const invalidateStatus = getInvalidate(prevStatus)
	if (invalidateStatus !== 0) {
		updateInvalidate(state, invalidateStatus)
	}
}

export function updateCalculatedValue<
	TThis,
	TArgs extends any[],
	TValue,
>(
	state: IFuncCallState<TThis, TArgs, TValue>,
	value: TValue,
) {
	const prevStatus = state.status

	if (!isCalculating(prevStatus)) {
		throw new InternalError(`Set status ${Update_Calculated_Value} called when current status is ${prevStatus}`)
	}
	if (state.valueAsync != null) {
		state.valueAsync = null
	}
	if ((prevStatus & (Flag_HasError | Flag_HasValue)) !== Flag_HasValue
		|| state.value !== value
	) {
		state.error = void 0
		state.value = value
		state.changeResultId = state.calcId
	}

	state.status = Update_Calculated_Value

	const invalidateStatus = getInvalidate(prevStatus)
	if (invalidateStatus !== 0) {
		updateInvalidate(state, invalidateStatus)
	}
}

export function updateCalculatedError<TThis,
	TArgs extends any[],
	TValue,
	>(
	state: IFuncCallState<TThis, TArgs, TValue>,
	error: any,
) {
	const prevStatus = state.status

	if (!isCalculating(prevStatus)) {
		throw new InternalError(`Set status ${Update_Calculated_Error} called when current status is ${prevStatus}`)
	}
	if (state.valueAsync != null) {
		state.valueAsync = null
	}
	state.error = error
	if ((prevStatus & Flag_HasError) === 0) {
		state.changeResultId = state.calcId
	}

	state.status = Update_Calculated_Error | (prevStatus & Flag_HasValue)

	const invalidateStatus = getInvalidate(prevStatus)
	if (invalidateStatus !== 0) {
		updateInvalidate(state, invalidateStatus)
	}
}

// tslint:disable-next-line:no-shadowed-variable
export function invalidate<
	TThis,
	TArgs extends any[],
	TValue,
>(
	state: IFuncCallState<TThis, TArgs, TValue>,
	status?: Mask_Update_Invalidate,
) {
	if (status == null) {
		updateInvalidate(state, Update_Invalidating_Self)
		updateInvalidate(state, Update_Invalidated_Self)
	} else {
		updateInvalidate(state, status)
	}
}

export function emit<
	TThis,
	TArgs extends any[],
	TValue,
>(state: IFuncCallState<TThis, TArgs, TValue>, status) {
	if (state._subscribersFirst != null) {
		let clonesFirst
		let clonesLast
		for (let link = state._subscribersFirst; link; link = link.next) {
			const cloneLink = getSubscriberLink(state, link.value, null, link.next)
			if (clonesLast == null) {
				clonesFirst = cloneLink
			} else {
				clonesLast.next = cloneLink
			}
			clonesLast = cloneLink
		}
		for (let link = clonesFirst; link;) {
			invalidate(link.value, status)
			link.value = null
			const next = link.next
			link.next = null
			releaseSubscriberLink(link)
			link = next
		}
	}
}

export class FuncCallState<TThis,
	TArgs extends any[],
	TValue,
	> {
	constructor(
		func: Func<TThis, TArgs, TValue>,
		_this: TThis,
		callWithArgs: TCall<TArgs>,
		valueIds: number[],
	) {
		this.func = func
		this._this = _this
		this.callWithArgs = callWithArgs
		this.valueIds = valueIds
	}

	public readonly func: Func<TThis, TArgs, TValue>
	public readonly _this: TThis
	public readonly callWithArgs: TCall<TArgs>
	public readonly valueIds: number[]
	public deleteOrder: number = 0

	public status = Flag_Invalidated | Flag_Invalidate_Self
	public valueAsync = null
	public value = void 0
	public error = void 0
	// for detect recursive async loop
	public parentCallState = null
	public _subscribersFirst = null
	public _subscribersLast = null
	/** for prevent recalc dependent funcs if dependencies.changeResultId <= dependent.changeResultId */
	public changeResultId = 0
	public calcId = 0
	// for prevent multiple subscribe equal dependencies
	public callId = 0
	public _unsubscribers = null
	public _unsubscribersLength = 0

	// calculable
	public get hasSubscribers(): boolean {
		return this._subscribersFirst != null
	}

	public get isHandling(): boolean {
		return (this.status & (Flag_Calculating | Flag_Invalidating)) !== 0
	}

	public get statusString(): string {
		return statusToString(this.status)
	}
}

// tslint:disable-next-line:no-shadowed-variable
export function createFuncCallState<TThis,
	TArgs extends any[],
	TValue,
	>(
	func: Func<TThis, TArgs, TValue>,
	_this: TThis,
	callWithArgs: TCall<TArgs>,
	valueIds: number[],
): IFuncCallState<TThis, TArgs, TValue> {
	return new FuncCallState(
		func,
		_this,
		callWithArgs,
		valueIds,
	)
}

function* checkDependenciesChangedAsync(
	state: IFuncCallState<any, any, any>,
	fromIndex?: number,
): ThenableIterator<boolean> {
	const {_unsubscribers, _unsubscribersLength} = state
	if (_unsubscribers != null) {
		const {changeResultId} = state
		for (let i = fromIndex || 0, len = _unsubscribersLength; i < len; i++) {
			const dependencyState = _unsubscribers[i].state
			if (getInvalidate(dependencyState.status) !== 0) {
				_dependentFunc(dependencyState, true)
			}

			if (getCalculate(dependencyState.status) === Flag_Calculating_Async) {
				yield resolveAsync(dependencyState.valueAsync, null, () => { }) as any
			}

			if (isCalculated(dependencyState.status)) {
				if (isHasError(dependencyState.status)) {
					unsubscribeDependencies(state, i + 1)
					updateCalculatedError(state, dependencyState.error)
					return false
				} else if (dependencyState.changeResultId > changeResultId) {
					unsubscribeDependencies(state)
					return true
				}
			} else {
				throw new InternalError('Unexpected dependency status: ' + dependencyState.status)
			}
		}
	}

	updateCalculated(state)
	return false
}

function checkDependenciesChanged(state: IFuncCallState<any, any, any>): ThenableIterator<boolean>|boolean {
	const {_unsubscribers, _unsubscribersLength} = state
	if (_unsubscribers != null) {
		const {changeResultId} = state
		for (let i = 0, len = _unsubscribersLength; i < len; i++) {
			const dependencyState = _unsubscribers[i].state
			if (getInvalidate(dependencyState.status) !== 0) {
				_dependentFunc(dependencyState, true)
			}

			if (isCalculated(dependencyState.status)) {
				if (isHasError(dependencyState.status)) {
					unsubscribeDependencies(state, i + 1)
					updateCalculatedError(state, dependencyState.error)
					return false
				} else if (dependencyState.changeResultId > changeResultId) {
					unsubscribeDependencies(state)
					return true
				}
			} else if (getCalculate(dependencyState.status) === Flag_Calculating_Async) {
				return checkDependenciesChangedAsync(state, i)
			} else {
				throw new InternalError('Unexpected dependency status: ' + dependencyState.status)
			}
		}
	}

	updateCalculated(state)
	return false
}

let currentState: IFuncCallState<any, any, any>
let nextCallId = 1
let nextCalcId = 1

// tslint:disable-next-line:no-shadowed-variable
export function subscribeDependency<
	TThis,
	TArgs extends any[],
	TValue,
>(state: IFuncCallState<TThis, TArgs, TValue>, dependency) {
	if (dependency.callId > state.callId) {
		if (getCalculate(state.status) !== Flag_Calculating_Async) {
			return
		}
		const _unsubscribers = state._unsubscribers
		for (let i = 0, len = state._unsubscribersLength; i < len; i++) {
			if (_unsubscribers[i].state === dependency) {
				return
			}
		}
	}
	{
		const subscriberLink = _subscribe(dependency, state)
		const _unsubscribers = state._unsubscribers
		if (_unsubscribers == null) {
			state._unsubscribers = [subscriberLink]
			state._unsubscribersLength = 1
		} else {
			_unsubscribers[state._unsubscribersLength++] = subscriberLink
		}
	}
}

export function _dependentFunc<
	TThis,
	TArgs extends any[],
	TValue,
>(state: IFuncCallState<TThis, TArgs, TValue>, dontThrowOnError?: boolean) {
	if (currentState != null) {
		subscribeDependency(currentState, state)
	}
	state.callId = nextCallId++

	const prevStatus = state.status

	if (isCalculated(state.status)) {
		if (isHasError(state.status)) {
			throw state.error
		}
		return state.value
	} else if (getCalculate(state.status) !== 0) {
		if (getCalculate(state.status) === Flag_Calculating_Async) {
			let parentCallState = state.parentCallState
			while (parentCallState) {
				if (parentCallState === state) {
					throw new InternalError('Recursive async loop detected')
				}
				parentCallState = parentCallState.parentCallState
			}
			return state.valueAsync
		} else if (getCalculate(state.status) === Flag_Calculating) {
			throw new InternalError('Recursive sync loop detected')
		} else {
			throw new InternalError('Unknown FuncCallStatus: ' + state.status)
		}
	} else if (getInvalidate(state.status) !== 0) {
		// nothing
	} else {
		throw new InternalError('Unknown FuncCallStatus: ' + state.status)
	}

	state.parentCallState = currentState
	currentState = null

	updateCalculating(state)

	// TODO remove this
	// unsubscribeDependencies(state)
	// return calc(state, dontThrowOnError)

	let shouldRecalc: ThenableIterator<boolean> | boolean
	if (isInvalidateSelf(prevStatus)) {
		shouldRecalc = true
		unsubscribeDependencies(state)
	} else {
		shouldRecalc = checkDependenciesChanged(state)
	}

	if (shouldRecalc === false) {
		if (isHasError(state.status)) {
			if (dontThrowOnError !== true) {
				throw state.error
			}
			return
		}
		return state.value
	}

	let value
	if (shouldRecalc === true) {
		value = calc(state, dontThrowOnError)
	} else if (isIterator(shouldRecalc)) {
		value = resolveAsync(shouldRecalc, o => {
			if (o === false) {
				if (isHasError(state.status)) {
					if (dontThrowOnError !== true) {
						throw state.error
					}
					return
				}
				return state.value
			}
			return calc(state, dontThrowOnError)
		})

		if (isThenable(value)) {
			updateCalculatingAsync(state, value)
		}
	} else {
		throw new InternalError(`shouldRecalc == ${shouldRecalc}`)
	}

	return value
}

export function calc<
	TThis,
	TArgs extends any[],
	TValue,
>(state: IFuncCallState<TThis, TArgs, TValue>, dontThrowOnError?: boolean) {
	state.callId = nextCallId++
	state.calcId = nextCalcId++

	let _isIterator = false
	try {
		currentState = state

		// let value: any = state.func.apply(state._this, arguments)
		let value: any = state.callWithArgs(state._this, state.func)

		if (!isIterator(value)) {
			if (isThenable(value)) {
				throw new InternalError('You should use iterator instead thenable for async functions')
			}
			updateCalculatedValue(state, value)
			return value
		}

		_isIterator = true

		value = resolveAsync(
			makeDependentIterator(state, value as Iterator<TValue>) as ThenableOrIteratorOrValue<TValue>,
		)

		if (isThenable(value)) {
			updateCalculatingAsync(state, value)
		}

		return value
	} catch (error) {
		if (error instanceof InternalError) {
			throw error
		}
		if (!_isIterator) {
			updateCalculatedError(state, error)
		}
		if (dontThrowOnError !== true) {
			throw error
		}
	} finally {
		currentState = state.parentCallState
		state.parentCallState = null
	}
}

export function* makeDependentIterator<TThis,
	TArgs extends any[],
	TValue,
	TFunc extends Func<TThis, TArgs, TValue>>(
	state: IFuncCallState<TThis, TArgs, TValue>,
	iterator: Iterator<TValue>,
	nested?: boolean,
): Iterator<TValue> {
	currentState = state

	try {
		let iteration = iterator.next()
		while (!iteration.done) {
			let value = iteration.value

			if (isIterator(value)) {
				value = makeDependentIterator(state, value as Iterator<TValue>, true)
			}

			value = yield value
			currentState = state
			iteration = iterator.next(value)
		}

		if (nested == null) {
			updateCalculatedValue(state, iteration.value)
		}
		return iteration.value
	} catch (error) {
		if (error instanceof InternalError) {
			throw error
		}
		if (nested == null) {
			updateCalculatedError(state, error)
		}
		throw error
	} finally {
		currentState = null
		state.parentCallState = null
	}
}
