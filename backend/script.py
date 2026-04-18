import sys
import re

content = open(r'c:\Meraki\frontend\app\dashboard\will\page.tsx', 'r', encoding='utf-8').read()
content = content.replace(\"import { Document, Page, pdfjs } from 'react-pdf';\\nimport 'react-pdf/dist/Page/AnnotationLayer.css';\\nimport 'react-pdf/dist/Page/TextLayer.css';\\n\\npdfjs.GlobalWorkerOptions.workerSrc = https://unpkg.com/pdfjs-dist@/build/pdf.worker.min.mjs;\\n\", '')

start = content.find('// -- Will Preview --------------------------------------------------------------')
end = content.find('// -- Generate Modal ------------------------------------------------------------')
if start != -1 and end != -1:
    content = content[:start] + content[end:]

old_hist_btn = '''                        <button
                            onClick={() => onView(row)}
                            className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors border border-border hover:bg-muted px-3 py-1.5 rounded-lg"
                        >
                            <EyeIcon className="w-3.5 h-3.5" />
                            View
                        </button>'''

new_hist_btn = '''                        <div className="flex items-center gap-2">
                            {row.signed_url && (
                                <a
                                    href={row.signed_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors border border-border hover:bg-muted px-3 py-1.5 rounded-lg"
                                >
                                    <EyeIcon className="w-3.5 h-3.5" />
                                    View
                                </a>
                            )}
                            <button
                                onClick={async () => {
                                    if (!row.id) return;
                                    try {
                                        const token = localStorage.getItem("paradosis_access_token");
                                        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
                                        const res = await fetch(${apiUrl}/api/documents/will//download, {
                                            headers: { Authorization: Bearer  },
                                        });
                                        if (!res.ok) throw new Error("Download failed");
                                        const blob = await res.blob();
                                        const url = URL.createObjectURL(blob);
                                        const a = document.createElement("a");
                                        a.href = url;
                                        a.download = Will_v.pdf;
                                        document.body.appendChild(a);
                                        a.click();
                                        document.body.removeChild(a);
                                        URL.revokeObjectURL(url);
                                    } catch (e: any) {
                                        if (row.signed_url) {
                                            const a = document.createElement("a");
                                            a.href = row.signed_url;
                                            a.download = Will_v.pdf;
                                            document.body.appendChild(a);
                                            a.click();
                                            document.body.removeChild(a);
                                        }
                                    }
                                }}
                                className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors border border-border hover:bg-muted px-3 py-1.5 rounded-lg"
                            >
                                <DownloadIcon className="w-3.5 h-3.5" />
                                Download
                            </button>
                        </div>'''

content = content.replace(old_hist_btn, new_hist_btn)
content = content.replace('    history: HistoryRow[];\\n    onView: (row: HistoryRow) => void;\\n', '    history: HistoryRow[];\\n')
content = re.sub(r'    onView,\\n\}: \{\\n', '}: {\\n', content)
content = content.replace('onView={setViewRow}', '')

start = content.find('// -- PDF Viewer Modal ----------------------------------------------------------')
end = content.find('// -- Main Page -----------------------------------------------------------------')
if start != -1 and end != -1:
    content = content[:start] + content[end:]

content = content.replace('<PdfViewerModal row={viewRow} onClose={() => setViewRow(null)} />', '')
content = content.replace('const [viewRow, setViewRow] = useState<HistoryRow | null>(null);\\n', '')

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
content = content.replace('{/* Version History */}\\n                    <WillVersionHistory history={history} />\\n', '')
content = content.replace('{/* Version History */}\\n                    <WillVersionHistory history={history} onView={setViewRow} />\\n', '')

open(r'c:\Meraki\frontend\app\dashboard\will\page.tsx', 'w', encoding='utf-8').write(content)
