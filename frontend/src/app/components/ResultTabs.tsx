"use client";
import { useState } from "react";

type Props = {
  extractedText?: string;
  summary?: string;
};

export default function ResultTabs({ extractedText, summary }: Props) {
  const [tab, setTab] = useState<"summary" | "text">(summary ? "summary" : "text");
  const [wrap, setWrap] = useState(true);
  const [expanded, setExpanded] = useState(false);

  const textForTab = tab === "summary" ? (summary || "") : (extractedText || "");

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(textForTab);
    } catch {}
  };

  const handleDownload = () => {
    const blob = new Blob([textForTab], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${tab}-legal-ai.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const TabButton = ({ id, label }: { id: "summary" | "text"; label: string }) => (
    <button
      onClick={() => setTab(id)}
      className={`px-3 py-2 rounded-md text-sm font-medium transition border ${
        tab === id
          ? "bg-primary-600 text-white border-primary-500"
          : "bg-dark-900 text-dark-200 border-dark-700 hover:bg-dark-800"
      }`}
    >
      {label}
    </button>
  );

  const Empty = ({ text }: { text: string }) => (
    <div className="p-6 text-center text-dark-300">{text}</div>
  );

  return (
    <div className="border glass-morphism rounded-2xl border-slate-200 dark:border-dark-700/50 overflow-hidden bg-white/60 dark:bg-transparent">
      <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-slate-50 to-slate-100 dark:from-dark-900 dark:to-dark-800 border-b border-slate-200 dark:border-dark-700/60">
        <div className="flex items-center gap-2">
          <TabButton id="summary" label={`Summary${summary ? "" : " (empty)"}`} />
          <TabButton id="text" label={`Extracted Text${extractedText ? "" : " (empty)"}`} />
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setWrap((w) => !w)}
            className="px-3 py-1.5 rounded-md text-xs border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 dark:border-dark-700 dark:bg-dark-900 dark:text-dark-200 dark:hover:bg-dark-800"
            title="Toggle wrap"
          >
            {wrap ? "No Wrap" : "Wrap"}
          </button>
          <button
            onClick={handleCopy}
            className="px-3 py-1.5 rounded-md text-xs border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 dark:border-dark-700 dark:bg-dark-900 dark:text-dark-200 dark:hover:bg-dark-800"
          >
            Copy
          </button>
          <button
            onClick={handleDownload}
            className="px-3 py-1.5 rounded-md text-xs border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 dark:border-dark-700 dark:bg-dark-900 dark:text-dark-200 dark:hover:bg-dark-800"
          >
            Download
          </button>
          <button
            onClick={() => setExpanded((e) => !e)}
            className="px-3 py-1.5 rounded-md text-xs border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 dark:border-dark-700 dark:bg-dark-900 dark:text-dark-200 dark:hover:bg-dark-800"
          >
            {expanded ? "Collapse" : "Expand"}
          </button>
        </div>
      </div>

      <div className={`p-4 ${expanded ? "max-h-[80vh]" : "max-h-[420px]"} overflow-auto` }>
        {tab === "summary" ? (
          summary ? (
            <pre className={`${wrap ? "whitespace-pre-wrap" : "whitespace-pre"} text-slate-800 dark:text-dark-200 leading-relaxed`}>{summary}</pre>
          ) : (
            <Empty text="No summary yet. Click Process to generate." />
          )
        ) : extractedText ? (
          <pre className={`${wrap ? "whitespace-pre-wrap" : "whitespace-pre"} text-slate-800 dark:text-dark-200 leading-relaxed`}>{extractedText}</pre>
        ) : (
          <Empty text="No text extracted yet. Upload and Process a document." />
        )}
      </div>

      <div className="flex items-center justify-between px-4 py-2 border-t border-slate-200 dark:border-dark-700/60 bg-slate-50 dark:bg-dark-900 text-xs text-slate-600 dark:text-dark-300">
        <span>
          {tab === "summary" ? "Summary" : "Extracted"} length: {textForTab.length.toLocaleString()} chars
        </span>
  <span className="opacity-80">TautologyAI</span>
      </div>
    </div>
  );
}


