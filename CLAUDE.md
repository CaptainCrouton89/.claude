**Config Locations (all managed by chezmoi)**
- `~/.config/nvim/` - LazyVim config (keymaps in `lua/config/keymaps.lua`, plugins in `lua/plugins/`)
- `~/.zshrc` - Shell config (aliases, functions like `lg` for multi-repo lazygit)
- `~/.tmux.conf` - Tmux config
- `~/.tmuxp/` - Tmuxp session definitions (use `tmuxp load <name>`)
- `~/Library/Application Support/lazygit/config.yml` - Lazygit config (macOS location)
- `~/.config/delta/themes.gitconfig` - Delta diff viewer theme (included in ~/.gitconfig)
- `~/.gitconfig` - Git config
- `~/.claude/` - Claude Code config, commands, hooks, skills
- `~/.local/share/chezmoi/` - Chezmoi source (run `chezmoi add <file>` to track new configs)

**Tmuxp Sessions**
- `tmuxp load config` - Opens all config files for editing

**File Storage**
- Plans → `<cwd>/.claude/plans/<name>.md`
- Context/skills → `<cwd>/.claude/`

**Feature Workflow**: `/rpi/arch` → `/rpi/plan` → `/rpi/implement` → `/rpi/review` → `/rpi/fix`