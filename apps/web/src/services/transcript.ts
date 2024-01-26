import { SupabaseClient } from '@supabase/auth-helpers-nextjs'
import { PostgrestError } from '@supabase/supabase-js';
import { Database, TRANSCRIPTS_TABLE } from './supabase'

export type Transcript = Database['public']['Tables']['transcripts']['Row']
export type Selection = Database['public']['Tables']['selections']['Row']
export type Excerpt = Database['public']['Tables']['excerpts']['Row']

export type Transcripts = {
    transcripts: Transcript[];
    count: number | null;
    error: PostgrestError | null;
}
export type Snippet = {
    start: string;
    end: string;
    text: string;
}

export const fetchTranscripts = async (page: number, transcriptsPerPage = 5) => {
    const body = JSON.stringify({ currentPage: page, transcriptsPerPage })
    const response = await fetch('/', {
        body
    })
}

export const getTranscripts = async (supabaseClient: SupabaseClient<Database>): Promise<Transcripts> => {
    const { data: { user } } = await supabaseClient.auth.getUser()
    const {
        data,
        count,
        error
    } = await supabaseClient
        .from(TRANSCRIPTS_TABLE)
        .select('*', { count: 'exact' })
        .match({ user_id: user?.id })

    if (error) {
        console.error(JSON.stringify(error))
    }

    return { transcripts: data ?? [], count, error }
}

export const getTranscript = async (supabaseClient: SupabaseClient<Database>, transcriptId: string): Promise<Transcript> => {
    const { transcripts, count } = await getTranscripts(supabaseClient)

    return transcripts.find(({ id }) => id === transcriptId) ?? {} as Transcript
}

export const getSnippets = (transcript: Transcript) => {
    const snippetComponents = (transcript.content ?? '').split('\n')
    const snippetCount = snippetComponents.length / 4
    const snippets: Snippet[] = []

    console.log('Components', snippetComponents)

    for (let index = 0; index < snippetCount; index++) {
        const componentOffset = index * 4
        const times = snippetComponents[componentOffset + 1]?.split(' --> ')
        const [start, end] = times ?? []

        snippets.push({ start, end, text: snippetComponents[componentOffset + 2] })
    }

    return snippets.filter(s => !!s.end)
}


export const getSelections = async (supabase: SupabaseClient, transcriptId: string) => {
    const { data: selections, error } = await supabase
        .from('selections')
        .select()
        .eq('transcript_id', transcriptId)

    console.log('selections', selections)

    if (error) {
        console.error('There was a problem retrieving selections:', error)
    }

    return selections
}
