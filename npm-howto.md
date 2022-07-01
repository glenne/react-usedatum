# Notes for publishing to npm

## Making a beta release

1. Modify version in package.json to the following format (match with existing verion numbers etc) "version": "0.1.120-beta.1" where beta.x is the number of those betas.
2. Build and publish to ```npm run build && npm publish --tag beta```.

## Standard Release

See [Scott Vandehey's page](https://cloudfour.com/thinks/how-to-publish-an-updated-version-of-an-npm-package/)
