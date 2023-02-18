export default async function loadImage(url) {

    const img = new Image();
    img.src = url;

    return new Promise((resolve, reject) => {

        img.onload = () => {
            resolve(img.src)
        };

        img.onerror = () => {
            reject();
        }
    });
};