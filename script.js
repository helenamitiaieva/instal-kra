document.addEventListener('DOMContentLoaded', () => {
    // Контейнеры и кнопки для каждого блока
    const horizontScroll1 = document.querySelector('.heating-container-cards');
    const leftBtn1 = document.querySelector('#heating-button-left');
    const rightBtn1 = document.querySelector('#heating-button-right');

    const horizontScroll2 = document.querySelector('.plumbing-container-cards');
    const leftBtn2 = document.querySelector('#plumbing-button-left');
    const rightBtn2 = document.querySelector('#plumbing-button-right');

    const horizontScroll3 = document.querySelector('.bathroom-container-cards');
    const leftBtn3 = document.querySelector('#bathroom-button-left');
    const rightBtn3 = document.querySelector('#bathroom-button-right');

    const horizontScroll4 = document.querySelector('.equipment-container-cards');
    const leftBtn4 = document.querySelector('#equipment-button-left');
    const rightBtn4 = document.querySelector('#equipment-button-right');

    // Оригинальные элементы для каждого контейнера
    const originalItems1 = [...horizontScroll1.children];
    const originalItems2 = [...horizontScroll2.children];
    const originalItems3 = [...horizontScroll3.children];
    const originalItems4 = [...horizontScroll4.children];

    let gap1 = 0, gap2 = 0, gap3 = 0, gap4 = 0;

    const getScrollStep = () => {
        const screenWidth = window.innerWidth;
        if (screenWidth <= 767) return 225;
        if (screenWidth >= 768 && screenWidth < 1023) return 315;
        if (screenWidth >= 1024 && screenWidth < 1439) return 365;
        if (screenWidth >= 1440 && screenWidth < 1919) return 730;
        return 820; 
    };

    const cloneItems = (horizontScroll, originalItems) => {
        originalItems.forEach((item) => {
            const clone = item.cloneNode(true);
            horizontScroll.appendChild(clone);
        });
    };

    const removeFirstItems = (horizontScroll, originalItems) => {
        for (let i = 0; i < originalItems.length; i++) {
            horizontScroll.removeChild(horizontScroll.firstElementChild);
        }
    };

    const handleScroll = (horizontScroll, originalItems, direction) => {
        const scrollStep = getScrollStep();
        if (direction === 'right') {
            horizontScroll.scrollLeft += scrollStep;

            // Если конец контента близок, добавляем новые элементы
            if (horizontScroll.scrollLeft + horizontScroll.offsetWidth >= horizontScroll.scrollWidth - scrollStep) {
                cloneItems(horizontScroll, originalItems);
            }
        } else if (direction === 'left') {
            horizontScroll.scrollLeft -= scrollStep;

            // Если начало контента близко, добавляем элементы в начало
            if (horizontScroll.scrollLeft <= scrollStep) {
                originalItems.forEach((item) => {
                    const clone = item.cloneNode(true);
                    horizontScroll.insertBefore(clone, horizontScroll.firstChild);
                });
                horizontScroll.scrollLeft += scrollStep * originalItems.length; // Корректируем позицию
            }
        }

        // // Удаляем элементы, которые больше не видны
        // if (horizontScroll.children.length > originalItems.length * 3) {
        //     removeFirstItems(horizontScroll, originalItems);
        // }

        // return gap + 15; // Увеличиваем шаг прокрутки
    };

    // Привязываем обработчики событий к кнопкам для каждого контейнера
    rightBtn1.addEventListener('click', () => gap1 = handleScroll(horizontScroll1, originalItems1, 'right', gap1));
    leftBtn1.addEventListener('click', () => gap1 = handleScroll(horizontScroll1, originalItems1, 'left', gap1));

    rightBtn2.addEventListener('click', () => gap2 = handleScroll(horizontScroll2, originalItems2, 'right', gap2));
    leftBtn2.addEventListener('click', () => gap2 = handleScroll(horizontScroll2, originalItems2, 'left', gap2));

    rightBtn3.addEventListener('click', () => gap3 = handleScroll(horizontScroll3, originalItems3, 'right', gap3));
    leftBtn3.addEventListener('click', () => gap3 = handleScroll(horizontScroll3, originalItems3, 'left', gap3));

    rightBtn4.addEventListener('click', () => gap4 = handleScroll(horizontScroll4, originalItems4, 'right', gap4));
    leftBtn4.addEventListener('click', () => gap4 = handleScroll(horizontScroll4, originalItems4, 'left', gap4));
});

var button = $(".burger-menu-wrapper");

button.click(function() {
	button.toggleClass("closing", button.hasClass("open"));
	button.toggleClass("open");
});
