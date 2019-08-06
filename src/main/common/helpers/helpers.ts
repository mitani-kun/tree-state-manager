export function isIterable(value: any): boolean {
	return value
		&& typeof value[Symbol.iterator] === 'function'
}

export function isIterator(value: any): boolean {
	return value
		&& typeof value[Symbol.iterator] === 'function'
		&& typeof value.next === 'function'
}
