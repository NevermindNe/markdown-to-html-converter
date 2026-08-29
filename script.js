const markdownInput = document.getElementById('markdown-input');
const htmlOutput = document.getElementById('html-output');
const htmlPreview = document.getElementById('html-preview');
const copyButton = document.getElementById('copy-button');
const copyMsg = document.getElementById('copy-message');

const blockRules = [
    {
        regex: /^(#{1,6}) (.+)/,
            parser (match) {
                const level = match[1].length;
                return `<h${level}>${parseInline(match[2])}</h${level}>`;
            }
        },
        {
            regex: /^!\[(.*?)\]\((.*?)\)$/,
            parser (match) {
                return `<img src="${match[2]}" alt="${match[1]}">`;
            }
        },
        {
            regex: /^> (.+)$/,
            parser (match) {
                return `<blockquote>${parseInline(match[1])}</blockquote>`;
            }
        }
];

const inlineRules = [
        {
            regex: /(\*\*|__)(.+?)(\*\*|__)/g,
            parser (match) {
                return `<strong>${match[2]}</strong>`;
            }
        },
        {
            regex: /(\*|_)(.+?)(\*|_)/g,
            parser (match) {
                return `<em>${match[2]}</em>`;
            }
        },
        {
            regex: /\[(.*?)\]\((.*?)\)/g,
            parser (match) {
                return `<a href="${match[2]}">${parseInline(match[1])}</a>`;
            }
        }
];

function parseInline (text) {
        let inlineResult = text;
        inlineRules.forEach(rule => {
            inlineResult = inlineResult.replace(rule.regex, (...args) => rule.parser(args));

        });
        return inlineResult;
}


function convertMarkdown () {
    let result = "";
    let inList = false;
    let listBuffer = "";

    const lines = markdownInput.value.split('\n');

    lines.forEach(line => {
        let found = false;

        if (line.trim() === "") {
            return;
        }

        const matchList = line.match(/^- (.+)$/);
        if (matchList) {
            if (!inList) {
                inList = true;
                listBuffer = "<ul>\n";
            }
            listBuffer += `   <li>${parseInline(matchList[1])}</li>\n`;
            return; 
        } else if (inList) {
            inList = false;
            listBuffer += "</ul>";
            result += listBuffer;
            listBuffer = "";
        }      

        for (const rule of blockRules) {
            const match = line.match(rule.regex);
            if (match) {
                result += rule.parser(match) + "\n";
                found = true;
                break;
            }
        } 
        if (!found) {
            result += `<p>${parseInline(line)}</p>\n`;
        }
    })
    if (inList) {
            inList = false;
            listBuffer += "</ul>";
            result += listBuffer;
            listBuffer = "";
    }

    htmlOutput.textContent = result;
    htmlPreview.innerHTML = result;
    return result;
}

markdownInput.addEventListener('input', convertMarkdown);

copyButton.addEventListener("click", async () => {
  const html  = htmlOutput.textContent;

  try {
    await navigator.clipboard.writeText(html);

    copyMsg.style.display = "block";

    setTimeout(() => {
      copyMsg.style.display = "none";
    }, 2000)
  } catch (error) {
    console.log(error);
  }
});