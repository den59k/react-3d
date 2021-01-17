export function saveFile (str){

	const file = new Blob([str], { type: 'application/json' });

	const a = document.createElement('a')
	a.href = URL.createObjectURL(file)
	a.download = 'project.json'
	a.click()
	a.remove()
}


export const loadFile = () => new Promise((res, _rej) => {
	const file = document.createElement('input')
	file.type = 'file'
	file.setAttribute('accept', 'application/json')

	file.addEventListener('change', (e) => {
		file.remove()
		const fileObject = e.target.files[0] 
		if(!fileObject) return
		
		const reader = new FileReader();
    reader.onload = function(event) {
      res(event.target.result)
    };
    reader.readAsText(fileObject);

	}, { once: true })

	file.click()
})