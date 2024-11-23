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
                        height: textarea.style.height
                    };
                })
            };
        });
        localStorage.setItem("containers", JSON.stringify(containers));
    }

    function createPage(fromLoad = false, id = `container-${pageId}`) {
        const containerWrapper = document.getElementById("main");
        const sidebarMenu = document.getElementById("menu");

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
        menuLink.href = `#${id}`;
        menuLink.style.color = 'white';
        menuLink.style.textDecoration = 'none';
        menuLink.style.fontSize = '20px'
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
        menuItem.appendChild(menuLink);
        sidebarMenu.appendChild(menuItem);

        // Создаем текстовое поле с определенным стилем, к которому нельзя применить delete и contextMenu
        createTextarea('', '35px', '600', 'auto', id, menuLink, true);

        if (!fromLoad) {
            pageId++;
            localStorage.setItem('pageId', pageId);
            saveContainers();
        }
    }

    document.getElementById("pagecrt").addEventListener("click", () => {
        createPage();
        saveContainers();
    });

    function createTextarea(value = '', fontSize = '', fontWeight = '', height = 'auto', containerId, menuLink = null, nonDeletable = false) {
        const textarea = document.createElement("textarea");
        textarea.value = value;
        textarea.rows = value.split('\n').length || 1;
        textarea.addEventListener("input", autoResize);
        textarea.addEventListener("input", saveContainers);
        textarea.addEventListener("input", function() {
            if (menuLink) {
                menuLink.textContent = this.value || menuLink.dataset.defaultName;
            }
        });
        textarea.id = `textarea-${nextId}`;
        textarea.placeholder = "Текст";
        textarea.style.fontSize = fontSize;
        textarea.style.fontWeight = fontWeight;
        textarea.style.height = height;
        
        if (!nonDeletable) {
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
            data.textareas.forEach(textareaData => {
                const menuLink = document.querySelector(`a[href="#${data.id}"]`);
                createTextarea(textareaData.value, textareaData.fontSize, textareaData.fontWeight, textareaData.height, data.id, menuLink, data.textareaData === '' ? true : false);
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
});
