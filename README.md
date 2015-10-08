# github-releaser
Continuous Deployment for Node. Works with CircleCI, Travis CI ... etc

## Requirements
* Node v4.1.0+ or iojs 1.x+

## Usage
### Options (pass to Release class as a single object)
  * name - The name of the app, e.g. 'Github Releaser',
  * github_path - The short github path to the project - 'asilluron/github-releaser',
  * github_ident_email - The ident info (email) for Git - 'circle-bot@users.noreply.github.com',
  * github_ident_name - The ident info (name) for Git 'Circle CI Bot',
  * commit_header - Keyword used to scour commits for notes to include in release notes. To capture all commit comments use '*'. Defaults to 'Release'
  * release_header - The label for the published release. Defaults to 'Release Notes',
  * commit_regex - Use a custom regex to capture only certain commit comments. Defaults to '^\*.*'
```
var options = { ...see above};
var release = new Release(options);
release.on('done', () => { console.log('Release Complete')});
```

## Example
Available in `examples/release.js`

## Sample setup for CircleCI
This repo is setup to deploy on develop and released using the script with circle ci.
* `circle.yml`
