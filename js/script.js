const container = document.getElementById("container");
const one_pont = document.querySelector('.one_pont');
const randomNumber = Math.floor(Math.random() * 1000000);


one_pont.addEventListener('mouseover', () => {
    one_pont.style.backgroundColor = 'rgba(0, 0, 0, 0.150)';
    one_pont.style.borderRadius = '5px'
    one_pont
});

one_pont.addEventListener('mouseout', () => {
    one_pont.style.backgroundColor = 'rgba(0, 0, 0, 0)';
});

setTimeout(function(){
	document.getElementById('hint').style.display = 'none';
}, 5000);

function Hide(){
    document.getElementById('hint').classList.add('slow');
}
setTimeout(Hide, 3000);



document.addEventListener("DOMContentLoaded", function() {
    const container = document.getElementById("container");
    let nextId = 1;

    function createTextarea(value = '', fontSize = '', fontWeight = '', height = 'auto') {
        const textarea = document.createElement("textarea");
        textarea.value = value;
        textarea.rows = value.split('\n').length || 1;
        textarea.addEventListener("input", autoResize);
        textarea.addEventListener("input", saveTextareas);
        textarea.id = `textarea-${nextId}`;
        textarea.placeholder = "Текст";
        textarea.style.fontSize = fontSize;
        textarea.style.fontWeight = fontWeight;
        textarea.addEventListener("keydown", deleteTextareaOnDeleteKey);
        textarea.addEventListener("contextmenu", function(event) {
            event.preventDefault();
            selectedTextarea = this;
            showContextMenu(event);
        });
        container.appendChild(textarea);
        autoResize.call(textarea);
        textarea.focus();
        nextId++;
    }

    document.addEventListener('keydown', event => {
        if (event.key === 'Enter') {
            createTextarea();
            event.preventDefault();
        }
    });


    document.addEventListener('click', function(event) {
        if (contextMenu.style.display === 'block') {
            contextMenu.style.display = 'none';
        }
    });

    function deleteTextareaOnDeleteKey(event) {
        if (event.key === "Delete") {
            this.removeEventListener("keydown", deleteTextareaOnDeleteKey);
            this.parentNode.removeChild(this);
            saveTextareas();
        }
    }

    function autoResize() {
        this.style.height = 'auto';
        this.style.height = this.scrollHeight + 'px';
    }

    function saveTextareas() {
        const textareas = Array.from(container.getElementsByTagName("textarea")).map(textarea => {
            return {
                value: textarea.value,
                fontSize: textarea.style.fontSize,
                fontWeight: textarea.style.fontWeight, 
                height: textarea.style.height
            };
        });
        localStorage.setItem("textareas", JSON.stringify(textareas));
    }

    function loadTextareas() {
        const textareas = JSON.parse(localStorage.getItem("textareas")) || [];
        textareas.forEach(data => createTextarea(data.value, data.fontSize, data.fontWeight, data.height));
    }

    function showContextMenu(event) {
        contextMenu.style.top = `${event.clientY}px`;
        contextMenu.style.left = `${event.clientX}px`;
        contextMenu.style.display = 'block';
    }


    loadTextareas();

    window.changeFont = function() {
        if (selectedTextarea) {
            selectedTextarea.style.fontSize = '25px';
            selectedTextarea.style.fontWeight = '600';
            selectedTextarea.style.height = selectedTextarea.scrollHeight + 'px';
            saveTextareas();
        }
    };
});
