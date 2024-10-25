// получить елемент по ID
	const el = (id)=> document.getElementById(id)
	//выбираем элементы
	const es = (selector)=> document.querySelector(selector)
	//извлечь значение первого элемента по имени
	const enm = (name)=> document.getElementsByName(name)[0]
	//адрес спецификации
	//var url = "https://cloud.luis.ru/index.php/s/6NSQGe3YpBKzwWP/download/LPA_Spec.xlsx"
	var url = "http://127.0.0.1:8080/LPA_Spec.xlsx"
	//глобальные переменные
	let objs_p
	let objs_w
	let ob
	let ang
	let spl
	let uzd
	let spls
	let selAng
	let power_calc
	let lenght
	let height
	let L
	let Ldiff
	let arr_dist
	let arr_uzd
	let areaL
	let model
	//let rupor
	//функция загрузки данных
	async function getData(address, sht){
		let arr = new Array()
		const f = await function StrToArr (bufArr){
			for (let i = 0; i != bufArr.length; ++i) {
				arr[i] = String.fromCharCode(bufArr[i]);
			};
			return arr.join("")
			
		};
		const data = await fetch(address);
		const buf = await data.arrayBuffer();
		const bufArr = await new Uint8Array(buf);
		let str = await f(bufArr)
		const xls = await XLSX.read(str, { type: 'binary' });
		//console.log(xls)
		const json = await XLS.utils.sheet_to_json(xls.Sheets[sht]);
		return json
	}

	//загружаем данные из спецификации и отпраляем их в переменную objs
	getData(url, "Лист2").then(json => objs_p = json)
	getData(url, "Лист3").then(json => objs_w = json)

	//переменная исполнение
	function changeVal(event){
		let selId = event.target.id;
		//el("data").style.display = "block"
		if(selId === "exec"){
			let exc = el("exec").options[el("exec").selectedIndex].text;
			//проверяем какое исполнение выбрано
			if(exc == "Выбрать"){
				el("model_speker").style.display = "none";
				if(el("sel")!== null){
					el('model_speker').removeChild(el("sel"));
				}
			}
			if(exc == "Потолочный"){
				el("model_speker").style.display = "table-row";
				if(el("sel")!== null){
					el('model_speker').removeChild(el("sel"));
				}
				let str = '<select id="sel">';
				for(let obj in objs_p ){
					str = str+'<option value = "p' + obj +'">'+objs_p[obj]['Модель'].toString()+'</option>';
				}
				str = str+'</select>';
				es('#model_speker').insertAdjacentHTML('beforeend', str);
			}
			if(exc == "Настенный"){
				el("model_speker").style.display = "table-row";
				if(el("sel")!== null){
					el('model_speker').removeChild(el("sel"));
				}
				let str = '<select id="sel">';
				for(let obj in objs_w ){
					str = str+'<option value = "p' + obj +'">'+objs_w[obj]['Модель'].toString()+'</option>';
				}
				str = str+'</select>';
				es('#model_speker').insertAdjacentHTML('beforeend', str);
				}
		}
		if(el("var2").checked == true){
				el("sq").disabled = false
				el("inlw").disabled = true
				el("inw").disabled = true
		}else{
				el("sq").disabled = true
				el("inlw").disabled = false
				el("inw").disabled = false
				el("sq").value = (+el("inlw").value) * (+el("inw").value)
		}
		el("noise_inp").value = LimNum(+el("noise_inp").value, 30, 99)
		el("uzd_inp").value = +el("noise_inp").value + 15
	}

	//ограничить значение
	function LimNum(num, minNum, maxNum){
		if(num < minNum){
			num = minNum
		}
		if(num > maxNum){
			num = maxNum
		}
		return num
	}
	//функция расчета дальности
	let dist = (spl, power, uzd) => 10**((spl+10*Math.log10(power)-uzd)/20)
	//функция расчета звукового давления
	let UZDofdist = (spl, power, dist) => spl + 10*Math.log10(power) - 20*Math.log10(dist)

	function calc(){
		//очищаем 3d
		if(el('3d').lastElementChild != null){el('3d').removeChild(el('3d').lastElementChild)}
		arr_dist = []
		arr_uzd = []
		try {
			//Высота установки
			height = +el("inh").value
			//console.log(height)
			//console.log(height)
			if(isNaN(height) || height === 0){
				//height = 0;
				//drawERROR("Введены не правильные данные!!! Введите числовое значение отличное от нуля и выберите модель")
				throw new Error("Данные высоты не верны");
			}
			//Площадь помещения
			let area = + el("sq").value
			//console.log(area)
			if(isNaN(area) || area === 0 ){
				throw new Error("Данные площади не верны");
			}
			//Уровень шума
			let noise = +el("noise_inp").value
			//console.log(noise)
			if(isNaN(noise) || noise === 0 ){
				throw new Error("Данные шума не верны");
			}
			uzd = +el("uzd_inp").value
			//console.log(uzd)
			ob = el("sel").selectedIndex
			//расчет для Потолочников
			if(el("exec").options[el("exec").selectedIndex].text === "Потолочный"){
				//получим данные из спецификации для выбранной модели
				power = objs_p[ob]['Мощность, Вт'].split("/")
				spl = +objs_p[ob]['SPL, дБ']
				ang = objs_w[ob]['Угол направленности при 1/4/8 кГц'].split("/")
				//расчитываем дальность и УЗД в зависимости от выбранной частоты
				if(el("fr_sel").selectedIndex == 0){
					for(let elem of power){
						let d = dist(spl, elem, uzd)
						let uzdMax = UZDofdist(spl, elem, height-1.5)
						if(uzdMax<120){
							arr_dist.push(d)
							arr_uzd.push(uzdMax)
						}
						//elem
					}
				} else {
					let d = (height - 1.5)/ Math.cos(Math.PI * ang[el("fr_sel").selectedIndex]/360)
					arr_dist.push(d)
					for(let elem of power){
						let uzdL = UZDofdist(spl, elem, d)
						let uzdMax = UZDofdist(spl, elem, height-1.5)
						if(uzdMax<120 && uzdL > uzd){
							arr_uzd.push(uzdL)
						}
					}
				}
				L = Math.sqrt(arr_dist[arr_dist.length-1]**2 - (height - 1.5)**2)
				areaL = (L**2)*Math.PI
				model = objs_p[ob]['Модель']
			}
			// расчет для настенных громкоговорителей
			if(el("exec").options[el("exec").selectedIndex].text === "Настенный"){
				//получим данные из спецификации для выбранной модели
				power = objs_w[ob]['Мощность, Вт'].split("/")
				spl = +objs_w[ob]['SPL, дБ']
				ang = objs_w[ob]['Угол направленности при 1/4/8 кГц'].split("/")
				//расчитываем дальность и УЗД
				for(let elem of power){
					let d = dist(spl, elem, uzd)
					console.log(d)
					let uzdL = UZDofdist(spl, elem, (height -1.5)*Math.sin(Math.PI * ang[el("fr_sel").selectedIndex]/360))
					console.log(uzdL)
					//if(uzdL < 120 && uzdL > uzd){
					if(uzdL < 120){
						arr_dist.push(d)
						arr_uzd.push(uzdL)
					}
				}
				let R = arr_dist[arr_dist.length-1]
				// в зависимости от выбранной частоты считаем площадь
				if(el("fr_sel").selectedIndex == 0){
					L = Math.sqrt(arr_dist[arr_dist.length-1]**2 - (height - 1.5)**2)
					areaL = (Math.PI*R*R)/2 - R*R*Math.acos(1-(R-L)/R) + L*Math.sqrt(R*R - L*L)
				} else {
					L = Math.sqrt(R**2 - (height - 1.5)**2)
					Ldiff = L - (height -1.5)/Math.tan(Math.PI * ang[el("fr_sel").selectedIndex]/360)
					areaL = Math.PI * (Ldiff**2)* ang[el("fr_sel").selectedIndex]/360
				}
				model = objs_w[ob]['Модель']
			}
			
			//el("data").style.display = "none"
			el("row0").value = model
			el("row1").value = power[power.length-1]
			el("row2").value = Math.ceil(areaL, 0)
			el("row3").value = Math.ceil(area/areaL, 0)
			console.log(arr_dist)
			console.log(arr_uzd)
			if(el("exec").selectedIndex == 1) {draw_p( height, arr_dist[arr_dist.length-1], L, area )}
			if(el("exec").selectedIndex == 2) {draw_w( height, arr_dist[arr_dist.length-1], L, area )}
			
		}catch (err) {
			console.log(err)
			alert('Вы ввели не верное значение')
		}
	}
	// нарисовать диаграмму
	function draw_p(h, l, r, s){
		const cylnd = new THREE.CylinderGeometry( 0.1, 0.1, 0.1, 10);
		//точки для УЗД
		const points =[];
		points.push(new THREE.Vector2(0, h))
		points.push(new THREE.Vector2(r, h-r));
		points.push(new THREE.Vector2(2*r/3, r-Math.sqrt(6)*r/3))
		points.push(new THREE.Vector2(r/3, r-Math.sqrt(8)*r/3))
		points.push( new THREE.Vector2(0, h-l) )
		console.log(points)
		//материал посторения УЗД
		const uzdG = new THREE.LatheGeometry( points, 30, 0, Math.PI*2 );
		const scene = new THREE.Scene();
		scene.background = new THREE.Color(0x282c34);
		const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 10000);
		const renderer = new THREE.WebGLRenderer();
		renderer.setSize( window.innerWidth, window.innerHeight );
		el('3d').appendChild( renderer.domElement );
		const planeG = new THREE.PlaneGeometry(Math.sqrt(s), Math.sqrt(s), 1, 1);
		const planeM = new THREE.MeshBasicMaterial({color: 0xcccccc});
		const plane = new THREE.Mesh(planeG, planeM);
		const material = new THREE.MeshNormalMaterial();
		const matLpa= new THREE.MeshBasicMaterial({color: 0xFFFFFFF});
		const matCon = new THREE.MeshBasicMaterial({color: 0x7777ff, wireframe: true});
		plane.rotation.x=-0.5*Math.PI;
		plane.position.x = 2;
		plane.position.y = 0;
		plane.position.z = 0;
		//const mesh = new THREE.Mesh(conus, matCon);

		const uzd = new THREE.Mesh(uzdG, matCon);
		const meshLPA = new THREE.Mesh(cylnd, matLpa);
		//uzd.position.setY(2);
		meshLPA.position.setX(0);
		meshLPA.position.setY(h);
		const axes = new THREE.AxisHelper( 20 );
		const grid = new THREE.GridHelper( 40, 10);
		scene.add(uzd);
		scene.add(meshLPA);
		scene.add(plane);
		scene.add(axes);
		scene.add(grid);
		camera.position.z = 20;
		camera.position.x = -10;
		camera.position.y = 20;
		camera.lookAt(scene.position);

		const controls = new THREE.OrbitControls( camera, renderer.domElement );
		const frontSpot = new THREE.SpotLight(0xeeeece);
		frontSpot.position.set(1000, 1000, 1000);
		scene.add(frontSpot);

		const frontSpot2 = new THREE.SpotLight(0xddddce);
		frontSpot2.position.set(-500, -500, -500);
		scene.add(frontSpot2);
		const animate = function () {
			controls.update()
			requestAnimationFrame(animate);
			renderer.render(scene, camera);
		};
		animate();
	}
	//функция отрисовка УЗД для настенного извещателя
	function draw_w(h, r, s){
		/*const cylnd = new THREE.CylinderGeometry( 0.1, 0.1, 0.1, 10);
		//точки для УЗД
		const points =[];
		points.push(new THREE.Vector2(0, h + 0.1))
		points.push(new THREE.Vector2(r, 1.5));
		points.push(new THREE.Vector2(2*r/3, h-1.5-Math.sqrt(6)*r/3))
		points.push(new THREE.Vector2(r/3, h-1.5-Math.sqrt(8)*r/3))
		points.push( new THREE.Vector2(0, h-1.5-r) )
		//console.log(points)
		//материал посторения УЗД
		const uzdG = new THREE.LatheGeometry( points, 30, 0, Math.PI*2 );
		const scene = new THREE.Scene();
		scene.background = new THREE.Color(0x282c34);
		const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 10000);
		const renderer = new THREE.WebGLRenderer();
		renderer.setSize( window.innerWidth, window.innerHeight );
		el('3d').appendChild( renderer.domElement );
		const planeG = new THREE.PlaneGeometry(Math.sqrt(s), Math.sqrt(s), 1, 1);
		const planeM = new THREE.MeshBasicMaterial({color: 0xcccccc});
		const plane = new THREE.Mesh(planeG, planeM);
		const material = new THREE.MeshNormalMaterial();
		const matLpa= new THREE.MeshBasicMaterial({color: 0xFFFFFFF});
		const matCon = new THREE.MeshBasicMaterial({color: 0x7777ff, wireframe: true});
		plane.rotation.x=-0.5*Math.PI;
		plane.position.x = 2;
		plane.position.y = 0;
		plane.position.z = 0;
		//const mesh = new THREE.Mesh(conus, matCon);

		const uzd = new THREE.Mesh(uzdG, matCon);
		const meshLPA = new THREE.Mesh(cylnd, matLpa);
		//uzd.position.setY(2);
		meshLPA.position.setX(0);
		meshLPA.position.setY(h-0.1);
		const axes = new THREE.AxisHelper( 20 );
		const grid = new THREE.GridHelper( 40, 10);
		scene.add(uzd);
		scene.add(meshLPA);
		scene.add(plane);
		scene.add(axes);
		scene.add(grid);
		camera.position.z = 20;
		camera.position.x = -10;
		camera.position.y = 20;
		camera.lookAt(scene.position);

		const controls = new THREE.OrbitControls( camera, renderer.domElement );
		const frontSpot = new THREE.SpotLight(0xeeeece);
		frontSpot.position.set(1000, 1000, 1000);
		scene.add(frontSpot);

		const frontSpot2 = new THREE.SpotLight(0xddddce);
		frontSpot2.position.set(-500, -500, -500);
		scene.add(frontSpot2);
		const animate = function () {
			controls.update()
			requestAnimationFrame(animate);
			renderer.render(scene, camera);
		};
		animate();*/

	}
	/*
	function drawERROR(Er){
		el("myCanvas").style.display = "block"
		el("btn2").style.display = "block"
		let canvas = document.getElementById("myCanvas")
		canvas.height = dict.dist.length* 70 +35
		let ctx = canvas.getContext("2d");
		ctx.font = '20px Arial'
		ctx.fillRect(canvas.width/2-10, 2, 20, 10);
		ctx.beginPath();
		ctx.moveTo(canvas.width/2-10, 12);
		ctx.lineTo(canvas.width/2-20, 22);
		ctx.lineTo(canvas.width/2+20, 22);
		ctx.lineTo(canvas.width/2+10, 12);
		ctx.fill();
		ctx.stroke();
		ctx.fillText(Er)
	}*/
	// очистка рисунка
	/*function drawClear(){
		el("myCanvas").style.display = "none"
		el("btn2").style.display = "none"
		let canvas = document.getElementById("myCanvas")
		let ctx = canvas.getContext("2d");
		ctx.clearRect(0, 0, canvas.width, canvas.height)
	}*/
	//таблица всех значений
	/*function getTable(data){
		if(el("grid") !== null){
			el("data").removeChild(el("grid"))
		}
		let str = '<div id="grid"><div>Дистанция, м</div><div>Ширина, м</div><div>УЗД, дБ</div>'
		for(elem in data.dist){
			str = str + '<div>' + data.dist[elem] +'</div><div>' + data.width[elem] + '</div><div>' + data.uzd[elem] + '</div>'
		}
		str = str + '</div>'
		es('#data').insertAdjacentHTML('beforeend', str)
	}*/

	// асинхронная функция печати в PDF
	/*async function print() {	
		el("data").style.display = "block";
		await html2pdf( el('print') );
		await new Promise((resolve, reject) => el("data").style.display = "none");
	}*/
	
    // основная функция
	function onLoadHandler() {
		//-- подключаем обработчик щелчка
		document.addEventListener("change", changeVal);
		el("btn").addEventListener("click", calc);
	}
	//пуск
	window.onload = onLoadHandler;
	
