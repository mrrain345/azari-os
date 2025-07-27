# Enable Powerlevel10k instant prompt. Should stay close to the top of ~/.zshrc.
# Initialization code that may require console input (password prompts, [y/n]
# confirmations, etc.) must go above this block; everything else may go below.
if [[ -r "${XDG_CACHE_HOME:-$HOME/.cache}/p10k-instant-prompt-${(%):-%n}.zsh" ]]; then
  source "${XDG_CACHE_HOME:-$HOME/.cache}/p10k-instant-prompt-${(%):-%n}.zsh"
fi

if [ -e "/usr/lib64/kitty/shell-integration/zsh/kitty.zsh" ]; then
  source "/usr/lib64/kitty/shell-integration/zsh/kitty.zsh"
fi

autoload -Uz compinit && compinit
# End of lines added by compinstall
# Lines configured by zsh-newuser-install
HISTFILE=~/.histfile
HISTSIZE=10000
SAVEHIST=10000
bindkey -e
# End of lines configured by zsh-newuser-install

setopt HIST_FCNTL_LOCK
unsetopt APPEND_HISTORY
setopt HIST_IGNORE_DUPS
unsetopt HIST_IGNORE_ALL_DUPS
unsetopt HIST_SAVE_NO_DUPS
unsetopt HIST_FIND_NO_DUPS
setopt HIST_IGNORE_SPACE
unsetopt HIST_EXPIRE_DUPS_FIRST
setopt SHARE_HISTORY
unsetopt EXTENDED_HISTORY

unsetopt correct # autocorrect commands
setopt hist_ignore_all_dups # remove older duplicate entries from history
setopt hist_reduce_blanks # remove superfluous blanks from history items
setopt inc_append_history # save history entries as soon as they are entered

# auto complete options
setopt auto_list # automatically list choices on ambiguous completion
setopt auto_menu # automatically use menu completion
zstyle :compinstall filename '$HOME/.zshrc'
zstyle ':completion:*' menu select # select completions with arrow keys
zstyle ':completion:*' group-name "" # group results by category
zstyle ':completion:::::' completer _expand _complete _ignored _approximate # enable approximate matches for completion

# Key bindings
typeset -g -A key

#key[Home]="${terminfo[khome]}"
#key[End]="${terminfo[kend]}"
#key[Insert]="${terminfo[kich1]}"
#key[Backspace]="${terminfo[kbs]}"
#key[Delete]="${terminfo[kdch1]}"
#key[Up]="${terminfo[kcuu1]}"
#key[Down]="${terminfo[kcud1]}"
#key[Left]="${terminfo[kcub1]}"
#key[Right]="${terminfo[kcuf1]}"
#key[PageUp]="${terminfo[kpp]}"
#key[PageDown]="${terminfo[knp]}"
#key[Shift-Tab]="${terminfo[kcbt]}"

key[Up]="^[[A"
key[Down]="^[[B"
key[Right]="^[[C"
key[Left]="^[[D"
key[Home]="^[[H"
key[End]="^[[F"
key[Insert]="^[[2~"
key[Delete]="^[[3~"
key[Backspace]="^[[4~"
key[PageUp]="^[[5~"
key[PageDown]="^[[6~"

key[Shift-Up]="^[[1;2A"
key[Shift-Down]="^[[1;2B"
key[Shift-Right]="^[[1;2C"
key[Shift-Left]="^[[1;2D"
key[Shift-Home]="^[[1;2H"
key[Shift-End]="^[[1;2F"
key[Shift-Tab]="^[[Z"

key[Ctrl-Left]="^[[1;5D"
key[Ctrl-Right]="^[[1;5C"

key[Ctrl-Z]="^Z"
key[Ctrl-Shift-Z]="^[[122;6u"

autoload -Uz up-line-or-beginning-search down-line-or-beginning-search
zle -N up-line-or-beginning-search
zle -N down-line-or-beginning-search

# setup key accordingly
bindkey -- "${key[Up]}"             up-line-or-beginning-search
bindkey -- "${key[Down]}"           down-line-or-beginning-search
bindkey -- "${key[Right]}"          forward-char
bindkey -- "${key[Left]}"           backward-char
bindkey -- "${key[Home]}"           beginning-of-line
bindkey -- "${key[End]}"            end-of-line
bindkey -- "${key[Insert]}"         overwrite-mode
bindkey -- "${key[Delete]}"         delete-char
bindkey -- "${key[Backspace]}"      backward-delete-char
bindkey -- "${key[PageUp]}"         beginning-of-buffer-or-history
bindkey -- "${key[PageDown]}"       end-of-buffer-or-history

bindkey -- "${key[Shift-Left]}"     beginning-of-line
bindkey -- "${key[Shift-Right]}"    end-of-line
bindkey -- "${key[Shift-Tab]}"      reverse-menu-complete

bindkey -- "${key[Ctrl-Left]}"      backward-word
bindkey -- "${key[Ctrl-Right]}"     forward-word

bindkey -- "${key[Ctrl-Z]}"         undo
bindkey -- "${key[Ctrl-Shift-Z]}"   redo

# Plugins
source ~/.config/zsh/zsh-syntax-highlighting/zsh-syntax-highlighting.zsh
source ~/.config/zsh/zsh-autosuggestions/zsh-autosuggestions.zsh
source ~/.config/zsh/powerlevel10k/powerlevel10k.zsh-theme

export TERM=xterm-256color

if ! [[ "$PATH" =~ "$HOME/.local/bin" ]]; then
  export PATH="$HOME/.local/bin:$PATH"
fi

if uwsm check may-start; then
  exec uwsm start default
fi

eval "$(zoxide init zsh --cmd cd)"

# To customize prompt, run `p10k configure` or edit ~/.p10k.zsh.
[[ ! -f ~/.p10k.zsh ]] || source ~/.p10k.zsh
