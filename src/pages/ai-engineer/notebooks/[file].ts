/* Course notebooks as downloads: /ai-engineer/notebooks/00-setup-notebooks-step-1.ipynb.
 * The notebook itself lives in /course next to the module it belongs to. */
import type { APIRoute } from 'astro'
import { allNotebooks } from '../../../lib/ai/course'

export function getStaticPaths() {
  return allNotebooks().map((n) => ({ params: { file: n.file }, props: { json: n.json } }))
}

export const GET: APIRoute = ({ props }) =>
  new Response(props.json as string, { headers: { 'Content-Type': 'application/x-ipynb+json' } })
