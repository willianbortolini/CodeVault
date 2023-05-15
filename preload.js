
const { contextBridge, ipcRenderer } = require('electron');
let idBox = 0;
// Exponha as funções que você deseja para o código do renderizador aqui.
contextBridge.exposeInMainWorld('myAPI', {
    sendToMain: (data) => {
        ipcRenderer.send('salvar_arquivo', data);
    },
    receiveFromMain: (channel, callback) => {
        ipcRenderer.on(channel, (event, ...args) => callback(...args));
    },

    create: (title, content) =>{
        idBox ++;
        createBox(title, content, idBox);
    }

});

ipcRenderer.on('main/salvar_arquivo', (event, arg) => {
    //console.log(arg.status); // imprime o status da mensagem
    //console.log(arg.msg); // imprime a mensagem recebida
});

ipcRenderer.on('auto_save_content', (event, datas) => {
    const data = JSON.parse(datas);

    for (let i = 0; i < data.length; i++) {
        const { title, content } = data[i];
        idBox = i;
        createBox(title, content, i);        
    }
    
});


function createBox(title, content, id) {
    var box = document.createElement("div");
    box.className = "box";
    var titleElement = document.createElement("h2");
    titleElement.id = id;
    titleElement.className = "box-title";
    titleElement.draggable = true;
    box.addEventListener("dragstart", handleDragStart);
    box.addEventListener("dragover", handleDragOver);
    box.addEventListener("drop", handleDrop);
    titleElement.innerText = title;
    titleElement.contentEditable = true;
    titleElement.addEventListener("click", function (event) {
        event.stopPropagation();
        var contentElement = this.nextElementSibling;
        contentElement.classList.toggle("hidden");
    });
    box.appendChild(titleElement);

    titleElement.addEventListener("input", function () {
        generateJSON();
    })
    titleElement.addEventListener("paste", function (event) {
        event.preventDefault();
        var clipboardData = event.clipboardData || window.clipboardData;
        var pastedText = clipboardData.getData("text/plain");
        document.execCommand("insertText", false, pastedText);
    });

    var contentElement = document.createElement("textarea");
    contentElement.className = "box-content";
    contentElement.innerText = content;
    contentElement.contentEditable = true;
    box.appendChild(contentElement);

    contentElement.addEventListener("input", function () {
        adjustTextareaHeight(contentElement);
        generateJSON();
    });

    function adjustTextareaHeight(textarea) {
        textarea.style.height = "auto";
        textarea.style.height = textarea.scrollHeight + "px";
    }

    contentElement.addEventListener("paste", function (event) {
        event.preventDefault();
        var clipboardData = event.clipboardData || window.clipboardData;
        var pastedText = clipboardData.getData("text/plain");
        document.execCommand("insertText", false, pastedText);
    });

    var copyButton = document.createElement("button");
    copyButton.innerHTML = '<i class="far fa-copy"></i>';
    copyButton.addEventListener("click", function () {
        copyToClipboard(contentElement);
    });

    var deleteButton = document.createElement("button");
    deleteButton.innerHTML = '<i class="far fa-trash-alt"></i>';
    deleteButton.addEventListener("click", function () {
        container.removeChild(box);
    });

    var actionButtons = document.createElement("div");
    actionButtons.className = "action-buttons";
    actionButtons.appendChild(copyButton);
    actionButtons.appendChild(deleteButton);
    box.appendChild(actionButtons);

    container.insertBefore(box, container.firstChild);
}

function copyToClipboard(text) {
    console.log(text.value);
    var textarea = document.createElement("textarea");
    textarea.value = text.value;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand("copy");
    document.body.removeChild(textarea);
}

function handleDragStart(event) {
    event.dataTransfer.setData("text/plain", event.target.id);
}

function handleDragOver(event) {
    event.preventDefault();
}

function handleDrop(event) {
    event.preventDefault();
    var sourceBoxId = event.dataTransfer.getData("text/plain");
    var sourceBox = document.getElementById(sourceBoxId).parentNode;
    var targetBox = event.target.closest(".box");
    console.log(sourceBoxId);
    if (sourceBox && targetBox) {
        var container = targetBox.parentNode;
        var sourceBoxIndex = Array.from(container.children).indexOf(
            sourceBox
        );
        var targetBoxIndex = Array.from(container.children).indexOf(
            targetBox
        );

        if (sourceBoxIndex < targetBoxIndex) {
            container.insertBefore(sourceBox, targetBox.nextSibling);
        } else {
            container.insertBefore(sourceBox, targetBox);
        }
    }
}

function generateJSON() {
    var boxes = document.getElementsByClassName("box");
    var jsonData = [];

    for (var i = 0; i < boxes.length; i++) {
        var box = boxes[i];
        var titleElement = box.querySelector(".box-title");
        var contentElement = box.querySelector(".box-content");

        var boxData = {
            title: titleElement.innerText,
            content: contentElement.value
        };

        jsonData.push(boxData);
    }
    //console.log(JSON.stringify(jsonData));
    ipcRenderer.send('salvar_arquivo', jsonData);
}




