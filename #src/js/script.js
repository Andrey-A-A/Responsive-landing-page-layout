function burgerMenu(selector) {
	let menu = $(selector);
	let button = menu.find('.top__left a');
	let links = menu.find('.top__link');
	let overlay = menu.find('.top__body-overlay');
	let topmenu = menu.find('.top__menu');
	//повесим событие click на кнопку
	button.on('click', (e) => {
		//у кнопки будет отключаться действие по умолчанию и вызываться действие функции toggleMenu
		e.preventDefault();
		toggleMenu();
	});
	//у ссылок и подложки будет просто вызываться функция toggleMenu
	links.on('click', () => toggleMenu());
	overlay.on('click', () => toggleMenu());
	
	//создадим функцию, которая будет отвечать за переключение меню из активного состояния в неактивное
	function toggleMenu() {
		//сначала будем либо добавлять класс active к нашему меню
		topmenu.toggleClass('active');
		//сделаем так,чтобы когда меню активно - было нельзя прокручивать область контента
		if (topmenu.hasClass('top__menu wrap active')) {
			$('body').css('overflow','hidden');
			overlay.addClass('active');
		} else {
			$('body').css('overflow','visible');
			setTimeout(function() {
				overlay.removeClass("active");
		  	}, 300);
		}
	}
}
burgerMenu('.top__body');