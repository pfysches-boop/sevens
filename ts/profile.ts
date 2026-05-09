class Profile {
  name: string
  pictureURI: string

  constructor(name: string, pictureURI: string) {
    this.name = name
    this.pictureURI = pictureURI
  }

  static imageToURI(image: HTMLImageElement): string {
    const canvas: HTMLCanvasElement = 
      document.createElement('canvas')
    canvas.width = image.width
    canvas.height = image.height

    const ctx: CanvasRenderingContext2D
      = canvas.getContext('2d') as CanvasRenderingContext2D
    
    ctx.drawImage(image, 0, 0)

    return canvas.toDataURL()
  }

}