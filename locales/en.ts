import { Translations } from './ko';

export const en: Translations = {
  // Card
  card: {
    placeholder: "What do you want?",
    addImage: "Add Image",
    changeImage: "Change Image",
  },

  // Buttons
  button: {
    delete: "Delete",
    edit: "Edit",
    save: "Save",
    close: "Close",
  },

  // Toolbar
  toolbar: {
    title: "Visual Board",
    sharedTitle: "Shared Board",
    refreshBackground: "Refresh Background",
    share: "Share",
  },

  // Settings Menu
  settings: {
    title: "Settings",
    backup: "Backup",
    restore: "Restore",
    boards: "Boards",
    language: "Language",
    korean: "한국어",
    english: "English",
  },

  // Links Menu
  links: {
    developerNotes: "Developer Notes",
    github: "GitHub",
  },

  // Image Source Dropdown
  imageSource: {
    uploadFile: "Upload File",
    generateAI: "Generate with AI",
    addByUrl: "Add by URL",
  },

  // Share Modal
  shareModal: {
    title: "Share Vision Board",
    asImage: "Save as Image",
    asImageDesc: "Download current screen as PNG image",
    asLink: "Share as Link",
    asLinkDesc: "Generate shareable link (valid for 1 day)",
    asFile: "Export as File",
    asFileDesc: "Save as JSON file (coming soon)",
  },

  // URL Input Modal
  urlModal: {
    title: "Enter Image URL",
    placeholder: "Enter image URL",
    add: "Add",
    cancel: "Cancel",
    tip: "Tip: Right-click on an image > 'Copy image address' to get the URL.",
  },

  // Toast Messages
  toast: {
    maxCards: "Too many dreams! Please delete old memories.",
    imageGenerating: "Generating image...",
    imageDownloaded: "Image downloaded! 🎉",
    imageFailed: "Failed to download image",
    captureError: "Failed to capture screen",
    linkCopied: "Link copied! (Valid for 1 day)",
    linkFailed: "Failed to generate link",
    linkGenerating: "🔗 Generating link...",
    backupSuccess: "Backup completed!",
    backupFailed: "Backup failed",
    restoreSuccess: "Restore completed!",
    restoreFailed: "Restore failed",
    noBackup: "No backup file found",
    sharedBoardLoaded: "🎉 Shared vision board loaded!",
    sharedBoardFailed: "⚠️ Failed to load shared vision board",
    cardDuplicated: "Card duplicated",
  },

  // Shared View Mode
  sharedView: {
    notice: "Viewing shared board (adjustable, not saved)",
    backToMyBoard: "Back to My Board",
  },

  // Developer Notes
  developerNotes: {
    title: "Developer Notes",
    features: "Key Features",
    cardMove: "Move Card: Drag cards to freely arrange",
    cardResize: "Resize: Drag corners/edges to resize cards",
    imageAdjust: "Adjust Image: Click lock icon to adjust image position",
    backgroundChange: "Change Background: Click refresh button to change background",
    buyMeCoffee: "☕ Buy Me a Coffee",
    madeWith: "Made with ❤️ by vision team",
  },

  boards: {
    title: "Boards",
    create: "Create",
    open: "Open",
    active: "Active",
    defaultName: "My Board",
    namePlaceholder: "Board name",
    newPlaceholder: "New board name",
    updatedAt: "Updated",
  },

  // Card Templates
  templates: {
    title: "Choose a template",
    recent: "Recent",
    items: {
      note: {
        label: "Note",
        description: "Empty text card",
        defaultText: "",
      },
      checklist: {
        label: "Checklist",
        description: "Simple to-do list",
        defaultText: "- [ ] Task 1\n- [ ] Task 2\n- [ ] Task 3",
      },
      goal: {
        label: "Goal",
        description: "Goal and next steps",
        defaultText: "[[goal]]\n\n[[reason]]\n\n[[firstStep]]\n",
      },
      retro: {
        label: "Retro",
        description: "Keep / Problem / Try",
        defaultText: "[[keep]]\n\n[[problem]]\n\n[[try]]\n",
      },
      project: {
        label: "Project",
        description: "Plan and track progress",
        defaultText: "[[projectName]]\n\n[[deadlineDate]]\n\n[[planning]]\n\n[[design]]\n\n[[development]]\n",
      },
    },
    sections: {
      goal: {
        goal: "Goal",
        reason: "Why",
        firstStep: "First step",
      },
      retro: {
        keep: "Keep",
        problem: "Problem",
        try: "Try",
      },
      project: {
        name: "Project name",
        deadlineDate: "Deadline (date)",
        planning: "Planning",
        design: "Design",
        development: "Development",
      },
    },
  },

  // Sticker Palette
  stickerPalette: {
    title: "Stickers",
    open: "Open sticker palette",
    empty: "No stickers yet",
    addHint: "Click + to add stickers",
    add: "Add Sticker",
    addTitle: "Add Sticker",
    addButton: "Add",
    nameLabel: "Name (optional)",
    namePlaceholder: "Sticker name",
    urlLabel: "Image URL",
    fileLabel: "Or upload file",
    chooseFile: "Choose File",
  },
};
