function markdown(str: string) {
	return '```' + 'markdown' + '\n' + str + '\n' + '```' + '\n'
}
export const firstNote = `# Welcome to Renote

Renote is a local-first (currently local-only) note-taking app.

To format text, use markdown shortcuts, as described [here](https://www.markdownguide.org/cheat-sheet/). For exemple:

${markdown(`# Title

## Subtitle

This word is _bold_.`)}

As this is still an exploration, don't store anything important here, because it **will** be lost.

I have some advanced features in mind, which are my main motivation for writing this app. However, my current focus is on having a robust implementation of basic features, such as tags, search, and trans bin. I am very excited to see where it will lead me!
`
