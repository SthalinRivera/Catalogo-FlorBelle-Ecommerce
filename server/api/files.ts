// export default defineEventHandler(async (event) => {
//     const { files } = await readBody<{ files: File[] }>(event)

//     for ( const file of files ) {
//         await storeFileLocally(
//             file,         // the file object
//             8,            // you can add a name for the file or length of Unique ID that will be automatically generated!
//             '/userFiles'  // the folder the file will be stored in
//         )

//         // {OR}

//         // Parses a data URL and returns an object with the binary data and the file extension.
//         const { binaryString, ext } = parseDataUrl(file.content)
//     }

//     return 'success!'
// })

// interface File {
//     name: string
//     content: string
// }
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