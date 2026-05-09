class Profile {
    name;
    pictureURI;
    constructor(name, pictureURI) {
        this.name = name;
        this.pictureURI = pictureURI;
    }
    static imageToURI(image) {
        const canvas = document.createElement('canvas');
        canvas.width = image.width;
        canvas.height = image.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(image, 0, 0);
        return canvas.toDataURL();
    }
}
