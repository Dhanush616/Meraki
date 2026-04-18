import sys
import re

content = open(r'c:\Meraki\frontend\app\dashboard\will\page.tsx', 'r', encoding='utf-8').read()

content = re.sub(r"import \{ Document, Page, pdfjs \} from 'react-pdf';\nimport 'react-pdf/dist/Page/AnnotationLayer\.css';\nimport 'react-pdf/dist/Page/TextLayer\.css';\n\npdfjs\.GlobalWorkerOptions\.workerSrc = `https://unpkg\.com/pdfjs-dist@.*?`;\n\n", '', content)

start = content.find('// ── Will Preview ──')
end = content.find('// ── Generate Modal ──')
content = content[:start] + content[end:]

old_hist = '''                        <button\n                            onClick={() => onView(row)}\n                            className=\"flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors border border-border hover:bg-muted px-3 py-1.5 rounded-lg\"\n                        >\n                            <EyeIcon className=\"w-3.5 h-3.5\" />\n                            View\n                        </button>'''

new_hist = '''                        <div className=\"flex items-center gap-2\">\n                            {row.signed_url && (\n                                <a\n                                    href={row.signed_url}\n                                    target=\"_blank\"\n                                    rel=\"noopener noreferrer\"\n                                    className=\"flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors border border-border hover:bg-muted px-3 py-1.5 rounded-lg\"\n                                >\n                                    <EyeIcon className=\"w-3.5 h-3.5\" />\n                                    View\n                                </a>\n                            )}\n                            <button\n                                onClick={async () => {\n                                    if (!row.id) return;\n                                    try {\n                                        const token = localStorage.getItem(\"paradosis_access_token\");\n                                        const apiUrl = process.env.NEXT_PUBLIC_API_URL || \"http://localhost:8000\";\n                                        const res = await fetch(`${apiUrl}/api/documents/will/${row.id}/download`, {\n                                            headers: { Authorization: `Bearer ${token}` },\n                                        });\n                                        if (!res.ok) throw new Error(\"Download failed\");\n                                        const blob = await res.blob();\n                                        const url = URL.createObjectURL(blob);\n                                        const a = document.createElement(\"a\");\n                                        a.href = url;\n                                        a.download = `Will_v${row.version}.pdf`;\n                                        document.body.appendChild(a);\n                                        a.click();\n                                        document.body.removeChild(a);\n                                        URL.revokeObjectURL(url);\n                                    } catch (e: any) {\n                                        if (row.signed_url) {\n                                            const a = document.createElement(\"a\");\n                                            a.href = row.signed_url;\n                                            a.download = `Will_v${row.version}.pdf`;\n                                            document.body.appendChild(a);\n                                            a.click();\n                                            document.body.removeChild(a);\n                                        }\n                                    }\n                                }}\n                                className=\"flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors border border-border hover:bg-muted px-3 py-1.5 rounded-lg\"\n                            >\n                                <DownloadIcon className=\"w-3.5 h-3.5\" />\n                                Download\n                            </button>\n                        </div>'''

content = content.replace(old_hist, new_hist)

content = content.replace('    history: HistoryRow[];\n    onView: (row: HistoryRow) => void;\n', '    history: HistoryRow[];\n')
content = content.replace('    onView,\n}: {\n', '}: {\n')
content = content.replace(' onView={setViewRow}', '')

start = content.find('// ── PDF Viewer Modal ──')
end = content.find('// ── Main Page ──')
if (start != -1 and end != -1):
    content = content[:start] + content[end:]

content = re.sub(r' +<PdfViewerModal row=\{viewRow\} onClose=\{.*? />\n', '', content)
content = re.sub(r' +const \[viewRow, setViewRow\] = useState<HistoryRow \| null>\(null\);\n', '', content)

old_layout = '''                        {/* Left: Will Preview */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h2 className="text-sm font-semibold text-foreground uppercase tracking-wide">
                                    Document Preview
                                </h2>
                                {will?.signed_url && (
                                    <a
                                        href={will.signed_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
                                    >
                                        <EyeIcon className="w-3.5 h-3.5" />
                                        Open PDF
                                        <ChevronRightIcon className="w-3 h-3" />
                                    </a>
                                )}
                            </div>
                            <WillPreview signedUrl={will?.signed_url} data={willData} />
                        </div>'''

new_layout = '''                        {/* Left: Version History */}
                        <div className="space-y-4">
                            <WillVersionHistory history={history} />
                        </div>'''

content = content.replace(old_layout, new_layout)
content = re.sub(r' +\{\/\* Version History \*\/\}\n +<WillVersionHistory history=\{history\} />\n', '', content)

with open(r'c:\Meraki\frontend\app\dashboard\will\page.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
