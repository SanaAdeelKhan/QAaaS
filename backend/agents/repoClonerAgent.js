const { exec } = require("child_process");

async function cloneRepo(repoUrl, destPath) {
  return new Promise((resolve, reject) => {
    exec(`git clone ${repoUrl} ${destPath}`, (err, stdout, stderr) => {
      if (err) return reject(stderr);
      resolve(stdout);
    });
  });
}

// Example Coral agent function
module.exports = async function repoClonerAgent(task) {
  const { repoUrl } = task;
  try {
    await cloneRepo(repoUrl, "./cloned-repo");
    return { success: true, message: `Repo cloned: ${repoUrl}` };
  } catch (error) {
    return { success: false, error };
  }
};
