import { openai } from "./services/openai"
import { encoding_for_model } from 'tiktoken'

type SrtEntry = {
  start: number
  end: number
  text: string
}

function splitTranscriptIntoBatches(
  fragments: SrtEntry[],
  promptHeadroom = 250,
  maxTokensPerBatch = 123_000
): string[] {
  const responseHeadroom = 500
  const effectiveMaxTokensPerBatch = maxTokensPerBatch - responseHeadroom - promptHeadroom

  // console.log('transcript', transcript)
  // const entries = parseSrt(transcript)
  // console.log('entries', entries)
  const batches: string[] = []
  let currentBatch: SrtEntry[] = []

  let tokensInCurrentBatch = 0
  for (const entry of fragments) {
    const { start, end, text } = entry
    const entryText = `${start} - ${end}: ${text}`
    const entryTokenCount = countTokens(entryText)

    // If a single entry exceeds the limit
    if (entryTokenCount > effectiveMaxTokensPerBatch) {
      throw new Error('A single entry exceeds the maximum allowed tokens.')
    }

    // If adding the current entry would cause the current batch to exceed the limit
    if (tokensInCurrentBatch + entryTokenCount > effectiveMaxTokensPerBatch) {
      // Add the current batch to the list of batches and start a new one
      batches.push(
        currentBatch.map(({ start, end, text }) => `${start} - ${end}: ${text}`).join('\n\n')
      )
      currentBatch = [entry]
      tokensInCurrentBatch = entryTokenCount
    } else {
      currentBatch.push(entry)
      tokensInCurrentBatch += entryTokenCount
    }
  }

  // Check if the last batch would exceed the limit
  if (tokensInCurrentBatch > effectiveMaxTokensPerBatch) {
    // Split the last batch into multiple batches
    while (tokensInCurrentBatch > effectiveMaxTokensPerBatch) {
      const lastEntry = currentBatch.pop()
      if (lastEntry) {
        tokensInCurrentBatch -= countTokens(
          `${lastEntry.start} --> ${lastEntry.end}\n${lastEntry.text}`
        )
        // Add the current batch (without the last entry) to batches
        batches.push(
          currentBatch.map(({ start, end, text }) => `${start} - ${end}: ${text}`).join('\n\n')
        )
        // Start a new batch with the last entry
        currentBatch = [lastEntry]
      }
    }
  }

  // Add the last batch if it has any entries
  if (currentBatch.length > 0) {
    batches.push(
      currentBatch.map(({ start, end, text }) => `${start} - ${end}: ${text}`).join('\n\n')
    )
  }

  // console.log('batches', batches)

  return batches
}

const getGoodBitsFromDaVinci = async (entries: string[]) => {
  const responses = []
  // const systemMessage = 'I will analyze the provided transcripts and respond to your'
  const userPrompt = `I am an expert content editor. I will analyze transcript fragments about infotainment topics, featuring 3 - 6 speakers, and extract the most entertaining, funny, informative, and/or outrageous excerpts.
		I will the include the results of my analysis in the specified format, which includes start and end times, and the text of each excerpt.

		Each excerpt will be formatted like the following example:

		START - END: TEXT_CONTENT

		I will ensure the output is properly formatted without any other text or explanation.`
  for (const batch of entries) {
    const completion = await openai.chat.completions.create({
      messages: [
        { role: 'system', content: userPrompt },
        { role: 'user', content: batch }
      ],
      // TODO: as of 2024-01-20 128k GPT-4 isn't prod-ready yet; will upgrade when it is
      model: 'gpt-4-1106-preview'
    })
    responses.push(completion)
    console.log('completion', JSON.stringify(completion))
  }
  return responses
}

const getSelections = (responses: ChatCompletion[]) => {
  return responses.flatMap(({ choices }) => {
    const content = choices[0].message.content?.split('\n').filter(Boolean)
    return content?.map((selection) => {
      const parts = selection.split(': ')
      const times = parts[0].split(' - ')
      return {
        start: parseFloat(times[0]),
        end: parseFloat(times[1]),
        content: parts[1]
      }
    })
  })
}

function countTokens(text: string) {
  const tokenizer = encoding_for_model('gpt-4-1106-preview')
  const encodedTokens = tokenizer.encode(text)
  tokenizer.free()
  return encodedTokens.length
}

export { splitTranscriptIntoBatches, getGoodBitsFromDaVinci, getSelections }
