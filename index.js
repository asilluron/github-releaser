'use strict';

require('shelljs/global');
var assert = require('assert');
var EventEmitter = require('events');

class Release extends EventEmitter {

  constructor(options) {
    super();
    assert(which('git'), 'This script requires git');
    assert(options.name, "Please set the app's name via options.name");
    assert(options.github_path, "Please set the app's Github Path with options.github_path");
    assert(options.github_ident_email, 'You need to set an email for Github ident');
    assert(options.github_ident_name, 'You need to set a name for the Github ident');

    var defaultOptions = {
      commit_header: 'Release',
      release_header: 'Release Notes',
      commit_regex: '^\*.*',
      build_command: null
    };

    this.options = Object.assign(defaultOptions, options);

    exec('git fetch --all');
    exec(`git config --global user.email "${options.github_ident_name}"`);
    exec(`git config --global user.name "${options.github_ident_name}"`);

    let lastAvailableTag = this.getLastAvailableTag();
    let releaseNotes = this.gatherReleaseNotes(lastAvailableTag);

    if (releaseNotes.length > 0) {
      //Trigger a build
      if (options.build_command) {
        let buildResult = exec(options.build_command);
        assert.strictEqual(buildResult.code, 0, 'Build command failed during release');
        echo('Build Complete: ${buildResult.output}');
        let buildCommitResult = exec('git commit -am "Deploy/Build"');
        assert.strictEqual(buildCommitResult.code, 0, 'Commiting build back to repo failed');
        let buildPushResult = exec('git push');
        assert.strictEqual(buildPushResult.code, 0, 'Pushing build to remote has failed');

      }
      let checkoutMasterResult = exec('git checkout master');
      assert.strictEqual(checkoutMasterResult.code, 0, 'Failed to check out master branch. Please ensure the script has access and master branch exists');
      let developMergeResult = exec('git merge --no-ff --no-edit develop');
      assert.strictEqual(developMergeResult.code, 0, 'Failed to merge develop with master before publishing release');
      let releaseTag = this.getNewVersion();

      //Go free into the world release!
      this.publishRelease(releaseTag, releaseNotes);
    } else {
      echo(`Release cancelled. No Release notes found. ${releaseNotes}`);
    }
  }

  publishRelease(releaseTag, releaseNotes) {
    let ghPublishResult = exec(`curl -H "Content-Type: application/json" -X POST -d '{\"tag_name\":\"${releaseTag}\",\"name\":\"${this.options.name} Version ${releaseTag}\", \"body\":\"# ${this.options.release_header}${releaseNotes}\"}' https://api.github.com/repos/${this.options.github_path}/releases?access_token=${env.GH_API_TOKEN}`);
    assert.strictEqual(ghPublishResult.code, 0, `Failed to publish release to githun: ${ghPublishResult.output}`);
    this.emit('done', `Release Completed: ${ghPublishResult.output}`);
  }

  getLastAvailableTag() {
    let describeRes = exec('git describe --tags --abbrev=0');
    if (describeRes.code === 0) {
      return describeRes.output.trim();
    } else {
      throw new Error('Could not describe current git repo');
    }
  }

  gatherReleaseNotes(lastTag) {
    let releaseNotesRes = exec(`git log --pretty=format:%B  --grep=${this.options.commit_header} ${lastTag}..HEAD | grep -oh '${this.options.commit_regex}'`);
    assert.strictEqual(releaseNotesRes.code, 0, `There was an error while retrieving git logs. ${releaseNotesRes.output}`);
    return releaseNotesRes.output.replace(/(?:\r\n|\r|\n)/g, '\\n');
  }

  getNewVersion() {
    let npmVersionResult = exec('npm version patch');
    assert.strictEqual(npmVersionResult.code, 0, 'Failed to bump patch version of repo');
    let versionPushResult = exec('git push');
    assert.strictEqual(versionPushResult.code, 0, 'Failed to push new tag');

    return npmVersionResult.output.trim();
  }

}

module.exports = Release;
