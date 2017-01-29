const bannedWords = {
  "countries": [
    "Iraq",
    "Syria",
    "Iran",
    "Libya",
    "Somalia",
    "Sudan",
    "Yemen"
  ],
  "demonyms": [
    "Iraqi",
    "Iraqis",
    "Syrian",
    "Syrians",
    "Iranian",
    "Iranians",
    "Libyan",
    "Libyans",
    "Somali",
    "Somalis",
    "Somalian",
    "Somalians",
    "Sudanese",
    "Yemeni",
    "Yemenis"
  ]
}

String.prototype.replaceAll = function(search, replacement) {

    function genereateRegExpStr(search) {
      return `\\b${search}\\b`;
    }

    var target = this;
    return target.replace(
      new RegExp(genereateRegExpStr(search), 'gi'), replacement
    );
};

function textNodesUnder(el){
  let n,
      allNodes = [],
      acceptNodeObj = {
        acceptNode: function(node) {
          // Ignore text nodes that just contain white space
          if ( ! /^\s*$/.test(node.data) ) {
            return NodeFilter.FILTER_ACCEPT;
          }
        }
      },
      walk = document.createTreeWalker(
        el, NodeFilter.SHOW_TEXT, acceptNodeObj, false
      );
  while (n = walk.nextNode()) allNodes.push(n);
  return allNodes;
}

function redactedWord(word) {
  let mouseOut = `this.innerHTML='${word}';this.style.backgroundColor='white';
                   this.style.color='black'; this.style.textDecoration='line-through';`,
      mouseOver = `this.innerHTML='#BannedByTrump';this.style.backgroundColor=
                  'black';this.style.color='white';this.style.textDecoration='initial';`;
  return `<span onMouseOver="${mouseOver}" onMouseOut="${mouseOut}" style=
          "background-color:white;color:black;text-decoration:line-through;">${word}</span>`;
}

function replaceAllBannedWords(text) {
  let newText = text;
  for (let word of allBannedWords) {
    newText = newText.replaceAll(word, redactedWord(word));
  }
  return newText;
}

function handleTextNode(node) {
  let newText = replaceAllBannedWords(node.textContent);
  if (newText !== node.textContent) {
    let sp = document.createElement("span");
    sp.innerHTML = newText;
    if (node.parentNode !== null) {
      node.parentNode.insertBefore(sp, node);
      node.parentNode.removeChild(node);
    }
  }
}

function checkAndReplaceAllTextNodes() {
  let textNodes = textNodesUnder(document.querySelector('body'));
  textNodes.map(handleTextNode);
}

function initializeMutationObserver() {
  let target = document.querySelector('body');
  let observer = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
        Array.prototype.slice.call(mutation.addedNodes).forEach(function(node) {
          if (node.nodeType === 3) {
            handleTextNode(node);
          }
        });
      });
    });

  let config = {childList: true, subtree: true};

  observer.observe(target, config);
}

let allBannedWords = [].concat(bannedWords["countries"])
                       .concat(bannedWords["demonyms"]);

checkAndReplaceAllTextNodes();
initializeMutationObserver();
