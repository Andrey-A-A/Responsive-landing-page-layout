
let project_folder = require("path").basename(__dirname); //папка для передачи заказчику
let source_folder = "#src"; //папка с исходниками

let fs = require('fs'); //переменная для подключения файла стилей которая называется file sistem (fs)

let path = {
	//здесь будут хранится пути куда gulp будет выгружать файлы
	build: {
		html: project_folder + "/",
		css: project_folder + "/css",
		js: project_folder + "/js",
		img: project_folder + "/img",
		fonts: project_folder + "/fonts",
	},
	//пути для файлов исходников
	src: {
		html: [source_folder + "/*.html", "!" + source_folder + "/_*.html"], //просматриваем все файлы html за исключением файлов html нижним подчеркиванием _
		css: source_folder + "/scss/style.scss",
		js: source_folder + "/js/script.js",
		img: source_folder + "/img/**/*.{jpg,png,svg,gif,ico,webp}",
		fonts: source_folder + "/fonts/*.ttf",
	},
	//здесь указываются пути к файлам для слушателя watch, который будет отслеживать все изменения
	watch: {
		html: source_folder + "/**/*.html",
		css: source_folder + "/scss/**/*.scss",
		js: source_folder + "/js/**/*.js",
		img: source_folder + "/img/**/*.{jpg,png,svg,gif,ico,webp}",
	},
	//путь к папке проекта, которую нужно будет удалять всякий раз, когда мы будем запускать gulp
	clean: "./" + project_folder + "/"
}

let { src, dest } = require('gulp'),
	gulp = require('gulp'),
	browsersync = require("browser-sync").create(),
	fileinclude = require('gulp-file-include'),
	del = require('del'),
	scss = require('gulp-sass'),
	plumber = require('gulp-plumber'),
	sourceMaps = require('gulp-sourcemaps'),
	autoprefixer = require('gulp-autoprefixer'),
	group_media = require('gulp-group-css-media-queries'),
	clean_css = require('gulp-clean-css'),
	rename = require('gulp-rename'),
	uglify = require('gulp-uglify-es').default,
	imagemin = require('gulp-imagemin'),
	webp = require('gulp-webp'),
	webphtml = require('gulp-webp-html'),
	webpcss = require('gulp-webpcss'),
	svgSprite = require('gulp-svg-sprite'),
	ttf2woff = require('gulp-ttf2woff'),
	ttf2woff2 = require('gulp-ttf2woff2'),
	fonter = require('gulp-fonter');

//создадим функцию отвечающую за обновление страницы
function browserSync(params) {
	browsersync.init({
		server: {
			baseDir: "./" + project_folder + "/"
		},
		port: 3000,
		notify: false
	})
}
//далее необходимо чтобы создавалась папка, в которую будут записываться итоговые файлы
//сначала создадим функцию для работы с html файлами
function html() {
	//возвращаем переменную src в которой указываем путь к исходным файлам используя переменную path, далее src, далее html, то есть обращаясь в корень нашего проекта
	return src(path.src.html)
		//далее обращаемся к переменной fileinclude для того чтобы попросить наш gulp собирать наши исходники в один файл для дальнейшей передачи в результирующую папку dist
		.pipe(fileinclude())
		//далее нам необходимо подключить обработку файлов изображений webp в html
		.pipe(webphtml())
		//далее перебросим исходные файлы в папку назначения. обращаемся к переменной dest для которой прописываем путь к html файлу папки назначения.
		.pipe(dest(path.build.html))
		//далее нужно обновить страницу - обращаемся к функции browsersync и его методу stream
		.pipe(browsersync.stream())
}

//создадим функцию для обработки css файлов
function css(params) {
	return src(path.src.css)
		.pipe(plumber())
		.pipe(sourceMaps.init())
		.pipe(
			scss({
				outputStyle: "expanded" //пускай мой scss файл будет формироваться не сжатым
			})
		)
		.pipe(
			group_media()
		)
		.pipe(
			autoprefixer({
				overrideBrowserslist: ["last 5 versions"], //префиксы для последних  версий
				cascade: true //стиль написания префиксов каскадный
			})
		)
		//.pipe(webpcss()) //здесь добавляем файлы изображений webp в css
		.pipe(dest(path.build.css)) //здесь выгружаем css 
		.pipe(clean_css()) //здесь сжимаем исходный css файл 
		.pipe(
			rename({
				extname: ".min.css" //здесь мы переименовываем сжатый файл css в файл min.css
			}))
			.pipe(sourceMaps.write())
		.pipe(dest(path.build.css)) //здесь выгружаем уже сжатый и переименованный в min.css файл
		.pipe(browsersync.stream())
}

//создадим функцию для обработки js файлов
function js(params) {
	return src(path.src.js)
		.pipe(fileinclude())
		.pipe(dest(path.build.js))
		.pipe(
			uglify()
		)
		.pipe(
			rename({
				extname: ".min.js"
			})
		)
		.pipe(dest(path.build.js))
		.pipe(browsersync.stream())
}

//создадим функцию для обработки изображений
function images(params) {
	return src(path.src.img)
		.pipe(
			webp({
				quality: 70 //указываем качество для webp изображений
			})
		)
		.pipe(dest(path.build.img)) //выгружаем изображение webp
		.pipe(src(path.src.img)) //вновь обращаемся к исходникам
		//и далее обрабатываем уже обычные изображения
		.pipe(
			imagemin({
				progressive: true,
				svgoPlugins: [{ removeViewBox: false }],
				interlaced: true,
				optimizationLevel: 3 // 0 to 7
			})
		)
		.pipe(dest(path.build.img))
		.pipe(browsersync.stream())
}

//функция для подключения шрифтов
function fonts() {
	src(path.src.fonts)
		.pipe(ttf2woff())
		.pipe(dest(path.build.fonts));
	return src(path.src.fonts)
		.pipe(ttf2woff2())
		.pipe(dest(path.build.fonts));
};

gulp.task('otf2ttf', function () {
	return src([source_folder + '/fonts/*.otf']) //обращаемся к файлу с исходниками, чтобы взять там файл шрифта otf
		.pipe(fonter({
			formats: ['ttf'] //наш исходный файл будет конвертироваться в формат шрифта ttf
		}))
		.pipe(dest(source_folder + '/fonts/')) //и выгружаем результат опять же в папку шрифтов с исходниками
})

//работа с svg файлами по созданию спрайта
gulp.task('svgSprite', function () {
	return gulp.src([source_folder + '/iconsprite/*svg']) //возвращаем исходные файлы svg
		//далее создадим обработчик для создания спрайта
		.pipe(svgSprite({
			mode: {
				stack: {
					sprite: "../icons/icons.svg", //имя файла спрайта
					example: true //эта настройка будет создавать html файл с примерами иконок
				}
			},
		}
		))
		.pipe(dest(path.build.img)) //далее нужно вывыгрузить svg sprite в нашу папку с изображениями
})

//создадим функию, которая будет отвечать за подключение наших шрифтов к файлу стилей
function fontsStyle(params) {
	//этот код будет записывать имена файлов сконвертированных нами шрифтов в этот файл fonts
	let file_content = fs.readFileSync(source_folder + '/scss/fonts.scss');
	if (file_content == '') {
		fs.writeFile(source_folder + '/scss/fonts.scss', '', cb);
		return fs.readdir(path.build.fonts, function (err, items) {
			if (items) {
				let c_fontname;
				for (var i = 0; i < items.length; i++) {
					let fontname = items[i].split('.');
					fontname = fontname[0];
					if (c_fontname != fontname) {
						fs.appendFile(source_folder + '/scss/fonts.scss', '@include font("' + fontname + '", "' + fontname + '", "400", "normal");\r\n', cb);
					}
					c_fontname = fontname;
				}
			}
		})
	}
}

//создадим функию callback под названием cb
function cb(params) {

}

//создадим функцию обеспечивающую налету изменения внесенные в исходные файлы
function watchFiles() {
	gulp.watch([path.watch.html], html);//прописываем пути к файлам, за которыми мы хотим следить для слушителя watch и присваиваем функцию которая обрабатывает html файлы - это функция html
	gulp.watch([path.watch.css], css); //аналогично для css файлов
	gulp.watch([path.watch.js], js); //аналогично для js файлов
	gulp.watch([path.watch.img], images); //аналогично для js файлов
}

//создадим функцию, которая будет чистить папку dist, то ест удалять её
function clean() {
	return del(path.clean);
}

let build = gulp.series(clean, gulp.parallel(js, css, html, images, fonts), fontsStyle); //подружим css и html с gulp, причем эти функции пускай выполняются галпом одновременно, предварительно впишем функцию очистки clean
let watch = gulp.parallel(build, watchFiles, browserSync); //также включчаем этот build в переменную watch
//далее нужно подружить gulp с новыми переменными, чтобы он их понимал и работал
exports.fontsStyle = fontsStyle;
exports.fonts = fonts;
exports.images = images;
exports.js = js;
exports.css = css;
exports.html = html;
exports.build = build;
exports.watch = watch;
exports.default = watch;
