export function normalizeQuery(tag: string) {
	return tag.toLowerCase()
}

export function matchQuery(a: string, b: string) {
	return normalizeQuery(a).includes(normalizeQuery(b))
}
