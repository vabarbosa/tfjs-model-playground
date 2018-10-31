
const modelUrl = '/model/tensorflowjs_model.pb'
const weightsUrl = '/model/weights_manifest.json'
const colorMapUrl = '/assets/color-map.json'

const imageSize = 512

let targetSize = { w: imageSize, h: imageSize }
let theModel
let imageElement
let colorMap

let loadModel = async function () {
  console.log('load model started')
  $('button, input').attr('disabled', true)
  $('#message').append('<div>loading model...</div>')
  let start = (new Date()).getTime()

  theModel = await tf.loadFrozenModel(modelUrl, weightsUrl)

  let end = (new Date()).getTime()
  $('#message').append(`<div>model loaded in ${(end - start) / 1000} secs</div>`)
  $('button, input').attr('disabled', null)
  console.log(`load model completed: ${theModel}`)
}

let loadImage = function (input) {
  if (input.files && input.files[0]) {
    console.log('loadImage: started')
    $('button, input').attr('disabled', true)
    $('#message').append('<div>resizing image...</div>')

    var reader = new FileReader()

    reader.onload = function (e) {
      let src = e.target.result
      console.log('loadImage (dataURL):', src)

      imageElement = new Image()
      document.getElementById('canvasimage').getContext('2d').clearRect(0, 0, targetSize.w, targetSize.h)
      document.getElementById('canvassegments').getContext('2d').clearRect(0, 0, targetSize.w, targetSize.h)
      imageElement.onload = function () {
        let resizeRatio = imageSize / Math.max(imageElement.width, imageElement.height)
        targetSize.w = Math.round(resizeRatio * imageElement.width)
        targetSize.h = Math.round(resizeRatio * imageElement.height)

        let origSize = {
          w: imageElement.width,
          h: imageElement.height
        }
        imageElement.width = targetSize.w
        imageElement.height = targetSize.h

        let canvas = document.getElementById('canvasimage')
        canvas.width = targetSize.w
        canvas.height = targetSize.w
        canvas
          .getContext('2d')
          .drawImage(imageElement, 0, 0, targetSize.w, targetSize.h)

        $('#message').append(`<div>resized from ${origSize.w} x ${origSize.h} to ${targetSize.w} x ${targetSize.h}</div>`)
        $('button, input').attr('disabled', null)
        console.log('loadImage: completed')
      }
      
      imageElement.src = src
    }

    reader.readAsDataURL(input.files[0])
  } else {
    $('#message').append('<div>no image uploaded</div>')
  }
}

let runModel = async function () {
  if (imageElement) {
    console.log('runModel started')
    $('button, input').attr('disabled', true)

    let img = preprocessInput(imageElement)

    $('#message').append('<div>running inference...</div>')
    let start = (new Date()).getTime()
    console.log('model.predict (input):', img.dataSync())

    const output = theModel.predict(img)
    console.log('model.predict (output):', output)

    await processOutput(output)

    let end = (new Date()).getTime()
    $('#message').append(`<div>inference ran in ${(end - start) / 1000} secs</div>`)
    $('button, input').attr('disabled', null)
    console.log('runModel completed')
  } else {
    $('#message').append('<div>no image provided</div>')
  }
}

let loadColorMap = async function () {
  let response = await fetch(colorMapUrl)
  colorMap = await response.json()

  if (colorMap && colorMap.hasOwnProperty('colorMap')) {
    colorMap = colorMap['colorMap']
  } else {
    console.warn('failed to fetch colormap')
    colorMap = []
  }
}

let preprocessInput = function (imageInput) {
  // get tensor from image
  let theImage = tf.fromPixels(imageInput)

  theImage.print()
  console.log('preprocessInput: ImageTensor shape = ', theImage.shape)

  let preprocessed = theImage.expandDims()

  console.log('preprocessInput:', preprocessed)
  return preprocessed
}

let processOutput = async function (output) {
  let segMap = Array.from(output.dataSync())
  if (!colorMap) {
    await loadColorMap()
  }
  
  let segMapColor = segMap.map(seg => colorMap[seg])

  let canvas = document.getElementById('canvassegments')
  let ctx = canvas.getContext('2d')
  canvas.width = targetSize.w
  canvas.height = targetSize.h

  let data = []
  for (var i = 0; i < segMapColor.length; i++) {
    data.push(segMapColor[i][0]) // red
    data.push(segMapColor[i][1]) // green
    data.push(segMapColor[i][2]) // blue
    data.push(175)            // alpha
  }

  let imageData = new ImageData(targetSize.w, targetSize.h)
  imageData.data.set(data)
  ctx.putImageData(imageData, 0, 0)

  console.log('processOutput:', imageData)
}

$('#modelload').on('click', loadModel)

$('#modelimage')
  .val(null)
  .attr('disabled', true)

$('#modelrun')
  .on('click', runModel)
  .attr('disabled', true)
