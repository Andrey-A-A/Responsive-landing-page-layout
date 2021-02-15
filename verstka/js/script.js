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
	console.log(links);
	console.log(overlay);

	//создадим функцию, которая будет отвечать за переключение меню из активного состояния в неактивное
	function toggleMenu() {
		//сначала будем либо добавлять класс active к нашему меню
		topmenu.toggleClass('active');
		//сделаем так,чтобы когда меню активно - было нельзя прокручивать область контента
		if (topmenu.hasClass('top__menu active')) {
			$('body').css('overflow','hidden');
			//$('body').addClass('body__hidden');
		} else {
			$('body').css('overflow','visible');
		}
	}
}
burgerMenu('.top__body');