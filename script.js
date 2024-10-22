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

	//загружаем данные из спецификации и отпраляем их в переменную objs
	getData(url, "Лист2").then(json => objs_p = json)
	getData(url, "Лист3").then(json => objs_w = json)

	//переменная исполнение
	function changeVal(event){
		let selId = event.target.id;
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

	function calc(){
		//drawClear()
		try {
			//Высота установки
			let height = +el("inh").value
			//console.log(height)
			if(isNaN(height) || height === 0){
				//height = 0;
				//drawERROR("Введены не правильные данные!!! Введите числовое значение отличное от нуля и выберите модель")
				throw new Error("Данные не верны");
			}
			//Площадь помещения
			let area = + el("sq").value
			//console.log(area)
			if(isNaN(area) || area === 0 ){
				throw new Error("Данные не верны");
			}
			//Уровень шума
			let noise = +el("noise_inp").value
			//console.log(noise)
			if(isNaN(noise) || noise === 0 ){
				throw new Error("Данные не верны");
			}
			let uzd = +el("uzd_inp").value
			if(el("exec").options[el("exec").selectedIndex].text === "Потолочный"){
				//console.log("Монтируем в потолок")
				for(obj in objs_w){
					if(objs_p[obj]['Модель'] === el("sel").options[el("sel").selectedIndex].text){
						ob = obj
						break
					}
				}
				let spls= objs_p[ob]['Мощность, Вт'].split("/")
				//let power_calc = 10**(uzd - spl + 20 * Math.log10(1.4*(height-1.5)))
				console.log(spl)
				//if(objs_w[obj]['Модель'])
			}
			//узд
			//let uzd = noise + 15
			//console.log(uzd)
			
		}catch (err) {
			console.log(err)
			alert('Вы ввели не верное значение')
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
	
