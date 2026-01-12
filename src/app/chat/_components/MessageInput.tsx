import React from 'react';
import { Send, Paperclip, ImageIcon, Smile, Clock, Loader2 } from 'lucide-react';

interface MessageInputProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  disabled?: boolean;
  placeholder?: string;
}

export default function MessageInput({
  value,
  onChange,
  onSend,
  disabled = false,
  placeholder = "Type a message...",
}: MessageInputProps) {
  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!disabled && value.trim()) {
        onSend();
      }
    }
  };

  return (
    <div className="p-6 pt-2 bg-background-light dark:bg-background-dark">
      <div className="bg-white dark:bg-surface-dark rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-2 flex flex-col gap-2">
        {/* Textarea */}
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={placeholder}
          disabled={disabled}
          className="w-full bg-transparent border-none focus:ring-0 p-3 text-sm min-h-[60px] resize-none text-text-main dark:text-white placeholder-text-muted disabled:opacity-50"
          rows={3}
        />

        {/* Toolbar */}
        <div className="flex justify-between items-center px-1 pb-1">
          {/* Action buttons */}
          <div className="flex gap-1">
            <ToolbarButton icon={<Paperclip size={20} />} title="Attach File" />
            <ToolbarButton icon={<ImageIcon size={20} />} title="Add Image" />
            <ToolbarButton icon={<Smile size={20} />} title="Emoji" />
          </div>

          <div className="flex items-center gap-3">
            {/* Quick Action */}
            <button className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/20 hover:bg-primary/30 text-green-800 dark:text-green-300 rounded-lg text-xs font-semibold transition-colors">
              <Clock size={16} />
              Propose Time
            </button>

            {/* Send Button */}
            <button
              onClick={onSend}
              disabled={!value.trim() || disabled}
              className="bg-primary hover:bg-green-400 disabled:opacity-50 disabled:cursor-not-allowed text-black rounded-lg p-2 pr-3 pl-3 flex items-center gap-2 font-medium text-sm transition-all shadow-md shadow-primary/20"
            >
              {disabled ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <>
                  <span>Send</span>
                  <Send size={18} />
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      <p className="text-center text-[10px] text-text-muted mt-2">
        Press Enter to send, Shift + Enter for new line
      </p>
    </div>
  );
}

function ToolbarButton({
  icon,
  title,
}: {
  icon: React.ReactNode;
  title: string;
}) {
  return (
    <button
      className="p-2 text-text-muted hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
      title={title}
      type="button"
    >
      {icon}
    </button>
  );
}
