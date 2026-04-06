if status is-login
  fish_add_path -g ~/.local/bin
  fish_add_path -g ~/.cargo/bin

  if uwsm check may-start
    exec uwsm start default
  end
end

if status is-interactive
  set -g fish_greeting

  zoxide init fish --cmd cd | source
  oh-my-posh init fish --config ~/.config/oh-my-posh/config.yaml | source
end
