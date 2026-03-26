import { NextResponse } from 'next/server'
import { getTemplateMetadata } from '@3d-modeler/core'

export async function GET() {
  return NextResponse.json({
    success: true,
    data: getTemplateMetadata(),
  })
}
