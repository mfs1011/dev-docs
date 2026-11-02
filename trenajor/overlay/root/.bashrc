[ -f /usr/share/bash-completion/bash_completion ] && . /usr/share/bash-completion/bash_completion
export EDITOR=nano GIT_PAGER=cat PAGER=cat HISTCONTROL=ignorespace
PROMPT_COMMAND=trenajor-holat
# Prompt oxirida ko'rinmas OSC 7770 belgisi — sahifa buyruq tugaganini shundan biladi
PS1='\[\e[32m\]\w\[\e[0m\] $ \[\e]7770;tayyor\a\]'
