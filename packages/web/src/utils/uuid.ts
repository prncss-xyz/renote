import { customAlphabet } from 'nanoid/non-secure'

const base64 =
	'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'
const seqn = 3 // number of characters in the sequencial part of the UUID
const seqMax = base64.length ** seqn // max value for the sequencial part

function encode(n: number) {
	let acc = ''
	while (n > 0) {
		acc = base64[n % base64.length] + acc
		n = Math.floor(n / base64.length)
	}
	while (acc.length < seqn) {
		acc = base64[0] + acc
	}
	return acc
}

const rand = customAlphabet(base64, 10)

function getFactory() {
	let count = Math.floor(Math.random() * seqMax)
	return function () {
		count++
		if (count >= seqMax) count = 0
		return encode(count) + rand()
	}
}

export const getUUID = getFactory()
