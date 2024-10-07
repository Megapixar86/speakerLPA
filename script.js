// получить елемент по ID
	const el = (id)=> document.getElementById(id)
	//выбираем элементы
	const es = (selector)=> document.querySelector(selector)
	//извлечь значение первого элемента по имени
	const enm = (name)=> document.getElementsByName(name)[0]
	//адрес спецификации
	//var url = "https://cloud.luis.ru/index.php/s/6NSQGe3YpBKzwWP/download/LPA_Spec.xlsx"
	var url = "http://192.168.0.114:8080/LPA_Spec.xlsx"
	//глобальные переменные
	let objs_p
	let objs_w
	let ob
	let ang
	let spl
	let selAng
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
	//переменная исполнение
	function changeVal(event){
		let selId = event.target.id;
		if(selId === "exec"){
			let exc = el("exec").options[el("exec").selectedIndex].text;
			console.log(exc)
			//проверяем какое исполнение выбрано
			if(exc == "Выбрать"){
				el("model_speker").style.display = "none";
				if(el("sel")!== null){
					el('model_speker').removeChild(el("sel"));
				}
			}
			if(exc == "Потолочный"){
				el("model_speker").style.display = "block";
				if(el("sel")!== null){
					el('model_speker').removeChild(el("sel"));
				}
				let str = '<select id="sel">';
				for(let obj in objs_p ){
					str = str+'<option value = "p' + obj +'">'+objs_p[obj]['Модель'].toString()+'</option>';
				}
				str = str+'</select>';
				//el("exec").append(str);
				es('#model_speker').insertAdjacentHTML('beforeend', str);
				//console.log(str)
			}
			if(exc == "Настенный"){
				el("model_speker").style.display = "block";
				if(el("sel")!== null){
					el('model_speker').removeChild(el("sel"));
				}
				//es('#model_speker').removeChild("sel");
				let str = '<select id="sel">';
				for(let obj in objs_w ){
					str = str+'<option value = "p' + obj +'">'+objs_w[obj]['Модель'].toString()+'</option>';
				}
				str = str+'</select>';
				//el("exec").append(str);
				es('#model_speker').insertAdjacentHTML('beforeend', str);
				}
		}
	}
	
	//загружаем данные из спецификации и отпраляем их в переменную objs
	getData(url, "Лист2").then(json => {
		objs_p = json;
		console.log(json);

	})
	//console.log(objs_p)
	getData(url, "Лист3").then(json => {
		objs_w = json;
		console.log(objs_w)}
	)
	//console.log(objs_w)
	
	// изменение элемента select
	/*function changeVal(event){
		//получить ID элемента от события
		let selId = event.target.id;
		if (selId === "mod_sel"){
		drawClear()
		let t = el("mod_sel").options[el("mod_sel").selectedIndex].text;
			if (t !== "Выбрать"){
				el("info").style.display = "block"
			}else{
				el("info").style.display = "none"
			}
			el("devices").innerText = ''
			el("power").innerText = ''
			el("freq").innerText = ''
			el("spl").innerText = ''
			el("angle").innerText = ''
			for( obj in objs){
				if(objs[obj]['Модель']===t){
					ob = obj;
					for(key in objs[obj]){
						if(key === "Описание"){
							}
						if(key === "Мощность, Вт"){
								let st = objs[obj][key];
								let str= 'Выберите мощность, Вт: <select id="power_sel" style = "width: 60px">'
								let arr = st.split('/')
								for(let i=0; i<arr.length; i++){
								}
								str =str +'</select>'
								es('#power').insertAdjacentHTML('beforeend', str)
							}
						if(key === "SPL, дБ"){
								spl = objs[obj][key]
								str = '<div>SPL равен '+ objs[obj][key] +' дБ</div>'
								es('#spl').insertAdjacentHTML('beforeend', str)
							}
						if(key.slice(0, 19) === "Угол направленности"){
								ang = objs[obj][key]
								let str = 'Выберите частоту, кГц: <select id="freq_sel" style = "width: 60px">'
								let arr = key.split(' ')
								//console.log(arr)
								arr = arr[3].split('/')
								for(let i=0; i<arr.length; i++){
									str = str + '<option value = "f' + i +'">'+arr[i]+'</option>'
								}
								str=str +'</select></br>'
								es('#freq').insertAdjacentHTML('beforeend', str)
								let arr2 = ang.split('/')
								selAng = arr2[0]
								strn = 'Угол направленности равен '+ selAng +' градусам'
								el('angle').append(strn)
						}
						if(key === "Материал"){
								el("devices").append(', '+ key.toString().toLowerCase() + ': ' + objs[obj][key]);
						}
						}
					}
				};
		}
		if (selId === "freq_sel"){
			el("angle").innerText = ''
			let ml = el("freq_sel").selectedIndex
			drawClear()
			let arr = ang.split('/')
			selAng = arr[ml]
			str = 'Угол направленности равен '+ selAng +' градусам'
			el('angle').append(str)
		}
	}	
	
	function range(start, end, step=1){
		if (typeof end === 'undefined') {
			end = start, start = 0;
		}
		let arr = [];
		if(end > start){
			let len = Math.round((end - start) / step);
			while ( len-- ) {
				arr[len] = start + (len * step);
			}
		}
		return arr;
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
	
	function calc(){
		drawClear()
		try {
			//высота установки
			let height = +el("height_inp").value
			if(isNaN(height) || height === 0){
				//height = 0;
				//drawERROR("Введены не правильные данные!!! Введите числовое значение отличное от нуля и выберите модель")
				throw new Error("Данные не верны");
			}
			//уровень шума
			let noise = +el("noise_inp").value
			if(isNaN(noise) || noise === 0 ){
				//noise = 0;
				//drawERROR("Введены не правильные данные!!! Введите числовое значение отличное от нуля и выберите модель")
				throw new Error("Данные не верны");
			}
			//мощность включения
			let power = +el("power_sel").options[el("power_sel").selectedIndex].text
			//узд
			let uzd = +spl + 10 * Math.log10(power)
			//максимальная дальность
			let l = 0
			if(uzd >= (noise-15)){
				l = 10**((uzd - (noise + 15))/20);
			}
			//console.log(l)
			let d = 0 
			if(l > height){
				d = Math.sqrt(l**2 - (height-1.5)**2)
			}
			//console.log(d)
			let r = range(5, d, Math.ceil((d-5)/5))
			//console.log(r)
			let rAll = range(5, d)
			//console.log(rAll)
			//словарь расчетных значений
			let rupor = {
				dist: [],
				width: [],
				uzd: [],
			}
			//словарь всех значений
			let ruporAll = {
				dist: [],
				width: [],
				uzd: [],
			}
			//добавим элементы в словарь всех значений
			for(elem of rAll){
				let eLength = Math.sqrt(elem**2 + (height-1.5)**2)
				let euzd  = uzd - 20 * Math.log10(eLength)
				let ewidth = 2 * eLength * Math.tan(Math.PI*selAng/360)
				//console.log(ruporAll.uzd.length)
				if(ruporAll.uzd.length !== 0 && ruporAll.uzd[ruporAll.uzd.length-1] === +euzd.toFixed(0)){
					ruporAll.dist[ruporAll.dist.length-1] = elem
					ruporAll.width[ruporAll.width.length-1]=+ewidth.toFixed(0)
					ruporAll.uzd[ruporAll.uzd.length-1] = +euzd.toFixed(0)
				}
				else{
					ruporAll.dist.push(elem)
					ruporAll.width.push(+ewidth.toFixed(0))
					ruporAll.uzd.push(+euzd.toFixed(0))
				}
			}
			let k = ruporAll.dist.length
			let m = Math.ceil(k/5)
			//добавим элементы для рисунка
			for(let i = 0; i < k; i+=m){
				//console.log(i)
				rupor.dist.push(ruporAll.dist[i])
				rupor.width.push(ruporAll.width[i])
				rupor.uzd.push(ruporAll.uzd[i])
			}
			if(ruporAll.uzd[k-1] !== rupor.uzd[rupor.uzd.length-1]){
				rupor.dist.push(ruporAll.dist[k-1])
				rupor.width.push(ruporAll.width[k-1])
				rupor.uzd.push(ruporAll.uzd[k-1])
			}
			//рисуем диаграмму изменения УЗД от расстояния
			if(rupor.dist.length !==0){
				draw(rupor, selAng)
				el("myCanvas").scrollIntoView()
			}
			if(ruporAll.dist.length !==0){
				getTable(ruporAll)
			}
		}catch (err) {
			console.log(err)
			//alert('не выбрана модель')
		}
	}
	// нарисовать диаграмму
	function draw(dict, angle){
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
		ctx.fillText(objs[ob]['Модель'], canvas.width/2+25, 20)
		let dr = 70;
		for(elem in dict.dist){
			ctx.beginPath();
			//console.log(arr[elem])
			ctx.arc(canvas.width/2, 2, dr, (90-angle/2)*Math.PI/180, (angle/2+90)*Math.PI/180);
			ctx.stroke();
			//console.log(text[elem])
			ctx.textAlign = "center";
			ctx.fillText("УЗД: "+ dict.uzd[elem] + "дБ, " + "Дист.: " + dict.dist[elem] + "м., " + "Ширина: " + dict.width[elem] + "м." , canvas.width/2, dr+25)
			dr+=70;
		}
	}
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
	}
	// очистка рисунка
	function drawClear(){
		el("myCanvas").style.display = "none"
		el("btn2").style.display = "none"
		let canvas = document.getElementById("myCanvas")
		let ctx = canvas.getContext("2d");
		ctx.clearRect(0, 0, canvas.width, canvas.height)
	}
	//таблица всхе значений
	function getTable(data){
		if(el("grid") !== null){
			el("data").removeChild(el("grid"))
		}
		let str = '<div id="grid"><div>Дистанция, м</div><div>Ширина, м</div><div>УЗД, дБ</div>'
		for(elem in data.dist){
			str = str + '<div>' + data.dist[elem] +'</div><div>' + data.width[elem] + '</div><div>' + data.uzd[elem] + '</div>'
		}
		str = str + '</div>'
		es('#data').insertAdjacentHTML('beforeend', str)
	}
	*/	
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
		//el("btn").addEventListener("click", calc);
		//el("btn2").addEventListener("click", print);
	}
	//пуск
	window.onload = onLoadHandler;
	
