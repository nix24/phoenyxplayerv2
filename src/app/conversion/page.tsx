"use client";

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import Link from 'next/link';

type ConversionFormat = 'mp3' | 'opus' | 'wav';
type FileStatus = 'waiting' | 'converting' | 'completed' | 'error';

interface FileWithStatus {
    file: File;
    status: FileStatus;
    progress: number;
    error?: string;
    downloadUrl?: string;
}

export default function FileConversion() {
    const [files, setFiles] = useState<FileWithStatus[]>([]);
    const [selectedFormat, setSelectedFormat] = useState<ConversionFormat>('mp3');

    const onDrop = useCallback((acceptedFiles: File[]) => {
        const newFiles = acceptedFiles.slice(0, 5).map(file => ({
            file,
            status: 'waiting' as FileStatus,
            progress: 0
        }));
        setFiles(prev => [...prev, ...newFiles].slice(0, 5));
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'audio/*': ['.mp3', '.wav', '.ogg', '.m4a', '.aac']
        },
        maxFiles: 5
    });

    const handleConvert = async () => {
        // Implementation for conversion will go here
        // This is a placeholder for the actual conversion logic
        setFiles(prev =>
            prev.map(file => ({
                ...file,
                status: 'converting',
            }))
        );
    };

    return (
        <main className="container mx-auto px-4 py-8">
            <div className="max-w-4xl mx-auto">
                <nav className="mb-8 breadcrumbs">
                    <ul>
                        <li><Link href="/" className="text-primary">Home</Link></li>
                        <li>File Conversion</li>
                    </ul>
                </nav>

                <div className="card bg-base-200 shadow-xl">
                    <div className="card-body">
                        <h1 className="card-title text-2xl mb-6">Audio File Conversion</h1>

                        <div className="form-control w-full max-w-xs mb-6">
                            <label htmlFor="format-select" className="label">
                                <span className="label-text">Output Format</span>
                            </label>
                            <select
                                id="format-select"
                                className="select select-bordered"
                                value={selectedFormat}
                                onChange={(e) => setSelectedFormat(e.target.value as ConversionFormat)}
                            >
                                <option value="mp3">MP3</option>
                                <option value="opus">Opus</option>
                                <option value="wav">WAV</option>
                            </select>
                        </div>

                        <button
                            type="button"
                            {...getRootProps()}
                            className={`w-full border-2 border-dashed rounded-lg p-10 text-center cursor-pointer transition-colors
                ${isDragActive ? 'border-primary bg-primary/10' : 'border-base-content/20 hover:border-primary'}`}
                            aria-label="Drag and drop audio files here or click to select files"
                        >
                            <input {...getInputProps()} aria-label="File input" />
                            <div className="flex flex-col items-center gap-4">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                                    <title>Upload icon</title>
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                </svg>
                                <div>
                                    <p className="text-lg font-medium">Drop your audio files here</p>
                                    <p className="text-sm opacity-70">or click to select files</p>
                                </div>
                            </div>
                        </button>

                        {files.length > 0 && (
                            <div className="mt-8">
                                <h2 className="text-lg font-semibold mb-4">Files to Convert</h2>
                                <div className="space-y-4">
                                    {files.map((file, i) => (
                                        <div key={`${file.file.name}-${i}`} className="card bg-base-300">
                                            <div className="card-body p-4">
                                                <div className="flex items-center justify-between">
                                                    <span className="font-medium">{file.file.name}</span>
                                                    <span className="badge badge-primary">{file.status}</span>
                                                </div>
                                                {file.status === 'converting' && (
                                                    <progress
                                                        className="progress progress-primary w-full"
                                                        value={file.progress}
                                                        max="100"
                                                        aria-label={`Conversion progress for ${file.file.name}`}
                                                    />
                                                )}
                                                {file.error && (
                                                    <div className="text-error text-sm mt-2">{file.error}</div>
                                                )}
                                                {file.downloadUrl && (
                                                    <a
                                                        href={file.downloadUrl}
                                                        download
                                                        className="btn btn-primary btn-sm mt-2"
                                                    >
                                                        Download
                                                    </a>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="mt-6 flex justify-end">
                                    <button
                                        type="button"
                                        className="btn btn-primary"
                                        onClick={handleConvert}
                                        disabled={files.some(f => f.status === 'converting')}
                                    >
                                        Convert Files
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </main>
    );
} 