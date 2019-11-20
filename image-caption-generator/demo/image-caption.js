/* global tf, Image, FileReader, vocabulary, generateCaption */

const modelUrl = '/model/model.json'

const imageSize = 512

const targetSize = { w: imageSize, h: imageSize }
let model
let imageElement
let vocab

/**
 * load the TensorFlow.js model
 */
window.loadModel = async function () {
  disableElements()
  message('loading model...')

  const start = (new Date()).getTime()

  // https://js.tensorflow.org/api/1.1.2/#loadGraphModel
  model = await tf.loadGraphModel(modelUrl)

  vocab = await vocabulary()

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
      document.getElementById('caption').innerText = ''

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
        canvas.height = targetSize.h
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

    const start = (new Date()).getTime()

    const initialState = getInitialState(img)
    const captions = generateCaption(model, vocab, initialState)

    await processOutput(captions)

    const end = (new Date()).getTime()

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

  const preprocessed = inputTensor.toFloat()

  console.log('preprocessInput:', preprocessed)
  return preprocessed
}

const getInitialState = function (input) {
  return model.execute({
    'convert_image/Cast': input
  }, 'lstm/initial_state')
}

/**
 * process output onto canvas for previewing
 *
 * @param {Tensor} output - the model output
 */
async function processOutput (output) {
  const results = []

  output.forEach((cap) => {
    const sentence = cap.sentence.map(wordid => {
      return vocab.id2word(wordid)
    }).join(' ')

    results.push({
      caption: sentence,
      probability: cap.probability
    })
  })

  caption(results)

  console.log('processOutput completed')
  console.log(JSON.stringify(results))
}

function caption (results) {
  const cap = document.getElementById('caption')
  if (results.length) {
    cap.innerText = results[0].caption
  } else {
    cap.innerText = '-- no results returned --'
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
