#!/bin/bash

remote_name="${REMOTE_NAME:-origin}"

echo "Deploying from the $CI_COMMIT_BRANCH branch."
release_path="$GIT_RUNNER_TARGET_DIR"

if [ ! -d "$release_path" ]; then
    echo "Target path does not exist: $release_path" >& 2
    exit 1
fi

pushd "$release_path" || exit 1

if [ "$GIT_STRATEGY" == "clone" ]; then
    bare="$release_path/.dep/repo"
    echo "CLONE BARE: $bare"
    rm -rf "${bare:?}"
    mkdir -p "$bare"

    git clone -v --progress --mirror "$CI_REPOSITORY_URL" "$bare"
else
    bare="$CI_REPOSITORY_URL"
    echo "FETCH BARE: $bare"
fi

if [ ! -d "$release_path/.git" ]; then
    echo "Git init."
    git init .

    echo "Adding remote origin URL: $bare"
    git remote add $remote_name "$bare"
else
    echo "Setting remote $remote_name URL: $bare"
    git remote rm $remote_name
    git remote add $remote_name "$bare"
fi

git fetch "$remote_name"
git checkout --force "$remote_name/$CI_COMMIT_BRANCH" --

current_revision=$(git reflog show -1 --format="%H" "HEAD@{0}")
echo "Current revision: $current_revision"

popd
