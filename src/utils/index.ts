export async function getBase64(file: File): Promise<string> {
	const reader = new FileReader();
	return new Promise<string>((resolve) => {
		try {
			reader.readAsArrayBuffer(file);
			reader.addEventListener('load', (ev) => {
				const blob = new Blob([ev.target['result']]);
				window.URL = window.URL || window['webkitURL'];
				const blobURL = window.URL.createObjectURL(blob);
				const image = new Image();
				image.src = blobURL;
				image.addEventListener('load', () => {
					resolve(blobURL);
				});
			});
		} catch (e) {
			reader.addEventListener('load', function () {
				resolve(reader.result);
			});
			reader.readAsDataURL(file);
		}
	})
}

export class DetectionError extends Error {
	
	imageIndex: number = 0

	constructor(reason: string) {
		super(reason)
		
		this.name = DetectionError.name

		if (/^image one/.test(reason)) {
			this.imageIndex = 1;
		} else {
			this.imageIndex = 2;
		}
	}
}