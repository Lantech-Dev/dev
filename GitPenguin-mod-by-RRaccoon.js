(function (Scratch) {
  let status = "", encodeMode = true;

  class GitPenguin {
    getInfo() {
      return {
        id: "gitpenguin",
        name: "GitHub File Extension",
        color1: "#303030",
        color2: "#212121",
        color3: "#212121",
        blocks: [
          { blockType: Scratch.BlockType.LABEL, text: "Get" },
          {
            opcode: "getFileContents",
            blockType: Scratch.BlockType.REPORTER,
            text: "get contents of file [FILE] from repository [REPO] of user [NAME] using token [TOKEN]",
            arguments: {
              FILE: { type: Scratch.ArgumentType.STRING, defaultValue: "README.md" },
              REPO: { type: Scratch.ArgumentType.STRING, defaultValue: "repository" },
              NAME: { type: Scratch.ArgumentType.STRING, defaultValue: "username" },
              TOKEN: { type: Scratch.ArgumentType.STRING, defaultValue: "YOUR_GITHUB_TOKEN" }
            }
          },
          { blockType: Scratch.BlockType.LABEL, text: "File control" },
          {
            opcode: "createFile",
            blockType: Scratch.BlockType.COMMAND,
            text: "create file [FILE] with content [CONTENT] in repository [REPO] of user [NAME] using token [TOKEN]",
            arguments: {
              FILE: { type: Scratch.ArgumentType.STRING, defaultValue: "newFile.txt" },
              CONTENT: { type: Scratch.ArgumentType.STRING, defaultValue: "Hello, world!" },
              REPO: { type: Scratch.ArgumentType.STRING, defaultValue: "repository" },
              NAME: { type: Scratch.ArgumentType.STRING, defaultValue: "username" },
              TOKEN: { type: Scratch.ArgumentType.STRING, defaultValue: "YOUR_GITHUB_TOKEN" }
            }
          },
          {
            opcode: "editFileContent",
            blockType: Scratch.BlockType.COMMAND,
            text: "edit content of file [FILE] in repository [REPO] of user [NAME] to [CONTENT] using token [TOKEN]",
            arguments: {
              FILE: { type: Scratch.ArgumentType.STRING, defaultValue: "newFile.txt" },
              CONTENT: { type: Scratch.ArgumentType.STRING, defaultValue: "Hello, world!" },
              REPO: { type: Scratch.ArgumentType.STRING, defaultValue: "repository" },
              NAME: { type: Scratch.ArgumentType.STRING, defaultValue: "username" },
              TOKEN: { type: Scratch.ArgumentType.STRING, defaultValue: "YOUR_GITHUB_TOKEN" }
            }
          },
          {
            opcode: "getStatus",
            blockType: Scratch.BlockType.REPORTER,
            text: "recent file status"
          },
          { blockType: Scratch.BlockType.LABEL, text: "DANGEROUS" },
          {
            opcode: "deleteFile",
            blockType: Scratch.BlockType.COMMAND,
            text: "delete file [FILE] from repository [REPO] of user [NAME] using token [TOKEN]",
            arguments: {
              FILE: { type: Scratch.ArgumentType.STRING, defaultValue: "newFile.txt" },
              REPO: { type: Scratch.ArgumentType.STRING, defaultValue: "repository" },
              NAME: { type: Scratch.ArgumentType.STRING, defaultValue: "username" },
              TOKEN: { type: Scratch.ArgumentType.STRING, defaultValue: "YOUR_GITHUB_TOKEN" }
            }
          },
          {
            opcode: "toggleEncode",
            blockType: Scratch.BlockType.COMMAND,
            text: "toggle file encoding [TYPE]",
            arguments: {
              TYPE: { type: Scratch.ArgumentType.STRING, menu: "TOGGLE" }
            }
          },
        ],
        menus: {
          TOGGLE: ["on", "off"]
        }
      };
    }

    async getFileContents({ FILE, REPO, NAME, TOKEN }) {
      const apiUrl = `https://api.github.com/repos/${NAME}/${REPO}/contents/${FILE}`;
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `token ${TOKEN}`
        }
      });

      status = response.status;
      if (!response.ok) {
        console.error(`Error: ${status}`);
        return;
      }

      const data = await response.json();
      const content = atob(data.content); // Декодируем содержимое, если оно в base64
      return content;
    }

    async createFile({ FILE, CONTENT, REPO, NAME, TOKEN }) {
      const apiUrl = `https://api.github.com/repos/${NAME}/${REPO}/contents/${FILE}`;
      const requestBody = JSON.stringify({
        message: `Create ${FILE}`,
        content: encodeMode ? btoa(CONTENT) : CONTENT
      });
      const response = await fetch(apiUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `token ${TOKEN}`
        },
        body: requestBody
      });
      status = response.status;
      if (!response.ok) return;
    }

    async editFileContent({ FILE, CONTENT, REPO, NAME, TOKEN }) {
      const apiUrl = `https://api.github.com/repos/${NAME}/${REPO}/contents/${FILE}`;
      const getResponse = await fetch(apiUrl, {
        headers: {
          'Authorization': `token ${TOKEN}`
        }
      });
      status = getResponse.status;
      if (!getResponse.ok) return;
      const fileData = await getResponse.json();
      const putResponse = await fetch(apiUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `token ${TOKEN}`
        },
        body: JSON.stringify({
          message: `Edit ${FILE}`,
          content: encodeMode ? btoa(CONTENT) : CONTENT,
          sha: fileData.sha
        })
      });
      status = putResponse.status;
      if (!putResponse.ok) return;
    }

    async deleteFile({ FILE, REPO, NAME, TOKEN }) {
      const apiUrl = `https://api.github.com/repos/${NAME}/${REPO}/contents/${FILE}`;
      const getResponse = await fetch(apiUrl, {
        headers: {
          'Authorization': `token ${TOKEN}`
        }
      });
      status = getResponse.status;
      if (!getResponse.ok) return;
      const fileData = await getResponse.json();
      const deleteResponse = await fetch(apiUrl, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `token ${TOKEN}`
        },
        body: JSON.stringify({
          message: `Delete ${FILE}`,
          sha: fileData.sha
        })
      });
      status = deleteResponse.status;
      if (!deleteResponse.ok) return;
    }

    getStatus() {
      return status;
    }

    toggleEncode({ TYPE }) {
      encodeMode = TYPE === "on";
    }
  }

  Scratch.extensions.register(new GitPenguin());
})(Scratch);