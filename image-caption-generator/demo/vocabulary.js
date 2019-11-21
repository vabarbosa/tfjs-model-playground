/* globals fetch */

const START_WORD = '<S>'
const END_WORD = '</S>'
const UNK_WORD = '<UNK>'

const VOCAB_FILE = '/assets/word-counts.txt'

window.vocabList = []
const options = {}

async function readFile () {
  const response = await fetch(VOCAB_FILE)
  const vocabStr = await response.text()

  vocabList = vocabStr.split('\n').map(line => {
    return line.split(' ')[0]
  })

  console.log(`using vocabulary file: ${options.vocabFile}`)

  if (vocabList.indexOf(options.startWord) === -1) {
    console.warn(`adding start word: ${options.startWord}`)
    vocabList.push(options.startWord)
  }

  if (vocabList.indexOf(options.endWord) === -1) {
    console.warn(`adding end word: ${options.endWord}`)
    vocabList.push(options.endWord)
  }

  if (vocabList.indexOf(options.unkWord) === -1) {
    console.warn(`adding unknown word: ${options.unkWord}`)
    vocabList.push(options.unkWord)
  }

  console.log(`created vocabulary with ${vocabList.length} words`)
}

async function vocabulary (config) {
  if (typeof config === 'object') {
    options.vocabFile = config.vocabFile || VOCAB_FILE
    options.startWord = config.startWord || START_WORD
    options.endWord = config.endWord || END_WORD
    options.unkWord = config.unkWord || UNK_WORD
  } else {
    options.vocabFile = config || VOCAB_FILE
    options.startWord = START_WORD
    options.endWord = END_WORD
    options.unkWord = UNK_WORD
  }

  await readFile()
    .catch(err => {
      console.log(err)
    })

  vocabulary.startId = vocabList.indexOf(START_WORD)
  vocabulary.endId = vocabList.indexOf(END_WORD)
  vocabulary.unkId = vocabList.indexOf(UNK_WORD)

  return vocabulary
}

vocabulary.word2id = word => {
  const id = vocabList.indexOf(word)
  return (id > -1) ? id : vocabList.indexOf(options.unkWord)
}

vocabulary.id2word = id => {
  let word = options.unkWord
  if (id >= 0 && id < vocabList.length) {
    word = vocabList[id]
  }
  return word
}
