/* global tf, Image, FileReader, fetch */

const modelUrl = '/model/model.json'

const threshold = 0.7
const imageSize = 512
const labelsMapUrl = '/assets/labels-map.json'

const targetSize = { w: imageSize, h: imageSize }
let model
let imageElement
let labelsMap

/**
 * load the TensorFlow.js model
 */
window.loadModel = async function () {
  disableElements()
  message('loading model...')

  const start = (new Date()).getTime()

  // https://js.tensorflow.org/api/1.1.2/#loadGraphModel
  model = await tf.loadGraphModel(modelUrl)

  const end = (new Date()).getTime()

  message(model.modelUrl)
  message(`model loaded in ${(end - start) / 1000} secs`, true)
  enableElements()
}

/**
 * handle image upload
 *
 * @param {DOM Node} input - the image file upload element
 */
window.loadImage = function (input) {
  if (input.files && input.files[0]) {
    disableElements()
    message('resizing image...')

    const reader = new FileReader()

    reader.onload = function (e) {
      const src = e.target.result

      document.getElementById('canvasimage').getContext('2d').clearRect(0, 0, targetSize.w, targetSize.h)
      document.getElementById('canvassegments').getContext('2d').clearRect(0, 0, targetSize.w, targetSize.h)

      imageElement = new Image()
      imageElement.src = src

      imageElement.onload = function () {
        const resizeRatio = imageSize / Math.max(imageElement.width, imageElement.height)
        targetSize.w = Math.round(resizeRatio * imageElement.width)
        targetSize.h = Math.round(resizeRatio * imageElement.height)

        const origSize = {
          w: imageElement.width,
          h: imageElement.height
        }
        imageElement.width = targetSize.w
        imageElement.height = targetSize.h

        const canvas = document.getElementById('canvasimage')
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
window.runModel = async function () {
  if (imageElement) {
    disableElements()
    message('running inference...')

    const img = preprocessInput(imageElement)
    console.log('model.predict (input):', img.dataSync())

    const start = (new Date()).getTime()

    // https://js.tensorflow.org/api/latest/#tf.Model.predict
    // const output = model.predict(img)

    // Error: The model contains control flow or dynamic shape ops, please use executeAsync method
    // https://github.com/tensorflow/tfjs/issues/1169#issuecomment-458723296
    // https://js.tensorflow.org/api/latest/#tf.GraphModel.executeAsync
    const output = await model.executeAsync(
      { image_tensor: img },
      ['detection_scores', 'detection_boxes', 'detection_classes'])
    // [detection_scores, detection_boxes, num_detections, detection_classes]

    const end = (new Date()).getTime()

    console.log('model.predict (output):', output)
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

  const inputTensor = tf.browser.fromPixels(imageInput)

  // https://js.tensorflow.org/api/latest/#expandDims
  const preprocessed = inputTensor.expandDims()

  console.log('preprocessInput completed:', preprocessed)
  return preprocessed
}

/**
 * process output onto canvas for previewing
 *
 * @param {Tensor} output - the model output
 */
async function processOutput (output) {
  console.log('processOutput started')

  if (!labelsMap) {
    await loadLabelsMap()
  }

  // output[0] = detection_scores  // shape: [1, x]
  // output[1] = detection_boxes   // shape: [1, x, 4]
  // output[2] = detection_classes // shape: [1, x]
  const scores = Array.from(output[0].dataSync())
  const boxes = output[1].arraySync()[0]
  const classes = Array.from(output[2].dataSync())

  const results = []
  scores.forEach((score, i) => {
    if (score > threshold) {
      results.push({
        label_id: classes[i],
        label: labelsMap[classes[i]],
        probability: score.toFixed(4),
        detection_box: [
          boxes[i][1] * targetSize.w, // x1
          boxes[i][0] * targetSize.h, // y1
          boxes[i][3] * targetSize.w, // x2
          boxes[i][2] * targetSize.h // y2
        ]
      })
    }
  })

  drawResults(results)
  console.log('processOutput completed:', results)
}

function drawResults (results) {
  const canvas = document.getElementById('canvassegments')
  const ctx = canvas.getContext('2d')
  canvas.width = targetSize.w
  canvas.height = targetSize.h

  results.forEach(result => {
    drawBoundingBox(ctx, ...result.detection_box, result.label)
  })
}

const drawBoundingBox = function (canvasCtx, x1, y1, x2, y2, label) {
  canvasCtx.beginPath()
  canvasCtx.rect(x1, y1, x2 - x1, y2 - y1)
  canvasCtx.strokeStyle = 'red'
  canvasCtx.lineWidth = 4
  canvasCtx.stroke()
  canvasCtx.closePath()

  if (label) {
    const fontSize = 14
    canvasCtx.beginPath()
    canvasCtx.textBaseline = 'top'
    canvasCtx.fillStyle = 'red'
    canvasCtx.font = `400 ${fontSize}px "Arial"`

    const hPad = 5
    const lHeight = 18
    const x = (x1 - 1 < 1) ? x1 : x1 - 2
    const y = (y1 - lHeight < 1) ? y1 : y1 - lHeight
    const w = canvasCtx.measureText(label).width

    canvasCtx.fillRect(x, y, w + (hPad * 2), lHeight)

    canvasCtx.fillStyle = 'white'
    canvasCtx.fillText(label, x + hPad, y + (lHeight - fontSize) / 2)
    canvasCtx.closePath()
  }
}

async function loadLabelsMap () {
  const response = await fetch(labelsMapUrl)
  labelsMap = await response.json()

  if (labelsMap && labelsMap.labels) {
    labelsMap = labelsMap.labels
  } else {
    console.warn('failed to fetch labelsmap')
    labelsMap = []
  }
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

function init () {
  message(`tfjs version: ${tf.version.tfjs}`, true)
}

// ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init)
} else {
  setTimeout(init, 500)
}
