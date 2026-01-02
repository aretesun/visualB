import React, { useEffect, useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import type { BoardData } from '../store/useBoardStore';
import { CONSTANTS } from '../utils/constants';

interface BoardManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  boards: BoardData[];
  activeBoardId: string | null;
  onCreateBoard: (name: string) => void;
  onSelectBoard: (id: string) => void;
  onRenameBoard: (id: string, name: string) => void;
  onDeleteBoard: (id: string) => void;
}

const BoardManagerModal: React.FC<BoardManagerModalProps> = ({
  isOpen,
  onClose,
  boards,
  activeBoardId,
  onCreateBoard,
  onSelectBoard,
  onRenameBoard,
  onDeleteBoard,
}) => {
  const { t } = useLanguage();
  const [newBoardName, setNewBoardName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');

  useEffect(() => {
    if (!isOpen) {
      setNewBoardName('');
      setEditingId(null);
      setEditingName('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCreate = () => {
    const name = newBoardName.trim() || t.boards?.defaultName || 'New Board';
    onCreateBoard(name);
    setNewBoardName('');
  };

  const handleEditStart = (board: BoardData) => {
    setEditingId(board.id);
    setEditingName(board.name);
  };

  const handleEditSave = () => {
    if (editingId) {
      const name = editingName.trim();
      if (name) {
        onRenameBoard(editingId, name);
      }
    }
    setEditingId(null);
    setEditingName('');
  };

  return (
    <div
      className="fixed inset-0 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      style={{ zIndex: CONSTANTS.Z_INDEX.MODAL }}
      onClick={onClose}
    >
      <div
        className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-lg shadow-xl p-6 max-w-xl w-full max-h-[80vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-semibold text-white">
            🧱 {t.boards?.title || 'Boards'}
          </h2>
          <button
            onClick={onClose}
            className="p-1 text-white/70 hover:text-white hover:bg-white/20 rounded transition-colors"
            aria-label="Close"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-3">
          {boards.map((board) => (
            <div
              key={board.id}
              className={`flex items-center justify-between p-3 rounded-lg border ${
                board.id === activeBoardId ? 'border-emerald-400 bg-emerald-500/10' : 'border-white/10 bg-white/5'
              }`}
            >
              <div className="flex-1">
                {editingId === board.id ? (
                  <input
                    value={editingName}
                    onChange={(e) => setEditingName(e.target.value)}
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white text-sm"
                    placeholder={t.boards?.namePlaceholder || 'Board name'}
                  />
                ) : (
                  <div className="text-white text-sm font-medium">{board.name}</div>
                )}
                <div className="text-white/50 text-xs mt-1">
                  {t.boards?.updatedAt || 'Updated'}: {new Date(board.updatedAt).toLocaleDateString()}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {editingId === board.id ? (
                  <button
                    onClick={handleEditSave}
                    className="px-3 py-2 bg-white/20 hover:bg-white/30 text-white rounded text-xs"
                  >
                    {t.button?.save || 'Save'}
                  </button>
                ) : (
                  <>
                    <button
                      onClick={() => {
                        onSelectBoard(board.id);
                        onClose();
                      }}
                      className="px-3 py-2 bg-white/20 hover:bg-white/30 text-white rounded text-xs"
                    >
                      {board.id === activeBoardId ? (t.boards?.active || 'Active') : (t.boards?.open || 'Open')}
                    </button>
                    <button
                      onClick={() => handleEditStart(board)}
                      className="px-3 py-2 bg-white/15 hover:bg-white/25 text-white rounded text-xs"
                    >
                      {t.button?.edit || 'Edit'}
                    </button>
                    <button
                      onClick={() => onDeleteBoard(board.id)}
                      className="px-3 py-2 bg-red-500/80 hover:bg-red-500 text-white rounded text-xs disabled:opacity-50"
                      disabled={boards.length <= 1}
                    >
                      {t.button?.delete || 'Delete'}
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 border-t border-white/10 pt-4">
          <div className="flex items-center gap-2">
            <input
              value={newBoardName}
              onChange={(e) => setNewBoardName(e.target.value)}
              className="flex-1 px-4 py-2 bg-white/10 border border-white/20 rounded text-white text-sm"
              placeholder={t.boards?.newPlaceholder || 'New board name'}
            />
            <button
              onClick={handleCreate}
              className="px-4 py-2 bg-white/25 hover:bg-white/35 text-white rounded text-sm"
            >
              {t.boards?.create || 'Create'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BoardManagerModal;
