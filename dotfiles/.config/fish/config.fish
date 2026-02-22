if status is-login
  contains ~/.local/bin $PATH
  or set -px PATH ~/.local/bin

  if uwsm check may-start
    exec uwsm start default
  end
end

if status is-interactive
  set -g fish_greeting

  zoxide init fish --cmd cd | source
  starship init fish | source
end
