
import { SupabaseClient } from "@supabase/auth-helpers-nextjs"
import { createClient } from '@supabase/supabase-js'

export interface Database {
	public: {
		Tables: {
			auth_key: {
				Row: {
					expires: number | null
					hashed_password: string | null
					id: string
					primary_key: boolean
					user_id: string
				}
				Insert: {
					expires?: number | null
					hashed_password?: string | null
					id: string
					primary_key: boolean
					user_id: string
				}
				Update: {
					expires?: number | null
					hashed_password?: string | null
					id?: string
					primary_key?: boolean
					user_id?: string
				}
				Relationships: [
					{
						foreignKeyName: 'auth_key_user_id_auth_user_id_fk'
						columns: ['user_id']
						referencedRelation: 'auth_user'
						referencedColumns: ['id']
					}
				]
			}
			auth_session: {
				Row: {
					active_expires: number
					id: string
					idle_expires: number
					user_id: string
				}
				Insert: {
					active_expires: number
					id: string
					idle_expires: number
					user_id: string
				}
				Update: {
					active_expires?: number
					id?: string
					idle_expires?: number
					user_id?: string
				}
				Relationships: [
					{
						foreignKeyName: 'auth_session_user_id_auth_user_id_fk'
						columns: ['user_id']
						referencedRelation: 'auth_user'
						referencedColumns: ['id']
					}
				]
			}
			auth_user: {
				Row: {
					created_at: string
					email: string
					first_name: string | null
					id: string
					last_name: string | null
					receive_email: boolean
					role: string
					token: string | null
					updated_at: string
					verified: boolean
				}
				Insert: {
					created_at?: string
					email: string
					first_name?: string | null
					id: string
					last_name?: string | null
					receive_email?: boolean
					role?: string
					token?: string | null
					updated_at?: string
					verified?: boolean
				}
				Update: {
					created_at?: string
					email?: string
					first_name?: string | null
					id?: string
					last_name?: string | null
					receive_email?: boolean
					role?: string
					token?: string | null
					updated_at?: string
					verified?: boolean
				}
				Relationships: []
			}
			excerpts: {
				Row: {
					created_at: string | null
					end: string | null
					id: string
					snippet_id: string | null
					start: string | null
					text: string | null
					transcript_id: string | null
					updated_at: string | null
				}
				Insert: {
					created_at?: string | null
					end?: string | null
					id?: string
					snippet_id?: string | null
					start?: string | null
					text?: string | null
					transcript_id?: string | null
					updated_at?: string | null
				}
				Update: {
					created_at?: string | null
					end?: string | null
					id?: string
					snippet_id?: string | null
					start?: string | null
					text?: string | null
					transcript_id?: string | null
					updated_at?: string | null
				}
				Relationships: [
					{
						foreignKeyName: 'excerpts_snippet_id_fkey'
						columns: ['snippet_id']
						referencedRelation: 'snippets'
						referencedColumns: ['id']
					},
					{
						foreignKeyName: 'excerpts_snippet_id_snippets_id_fk'
						columns: ['snippet_id']
						referencedRelation: 'snippets'
						referencedColumns: ['id']
					},
					{
						foreignKeyName: 'excerpts_transcript_id_fkey'
						columns: ['transcript_id']
						referencedRelation: 'transcripts'
						referencedColumns: ['id']
					}
				]
			}
			fragments: {
				Row: {
					avg_logprob: number | null
					chunk_start_time: number | null
					compression_ratio: number | null
					created_at: string | null
					end: number | null
					id: string
					incoming_id: string | null
					no_speech_prob: number | null
					seek: number | null
					start: string | null
					temperature: number | null
					text: string | null
					tokens: number[] | null
					transcript_id: string | null
					updated_at: string | null
				}
				Insert: {
					avg_logprob?: number | null
					chunk_start_time?: number | null
					compression_ratio?: number | null
					created_at?: string | null
					end?: number | null
					id?: string
					incoming_id?: string | null
					no_speech_prob?: number | null
					seek?: number | null
					start?: string | null
					temperature?: number | null
					text?: string | null
					tokens?: number[] | null
					transcript_id?: string | null
					updated_at?: string | null
				}
				Update: {
					avg_logprob?: number | null
					chunk_start_time?: number | null
					compression_ratio?: number | null
					created_at?: string | null
					end?: number | null
					id?: string
					incoming_id?: string | null
					no_speech_prob?: number | null
					seek?: number | null
					start?: string | null
					temperature?: number | null
					text?: string | null
					tokens?: number[] | null
					transcript_id?: string | null
					updated_at?: string | null
				}
				Relationships: [
					{
						foreignKeyName: 'fragments_transcript_id_fkey'
						columns: ['transcript_id']
						referencedRelation: 'transcripts'
						referencedColumns: ['id']
					}
				]
			}
			profiles: {
				Row: {
					avatar_url: string | null
					full_name: string | null
					id: string
					updated_at: string | null
					username: string | null
					website: string | null
				}
				Insert: {
					avatar_url?: string | null
					full_name?: string | null
					id: string
					updated_at?: string | null
					username?: string | null
					website?: string | null
				}
				Update: {
					avatar_url?: string | null
					full_name?: string | null
					id?: string
					updated_at?: string | null
					username?: string | null
					website?: string | null
				}
				Relationships: [
					{
						foreignKeyName: 'profiles_id_fkey'
						columns: ['id']
						referencedRelation: 'users'
						referencedColumns: ['id']
					}
				]
			}
			selections: {
				Row: {
					content: string | null
					created_at: string | null
					end: number | null
					id: string
					start: number | null
					summary: string | null
					title: string | null
					transcript_id: string | null
					updated_at: string | null
					user_id: string | null
				}
				Insert: {
					content?: string | null
					created_at?: string | null
					end?: number | null
					id?: string
					start?: number | null
					summary?: string | null
					title?: string | null
					transcript_id?: string | null
					updated_at?: string | null
					user_id?: string | null
				}
				Update: {
					content?: string | null
					created_at?: string | null
					end?: number | null
					id?: string
					start?: number | null
					summary?: string | null
					title?: string | null
					transcript_id?: string | null
					updated_at?: string | null
					user_id?: string | null
				}
				Relationships: [
					{
						foreignKeyName: 'selections_transcript_id_transcripts_id_fk'
						columns: ['transcript_id']
						referencedRelation: 'transcripts'
						referencedColumns: ['id']
					}
				]
			}
			snippets: {
				Row: {
					created_at: string | null
					id: string
					summary: string | null
					title: string | null
					transcript_id: string | null
					updated_at: string | null
				}
				Insert: {
					created_at?: string | null
					id?: string
					summary?: string | null
					title?: string | null
					transcript_id?: string | null
					updated_at?: string | null
				}
				Update: {
					created_at?: string | null
					id?: string
					summary?: string | null
					title?: string | null
					transcript_id?: string | null
					updated_at?: string | null
				}
				Relationships: [
					{
						foreignKeyName: 'snippets_transcript_id_fkey'
						columns: ['transcript_id']
						referencedRelation: 'transcripts'
						referencedColumns: ['id']
					},
					{
						foreignKeyName: 'snippets_transcript_id_transcripts_id_fk'
						columns: ['transcript_id']
						referencedRelation: 'transcripts'
						referencedColumns: ['id']
					}
				]
			}
			transcripts: {
				Row: {
					content: string | null
					created_at: string | null
					episode_number: number | null
					filepath: string | null
					id: string
					season: number | null
					title: string | null
					updated_at: string | null
					user_id: string
				}
				Insert: {
					content?: string | null
					created_at?: string | null
					episode_number?: number | null
					filepath?: string | null
					id?: string
					season?: number | null
					title?: string | null
					updated_at?: string | null
					user_id: string
				}
				Update: {
					content?: string | null
					created_at?: string | null
					episode_number?: number | null
					filepath?: string | null
					id?: string
					season?: number | null
					title?: string | null
					updated_at?: string | null
					user_id?: string
				}
				Relationships: [
					{
						foreignKeyName: 'transcripts_user_id_fkey'
						columns: ['user_id']
						referencedRelation: 'users'
						referencedColumns: ['id']
					}
				]
			}
		}
		Views: {
			[_ in never]: never
		}
		Functions: {
			save_transcript: {
				Args: {
					transcript_input: Json
					snippets_input: Json
				}
				Returns: string
			}
			save_v2: {
				Args: {
					transcript_input: Json
					fragments_input: Json
					selections_input: Json
				}
				Returns: string
			}
		}
		Enums: {
			[_ in never]: never
		}
		CompositeTypes: {
			[_ in never]: never
		}
	}
}


export const TRANSCRIPTS_TABLE = 'transcripts'

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export async function getSignedFileUrl(supabase: SupabaseClient, filepath: string, expiresIn = 60, bucketName = 'transcripts') {
	const { data, error } = await supabase
		.storage
		.from(bucketName)
		.createSignedUrl(filepath, expiresIn);

	if (error) {
		console.error('Error generating signed URL:', error);
		return null;
	}

	return data.signedUrl;
}


// export async function getSupabaseClient() {
// 	const { userId, getToken } = auth()
// 	if (!userId) throw new Error('No user ID')

// 	const accessToken = await getToken({ template: 'supabase' })

// 	return createClient<Database>(
// 		// @ts-ignore
// 		process.env.SUPABASE_URL,
// 		process.env.SUPABASE_ANON_KEY,
// 		{ global: { headers: { Authorization: `Bearer ${accessToken}` } } }
// 	)
// }
