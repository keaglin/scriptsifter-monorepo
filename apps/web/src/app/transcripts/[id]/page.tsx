'use client'
import { convertSelectionsToMarkersCSV, downloadCSV } from '@/lib/clipToCsv'
import { createClient } from '@/services/supabase/client'
import { Transcript, getSelections } from '@/services/transcript'
import { FormEventHandler, useEffect, useState } from 'react'

export default function Page({ params }: { params: { id: string } }) {
  const [transcript, setTranscript] = useState({} as unknown as Transcript)
  const [selections, setSelections] = useState([])
  const [selectedClips, setSelectedClips] = useState<boolean[]>([]);
  const [csvDataUrl, setCsvDataUrl] = useState('');
  const supabase = createClient()
  const { id } = params

  useEffect(() => {
    (async () => {
      const selections = await getSelections(supabase, id)
      setSelections(selections)
      setSelectedClips(new Array(selections.length).fill(false));
    })()
  }, [supabase, id])

  const toggleSelectAll = () => {
    const allSelected = selectedClips.every(Boolean);
    setSelectedClips(selectedClips.map(() => !allSelected));
  }

  const handleChange = (index: number) => {
    const updatedClips = [...selectedClips];
    updatedClips[index] = !updatedClips[index];
    setSelectedClips(updatedClips);
  }

  const handleSubmit: FormEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault();
    // const csvRowsArray = convertSelectionsToMarkersCSV(selections.filter((_, index) => selectedClips[index]));
    // console.log('csvRowsArray', csvRowsArray)
    const csvString = convertSelectionsToMarkersCSV(selections.filter((_, index) => selectedClips[index]));
    // console.log('csvString', csvString)

    setCsvDataUrl(`data:text/csv;charset=utf-8,${encodeURIComponent(csvString)}`);

    downloadCSV(csvString, `transcript-${id}.csv`);
  }

  return (
    <div className='text-black'>
      {csvDataUrl && (
        <a href={csvDataUrl} download="selected_clips.csv">Redownload Previous Selection</a>
      )}

      {transcript?.title && (
        <h1>{transcript.title}</h1>
      )}

      <form onSubmit={(e) => {
        e.preventDefault();
        handleSubmit(e);
      }}>
        <label>
          <input
            type="checkbox"
            checked={selectedClips.every(Boolean)}
            onChange={toggleSelectAll}
          />
          Select / Deselect All
        </label>
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th>Select</th>
              <th>Start</th>
              <th>End</th>
              <th>Text</th>
            </tr>
          </thead>
          <tbody>
            {selections.map(({ start, end, content }, index) => (
              <tr key={index} className="bg-white even:bg-gray-50">
                <td>
                  <input
                    type="checkbox"
                    checked={selectedClips[index]}
                    onChange={() => handleChange(index)}
                  />
                </td>
                <td>{start}</td>
                <td>{end}</td>
                <td>{content}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <button type="submit" className="bg-green-500 text-white font-bold py-2 px-4 rounded">
          Download Selected Clips
        </button>
      </form>
    </div>
  );
}
