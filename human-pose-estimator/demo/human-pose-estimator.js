/* global tf, fetch, estimatePoses, Image */

const MODELURL = '/model/tensorflowjs_model.pb'
const WEIGHTSURL = '/model/weights_manifest.json'
const COCO = '/assets/coco-common.json'

const imageSize = 512

let targetSize = { w: imageSize, h: imageSize }
let openPoseModel
let imageElement
let cocoUtil

/**
 * load the TensorFlow.js model
 */
async function loadModel () {
  disableElements()
  message('loading model...')

  let start = (new Date()).getTime()

  // https://js.tensorflow.org/api/latest/#loadFrozenModel
  openPoseModel = await tf.loadFrozenModel(MODELURL, WEIGHTSURL)

  let end = (new Date()).getTime()

  message(`model loaded in ${(end - start) / 1000} secs`, true)
  enableElements()
}

/**
 * handle image upload
 *
 * @param {DOM Node} input - the image file upload element
 */
function loadImage (input) {
  if (input.files && input.files[0]) {
    disableElements()
    message('resizing image...')

    let reader = new FileReader()

    reader.onload = function (e) {
      let src = e.target.result

      document.getElementById('canvasimage').getContext('2d').clearRect(0, 0, targetSize.w, targetSize.h)
      document.getElementById('canvasposes').getContext('2d').clearRect(0, 0, targetSize.w, targetSize.h)

      imageElement = new Image()
      imageElement.src = src

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

        message(`resized from ${origSize.w} x ${origSize.h} to ${targetSize.w} x ${targetSize.h}`)
        enableElements()
      }
    }

    reader.readAsDataURL(input.files[0])
  } else {
    message('no image uploaded', true)
  }
}

/**
 * run the model and get a prediction
 */
async function runModel () {
  if (imageElement) {
    disableElements()
    message('running inference...')

    let img = preprocessInput(imageElement)
    console.log('model.predict (input):', img.dataSync())

    let start = (new Date()).getTime()

    // https://js.tensorflow.org/api/latest/#tf.Model.predict
    const output = openPoseModel.predict(img)

    let end = (new Date()).getTime()

    console.log('model.predict (output):', output.dataSync())
    await processOutput(output)

    message(`inference ran in ${(end - start) / 1000} secs`, true)
    enableElements()
  } else {
    message('no image available', true)
  }
}

/**
 * convert image to Tensor input required by the model
 *
 * @param {HTMLImageElement} imageInput - the image element
 */
function preprocessInput (imageInput) {
  console.log('preprocessInput started')

  // create tensor from input element
  let inputTensor = tf.browser.fromPixels(imageInput)

  // https://js.tensorflow.org/api/latest/#expandDims
  let preprocessed = inputTensor.toFloat().expandDims()

  console.log('preprocessInput completed:', preprocessed)
  return preprocessed
}

/**
 * convert model Tensor output to pose data
 *
 * @param {Tensor} output - the model output
 */
async function processOutput (output) {
  console.log('processOutput started')

  let canvas = document.getElementById('canvasposes')
  let canvasCtx = canvas.getContext('2d')
  canvas.width = targetSize.w
  canvas.height = targetSize.w

  let poses = estimatePoses(output, targetSize.w, targetSize.h, cocoUtil)

  for (var i = 0; i < poses.length; i++) {
    poses[i].bodyParts.forEach(p => {
      let color = `rgb(${cocoUtil.cocoColors[p.partId]})`
      drawPoint(canvasCtx, p.x, p.y, color)
    })
    poses[i].poseLines.forEach((l, j) => {
      let color = `rgb(${cocoUtil.cocoColors[j].join()})`
      drawLine(canvasCtx, ...l, color)
    })
  }

  console.log('processOutput completed:', poses)
}

/**
 * draw point on given canvas
 *
 * @param {CanvasRenderingContext2D} canvasCtx - the canvas rendering context to draw point
 * @param {Integer} x - the horizontal value of point
 * @param {Integer} y - the vertical value of point
 * @param {String} c - the color value for point
 */
function drawPoint (canvasCtx, x, y, c = 'black') {
  canvasCtx.beginPath()
  canvasCtx.arc(x, y, 4, 0, 2 * Math.PI)
  canvasCtx.fillStyle = c
  canvasCtx.fill()
}

/**
 * Draws a line on a canvas
 *
 * @param {CanvasRenderingContext2D} canvasCtx - the canvas rendering context to draw point
 * @param {Integer} x1 - the horizontal value of first point
 * @param {Integer} y1 - the vertical value of first point
 * @param {Integer} x2 - the horizontal value of first point
 * @param {Integer} y2 - the vertical value of first point
 * @param {String} c - the color value for line
 */
function drawLine (canvasCtx, x1, y1, x2, y2, c = 'black') {
  canvasCtx.beginPath()
  canvasCtx.moveTo(x1, y1)
  canvasCtx.lineTo(x2, y2)
  canvasCtx.lineWidth = 2
  canvasCtx.strokeStyle = c
  canvasCtx.stroke()
}

function disableElements () {
  const buttons = document.getElementsByTagName('button')
  for (var i = 0; i < buttons.length; i++) {
    buttons[i].setAttribute('disabled', true)
  }

  const inputs = document.getElementsByTagName('input')
  for (var j = 0; j < inputs.length; j++) {
    inputs[j].setAttribute('disabled', true)
  }
}

function enableElements () {
  const buttons = document.getElementsByTagName('button')
  for (var i = 0; i < buttons.length; i++) {
    buttons[i].removeAttribute('disabled')
  }

  const inputs = document.getElementsByTagName('input')
  for (var j = 0; j < inputs.length; j++) {
    inputs[j].removeAttribute('disabled')
  }
}

function message (msg, highlight) {
  let mark = null
  if (highlight) {
    mark = document.createElement('mark')
    mark.innerText = msg
  }

  const node = document.createElement('div')
  if (mark) {
    node.appendChild(mark)
  } else {
    node.innerText = msg
  }

  document.getElementById('message').appendChild(node)
}

async function loadCoco () {
  disableElements()
  try {
    let response = await fetch(COCO)
    cocoUtil = await response.json()
    enableElements()
  } catch (err) {
    console.warn('failed to fetch coco-common.json')
  }
}

// init
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', loadCoco)
} else {
  setTimeout(loadCoco, 500)
}
