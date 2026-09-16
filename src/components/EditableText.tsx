import React, { useState } from 'react';
import { useCms } from '../context/CmsContext';
import { Edit2, RotateCcw, Check, X, Sparkles } from 'lucide-react';

interface EditableTextProps {
  contentKey: string;
  defaultText: string;
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'p' | 'span' | 'div';
  className?: string;
  multiline?: boolean;
  label?: string;
  children?: (text: string) => React.ReactNode;
}

export const EditableText: React.FC<EditableTextProps> = ({
  contentKey,
  defaultText,
  as: Component = 'span',
  className = '',
  multiline = false,
  label,
  children
}) => {
  const { getText, setText, resetText, isModified, isMasterEditMode, canEdit, isSaving } = useCms();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [tempValue, setTempValue] = useState('');

  const currentText = getText(contentKey, defaultText);
  const modified = isModified(contentKey);

  const handleOpenEditor = (e: React.MouseEvent) => {
    if (!isMasterEditMode || !canEdit) return;
    e.preventDefault();
    e.stopPropagation();
    setTempValue(currentText);
    setIsModalOpen(true);
  };

  const handleSave = async (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    await setText(contentKey, tempValue);
    setIsModalOpen(false);
  };

  const handleReset = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    await resetText(contentKey);
    setTempValue(defaultText);
    setIsModalOpen(false);
  };

  // Render content
  const renderedContent = children ? children(currentText) : currentText;

  if (!isMasterEditMode || !canEdit) {
    return <Component className={className}>{renderedContent}</Component>;
  }

  return (
    <>
      <Component
        onClick={handleOpenEditor}
        className={`${className} group/editable relative cursor-pointer outline-dashed outline-1 outline-amber-400/50 hover:outline-amber-400 hover:outline-2 rounded-sm transition-all hover:bg-amber-400/10 px-0.5`}
        title={`Click to edit live text [Key: ${contentKey}]`}
      >
        {renderedContent}
        {/* Floating live indicator icon */}
        <span className="opacity-0 group-hover/editable:opacity-100 transition-opacity absolute -top-5 right-0 z-30 flex items-center gap-1 bg-amber-500 text-slate-950 font-black text-[9px] px-1.5 py-0.5 rounded shadow-lg whitespace-nowrap pointer-events-none uppercase tracking-wider">
          <Edit2 className="w-2.5 h-2.5" />
          <span>Edit</span>
          {modified && <span className="w-1.5 h-1.5 rounded-full bg-rose-950" />}
        </span>
      </Component>

      {/* In-Place Quick Edit Modal */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-100 no-print"
          onClick={(e) => {
            e.stopPropagation();
            setIsModalOpen(false);
          }}
        >
          <div
            className="bg-slate-900 border border-amber-400/50 rounded-2xl shadow-[0_0_50px_rgba(245,158,11,0.25)] max-w-lg w-full p-5 space-y-4 text-slate-100 relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
                  <Edit2 className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <span>{label || 'Edit Website Text'}</span>
                    {modified && (
                      <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        Modified
                      </span>
                    )}
                  </h4>
                  <p className="text-[11px] font-mono text-slate-400 truncate max-w-xs">
                    {contentKey}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Input area */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center justify-between">
                <span>Live Content</span>
                <span className="text-[10px] text-slate-400 font-mono">
                  {tempValue.length} characters
                </span>
              </label>

              {multiline ? (
                <textarea
                  rows={4}
                  value={tempValue}
                  onChange={(e) => setTempValue(e.target.value)}
                  className="w-full p-3 rounded-xl bg-slate-950 border border-white/20 text-white text-sm focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400 resize-y"
                  placeholder="Enter custom text..."
                />
              ) : (
                <input
                  type="text"
                  value={tempValue}
                  onChange={(e) => setTempValue(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/20 text-white text-sm focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400"
                  placeholder="Enter custom text..."
                />
              )}
            </div>

            {/* Default reference box */}
            <div className="bg-slate-950/70 p-3 rounded-xl border border-white/10 text-xs space-y-1">
              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <span className="font-bold uppercase tracking-wider">Default Factory Text:</span>
                {tempValue !== defaultText && (
                  <button
                    type="button"
                    onClick={() => setTempValue(defaultText)}
                    className="text-amber-400 hover:text-amber-300 underline font-bold"
                  >
                    Copy default into editor
                  </button>
                )}
              </div>
              <p className="text-slate-300 italic text-[11px] leading-relaxed">
                "{defaultText}"
              </p>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-2 border-t border-white/10 gap-2">
              <button
                type="button"
                onClick={handleReset}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-rose-300 bg-rose-950/30 hover:bg-rose-900/40 border border-rose-500/30 transition-colors"
                title="Reset to factory default"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset to Default</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3.5 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white hover:bg-white/10"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isSaving}
                  onClick={handleSave}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black text-slate-950 bg-gradient-to-r from-amber-400 to-amber-500 hover:opacity-95 shadow-[0_0_15px_rgba(245,158,11,0.4)] transition-all"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>{isSaving ? 'Saving...' : 'Save Live Text'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
