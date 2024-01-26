import Link from 'next/link';

export type TranscriptItemProps = {
  id: number;
  title: string;
}

export default function TranscriptItem({ id, title }: TranscriptItemProps) {
  return <Link href={`transcripts/${id}`}>{title}</Link>
}
