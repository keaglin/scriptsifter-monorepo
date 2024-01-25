/**
 * Converts an array of transcript selections into a CSV string, escaping characters as necessary.
 * @param data Array of selections to convert to CSV.
 * @param options. Optional. Future implementation for adding options for each selection.
 * @returns CSV string.
 */
export function convertSelectionsToMarkersCSV(selections, options?) {
  console.log('selections[0] from convertSelectionsToMarkersCSV', selections[0])
  const csvRows = []

  // Add header row
  csvRows.push(['Marker Name', 'Color', 'Start Time', 'Duration', 'Description'])

  const csvContent = csvRows.concat(selections.map(({ start, end, content }) => {
    // in order for these to work well, I think we'd need individual options for each selection
    // maybe refactor later for this added flexibility
    const name = options?.name ?? ''
    const color = options?.color ?? ''
    const description = options?.description ?? content
    const { startTime, duration } = convertToResolveTime(start, end)
    return [name, color, startTime, duration, escapeCsvText(description)]
  })
  )
  console.log('csvContent from csv utils', csvContent)

  return csvContent.map(row => row.join(',')).join('\r\n')
}

function convertToResolveTime(start, end, fps: number = 30): { startTime: string, duration: string } {
  // get fragment whose start and transcriptId match the segment?
  // console.log('segment', segment)

  const secondsToTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    const frames = Math.floor((seconds % 1) * fps);

    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}:${frames.toString().padStart(2, '0')}`;
  };

  const startTime = secondsToTime(Number(start));
  const duration = secondsToTime(Number(end) - Number(start));

  return { startTime, duration };
}

/**
 * Downloads a CSV file.
 * @param csvContent CSV content to download.
 * @param fileName Name of the file to download.
 * @returns void.
 */
export function downloadCSV(csvContent: string, fileName: string) {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  link.setAttribute('href', url)
  link.setAttribute('download', fileName)
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

function escapeCsvText(text) {
  // Check if the text contains commas, double quotes, or newlines
  if (/[",\n]/.test(text)) {
    // Escape double quotes by doubling them
    const escapedText = text.replace(/"/g, '""');
    // Enclose in double quotes
    return `"${escapedText}"`;
  }
  return text;
}
