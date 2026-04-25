"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Link2,
  DownloadCloud,
  Search,
  Loader2,
  AlertTriangle,
  Play,
  Github,
  X
} from "lucide-react";

const PROXY = "https://cool-rain-9329.lekharitami.workers.dev/?url=";

export default function TeraPeek() {
  const [videoId, setVideoId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [data, setData] = useState(null);
  const [showPlayer, setShowPlayer] = useState(false);
  const [freshLink, setFreshLink] = useState("");
  const [playerLoading, setPlayerLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const extractId = (input) => {
    if (!input) return "";
    try {
      const trimmed = input.trim();

      const match = trimmed.match(/\/s\/([^/?#]+)/i);
      if (match && match[1]) return match[1];

      return trimmed;
    } catch {
      return input.trim();
    }
  };

  const fetchMeta = async () => {
    setError("");
    setData(null);
    setShowPlayer(false);

    if (!videoId.trim()) {
      setError("Enter a valid link or ID");
      return;
    }

    const id = extractId(videoId);

    const apiUrl = `https://tera-core.vercel.app/api?url=https://terabox.com/s/${encodeURIComponent(id)}`;

    try {
      setLoading(true);

      const res = await fetch(apiUrl);
      if (!res.ok) throw new Error(`API error: ${res.status}`);

      const json = await res.json();

      if (json.status !== "success") {
        throw new Error(json.message || "API failed");
      }

      const file = json.files?.[0];
      if (!file) throw new Error("No file found");

      setData({
        file_name: file.filename,
        size: file.size,
        sizebytes: parseInt(file.size_bytes) || 0,
        thumb: file.thumbnails?.["850x580"] || null,
        rawlink: file.download_link,
        share_id: id,
      });
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const getFreshLink = async () => {
    try {
      const apiUrl = `https://tera-core.vercel.app/api?url=https://terabox.com/s/${encodeURIComponent(
        data.share_id
      )}`;

      const res = await fetch(apiUrl);
      const json = await res.json();

      const fresh = json?.files?.[0]?.download_link;

      return PROXY + encodeURIComponent(fresh || data.rawlink);
    } catch {
      return PROXY + encodeURIComponent(data.rawlink);
    }
  };

  const handlePlay = async () => {
    if (showPlayer) {
      setShowPlayer(false);
      return;
    }

    setPlayerLoading(true);
    const link = await getFreshLink();
    setFreshLink(link);
    setPlayerLoading(false);
    setShowPlayer(true);
  };

  const handleDownload = async () => {
    if (downloading) return;

    setDownloading(true);
    const link = await getFreshLink();
    window.open(link, "_blank");
    setDownloading(false);
  };

  const clearInput = () => {
    setVideoId("");
    setError("");
    setData(null);
    setShowPlayer(false);
  };

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-3xl mx-auto space-y-6">

        <h1 className="text-3xl font-bold">TeraPeek</h1>

        {/* INPUT */}
        <div className="flex gap-2">
          <input
            ref={inputRef}
            value={videoId}
            onChange={(e) => setVideoId(e.target.value)}
            placeholder="Paste Terabox link or ID"
            className="flex-1 p-3 rounded bg-neutral-800 outline-none"
          />

          <button
            onClick={fetchMeta}
            className="px-4 bg-indigo-600 rounded"
          >
            {loading ? <Loader2 className="animate-spin" /> : <Search />}
          </button>

          <button onClick={clearInput}>
            <X />
          </button>
        </div>

        {error && (
          <div className="text-red-400 flex gap-2">
            <AlertTriangle /> {error}
          </div>
        )}

        {/* RESULT */}
        {data && (
          <div className="space-y-4">

            {/* PLAYER */}
            <div className="bg-neutral-900 aspect-video flex items-center justify-center">
              {showPlayer ? (
                <video src={freshLink} controls className="w-full h-full" />
              ) : playerLoading ? (
                <Loader2 className="animate-spin" />
              ) : data.thumb ? (
                <img src={data.thumb} className="w-full h-full object-contain" />
              ) : (
                "No preview"
              )}
            </div>

            {/* BUTTONS */}
            <div className="flex gap-3 flex-wrap">
              <button onClick={handlePlay} className="bg-indigo-600 px-4 py-2 rounded flex gap-2">
                <Play /> {showPlayer ? "Hide" : "Play"}
              </button>

              <a
                href={freshLink || PROXY + encodeURIComponent(data.rawlink)}
                target="_blank"
                rel="noreferrer"
                className="bg-yellow-500 px-4 py-2 rounded flex gap-2"
              >
                <Link2 /> Open
              </a>

              <button
                onClick={handleDownload}
                className="bg-green-600 px-4 py-2 rounded flex gap-2"
              >
                {downloading ? <Loader2 className="animate-spin" /> : <DownloadCloud />}
                Download
              </button>
            </div>

            {/* METADATA */}
            <div className="bg-neutral-800 p-4 rounded space-y-2 text-sm">
              <div><b>Name:</b> {data.file_name}</div>
              <div><b>Size:</b> {data.size}</div>
              <div><b>Bytes:</b> {data.sizebytes}</div>
            </div>
          </div>
        )}

        {/* FOOTER */}
        <a
          href="https://github.com/saahiyo/tera-peek"
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-2 text-sm text-gray-400"
        >
          <Github /> View Repo
        </a>

      </div>
    </div>
  );
}
