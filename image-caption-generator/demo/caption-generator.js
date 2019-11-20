/* globals tf */

const searchSize = 3
const maxCaptionLength = 20

const captionEntry = function (sentence, state) {
  return {
    sentence: sentence,
    state: Array.from(state.dataSync()),
    logprob: 0.0,
    score: 0.0
  }
}

const capgen = {
  model: null,
  vocab: null,
  initialState: null,
  initialCaption: null,
  partialCaptionsList: null,
  partialCaptions: null
}

window.generateCaption = function (theModel, theVocab, initialState) {
  capgen.model = theModel
  capgen.vocab = theVocab
  capgen.initialCaption = captionEntry([capgen.vocab.startId], initialState)

  capgen.partialCaptions = [
    capgen.initialCaption
  ]

  capgen.completeCaptions = []

  for (var i = 0; i < maxCaptionLength; i++) {
    capgen.partialCaptionsList = capgen.partialCaptions.sort((a, b) => {
      return a.score < b.score
    }).slice(0, searchSize)

    capgen.partialCaptions = []

    const inf = capgen.partialCaptionsList.map(c => {
      return c.sentence[c.sentence.length - 1]
    })

    capgen.inputFeed = tf.tensor1d(inf, 'int32')

    const stf = capgen.partialCaptionsList.map(c => {
      return c.state
    })

    capgen.stateFeed = tf.tensor2d(stf, [stf.length, stf[0].length], 'float32')

    const r = runInference(capgen.model, capgen.inputFeed, capgen.stateFeed)

    const softmax = r[0]
    const states = r[1]

    capgen.partialCaptionsList.forEach((partialCaption, i) => {
      const wordProb = softmax[i].map((p, i) => {
        return { i: i, p: p }
      }).sort((a, b) => {
        return b.p - a.p
      }).slice(0, 3)

      const state = states[i]

      wordProb.forEach(w => {
        if (w.p > 1e-12) {
          const sentence = partialCaption.sentence.concat(w.i)
          const logprob = partialCaption.logprob + Math.log(w.p)
          const score = logprob
          const cap = {
            sentence: sentence,
            state: state,
            logprob: logprob,
            score: score
          }

          if (w.i === capgen.vocab.endId) {
            capgen.completeCaptions.push(cap)
          } else {
            capgen.partialCaptions.push(cap)
          }
        }
      })
    })
  }

  if (!capgen.completeCaptions.length) {
    capgen.completeCaptions = capgen.partialCaptions
  }

  return capgen.completeCaptions.slice(0, 3).map(cap => {
    return {
      sentence: cap.sentence.slice(1, -1),
      probability: Math.exp(cap.logprob)
    }
  })
}

const runInference = function (model, inputFeed, stateFeed) {
  return tf.tidy(() => {
    const r = model.execute({
      input_feed: inputFeed,
      'lstm/state_feed': stateFeed
    }, ['softmax', 'lstm/state'])

    const softmax = r[0].arraySync()
    const states = r[1].arraySync()

    return [softmax, states]
  })
}
