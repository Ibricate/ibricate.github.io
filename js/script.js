setTimeout(function(){
	document.getElementById('hint').style.display = 'none';
}, 5000);

function Hide(){
    document.getElementById('hint').classList.add('slow');
}
setTimeout(Hide, 3000);


document.addEventListener("DOMContentLoaded", function() {
    let nextId = 0;
    let pageId = localStorage.getItem('pageId') ? parseInt(localStorage.getItem('pageId')) : 0;

    function saveContainers() {
        const containerWrapper = document.getElementById("main");
        const containers = Array.from(containerWrapper.querySelectorAll(".container")).map(container => {
            return {
                id: container.id,
                textareas: Array.from(container.getElementsByTagName("textarea")).map(textarea => {
                    return {
                        value: textarea.value,
                        fontSize: textarea.style.fontSize,
                        fontWeight: textarea.style.fontWeight,
                        height: textarea.style.height,
                        mainTextarea: textarea.dataset.mainTextarea || false
                    };
                })
            };
        });
        localStorage.setItem("containers", JSON.stringify(containers));
    }

    function deleteContainer(containerId) {
        const container = document.getElementById(containerId);
        if (container) {
            container.remove();
        }

        const menuItem = document.querySelector(`a[href="#${containerId}"]`).parentElement;
        if (menuItem) {
            menuItem.remove();
        }

        saveContainers();
    }

    function createPage(fromLoad = false, id = `container-${pageId}`) {
        const containerWrapper = document.getElementById("main");
        const sidebarMenu = document.getElementById("menu_point");

        const previousContainer = containerWrapper.querySelector(".container[style*='block']");
        if (previousContainer) {
            previousContainer.style.display = 'none';
        }

        const newContainer = document.createElement("div");
        newContainer.className = "container";
        newContainer.id = id;
        newContainer.style.display = 'block';

        containerWrapper.appendChild(newContainer);

        const menuItem = document.createElement("li");
        const menuLink = document.createElement("a");
        menuLink.style.color = "white";
        menuLink.style.textDecoration = "none";
        menuLink.href = `#${id}`;
        menuLink.textContent = `Контейнер ${parseInt(id.split('-')[1]) + 1}`;
        menuLink.dataset.containerId = id;
        menuLink.dataset.defaultName = menuLink.textContent;
        menuLink.addEventListener("click", function(event) {
            event.preventDefault();
            document.querySelectorAll(".container").forEach(container => container.style.display = 'none');
            const containerToShow = document.getElementById(this.dataset.containerId);
            if (containerToShow) {
                containerToShow.style.display = 'block';
            } else {
                console.error("Контейнер не найден: ", this.dataset.containerId);
            }
        });

        const deleteButton = document.createElement("span");
        deleteButton.textContent = "X";
        deleteButton.className = "delete-button";
        deleteButton.addEventListener("click", function(event) {
            event.stopPropagation();
            const containerId = this.previousElementSibling.dataset.containerId;
            deleteContainer(containerId);
        });

        menuItem.appendChild(menuLink);
        menuItem.appendChild(deleteButton);
        sidebarMenu.appendChild(menuItem);

        if (!fromLoad) {
            createTextarea('', '35px', '600', 'auto', id, menuLink, true);
            pageId++;
            localStorage.setItem('pageId', pageId);
            saveContainers();
        }
    }

    document.getElementById("pagecrt").addEventListener("click", () => {
        createPage();
        saveContainers();
    });

    function createTextarea(value = '', fontSize = '', fontWeight = '', height = 'auto', containerId, menuLink = null, mainTextarea = false) {
        const textarea = document.createElement("textarea");
        textarea.value = value;
        textarea.rows = value.split('\n').length || 1;
        textarea.addEventListener("input", autoResize);
        textarea.addEventListener("input", saveContainers);

        if (mainTextarea) {
            textarea.dataset.mainTextarea = true;
            textarea.addEventListener("input", function() {
                if (menuLink) {
                    menuLink.textContent = this.value || menuLink.dataset.defaultName;
                }
            });
        }

        textarea.id = `textarea-${nextId}`;
        textarea.placeholder = "Текст";
        textarea.style.fontSize = fontSize;
        textarea.style.fontWeight = fontWeight;
        textarea.style.height = height;

        if (!mainTextarea) {
            textarea.addEventListener("keydown", deleteTextareaOnDeleteKey);
            textarea.addEventListener("contextmenu", function(event) {
                event.preventDefault();
                selectedTextarea = this;
                showContextMenu(event);
            });
        }

        const container = document.getElementById(containerId) || document.querySelector(".container[style*='block']");
        if (container) {
            container.appendChild(textarea);
        } else {
            console.error("Нет активного контейнера для добавления текстового поля.");
        }

        autoResize.call(textarea);
        textarea.focus();
        nextId++;
    }

    document.addEventListener('keydown', event => {
        if (event.key === 'Enter') {
            const currentContainer = document.querySelector(".container[style*='block']");
            if (currentContainer) {
                const menuLink = document.querySelector(`a[href="#${currentContainer.id}"]`);
                createTextarea('', '', '', 'auto', currentContainer.id, menuLink);
                saveContainers();
            }
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
            saveContainers();
        }
    }

    function autoResize() {
        this.style.height = 'auto';
        this.style.height = this.scrollHeight + 'px';
    }

    function loadContainers() {
        const containers = JSON.parse(localStorage.getItem("containers")) || [];
        containers.forEach(data => {
            createPage(true, data.id);
            const menuLink = document.querySelector(`a[href="#${data.id}"]`);
            data.textareas.forEach(textareaData => {
                createTextarea(textareaData.value, textareaData.fontSize, textareaData.fontWeight, textareaData.height, data.id, textareaData.mainTextarea ? menuLink : null, textareaData.mainTextarea);
            });
        });
    }

    function showContextMenu(event) {
        contextMenu.style.top = `${event.clientY}px`;
        contextMenu.style.left = `${event.clientX}px`;
        contextMenu.style.display = 'block';
    }

    loadContainers();

    window.changeFont = function() {
        if (selectedTextarea) {
            selectedTextarea.style.fontSize = '25px';
            selectedTextarea.style.fontWeight = '600';
            selectedTextarea.style.height = selectedTextarea.scrollHeight + 'px';
            saveContainers();
        }
    };

    // Открытие и закрытие меню для мобильных устройств
    document.getElementById("openMenuBtn").addEventListener("click", function() {
        document.getElementById("menu").classList.add("open");
    });

    document.getElementById("menu").addEventListener("click", function() {
        document.getElementById("menu").classList.remove("open");
    });
});
