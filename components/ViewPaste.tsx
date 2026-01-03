import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getPaste } from '../services/mockBackend';
import { ViewPasteResponse } from '../types';
import { Loader2, AlertTriangle, Calendar, Eye, Clock, FileText, Flame, Lock, Check, Copy } from 'lucide-react';

export const ViewPaste: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [paste, setPaste] = useState<ViewPasteResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [password, setPassword] = useState('');
  const [requiresPassword, setRequiresPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [copied, setCopied] = useState(false);

  const fetchPaste = async (pwd?: string) => {
    if (!id) return;
    setLoading(true);
    setPasswordError('');
    
    try {
      const data = await getPaste(id, pwd);
      setPaste(data);
      setRequiresPassword(false);
    } catch (err: any) {
      if (err.requiresPassword) {
        setRequiresPassword(true);
      } else {
        setError("Paste not found or expired.");
        setRequiresPassword(false);
      }
      if (pwd) setPasswordError('Incorrect password');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPaste();
  }, [id]);

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchPaste(password);
  };

  const handleCopyContent = async () => {
    if (!paste) return;
    try {
      if (navigator.clipboard && (window as any).isSecureContext) {
        await navigator.clipboard.writeText(paste.content);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = paste.content;
        textarea.style.position = 'fixed';
        textarea.style.left = '-9999px';
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error('Clipboard copy failed', e);
    }
  };

  if (loading && !requiresPassword) {
    return (
      <div className="flex flex-col items-center justify-center py-20 animate-in fade-in duration-300">
        <Loader2 className="w-10 h-10 text-indigo-600 animate-spin mb-4" />
        <p className="text-slate-500 font-medium">Decrypting paste...</p>
      </div>
    );
  }

  if (requiresPassword) {
    return (
      <div className="max-w-md mx-auto mt-8 p-6 bg-white dark:bg-slate-900 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-300">
        <div className="flex flex-col items-center space-y-4 text-center">
          <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center">
            <Lock className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Password Required</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm">This paste is protected. Please enter the password to view it.</p>
          
          <form onSubmit={handlePasswordSubmit} className="w-full space-y-4 pt-2">
            <input
              type="password"
              autoFocus
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter Password"
              className="w-full p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-center focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-slate-800 dark:text-slate-200"
            />
            {passwordError && <p className="text-red-500 text-sm">{passwordError}</p>}
            <button
              type="submit"
              disabled={!password}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Unlock Paste
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-xl mx-auto text-center py-12 px-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm animate-in zoom-in-95 duration-200">
        <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6">
          <AlertTriangle className="w-8 h-8 text-slate-400 dark:text-slate-500" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">404 - Unavailable</h2>
        <p className="text-slate-600 dark:text-slate-400 mb-8">{error}</p>
        <Link 
          to="/" 
          className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 transition-colors"
        >
          Create New Paste
        </Link>
      </div>
    );
  }

  if (!paste) return null;

  const isLastView = paste.remainingViews === 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
           {paste.title && (
             <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-1 break-all">
               {paste.title}
             </h1>
           )}
           <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
             <FileText className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
             Paste <span className="font-mono text-xs bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">#{id}</span>
           </div>
        </div>
        
        <div className="flex items-center gap-3">
           <button 
             onClick={handleCopyContent}
             className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
           >
             {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
             {copied ? 'Copied' : 'Copy Content'}
           </button>
           <Link to="/" className="text-sm px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors">
            New Paste
           </Link>
        </div>
      </div>

      {isLastView && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/50 rounded-xl p-4 flex items-start gap-3 text-red-800 dark:text-red-200 text-sm animate-in slide-in-from-top-2">
          <Flame className="w-5 h-5 shrink-0 text-red-600 dark:text-red-400" />
          <div>
            <span className="font-bold">Paste Destroyed:</span> This paste has reached its view limit (0 remaining). 
            This is the last time it will be shown. Refreshing this page will result in a 404.
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden transition-colors duration-300">
        <div className="bg-slate-50 dark:bg-slate-950 px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center gap-4 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-1.5" title="Created At">
            <Calendar className="w-4 h-4" />
            <span>{new Date(paste.createdAt).toLocaleString()}</span>
          </div>

          {paste.expiresAt && (
            <div className="flex items-center gap-1.5 text-orange-600 dark:text-orange-400" title="Expires At">
              <Clock className="w-4 h-4" />
              <span>Expires: {new Date(paste.expiresAt).toLocaleString()}</span>
            </div>
          )}

          {paste.remainingViews !== null && (
            <div className={`flex items-center gap-1.5 ${isLastView ? 'text-red-600 dark:text-red-400 font-bold' : 'text-purple-600 dark:text-purple-400'}`} title="Remaining Views">
              <Eye className="w-4 h-4" />
              <span>{paste.remainingViews} view{paste.remainingViews !== 1 && 's'} remaining</span>
            </div>
          )}
          
          <div className="ml-auto">
             <span className="px-2 py-1 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded text-xs uppercase font-bold tracking-wider">
               {paste.language || 'Plain Text'}
             </span>
          </div>
        </div>

        <div className="p-0 overflow-x-auto relative group">
          <pre className="p-6 text-sm text-slate-800 dark:text-slate-300 leading-relaxed whitespace-pre-wrap break-all mono selection:bg-indigo-100 dark:selection:bg-indigo-900 selection:text-indigo-900 dark:selection:text-indigo-100">
            <code>{paste.content}</code>
          </pre>
        </div>
      </div>
      
      <div className="text-center pt-8">
        <Link 
          to="/"
          className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 text-sm font-medium transition-colors"
        >
          &larr; Back to Home
        </Link>
      </div>
    </div>
  );
};
