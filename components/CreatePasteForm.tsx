import React, { useState } from 'react';
import { Clock, Eye, AlertCircle, CheckCircle2, Copy, ArrowRight, Loader2, ChevronDown, ChevronUp, ExternalLink, RefreshCw, Lock, Type, Code } from 'lucide-react';
import { createPaste } from '../services/mockBackend';
import { CreatePasteRequest } from '../types';

const PRESETS_TTL = [
	{ label: '10 min', value: 600 },
	{ label: '1 hour', value: 3600 },
	{ label: '1 day', value: 86400 },
];

const LANGUAGES = [
	{ value: 'plaintext', label: 'Plain Text' },
	{ value: 'javascript', label: 'JavaScript' },
	{ value: 'typescript', label: 'TypeScript' },
	{ value: 'json', label: 'JSON' },
	{ value: 'python', label: 'Python' },
	{ value: 'html', label: 'HTML' },
	{ value: 'css', label: 'CSS' },
	{ value: 'markdown', label: 'Markdown' },
	{ value: 'sql', label: 'SQL' },
];

export const CreatePasteForm: React.FC = () => {
	const [content, setContent] = useState('');
	const [title, setTitle] = useState('');
	const [language, setLanguage] = useState('plaintext');
	const [password, setPassword] = useState('');
	const [ttl, setTtl] = useState<string>(''); 
	const [maxViews, setMaxViews] = useState<string>('');
  
	const [showAdvanced, setShowAdvanced] = useState(true);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
	const [successData, setSuccessData] = useState<{url: string, expireAt: string | null} | null>(null);
	const [copied, setCopied] = useState(false);

	const validate = () => {
		const newFieldErrors: Record<string, string> = {};
		if (!content.trim()) newFieldErrors.content = "Content is required.";
    
		if (ttl) {
			const val = Number(ttl);
			if (!Number.isInteger(val) || val < 1) newFieldErrors.ttl = "Must be integer ≥ 1.";
		}

		if (maxViews) {
			const val = Number(maxViews);
			if (!Number.isInteger(val) || val < 1) newFieldErrors.maxViews = "Must be integer ≥ 1.";
		}

		setFieldErrors(newFieldErrors);
		return Object.keys(newFieldErrors).length === 0;
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError(null);
		setSuccessData(null);

		if (!validate()) return;

		setLoading(true);

		try {
			const payload: CreatePasteRequest = {
				content,
				title: title.trim() || undefined,
				language,
				password: password || undefined,
				ttlSeconds: ttl ? parseInt(ttl) : undefined,
				maxViews: maxViews ? parseInt(maxViews) : undefined,
			};

			const result = await createPaste(payload);
			setSuccessData({ url: result.url, expireAt: result.expireAt });
      
			setContent('');
			setPassword('');
		} catch (err: any) {
			setError(err.message || "Failed to create paste");
		} finally {
			setLoading(false);
		}
	};

	const resetForm = () => {
		setSuccessData(null);
		setContent('');
		setTitle('');
		setLanguage('plaintext');
		setPassword('');
		setTtl('');
		setMaxViews('');
		setShowAdvanced(true);
		setFieldErrors({});
	};

	const copyToClipboard = async () => {
		if (!successData) return;
		try {
			if (navigator.clipboard && (window as any).isSecureContext) {
				await navigator.clipboard.writeText(successData.url);
			} else {
				const textarea = document.createElement('textarea');
				textarea.value = successData.url;
				textarea.style.position = 'fixed';
				textarea.style.left = '-9999px';
				document.body.appendChild(textarea);
				textarea.focus();
				textarea.select();
				document.execCommand('copy');
				document.body.removeChild(textarea);
			}
			setCopied(true);
			setTimeout(() => setCopied(false), 1500);
		} catch (e) {
			console.error('Clipboard copy failed', e);
		}
	};

	return (
		<div className="space-y-8">
			{!successData && (
				<div className="text-center space-y-2 animate-in fade-in slide-in-from-bottom-2">
					<h1 className="text-3xl font-extrabold text-slate-900 dark:text-white sm:text-4xl">
						Share text securely
					</h1>
					<p className="text-lg text-slate-600 dark:text-slate-400 max-w-xl mx-auto">
						Paste your code or text below. Secure it with expiration rules and password protection.
					</p>
				</div>
			)}

			<div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden transition-colors duration-300">
				{successData ? (
					<div className="p-8 flex flex-col items-center justify-center space-y-6 text-center animate-in fade-in zoom-in-95 duration-300">
						<div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
							<CheckCircle2 className="w-8 h-8 text-green-600 dark:text-green-400" />
						</div>
						<div>
							<h3 className="text-xl font-bold text-slate-900 dark:text-white">Paste Created!</h3>
							<p className="text-slate-500 dark:text-slate-400 mt-1">Your secure link is ready.</p>
						</div>
            
						<div className="w-full max-w-md flex flex-col gap-3">
							<div className="flex gap-2">
								<input 
									readOnly 
									value={successData.url} 
									className="flex-1 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-4 py-3 text-sm font-mono text-slate-600 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
								/>
								<button 
									onClick={copyToClipboard}
									className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
								>
									{copied ? <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400" /> : <Copy className="w-4 h-4" />}
									{copied ? 'Copied!' : 'Copy'}
								</button>
							</div>

							<a 
								href={successData.url}
								target="_blank"
								rel="noreferrer"
								className="w-full bg-indigo-50 dark:bg-indigo-900/20 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-800 py-2.5 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
							>
								Open Paste <ExternalLink className="w-4 h-4" />
							</a>
						</div>

						<div className="text-sm text-slate-400 dark:text-slate-500 max-w-sm">
							 {ttl || maxViews ? (
								 <p>
									 Expires {ttl ? `in ${ttl} seconds` : ''} 
									 {ttl && maxViews ? ' or ' : ''} 
									 {maxViews ? `after ${maxViews} views` : ''}, whichever comes first.
								 </p>
							 ) : (
								 <p>This paste will not expire automatically.</p>
							 )}
						</div>

						<button 
							onClick={resetForm}
							className="text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 font-medium text-sm flex items-center gap-1 mt-4 transition-colors"
						>
							<RefreshCw className="w-3 h-3" /> Create another paste
						</button>
					</div>
				) : (
					<form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
            
						<div className="space-y-4">
							<input
								type="text"
								placeholder="Paste Title (Optional)"
								value={title}
								onChange={(e) => setTitle(e.target.value)}
								className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-500/50 text-slate-800 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500"
							/>

							<div className="space-y-1">
								<textarea
									id="content"
									value={content}
									onChange={(e) => {
										setContent(e.target.value);
										if (fieldErrors.content) setFieldErrors({...fieldErrors, content: ''});
									}}
									placeholder="Paste your content here..."
									className={`w-full h-80 p-4 bg-slate-50 dark:bg-slate-950 border ${fieldErrors.content ? 'border-red-300 focus:border-red-500 focus:ring-red-200' : 'border-slate-200 dark:border-slate-800 focus:border-indigo-500 focus:ring-indigo-500'} rounded-xl mono text-sm focus:ring-2 transition-all resize-y placeholder:text-slate-400 dark:placeholder:text-slate-600 text-slate-800 dark:text-slate-200`}
									spellCheck={false}
								/>
								{fieldErrors.content && (
									<p className="text-xs text-red-600 dark:text-red-400 pl-1">{fieldErrors.content}</p>
								)}
							</div>
						</div>

						<div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
							<button
								type="button"
								onClick={() => setShowAdvanced(!showAdvanced)}
								className="w-full flex items-center justify-between px-4 py-3 bg-slate-50 dark:bg-slate-950/50 hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors text-sm font-medium text-slate-700 dark:text-slate-300"
							>
								<span className="flex items-center gap-2">
									<Type className="w-4 h-4 text-slate-400" />
									Options
								</span>
								{showAdvanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
							</button>

							{showAdvanced && (
								<div className="p-4 sm:p-6 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-6 animate-in slide-in-from-top-2">
                  
									<div className="space-y-2">
										<label className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
											<Code className="w-4 h-4 text-slate-400" />
											Syntax Highlighting
										</label>
										<div className="relative">
											<select
												value={language}
												onChange={(e) => setLanguage(e.target.value)}
												className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-sm text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 appearance-none"
											>
												{LANGUAGES.map(lang => (
													<option key={lang.value} value={lang.value}>{lang.label}</option>
												))}
											</select>
											<ChevronDown className="absolute right-3 top-3 w-4 h-4 text-slate-400 pointer-events-none" />
										</div>
									</div>

									<div className="space-y-2">
										<label className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
											<Lock className="w-4 h-4 text-slate-400" />
											Password Protection
										</label>
										<input
											type="password"
											autoComplete="new-password"
											placeholder="Optional password"
											value={password}
											onChange={(e) => setPassword(e.target.value)}
											className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-sm text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
										/>
									</div>

									<div className="space-y-2">
										<label className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
											<Clock className="w-4 h-4 text-slate-400" />
											Expiration (Seconds)
										</label>
										<input
											type="number"
											min="1"
											step="1"
											placeholder="e.g. 60"
											value={ttl}
											onChange={(e) => setTtl(e.target.value)}
											className={`w-full p-2.5 bg-slate-50 dark:bg-slate-950 border ${fieldErrors.ttl ? 'border-red-300 focus:border-red-500' : 'border-slate-200 dark:border-slate-800 focus:border-indigo-500'} rounded-lg text-sm text-slate-800 dark:text-slate-200 focus:ring-2`}
										/>
										{fieldErrors.ttl && <p className="text-xs text-red-600 dark:text-red-400">{fieldErrors.ttl}</p>}
                    
										<div className="flex gap-2 pt-1">
											{PRESETS_TTL.map(preset => (
												<button
													key={preset.value}
													type="button"
													onClick={() => setTtl(preset.value.toString())}
													className="px-2 py-1 text-xs bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded border border-slate-200 dark:border-slate-700 transition-colors"
												>
													{preset.label}
												</button>
											))}
										</div>
									</div>

									<div className="space-y-2">
										<label className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
											<Eye className="w-4 h-4 text-slate-400" />
											Max Views
										</label>
										<input
											type="number"
											min="1"
											step="1"
											placeholder="e.g. 5"
											value={maxViews}
											onChange={(e) => setMaxViews(e.target.value)}
											className={`w-full p-2.5 bg-slate-50 dark:bg-slate-950 border ${fieldErrors.maxViews ? 'border-red-300 focus:border-red-500' : 'border-slate-200 dark:border-slate-800 focus:border-indigo-500'} rounded-lg text-sm text-slate-800 dark:text-slate-200 focus:ring-2`}
										/>
										{fieldErrors.maxViews && <p className="text-xs text-red-600 dark:text-red-400">{fieldErrors.maxViews}</p>}
										<p className="text-xs text-slate-400">Burn after reading logic (e.g. 1)</p>
									</div>
								</div>
							)}
						</div>

						{error && (
							<div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/50 rounded-lg flex items-start gap-3 text-red-700 dark:text-red-400 text-sm animate-in fade-in slide-in-from-top-2">
								<AlertCircle className="w-5 h-5 shrink-0" />
								<span>{error}</span>
							</div>
						)}

						<div className="pt-2">
							<button
								type="submit"
								disabled={loading}
								className="w-full bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-500 disabled:bg-indigo-400 disabled:cursor-not-allowed text-white font-semibold py-3.5 px-6 rounded-xl shadow-sm transition-all flex items-center justify-center gap-2"
							>
								{loading ? (
									<>
										<Loader2 className="w-5 h-5 animate-spin" />
										Creating Paste...
									</>
								) : (
									<>
										Create Paste
										<ArrowRight className="w-5 h-5" />
									</>
								)}
							</button>
						</div>
					</form>
				)}
			</div>
      
			<div className="text-center text-xs text-slate-400 dark:text-slate-600 max-w-lg mx-auto leading-relaxed transition-colors duration-300">
				<p>
					<span className="font-semibold text-slate-500 dark:text-slate-500">Note:</span> API requests run against the backend at <span className="font-mono">/api</span>; keep the server running while testing.
				</p>
			</div>
		</div>
	);
};