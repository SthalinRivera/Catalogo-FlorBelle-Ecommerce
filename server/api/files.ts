
export default defineEventHandler(async (event) => {
	const { files } = await readBody<{ files: File[] }>(event)
	const fileNames: string[] = []
	for (const file of files) {
		fileNames.push(await storeFileLocally(file, 12, '/upload'))
	}
	return fileNames
})

interface File {
	name: string
	content: string
	size: string
	type: string
	lastModified: string
}