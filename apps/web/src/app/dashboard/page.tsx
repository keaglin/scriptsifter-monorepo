'use client'
import NavBar from '@/components/NavBar'
import TranscriptItem from '@/components/TranscriptItem'
import { createClient } from '@/services/supabase/client'
import { getTranscripts } from '@/services/transcript'
import { useEffect, useState } from 'react'

export default function Dashboard() {
    const [results, setResults] = useState([] as Record<string, any>[])
    const [transcripts, setTranscripts] = useState([] as Record<string, any>[])
    const [currentPage, setCurrentPage] = useState(0)
    const [pageCount, setPageCount] = useState(0)
    const [transcriptCount, setTranscriptCount] = useState(0)

    // const router = useRouter()
    const supabase = createClient()

    useEffect(() => {
        (async () => {
            // const user = await supabase.auth.getUser()
            // console.log('user', user)
            const {
                transcripts,
                count,
                error
            } = await getTranscripts(supabase)

            if (error) {
                console.error(JSON.stringify(error))
            }

            // console.log('Transcripts', await getTranscripts(supabase))
            console.log('Transcripts', transcripts)
            console.log('Count', count)
            setTranscripts(transcripts)
            setPageCount(Math.ceil(count! / 5))
            setTranscriptCount(count!)
        })()
    }, [supabase])

    const hasMoreTranscripts = false
    const start = currentPage * 5
    const end = transcriptCount ? Math.min(5, transcriptCount - start) : 0
    const items = results.length ? results : transcripts.slice(start, start + end)
    const markup = (<ul>
        {items.map((result, index) =>
            <li key={index}>
                <TranscriptItem id={result.id} title={result.title} />
            </li>)
        }
    </ul>)

    const goToPreviousPage = async () => setCurrentPage(currentPage ? currentPage - 1 : 0)
    const goToNextPage = async () => setCurrentPage(currentPage + 1)

    return (
        <div>
            <h1>Dashboard</h1>
            <input
                type='text'
                placeholder='Search transcripts'
                //on:input={performSearch}
                autoComplete='on'
            />
            <h2>Your Transcripts</h2>
            <div>
                {items ? markup : <p>No transcripts found.</p>}
            </div>
            <div>
                <button onClick={goToPreviousPage} disabled={currentPage === 0}> Previous Page </button>
                <span>Page {currentPage + 1}</span>
                <button onClick={goToNextPage} disabled={currentPage === (pageCount - 1)}> Next Page </button>
            </div>
        </div>)
}
