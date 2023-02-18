export default function stringToElement(string) {
    const div = document.createElement('div');
    div.innerHTML = string;
    return div.firstElementChild;
};