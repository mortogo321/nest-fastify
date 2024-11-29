#!/bin/bash

runner="${GIT_RUNNER_TARGET_USER:?}";

if  [ "$USER" != "$runner" ] && [ "$USER" == "root" ]; then
    echo "Impersonating: $USER TO $runner"
    runuser -u $runner -- "$0" "$@"
    return $?
elif [ "$USER" != "$runner" ]; then
    echo "Run user not correct: $USER , Expected user: $runner"
    return 1
fi

echo "Current USER: `whoami`"

$@
