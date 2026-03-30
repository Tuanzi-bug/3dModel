import { NewEditorClient } from './NewEditorClient'

type NewEditorPageProps = {
  searchParams: Promise<{
    template?: string | string[] | undefined
    mode?: string | string[] | undefined
  }>
}

export default async function NewEditorPage({ searchParams }: NewEditorPageProps) {
  const params = await searchParams
  const templateParam = params.template
  const templateId = Array.isArray(templateParam)
    ? (templateParam[0] ?? null)
    : (templateParam ?? null)
  const modeParam = params.mode
  const mode = Array.isArray(modeParam)
    ? (modeParam[0] ?? null)
    : (modeParam ?? null)

  return (
    <NewEditorClient
      templateId={templateId}
      mode={mode === 'freeform' ? 'freeform' : 'template'}
    />
  )
}
