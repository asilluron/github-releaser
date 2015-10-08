var Release = require('../index');

var releaseOptions = {
  name: 'Github Releaser',
  github_path: 'asilluron/github-releaser',
  github_ident_email: 'circle-bot@users.noreply.github.com',
  github_ident_name: 'Circle CI Bot',
  commit_header: 'Release',
  release_header: 'Release Notes',
  commit_regex: '^\*.*'
};

try {
  var release = new Release(releaseOptions);

  release.on('done', () => {
    console.log('Release Complete');
  });
} catch ( releaseError ) {
  console.err(releaseError);
}

