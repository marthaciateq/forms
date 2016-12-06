Mi.Template.id = 1
Mi.Template.orientation = $(window).width() > $(window).height() ? 'H' : 'V'
Mi.Template.value = function (key) {
	switch (key) {
		case 'borderRadius':
			if (Mi.Template.id == 1) return $(window).height() * 0.01;
			break;
		case 'boxShadow':
			if (Mi.Template.id == 1) return ($(window).height() * 0.001) + 'px ' + ($(window).height() * -0.001) + 'px ' + ($(window).height() * 0.03) + 'px ' + ($(window).height() * 0.0045) + 'px ' + Mi.Template.value('colorObscuro');
			break;
		case 'boxShadowInput':
			if (Mi.Template.id == 1) return ($(window).height() * 0.001) + 'px ' + ($(window).height() * -0.001) + 'px ' + ($(window).height() * 0.01) + 'px ' + ($(window).height() * 0.0005) + 'px ' + Mi.Template.value('colorObscuro');
			break;
		case 'colorMuyObscuro':
			if (Mi.Template.id == 1) return '#226179';
			break;
		case 'colorObscuro':
			if (Mi.Template.id == 1) return '#3c89a6';
			break;
		case 'colorClaro':
			if (Mi.Template.id == 1) return '#8dc8de';
			break;
		case 'colorMuyClaro':
			if (Mi.Template.id == 1) return '#effbff';
			break;
		case 'colorInputMask':
			if (Mi.Template.id == 1) return Mi.Template.value('colorClaro');
			break;
		case 'colorInput':
			if (Mi.Template.id == 1) return 'black';
			break;
		case 'deleted':
			return {
				opacity: 0.4
			}
			break;
		case 'fontFamily':
			if (Mi.Template.id == 1) return 'Arial, Verdana, Book Antiqua';
			break;
		case 'fontSizeNormal':
			if (Mi.Template.id == 1) {
				if (Mi.Template.orientation == 'H') return $(window).height() * 0.020;
				else return $(window).width() * 0.03;
			}
			break;
		case 'fontSizeGrande':
			if (Mi.Template.id == 1) {
				if (Mi.Template.orientation == 'H') return $(window).height() * 0.025;
				else return $(window).width() * 0.03;
			}
			break;
		case 'fontSizeExtraGrande':
			if (Mi.Template.id == 1) {
				if (Mi.Template.orientation == 'H') return $(window).height() * 0.03;
				else return $(window).width() * 0.03;
			}
			break;
		case 'header':
			return {
				'border-radius': Mi.Template.value('borderRadius'),
				background: 'linear-gradient(' + Mi.Template.value('colorMuyObscuro') + ', ' + Mi.Template.value('colorObscuro') + ')',
				'color': 'white',
				'font-weight': 'bold',
				'font-size': Mi.Template.value('fontSizeGrande')
			}
			break;
		case 'iconSize':
			return $(window).height() * 0.035
			break;
		case 'textShadow':
			if (Mi.Template.id == 1) return ($(window).height() * -0.003) + 'px ' + ($(window).height() * -0.002) + 'px ' + ($(window).height() * 0.015) + 'px ' + ($(window).height() * 0.0025) + 'px ' + Mi.Template.value('colorObscuro');
			break;
	}
	return null;
}
Mi.Template.load = function (onload, id, noAutenticacion) {
	if ($.type(onload) != 'function') onload = function () { };
	var templateFunction = null;
	var templateAutenticationFunction = null;
	switch (id) {
		case 1:
			Mi.Template.id = 1;
			templateFunction = Mi.Template.one;
			templateAutenticationFunction = Mi.Template.oneAutentication;
			break;
		default:
			Mi.Template.id = 1;
			templateFunction = Mi.Template.one;
			templateAutenticationFunction = Mi.Template.oneAutentication;
			break;
	}
	if (noAutenticacion) {
		templateFunction();
		Mi.Menu.load();
		onload();
	} else {
		if (Mi.Cookie.exist('SESIONGRACABE')) {
			templateFunction(onload);
			Mi.Menu.load();
			onload();
		} else templateAutenticationFunction(onload);
	}
}
Mi.Template.one = function () {
	$(document.body).children().remove();
	$(document.body).css({
		'color': Mi.Template.value('colorMuyObscuro'),
		overflow: 'hidden'
	});
	var div000 = $('<div id="DIV000">\
		<img id="LOGO"/>\
		<div id="FOOTER"/>\
		<div id="TITLE"/>\
		<div id="BODY"/>\
		<img id="MENU_ICON"/>\
		<img id="MENU_ICON2"/>\
		<div id="MENU2"/>\
		<div id="MENU"/>\
	</div>'); $(document.body).append(div000);
	div000.css({
		position: 'absolute',
		left: 0,
		top: 0,
		width: $(window).width(),
		height: $(window).height(),
		'font-size': Mi.Template.value('fontSizeNormal'),
		'font-family': Mi.Template.value('fontFamily')
	});
	div000.children().css({
		position: 'absolute'
	});
	if (Mi.Template.orientation == 'H') {
		var logo = div000.children('#LOGO');
		logo.prop('src', Mi.webHome + 'img/logoSmall.png');
		logo.css({
			right: $(window).height() * 0.01,
			top: $(window).height() * 0.01,
			height: $(window).height() * 0.08,
			width: $(window).height() * 0.08 * 306 / 67
		});
		var footer = div000.children('#FOOTER');
		footer.css({
			'padding-top': $(window).height() * 0.01,
			'padding-left': $(window).width() * 0.01,
			left: 0,
			top: $(window).height() * 0.96,
			width: $(window).width() * 0.99,
			height: $(window).height() * 0.03,
			overflow: 'hidden',
			'background-color': Mi.Template.value('colorMuyObscuro'),
			color: 'white'
		});
		if (Mi.Cookie.get('SESIONGRACABE'))
			footer.text(Mi.Cookie.get('SESIONGRACABE').persona);
		var title = div000.children('#TITLE');
		title.css({
			'padding-left': $(window).height() * 0.02,
			left: $(window).width() * 0.1,
			bottom: $(window).height() * 0.91,
			width: $(window).width() * 0.7,
			'max-height': $(window).height() * 0.09,
			'padding-top': $(window).height() * 0.01,
			overflow: 'auto',
			color: Mi.Template.value('colorMuyObscuro'),
			'font-size': $(window).height() * 0.06,
			'font-weight': 'bolder',
			'text-shadow': Mi.Template.value('textShadow'),
			'letter-spacing': $(window).height() * 0.006,
			'word-spacing': $(window).height() * 0.017
		});
		Mi.Efects.flash(title);
		var body = div000.children('#BODY');
		body.css({
			'padding': $(window).height() * 0.05,
			left: 0,
			top: $(window).height() * 0.089,
			width: $(window).width() - $(window).height() * 0.1,
			height: $(window).height() * 0.77,
			'text-align': 'center',
			overflow: 'auto'
		});
		var menuIcon = div000.children('#MENU_ICON');
		menuIcon.prop('src', Mi.webHome + 'img/menu.png');
		menuIcon.css({
			left: $(window).height() * 0.02,
			top: $(window).height() * 0.02,
			height: $(window).height() * 0.04,
			width: $(window).height() * 0.04 * 109 / 72,
			cursor: 'pointer',
			opacity: 0.3
		});
		menuIcon.mouseenter(function () {
			$(this).css('opacity', 1);
		});
		menuIcon.mouseleave(function () {
			$(this).css('opacity', 0.3);
		});
		menuIcon.click(function () {
			if (Mi.Menu.attributes.hidden) Mi.Menu.showOptions(Mi.Menu.root);
			Mi.Menu.toggle();
		});
		var menuIcon2 = div000.children('#MENU_ICON2');
		menuIcon2.prop('src', Mi.webHome + 'img/menu.png');
		menuIcon2.css({
			left: $(window).height() * 0.13,
			top: $(window).height() * 0.05,
			height: $(window).height() * 0.03,
			width: $(window).height() * 0.03 * 109 / 72,
			cursor: 'pointer',
			opacity: 0.3
		});
		menuIcon2.mouseenter(function () {
			$(this).css('opacity', 1);
		});
		menuIcon2.mouseleave(function () {
			$(this).css('opacity', 0.3);
		});
		var menu2Handler = null;
		menuIcon2.click(function () {
			if (menu2Handler != null) clearTimeout(menu2Handler);
			menu2.toggle();
			menu2Handler = setTimeout(function () {
				menu2.hide();
			}, 5000);
		});
		menuIcon2.hide();
		var menu2 = div000.children('#MENU2');
		menu2.css({
			left: $(window).height() * 0.20,
			top: $(window).height() * 0.1,
			width: $(window).width() * 0.2,
			padding: $(window).height() * 0.01,
			cursor: 'pointer',
			'background-color': 'white',
			border: 'solid 1px ' + Mi.Template.value('colorMuyObscuro'),
			'border-radius': Mi.Template.value('borderRadius')
		});
		menu2.mouseenter(function () {
			if (menu2Handler != null) clearTimeout(menu2Handler);
		});
		menu2.mouseleave(function () {
			menu2Handler = setTimeout(function () {
				menu2.hide();
			}, 2000);
		});
		menu2.click(function () {
			menu2.hide();
		});
		menu2.hide();
	} else {

	}
}
Mi.Template.oneAutentication = function (onload) {
	function teclaEnter(event) {
		if (event.which == 13) buttons.click();
	}
	var usuario = Mi.Input.text(); usuario.keydown(teclaEnter);
	var pwd = Mi.Input.text(); pwd.prop('type', 'password'); pwd.keydown(teclaEnter);
	var buttons = $('<button>Entrar</button>'); buttons.MiButton();
	buttons.eq(0).click(function () {
		Mi.AJAX.request({
			data: [
				{
					NAME: 'spp_autenticar',
					login: usuario.MiVal(),
					password: pwd.MiVal()
				},
				{
					NAME: 'spp_deleted'
				}
			],
			onsuccess: function (r) {
				var servicios = {}
				for (var i = 0; i < r[1].length; i++)
					servicios[r[1][i].servicio] = true;
				Mi.Cookie.set('SESIONGRACABE', {
					idsesion: r[0][0].idsesion,
					login: r[0][0].login,
					persona: r[0][0].persona,
					servicios: servicios
				});
				Mi.Cookie.set('SESIONGRACABETABLAS', {
					deleted: r[2]
				});
				Mi.Template.load(onload);
			}
		});
	});
	var table = Mi.table({
		head: {
			data: [['Entrar a GRACABE']]
		},
		body: {
			data: [
				['Usuario:', usuario],
				['Contraseña:', pwd]
			]
		},
		foot: {
			data: [[buttons]]
		},
		format: function (element, type, section, row, col, value) {
			if (type == 'TABLE') element.css({
				position: 'absolute',
				left: $(window).width() * 0.35,
				top: $(window).height() * 0.45,
				width: $(window).width() * 0.3,
				height: $(window).height() * 0.2
			});
			else if (section == 'THEAD' && type == 'TD') element.prop('colspan', 2);
			else if (section == 'TBODY' && type == 'TD') element.css({
				'border-bottom-style': 'none'
			});
		}
	}); table.appendTo(document.body);

	var img = $('<img src="' + Mi.webHome + 'img/logoBig.png" />'); img.appendTo(document.body);
	img.css({
		position: 'absolute',
		top: $(window).height() * 0.1,
		left: $(window).height() * 0.1,
		height: $(window).height() * 0.2
	});
	usuario.focus();
}
