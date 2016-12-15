#!/bin/bash
set -e # Exit with nonzero exit code if anything fails

node ./tools/setupDeploy.js 

if [[ $TRAVIS_TAG =~ [0-9]+\.[0-9]+\.[0-9]+(-([a-z]+)\.[0-9]+)? ]];
then
    tabLabel=${BASH_REMATCH[2]};
fi

case $tagLabel in
"beta") TAG_TYPE="beta" ;;
"rc") TAG_TYPE="release candidate" ;;
*) TAG_TYPE="latest" ;;
esac

npm publish ./dist/src --tag $TAG_TYPE

TARGET_BRANCH="gh-pages"

# Save some useful information
REPO=`git config remote.origin.url`
SSH_REPO=${REPO/https:\/\/github.com\//git@github.com:}
SHA=`git rev-parse --verify HEAD`

# Clone the existing gh-pages for this repo into out/
# Create a new empty branch if gh-pages doesn't exist yet (should only happen on first deply)
cd ..
git clone $REPO docs
cd docs
git checkout $TARGET_BRANCH || git checkout --orphan $TARGET_BRANCH
cd ..

# Copy contents from ./SirDarquan/h5webstorage/dist/docs
cd h5webstorage
npm run documentation

# If there are no changes to the documentation then just bail.
if [ -n "$(git status --porcelain)" ]; then
    echo "No changes to the output on this push; exiting."
    exit 0
fi

# Get the deploy key by using stored variables to decrypt deploy.enc
openssl aes-256-cbc -pass "pass:$DEPLOY_KEY" -in ./tools/deploy.enc -out ./tools/deploy_key -d -a
chmod 600 ./tools/deploy_key
eval `ssh-agent -s`
ssh-add ./tools/deploy_key

# Now let's go have some fun with the cloned repo
cd ..
cd docs

git config user.name "Travis CI"
git config user.email "$COMMIT_AUTHOR_EMAIL"


# Commit the "changes", i.e. the new version.
# The delta will show diffs between new and old versions.
git add .
git commit -m "Deploy to GitHub Pages: ${SHA}"

# Now that we're all set up, we can push.
git push $SSH_REPO $TARGET_BRANCH


# Attrition:
# https://gist.github.com/domenic/ec8b0fc8ab45f39403dd for the over all structure
# https://gist.github.com/kzap/5819745 for the encryption method that didn't require the travis cli