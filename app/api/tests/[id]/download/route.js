import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../auth/[...nextauth]/route'
import { PrismaClient } from '@prisma/client'
import puppeteer from 'puppeteer-core'
import chromium from '@sparticuz/chromium'
import { generateHTML } from '@tiptap/html'
import StarterKit from '@tiptap/starter-kit'
import Bold from '@tiptap/extension-bold'
import BulletList from '@tiptap/extension-bullet-list'
import ListItem from '@tiptap/extension-list-item'

const prisma = new PrismaClient()

function escapeHtml(s = '') {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

function renderRichText(plain, formatted) {
  // If TipTap JSON provided
  if (formatted) {
    try {
      // If stored as string, detect JSON and parse; otherwise if HTML string, return as-is
      if (typeof formatted === 'string') {
        const trimmed = formatted.trim()
        if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
          const parsed = JSON.parse(trimmed)
          const json = parsed.type
            ? parsed
            : { type: 'doc', content: parsed.content || parsed }
          return generateHTML(json, [StarterKit, BulletList, ListItem, Bold])
        }
        // Assume already HTML
        return formatted
      }
      // Object provided (likely TipTap JSON)
      const json = formatted.type
        ? formatted
        : { type: 'doc', content: formatted.content || formatted }
      return generateHTML(json, [StarterKit, BulletList, ListItem, Bold])
    } catch (_e) {
      // fall through to plain handling
    }
  }

  // Fallback: if plain looks like HTML, return as-is; else escape
  if (typeof plain === 'string' && /<[^>]+>/.test(plain)) return plain
  return plain ? escapeHtml(plain) : ''
}

function htmlTemplate({ test, passages, questions }) {
  // Sort questions globally by questionNumber to match test interface order
  const sortedQuestions = [...questions].sort(
    (a, b) => a.questionNumber - b.questionNumber
  )

  // Create a map of passages for quick lookup
  const passageMap = new Map()
  passages.forEach((p) => passageMap.set(p.id, p))

  const styles = `
    <style>
      @page { size: A4; margin: 16mm 12mm; }
      body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans', sans-serif; color: #111; }
      h1 { font-size: 20px; margin: 0 0 12px; }
      h2 { font-size: 16px; margin: 18px 0 8px; }
      .brand-cover { display: flex; justify-content: space-between; align-items: center; padding: 10px 12px; border: 1px solid #eee; border-radius: 8px; background: linear-gradient(135deg, #f8fafc, #eef2ff); margin-bottom: 12px; }
      .brand-title { font-weight: 700; letter-spacing: 0.4px; color: #111827; }
      .brand-sub { color: #6b7280; font-size: 12px; }
      .passage { padding: 10px; border: 1px solid #ddd; border-radius: 6px; margin: 12px 0; background: #fafafa; }
      .question { margin: 10px 0; padding: 8px 10px; border-left: 3px solid #e5e7eb; }
      .options { margin: 6px 0 0 14px; }
      .option { margin: 2px 0; }
      .img { max-width: 100%; margin: 6px 0; }
      .table { border-collapse: collapse; width: 100%; margin: 6px 0; }
      .table td, .table th { border: 1px solid #ddd; padding: 4px 6px; font-size: 12px; }
      .divider { height: 2px; background: #e5e7eb; margin: 16px 0; }
      .answers { page-break-before: always; }
      .small { color: #666; font-size: 11px; }
      .badge { display: inline-block; font-size: 10px; color: #555; padding: 2px 6px; border: 1px solid #ddd; border-radius: 999px; margin-left: 6px; }
    </style>
  `

  const renderImages = (urls = []) =>
    urls.map((u) => `<img class="img" src="${u}" />`).join('')
  const renderTable = (table) => {
    if (!table) return ''
    const rows = Array.isArray(table) ? table : table.data || []
    return `
      <table class="table">
        ${rows
          .map(
            (r) =>
              `<tr>${r
                .map((c) => `<td>${escapeHtml(String(c ?? ''))}</td>`)
                .join('')}</tr>`
          )
          .join('')}
      </table>
    `
  }

  const renderQuestion = (q) => {
    const qText = renderRichText(q.questionText, q.questionTextFormat)
    const options = (q.options || [])
      .map(
        (opt, idx) =>
          `<div class="option">(${String.fromCharCode(65 + idx)}) ${escapeHtml(
            opt
          )}</div>`
      )
      .join('')
    const table = q.isTable ? renderTable(q.tableData) : ''
    const images = renderImages(q.imageUrls || [])
    return `
      <div class="question">
        <div><strong>Q${q.questionNumber}.</strong> ${qText}</div>
        ${images}
        ${table}
        ${options ? `<div class="options">${options}</div>` : ''}
      </div>
    `
  }

  // Display questions in global order with their passages
  let currentPassageId = null
  let currentPassageNumber = 0

  const questionBlocks = sortedQuestions
    .map((q) => {
      let passageBlock = ''

      // Show passage if this question has a different passage than the previous one
      if (q.passageId && q.passageId !== currentPassageId) {
        const passage = passageMap.get(q.passageId)
        if (passage) {
          currentPassageId = q.passageId
          currentPassageNumber = passage.passageNumber
          const content = renderRichText(passage.content, passage.contentFormat)
          const images = renderImages(passage.imageUrls || [])
          const table = passage.isTable ? renderTable(passage.tableData) : ''

          passageBlock = `
          <section>
            <h2>Passage ${passage.passageNumber} <span class="badge">${passage.section}</span></h2>
            <div class="passage">${content}${images}${table}</div>
          </section>
        `
        }
      } else if (!q.passageId && currentPassageId !== null) {
        // Reset passage tracking for standalone questions
        currentPassageId = null
        currentPassageNumber = 0
      }

      return passageBlock + renderQuestion(q)
    })
    .join('')

  return `
    <!doctype html>
    <html>
      <head>
        <meta charset="utf-8" />
        ${styles}
        <title>${escapeHtml(test.title)} — Outlawed</title>
      </head>
      <body>
        <div class="brand-cover">
          <div>
            <div class="brand-title">Outlawed</div>
            <div class="brand-sub">www.outlawed.in</div>
          </div>
          <div class="brand-sub">${escapeHtml(test.type)} Test</div>
        </div>
        <h1>${escapeHtml(test.title)} — Outlawed</h1>
        <div class="small">
          Type: ${escapeHtml(test.type)} • Duration: ${
    test.durationInMinutes
  } min • Questions: ${(questions || []).length}
        </div>
        <div class="divider"></div>

        ${questionBlocks}

        <section style="margin-top: 40px; padding: 20px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; text-align: center;">
          <h2 style="color: #1e40af; margin-bottom: 12px;">📝 To View Answers & Analysis</h2>
          <p style="color: #64748b; font-size: 14px; margin: 0;">
            Attempt this test on <strong>www.outlawed.in</strong> to see correct answers and detailed explanations in the analysis section.
          </p>
        </section>
      </body>
    </html>
  `
}

export async function GET(request, { params }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id } = params

    const test = await prisma.test.findUnique({
      where: { id },
      include: { passages: true, questions: true },
    })

    if (!test)
      return NextResponse.json({ error: 'Test not found' }, { status: 404 })

    const role = session.user?.role || 'FREE'
    const isFreeTest = test.type === 'FREE'
    const canDownload =
      role === 'ADMIN' || role === 'PAID' || (role === 'FREE' && isFreeTest)
    if (!canDownload) {
      return NextResponse.json(
        { error: 'Upgrade to download this test' },
        { status: 403 }
      )
    }

    const html = htmlTemplate({
      test,
      passages: test.passages || [],
      questions: test.questions || [],
    })

    // Configure browser for Vercel serverless environment
    const isVercel = process.env.VERCEL === '1'

    let executablePath
    if (isVercel) {
      executablePath = await chromium.executablePath()
    } else {
      // For local development, try to find Chrome/Chromium
      const { execSync } = require('child_process')
      try {
        // Try to find Chrome on macOS
        executablePath = execSync(
          'which google-chrome-stable || which google-chrome || which chromium || which chromium-browser',
          { encoding: 'utf8' }
        ).trim()
      } catch (error) {
        // Fallback to common Chrome paths on macOS
        const commonPaths = [
          '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
          '/Applications/Chromium.app/Contents/MacOS/Chromium',
          '/usr/bin/google-chrome',
          '/usr/bin/chromium',
        ]
        executablePath = commonPaths.find((path) =>
          require('fs').existsSync(path)
        )
      }
    }

    const browser = await puppeteer.launch({
      args: isVercel
        ? chromium.args
        : [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
            '--no-first-run',
            '--no-zygote',
            '--disable-gpu',
          ],
      defaultViewport: chromium.defaultViewport,
      executablePath: executablePath,
      headless: chromium.headless,
      ignoreHTTPSErrors: true,
    })
    const page = await browser.newPage()
    await page.setContent(html, { waitUntil: 'networkidle0' })
    const pdf = await page.pdf({
      format: 'A4',
      printBackground: true,
      displayHeaderFooter: true,
      headerTemplate: `<div style="font-size:10px; color:#6b7280; width:100%; padding:4px 12px;">
        <div style="display:flex; justify-content:space-between; width:100%;">
          <span>Outlawed</span>
          <span>www.outlawed.in</span>
        </div>
      </div>`,
      footerTemplate: `<div style="font-size:10px; color:#6b7280; width:100%; padding:4px 12px;">
        <div style="display:flex; justify-content:space-between; width:100%;">
          <span>${escapeHtml(test.title)} — Outlawed</span>
          <span style="font-size:10px;">Page <span class="pageNumber"></span> of <span class="totalPages"></span></span>
        </div>
      </div>`,
      margin: { top: '16mm', right: '12mm', bottom: '16mm', left: '12mm' },
    })
    await browser.close()

    return new NextResponse(pdf, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${encodeURIComponent(
          test.title
        )}.pdf"`,
        'Cache-Control': 'no-store',
      },
    })
  } catch (error) {
    console.error('PDF generation error:', error)

    // More specific error messages
    if (
      error.message.includes('Could not find browser') ||
      error.message.includes('spawn')
    ) {
      return NextResponse.json(
        { error: 'PDF service unavailable. Please try again later.' },
        { status: 503 }
      )
    }

    if (error.message.includes('Navigation timeout')) {
      return NextResponse.json(
        { error: 'PDF generation timeout. Please try again.' },
        { status: 504 }
      )
    }

    if (error.message.includes('Unknown system error -8')) {
      return NextResponse.json(
        {
          error:
            'PDF generation failed due to server configuration. Please try again.',
        },
        { status: 503 }
      )
    }

    return NextResponse.json(
      {
        error: 'Failed to generate PDF',
        details:
          process.env.NODE_ENV === 'development' ? error.message : undefined,
      },
      { status: 500 }
    )
  }
}
