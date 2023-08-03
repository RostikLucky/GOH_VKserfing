//////////////////////////
//                      //
//   GOH_VKserfing_bot  //
//                      //
//////////////////////////
/// npm init
const open = require('open'); /// npm i --save open
const fetch = require("node-fetch"); /// npm i --save node-fetch@2
const UserAgent = require("user-agents") /// npm i --save user-agents
var term = require('terminal-kit').terminal; /// npm i --save terminal-kit
const {Api, TelegramClient} = require("telegram"); /// npm i --save telegram
const prompt = require("prompt-sync")({sigint:true}); /// npm i --save prompt-sync
var {SocksProxyAgent} = require('socks-proxy-agent'); /// npm i --save socks-proxy-agent
const {StringSession} = require("telegram/sessions");
const {Message} = require("telegram/tl/custom/message");
var LocalStorage = require('node-localstorage').LocalStorage; /// npm i --save node-localstorage

//////////////////////////
//                      //
//      ПЕРЕМЕННЫЕ      //
//                      //
//////////////////////////
appVer = "2.4";
localStorage = new LocalStorage(process.cwd()+'/GOH_VKserfing_settings');
if (localStorage.getItem('mySessions') == null || localStorage.getItem('mySessions') == "") localStorage.setItem('mySessions', "[]");

debug = false;
/// Временные переменные
userAgent = null;
proxy_server = null;
vkserfing_cookie = null;
telegram_username = null;
vkserfing_username = null;
telegram_session = null;
/// Переменные бота
iphone = ["iPhone 8", "iPhone 8 Plus", "iPhone X", "iPhone XR", "iPhone XS", "iPhone XS Max", "iPhone 11", "iPhone 11 Pro", "iPhone 11 Pro Max", "iPhone 12", "iPhone 12 Mini", "iPhone 12 Pro", "iPhone 12 Pro Max", "iPhone 13", "iPhone 13 Mini", "iPhone 13 Pro", "iPhone 13 Pro Max", "iPhone 14", "iPhone 14 Plus", "iPhone 14 Pro", "iPhone 14 Pro Max"];
active_session = 0;
mySessions = "";
thisSession = "";
x_xsrf_token = "";
bot_categories = "";
client = null;
tasks = [];
task_hash = "";
start_balance = 0.00;
balance = 0.00;
task_good = 0;
task_bad = 0;
view_earn_categories = [];
view_earn_categories_val = 0;
bot_workstation_status = "";
cashout = true;

//////////////////////////
//                      //
//  ВЫПОЛНЕНИЕ ЗАПРОСА	//
//                      //
//////////////////////////
async function fetch_request(url, method, headers, body, type, proxy, useragent) {
	function jsonConcat(o1, o2) {
		for (var key in o2) o1[key] = o2[key];
	 	return o1;
	}
	value = {"status": "error", "data": "invalid_request"};
	fetch_data = {
		agent: new SocksProxyAgent(proxy),
		method: method,
		headers: jsonConcat({
			'accept': 'application/json, text/plain, */*',
			'accept-language': 'ru-RU,ru;q=0.9,en-US;q=0.8,en;q=0.7,zh-CN;q=0.6,zh;q=0.5,tr;q=0.4',
			'x-requested-with': 'XMLHttpRequest',
			'user-agent': useragent
		}, headers)
	}
	if (method == "POST") fetch_data["body"] = body;
	await fetch(url, fetch_data).then(function(data) {
		if (type == "text") return data.text();
		else if (type == "json") return data.json();
	}).then(function(data) {
		value = {"status": "success", "data": data};
	}).catch(function(data){
		data = data.toString();
		if (data.indexOf("Failed to fetch") != -1) value = {"status": "error", "data": "invalid_url"};
		else if (data.indexOf("SyntaxError") != -1) value = {"status": "error", "data": "invalid_request"};
		else value = {"status": "error", "data": data};
	});
	return value;
}

//*//*//*//*//*//*//*//*//*//*//*//
//                               //
//                               //
//     ВЫВОД ДАННЫХ НА ЭКРАН     //
//                               //
//                               //
//*//*//*//*//*//*//*//*//*//*//*//
function setTerminalTitle(title) {
  process.stdout.write(String.fromCharCode(27) + "]0;" + title + String.fromCharCode(7));
}

///////////////////////////
//                       //
//     ГЛАВНОЕ МЕНЮ      //
//                       //
///////////////////////////
function main_window() {
	term.clear();
	active_session = 0;
	setTerminalTitle("GOH_VKserfing");
	term.bgGreen.bold("Выберете действие:");
	items = [];
	mySessions = JSON.parse(localStorage.getItem('mySessions'));
	for (var i = 0; i < mySessions.length; i++) {items.push(`${i+1}. Войти - ${mySessions[i]}`)}
	items.push(`${mySessions.length+1}. Добавить сессию`, `${mySessions.length+2}. Выйти из приложения`)
	term.singleColumnMenu(items, function(error, response) {
		if (response.selectedText.indexOf("Добавить сессию") != -1) {
			add_session_proxy();
		} else if (response.selectedText.indexOf("Выйти из приложения") != -1) {
			term.clear();
			process.exit();
		} else {
			active_session = Number(response.selectedIndex);
			bot_main();
		}
	})
}

///////////////////////////
//                       //
//       МЕНЮ БОТА       //
//                       //
///////////////////////////
function bot_main() {
	mySessions = JSON.parse(localStorage.getItem('mySessions'));
	thisSession = JSON.parse(localStorage.getItem("session-"+mySessions[active_session].split(", @")[1]))
	term.clear();
	if (thisSession != null) {
		setTerminalTitle("Аккаунт: "+mySessions[active_session]);
		term.bgGreen.bold(`Аккаунт - ${mySessions[active_session]}`);
		items = ["1. Запустить бота", 
			"2. Прогрев Telegram аккаунта", 
			"3. Прогрев VKserfing аккаунта", 
			"_____________________________",
			"4. Изменить Telegram аккаунт",
			"5. Изменить прокси сервер",
			"6. Изменить настройки бота", 
			"7. Изменить примечание", 
			"8. Удалить данную сессию", 
			"9. Вернуться в главное меню"];
		term.singleColumnMenu(items, function(error, response) {
			if (response.selectedIndex == 0) bot_workstation_check();
			else if (response.selectedIndex == 1) bot_workstation_check("progrev");
			else if (response.selectedIndex == 2) bot_workstation_check("view");
			else if (response.selectedIndex == 3) bot_main();
			else if (response.selectedIndex == 4) edit_telegram();
			else if (response.selectedIndex == 5) add_session_proxy("1");
			else if (response.selectedIndex == 6) session_settings();
			else if (response.selectedIndex == 7) add_note();
			else if (response.selectedIndex == 8) {
				/// Удалить сессию
				localStorage.removeItem("session-"+mySessions[active_session].split(", @")[1])
				index = mySessions.indexOf(mySessions[active_session]);
	      if (index > -1) mySessions.splice(index, 1);
	      localStorage.setItem('mySessions', JSON.stringify(mySessions));
				main_window();
			} else if (response.selectedIndex == 9) main_window();
		})
	} else {
		/// Удалить сессию
		index = mySessions.indexOf(mySessions[active_session]);
    if (index > -1) mySessions.splice(index, 1);
    localStorage.setItem('mySessions', JSON.stringify(mySessions));
		term.red("\nПроизошла ошибка! Сессия удалена (Нажмите Enter для повтора)");
		term.inputField(function(error ,input) {main_window()})
	}
}

///////////////////////////
//                       //
//    ДОБАВИТЬ ПРОКСИ    //
//                       //
///////////////////////////
function add_session_proxy(type="") {
	term.clear();
	setTerminalTitle("GOH_VKserfing настройка прокси");
	if (type == "") term.bgGreen.bold("1 Этап - Добавление SOCKS IPv4 прокси сервера.\n");
	else term.bgGreen.bold("Изменить SOCKS IPv4 прокси сервер.\n");
	term.bold.green("Пример: socks4://ip-address:port\nПример: socks5://username:password@ip-address:port")
	term.magenta("\nПрокси: ");
	term.inputField(function(error ,input) {
			if (input == "") {
				if (type == "") main_window();
				else bot_main();
			} else if (input.indexOf("socks4://") != -1 || input.indexOf("socks5://") != -1) {
				term.green("\nБот проверяет ваш прокси сервер!");
				userAgent = new UserAgent({platform: 'iPhone'}).toString();
				proxy_server = input;
				fetch_request("https://tg.goh.su/VKserfing/?action=ip", "GET", {}, "{}", "text", proxy_server, userAgent).then(function(request){
  				if (request.status == "success") {
  					term.clear();
  					term.bgGreen.bold(`Ваш прокси сервер сохранён! IP адрес: ${request.data}`);
  					if (type == "") {
	  					items = ["1. Продолжить", "2. Изменить прокси сервер", "3. Вернуться в главное меню"]
	  					term.singleColumnMenu(items, function(error, response) {
								if (response.selectedIndex == 0) add_session_vkserfing();
								if (response.selectedIndex == 1) add_session_proxy(type);
								if (response.selectedIndex == 2) main_window();
							})
						} else {
							thisSession.proxy_server = proxy_server;
							thisSession.userAgent = userAgent;
							localStorage.setItem('session-'+mySessions[active_session].split(", @")[1], JSON.stringify(thisSession))
							items = ["1. Продолжить", "2. Изменить прокси сервер"]
	  					term.singleColumnMenu(items, function(error, response) {
								if (response.selectedIndex == 0) bot_main();
								if (response.selectedIndex == 1) add_session_proxy(type);
							})
						}
  				/// Вывод ошибки при проверке прокси
  				} else if (request.status == "error") {
  					term.red("\nПроизошла ошибка! (Нажмите Enter для повтора)\n - ",request.data);
  					term.inputField(function(error ,input) {add_session_proxy(type)})
					}
  			})
			} else {
				term.red("\nВы ошиблись при вводе прокси сервера! (Нажмите Enter для повтора)");
				term.inputField(function(error ,input) {add_session_proxy(type)})
			}
		}
	)
}

///////////////////////////
//                       //
//  ДОБАВИТЬ VKSERFING   //
//                       //
///////////////////////////
function add_session_vkserfing() {
	term.clear();
	setTerminalTitle("GOH_VKserfing настройка VKserfing");
	term.bgGreen.bold("2 Этап - Добавление VKserfing аккаунта.\n");
	term.bold.green("Введите cookie от вашего аккаунта:");
	term.magenta("\nvksid: ");
	term.inputField(function(error ,input) {
		vkserfing_cookie = "";
		if (input != "") {
			vkserfing_cookie = `vksid=${input}; `;
			term.magenta("\nvkstoken: ");
			term.inputField(function(error ,input) {
				vkserfing_cookie = vkserfing_cookie+`vkstoken=${input}; `;
				term.magenta("\nsessid: ");
				term.inputField(function(error ,input) {
					vkserfing_cookie = vkserfing_cookie+`sessid=${input}`;					
					term.green("\nБот проверяет ваш аккаунт!");
					fetch_request("https://vkserfing.ru/accounts", "GET", {
						'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
        		'accept-language': 'ru-RU,ru;q=0.9,en-US;q=0.8,en;q=0.7,zh-CN;q=0.6,zh;q=0.5,tr;q=0.4',
        		'upgrade-insecure-requests': '1', cookie: vkserfing_cookie
      		}, "{}", "text", proxy_server, userAgent).then(function(request){
	  				if (request.status == "success") {
	  					if (request.data.indexOf(`<a href="#reg" class="form__btn btn btn--light btn--block" v-fancybox><span>Зарегистрироваться</span></a>`) == -1) {
	  						if (request.data.indexOf(`Произошла ошибка сервера. Мы уже работаем над исправлением проблемы`) == -1) {
			            data = request.data.split("accounts:")[1].split("]")[0].split('"id"');
			            telegram_username = "";
			            for (var i = 0; i < data.length; i++) {
			              if (data[i].indexOf('"platform":"telegram"') != -1 && data[i].indexOf('"platform_alias"') != -1 && data[i].indexOf('"status":"active"') != -1) {
		                	telegram_username = data[i].split('"platform_alias":"')[1].split('"')[0];
		                	break;
			              }
			            }
			            if (telegram_username != "") {
			            	my_id = request.data.split('auth-menu__id">Ваш ID: ')[1].split("</di")[0];
			            	fetch_request("https://tg.goh.su/VKserfing/index.php?action=id_info&data="+my_id, "GET", {}, "{}", "json", proxy_server, userAgent).then(function(request2){
			            		if (request2.status == "success") {
							  				if (request2.data.status != ".") {
							  					string_key = ((Number(request2.data.status.split(".")[0]) - 45424404) / 2).toString();
													activation_type = string_key[0];
													now_date = parseInt((new Date().getTime() / 1000).toFixed(0))
													activation_date = parseInt((new Date(string_key.substr(1, 18).split("399").reverse().join('.')).getTime() / 1000).toFixed(0));
													activation_id = ((Number(request2.data.status.split(".")[1]) - 45424404) / 6).toString();
													if (activation_id == my_id) {
														if (activation_type == "2" && now_date < activation_date) {
						            			vkserfing_username = request.data.split(" user: {")[1].split("name: '")[1].split("',")[0];
						            			term.clear();
									  					term.bgGreen.bold(`Ваш аккаунт VKserfing сохранен: ${vkserfing_username}`);
									  					items = ["1. Продолжить", "2. Изменить аккаунт", "3. Вернуться в главное меню"]
									  					term.singleColumnMenu(items, function(error, response) {
																if (response.selectedIndex == 0) add_session_telegram();
																if (response.selectedIndex == 1) add_session_vkserfing();
																if (response.selectedIndex == 2) main_window();
															})
														} else {
															term.red("\nВремя активации прошло! Активируйте этот аккаунт в боте https://t.me/RostikLuckyBot (Нажмите Enter для повтора)");
							  							term.inputField(function(error ,input) {open("https://t.me/RostikLuckyBot"); add_session_vkserfing()})
														}
													} else {
														term.red("\nПроизошла ошибка активации! (Нажмите Enter для повтора)");
							  						term.inputField(function(error ,input) {add_session_vkserfing()})
													}
							  				} else {
							  					term.red("\nВам необходимо активировать этот аккаунт в боте https://t.me/RostikLuckyBot (Нажмите Enter для повтора)");
							  					term.inputField(function(error ,input) {open("https://t.me/RostikLuckyBot"); add_session_vkserfing()})
												}
											} else {
												term.red("\nПроизошла ошибка при подключении! (Нажмите Enter для повтора)");
					  						term.inputField(function(error ,input) {add_session_vkserfing()})
											}
						  			})
			            } else {
			            	term.red("\nУ вас нет активного Telegram аккаунта (или у вас нет UserName в Telegram)! (Нажмите Enter для повтора)");
										term.inputField(function(error ,input) {add_session_vkserfing()})
			            }   
			          } else {
			          	term.red("\nВы ошиблись при вводе cookie от аккаунта! #1 (Нажмите Enter для повтора)");
									term.inputField(function(error ,input) {add_session_vkserfing()})
			          }
		          } else {
		            term.red("\nВы ошиблись при вводе cookie от аккаунта! #2 (Нажмите Enter для повтора)");
								term.inputField(function(error ,input) {add_session_vkserfing()})
		          }
	  				/// Вывод ошибки при вводе cookie
	  				} else if (request.status == "error") {
	  					term.red("\nВы ошиблись при вводе cookie от аккаунта! #3 (Нажмите Enter для повтора)\n - ", request.data);
							term.inputField(function(error ,input) {add_session_vkserfing()})
						}
	  			})
				})
			})
		} else {
			main_window();
		}
	})
}

///////////////////////////
//                       //
//   ДОБАВИТЬ TELEGRAM   //
//                       //
///////////////////////////
function add_session_telegram() {
	term.clear();
	setTerminalTitle("GOH_VKserfing настройка Telegram");
	term.bgGreen.bold(`3 Этап - Добавление Telegram аккаунта.`);
	randomIphone = iphone[Math.floor(Math.random() * iphone.length)];
	items = ["1. Войти по номеру телефона", "2. Войти по StringSession"]
	term.singleColumnMenu(items, function(error, response) {
		if (response.selectedIndex == 0) {
			string_session = new StringSession("");
			term.bold.green(`Введите данные от вашего аккаунта ${telegram_username}:\n`);
			login_Telegram();
		}
		if (response.selectedIndex == 1) {
			term.magenta("Введите StringSession: ");
			term.inputField(function(error ,input) {
				if (input != "") string_session = new StringSession(input);
				else {
					string_session = new StringSession("");
					term.bold.green(`Введите данные от вашего аккаунта ${telegram_username}:\n`);
				}
				login_Telegram();
			});
		};
		async function login_Telegram() {
	    try {
	    	if (proxy_server.indexOf("@") == -1) {
	    		proxy = {
	    			ip: proxy_server.split("://")[1].split(":")[0],
			      port: Number(proxy_server.split(":")[2]),
			      socksType: Number(proxy_server.split("socks")[1].split("://")[0]),
			      timeout: 2
	    		}
	    	} else {
	    		proxy = {
	    			ip: proxy_server.split("@")[1].split(":")[0],
			      port: Number(proxy_server.split(":")[proxy_server.split(":").length - 1]),
			      socksType: Number(proxy_server.split("socks")[1].split("://")[0]),
			      username: proxy_server.split("://")[1].split(":")[0],
			      password: proxy_server.split("://")[1].split(":")[1].split("@")[0],
			      timeout: 2
	    		}
	    	}
	      client = new TelegramClient(string_session, 7868091, "e513587e796d3334308ba1b253bfe963", {
	      	connectionRetries: 5,
	      	deviceModel: randomIphone,
	      	langPack: 'ios',
	      	systemVersion: userAgent.split("iPhone OS ")[1].split(" like")[0].replaceAll("_", "."),
	      	proxy: proxy
	      });
	      await client.start({
	        phoneNumber: async () => await prompt("Введите номер телефона: +"),
	        password: async () => await prompt("Введите пароль от аккаунта: ", {echo: '*'}),
	        phoneCode: async () => await prompt("Введите код из смс: "),
	        onError: function(error){
	        	term.red("\nПроизошла ошибка при добавлении аккаунта! (Нажмите Enter для повтора)\n - ", error);
						term.inputField(function(error ,input) {add_session_telegram()})
	        },
	      });
	      term.green("\nБот входит в ваш аккаунт!");
	      telegram_session = await client.session.save();
	      me = await client.getMe();
	      if (me.username == telegram_username.replace("@", "")) {
	      	/// Сохранить аккаунт
	      	session_name = vkserfing_username + ", " + telegram_username;
	      	mySessions = JSON.parse(localStorage.getItem('mySessions'));
	      	if (mySessions.indexOf(session_name) == -1) mySessions.push(session_name);
	        localStorage.setItem('mySessions', JSON.stringify(mySessions));
	        localStorage.setItem('session-'+telegram_username.replace("@", ""), `{"proxy_server": "${proxy_server}", "vkserfing_cookie": "${vkserfing_cookie}", "cashout": "", "telegram_session": "${telegram_session}", "iPhone": "${randomIphone}", "userAgent": "${userAgent}", "st_category": 0, "st_task_delay": 5, "st_follow_delay": 5, "st_check_delay": 12, "st_sleep_delay": 5}`);
	        await client.disconnect();
	        main_window();
	      } else {
	      	await client.disconnect();
	        term.red("\nАккаунт не соответствует тому, что добавлено в VKserfing (Нажмите Enter для повтора)");
					term.inputField(function(error ,input) {add_session_telegram()})
	      }
	    } catch (error) {
	      term.red("\nПроизошла ошибка при добавлении аккаунта! (Нажмите Enter для повтора)\n - ", error);
				term.inputField(function(error ,input) {add_session_telegram()})
	    }
	  };
	});
}

///////////////////////////
//                       //
//    НАСТРОЙКИ БОТА     //
//                       //
///////////////////////////
function session_settings() {
	term.clear();
	setTerminalTitle("GOH_VKserfing настройки бота");
	term.bgGreen.bold(`Выставите оптимальные настройки для аккаунта`);
	if (thisSession.st_category == 0) temp_category = "Подписки и Просмотры";
	else if (thisSession.st_category == 1) temp_category = "Подписки";
	else temp_category = "Просмотры";
	if (thisSession.st_task_delay == 5) delay_preset = "Медленное выполнение";
	else if (thisSession.st_task_delay == 15) delay_preset = "Быстрое выполнение";
	else delay_preset = "Среднее выполнение";
	items = [`1. Категория заданий: ${temp_category}`, 
		`2. Задержка между заданиями: ${thisSession.st_task_delay} сек.`, 
		`3. Задержка между выполнением: ${thisSession.st_follow_delay} сек.`,
		`4. Задержка между проверкой: ${thisSession.st_check_delay} сек.`,
		`5. Задержка если нет заданий: ${thisSession.st_sleep_delay} мин.`,
		`6. Установить пресет: ${delay_preset}`,
		`7. Автовывод на QIWI: ${thisSession.cashout}`,
		'8. Вернуться в меню бота']
	term.singleColumnMenu(items, function(error, response) {
		if (response.selectedIndex == 0) {
			if (thisSession.st_category < 2) thisSession.st_category++;
			else thisSession.st_category = 0;
			localStorage.setItem("session-"+mySessions[active_session].split(", @")[1], JSON.stringify(thisSession));
			session_settings();
		}
		if (response.selectedIndex == 1) {
			term.magenta("Введите значение от 5 до 120: ");
			term.inputField(function(error ,input) {
				if (!isNaN(Number(input))) if (Number(input) >= 5 && Number(input) <= 120) thisSession.st_task_delay = Number(input);
				localStorage.setItem("session-"+mySessions[active_session].split(", @")[1], JSON.stringify(thisSession));
				session_settings();
			})
		}
		if (response.selectedIndex == 2) {
			term.magenta("Введите значение от 2 до 60: ");
			term.inputField(function(error ,input) {
				if (!isNaN(Number(input))) if (Number(input) >= 2 && Number(input) <= 60) thisSession.st_follow_delay = Number(input);
				localStorage.setItem("session-"+mySessions[active_session].split(", @")[1], JSON.stringify(thisSession));
				session_settings();
			})
		}
		if (response.selectedIndex == 3) {
			term.magenta("Введите значение от 10 до 60: ");
			term.inputField(function(error ,input) {
				if (!isNaN(Number(input))) if (Number(input) >= 10 && Number(input) <= 60) thisSession.st_check_delay = Number(input);
				localStorage.setItem("session-"+mySessions[active_session].split(", @")[1], JSON.stringify(thisSession));
				session_settings();
			})
		}
		if (response.selectedIndex == 4) {
			term.magenta("Введите значение от 5 до 60: ");
			term.inputField(function(error ,input) {
				if (!isNaN(Number(input))) if (Number(input) >= 5 && Number(input) <= 60) thisSession.st_sleep_delay = Number(input);
				localStorage.setItem("session-"+mySessions[active_session].split(", @")[1], JSON.stringify(thisSession));
				session_settings();
			})
		}
		if (response.selectedIndex == 5) {
			if (delay_preset == "Быстрое выполнение") {
				thisSession.st_task_delay = 5;
				thisSession.st_follow_delay = 2;
				thisSession.st_check_delay = 10;
				thisSession.st_sleep_delay = 5;
			} else if (delay_preset == "Среднее выполнение") {
				thisSession.st_task_delay = 15;
				thisSession.st_follow_delay = 5;
				thisSession.st_check_delay = 15;
				thisSession.st_sleep_delay = 15;
			} else {
				thisSession.st_task_delay = 30;
				thisSession.st_follow_delay = 10;
				thisSession.st_check_delay = 15;
				thisSession.st_sleep_delay = 30;
			}
			localStorage.setItem("session-"+mySessions[active_session].split(", @")[1], JSON.stringify(thisSession));
			session_settings();
		}
		if (response.selectedIndex == 6) {
			term.magenta("Введите номер от QIWI кошелька: +");
			term.inputField(function(error ,input) {
				if (!isNaN(Number(input))) if (input.length >= 11 && input.length <= 12) thisSession.cashout = "+"+input;
				else thisSession.cashout = "";
				localStorage.setItem("session-"+mySessions[active_session].split(", @")[1], JSON.stringify(thisSession));
				session_settings();
			})
		}
		if (response.selectedIndex == 7) bot_main();
	})
}

///////////////////////////
//                       //
//  ДОБАВИТЬ ПРИМЕЧАНИЕ  //
//                       //
///////////////////////////
function add_note() {
	term.clear();
	setTerminalTitle("Добавить примечание: "+mySessions[active_session]);
	term.bgGreen.bold(`Добавьте любое текстовое примечание к аккаунту\n`);
	term.magenta("Примечание: ");
	term.inputField(function(error ,input) {
		if (input != "") {
			if (input.indexOf(", @") == -1) {
				name = mySessions[active_session].split(", @")[0];
				/// Удалить старое примечание (Если есть)
				if (name.indexOf(" (") != -1 && name.indexOf(")") != -1) name = mySessions[active_session].split(", @")[0].split(" (")[0];
				name = name+" ("+input+"), @"+mySessions[active_session].split(", @")[1];
				for (var i = 0; i < mySessions.length; i++) {
					if (mySessions[i] == mySessions[active_session]) {
						mySessions[i] = name;
						break
					}
				}
				localStorage.setItem('mySessions', JSON.stringify(mySessions));
				bot_main();
			} else bot_main();
		} else bot_main();
	})
}

///////////////////////////
//                       //
//   ИЗМЕНИТЬ ТЕЛЕГРАМ   //
//                       //
///////////////////////////
function edit_telegram() {
	term.clear();
	setTerminalTitle("GOH_VKserfing настройка Telegram");
	term.bgGreen.bold(`Изменить Telegram аккаунт`);
	items = ["1. Войти по номеру телефона", "2. Войти по StringSession", "3. Вернуться обратно"]
	term.singleColumnMenu(items, function(error, response) {
		if (response.selectedIndex == 0) {
			string_session = new StringSession("");
			term.bold.green(`Введите данные от вашего аккаунта:\n`);
			login_Telegram();
		}
		if (response.selectedIndex == 1) {
			term.magenta("Введите StringSession: ");
			term.inputField(function(error ,input) {
				if (input != "") string_session = new StringSession(input);
				else {
					string_session = new StringSession("");
					term.bold.green(`Введите данные от вашего аккаунта:\n`);
				}
				login_Telegram();
			});
		}
		if (response.selectedIndex == 2) bot_main();
		async function login_Telegram() {
	    try {
	    	if (thisSession.proxy_server.indexOf("@") == -1) {
	    		proxy = {
	    			ip: thisSession.proxy_server.split("://")[1].split(":")[0],
			      port: Number(thisSession.proxy_server.split(":")[2]),
			      socksType: Number(thisSession.proxy_server.split("socks")[1].split("://")[0]),
			      timeout: 2
	    		}
	    	} else {
	    		proxy = {
	    			ip: thisSession.proxy_server.split("@")[1].split(":")[0],
			      port: Number(thisSession.proxy_server.split(":")[thisSession.proxy_server.split(":").length - 1]),
			      socksType: Number(thisSession.proxy_server.split("socks")[1].split("://")[0]),
			      username: thisSession.proxy_server.split("://")[1].split(":")[0],
			      password: thisSession.proxy_server.split("://")[1].split(":")[1].split("@")[0],
			      timeout: 2
	    		}
	    	}
	      client = new TelegramClient(string_session, 7868091, "e513587e796d3334308ba1b253bfe963", {
	      	connectionRetries: 5,
	      	deviceModel: thisSession.iPhone,
	      	langPack: 'ios',
	      	systemVersion: thisSession.userAgent.split("iPhone OS ")[1].split(" like")[0].replaceAll("_", "."),
	      	proxy: proxy
	      });
	      await client.start({
	        phoneNumber: async () => await prompt("Введите номер телефона: +"),
	        password: async () => await prompt("Введите пароль от аккаунта: ", {echo: '*'}),
	        phoneCode: async () => await prompt("Введите код из смс: "),
	        onError: function(error){
	        	term.red("\nПроизошла ошибка при добавлении аккаунта! (Нажмите Enter для повтора)\n - ", error);
						term.inputField(function(error ,input) {bot_main()})
	        },
	      });
	      term.green("\nБот входит в ваш аккаунт!");
	      telegram_session = await client.session.save();
	      me = await client.getMe();
	      name = mySessions[active_session];
	      if (name.indexOf(" (") != -1 && name.indexOf(")") != -1) name = mySessions[active_session].split(", @")[0].split(" (")[0];
	      else name = mySessions[active_session].split(", @")[0];
      	session_name = name + ", @" + me.username;
      	/// Удалить старое примечание (Если есть)
      	name = mySessions[active_session].split(", @")[0];
				if (name.indexOf(" (") != -1 && name.indexOf(")") != -1) name = mySessions[active_session].split(", @")[0].split(" (")[0];
				let today = new Date();
				name = name+` (TG отвязан ${String(today.getDate()).padStart(2, '0')}.${String(today.getMonth() + 1).padStart(2, '0')}), @`+mySessions[active_session].split(", @")[1];
				for (var i = 0; i < mySessions.length; i++) {
					if (mySessions[i] == mySessions[active_session]) {
						mySessions[i] = name;
						break
					}
				}
				localStorage.setItem('mySessions', JSON.stringify(mySessions));
				/// Сохранить аккаунт
      	mySessions = JSON.parse(localStorage.getItem('mySessions'));
      	if (mySessions.indexOf(session_name) == -1) mySessions.push(session_name);
        localStorage.setItem('mySessions', JSON.stringify(mySessions));
        localStorage.setItem("session-"+me.username.replace("@", ""), `{"proxy_server": "${thisSession.proxy_server}", "vkserfing_cookie": "${thisSession.vkserfing_cookie}", "cashout": "${thisSession.cashout}", "telegram_session": "${telegram_session}", "iPhone": "${thisSession.iPhone}", "userAgent": "${thisSession.userAgent}", "st_category": ${thisSession.st_category}, "st_task_delay": ${thisSession.st_task_delay}, "st_follow_delay": ${thisSession.st_follow_delay}, "st_check_delay": ${thisSession.st_check_delay}, "st_sleep_delay": ${thisSession.st_sleep_delay}}`);
        await client.disconnect();
        main_window();
	    } catch (error) {
	      term.red("\nПроизошла ошибка при добавлении аккаунта! (Нажмите Enter для повтора)\n - ", error);
				term.inputField(function(error ,input) {bot_main()})
	    }
	  };
	});
}

//*//*//*//*//*//*//*//*//*//*//*//
//                               //
//                               //
//        БОТ WORKSTATION        //
//                               //
//                               //
//*//*//*//*//*//*//*//*//*//*//*//

///////////////////////////
//                       //
//      ВЫВОД ЛОГА       //
//                       //
///////////////////////////
function log_echo(info) {
	term.clear();
	d = new Date();
	earn = (parseFloat(balance) - parseFloat(start_balance)).toFixed(2);
	if (earn < 0) {start_balance = 0.00; cashout = true}
	term.bgGreen.bold(`GOH_VKserfing  Баланс: ${(parseFloat(balance)).toFixed(2)} руб (Ctr+C выход)\n`);
	term.bold.green(`Заработок: ${earn} руб.  Выполнено ${task_good}/${tasks.length}/${task_bad} заданий\n`);
	term.bold.green(`${d.toLocaleTimeString()} - ${info}`);
}

///////////////////////////
//                       //
//  ПРОВЕРКА АККАУНТОВ   //
//                       //
///////////////////////////
function bot_workstation_check(type = "") {
	term.on('key', function(name, matches, data) {if (name === 'CTRL_C') {setTerminalTitle("GOH_VKserfing"); term.clear(); process.exit()}});
	thisSession = JSON.parse(localStorage.getItem("session-"+mySessions[active_session].split(", @")[1]))
	term.clear();
	setTerminalTitle("Аккаунт: "+mySessions[active_session]);
	term.bgGreen.bold(`Идет проверка аккаунта (${mySessions[active_session]})\n`);
	///////////////////////////
	//                       //
	//    ВХОД В VKSERFING   //
	//                       //
	///////////////////////////
	fetch_request("https://vkserfing.ru/accounts", "GET", {
		'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
		'accept-language': 'ru-RU,ru;q=0.9,en-US;q=0.8,en;q=0.7,zh-CN;q=0.6,zh;q=0.5,tr;q=0.4',
		'upgrade-insecure-requests': '1', cookie: thisSession.vkserfing_cookie
	}, "{}", "text", thisSession.proxy_server, thisSession.userAgent).then(function(request){
		if (request.status == "success") {
			if (request.data.indexOf(`<a href="#reg" class="form__btn btn btn--light btn--block" v-fancybox><span>Зарегистрироваться</span></a>`) == -1) {
				if (request.data.indexOf(`Произошла ошибка сервера. Мы уже работаем над исправлением проблемы`) == -1) {
	        data = request.data.split("accounts:")[1].split("]")[0].split('"id"');
	        telegram_username = "";
	        view_earn_categories = [];
	        view_earn_categories_val = 0;
	        for (var i = 0; i < data.length; i++) {
	          if (data[i].indexOf('"platform_alias"') != -1 && data[i].indexOf('"status":"active"') != -1 && data[i].indexOf('"platform":"') != -1) {
	            /// Для заработка на просмотрах
	            if (type == "view") {
	            	if (data[i].split('"platform":"')[1].split('"')[0] == "vk") {
									view_earn_categories.push("vk/views")
									view_earn_categories.push("vk/video")
								} else if (data[i].split('"platform":"')[1].split('"')[0] == "tiktok") {
									view_earn_categories.push("tiktok/video")
								} else if (data[i].split('"platform":"')[1].split('"')[0] == "instagram") {
									view_earn_categories.push("instagram/video")
									view_earn_categories.push("instagram/history")
								} else if (data[i].split('"platform":"')[1].split('"')[0] == "telegram") {
									telegram_username = data[i].split('"platform_alias":"')[1].split('"')[0];
								}
							/// Для заработка на Telegram
	            } else {
	            	if (data[i].split('"platform":"')[1].split('"')[0] == "telegram") {
	            		telegram_username = data[i].split('"platform_alias":"')[1].split('"')[0];
	            		break
	            	}
	            }
	          }
	        }
	        if (telegram_username != "" || debug) {
	        	my_id = request.data.split('auth-menu__id">Ваш ID: ')[1].split("</di")[0];
          	fetch_request("https://tg.goh.su/VKserfing/index.php?action=id_info&data="+my_id, "GET", {}, "{}", "json", thisSession.proxy_server, thisSession.userAgent).then(function(request2){
          		if (request2.status == "success") {
			  				if (request2.data.status != ".") {
			  					string_key = ((Number(request2.data.status.split(".")[0]) - 45424404) / 2).toString();
									activation_type = string_key[0];
									if (thisSession.iPhone == null) {
										thisSession.iPhone = iphone[Math.floor(Math.random() * iphone.length)];
										localStorage.setItem("session-"+mySessions[active_session].split(", @")[1], JSON.stringify(thisSession));
									}
									now_date = parseInt((new Date().getTime() / 1000).toFixed(0))
									activation_date = parseInt((new Date(string_key.substr(1, 18).split("399").reverse().join('.')).getTime() / 1000).toFixed(0));
									activation_id = ((Number(request2.data.status.split(".")[1]) - 45424404) / 6).toString();
									if (activation_id == my_id) {
										if (activation_type == "2" && now_date < activation_date) {
		            			///////////////////////////
											//                       //
											//    ВХОД В TELEGRAM    //
											//                       //
											///////////////////////////
											(async () => {
										    try {
										    	if (thisSession.proxy_server.indexOf("@") == -1) {
										    		proxy = {
										    			ip: thisSession.proxy_server.split("://")[1].split(":")[0],
												      port: Number(thisSession.proxy_server.split(":")[2]),
												      socksType: Number(thisSession.proxy_server.split("socks")[1].split("://")[0]),
												      timeout: 2
										    		}
										    	} else {
										    		proxy = {
										    			ip: thisSession.proxy_server.split("@")[1].split(":")[0],
												      port: Number(thisSession.proxy_server.split(":")[thisSession.proxy_server.split(":").length - 1]),
												      socksType: Number(thisSession.proxy_server.split("socks")[1].split("://")[0]),
												      username: thisSession.proxy_server.split("://")[1].split(":")[0],
												      password: thisSession.proxy_server.split("://")[1].split(":")[1].split("@")[0],
												      timeout: 2
										    		}
										    	}
										      client = new TelegramClient(new StringSession(thisSession.telegram_session), 10840, "33c45224029d59cb3ad0c16134215aeb", {
										      	connectionRetries: 5,
										      	deviceModel: thisSession.iPhone,
										      	langPack: 'ios',
										      	systemVersion: thisSession.userAgent.split("iPhone OS ")[1].split(" like")[0].replaceAll("_", "."),
										      	proxy: proxy
										      });
										      await client.connect();
										      me = await client.getMe();
										      if (me.username == telegram_username.replace("@", "") || debug) {
										      	////////////////////////////
														//                        //
														//  ПОДГОТОВКА К ЗАПУСКУ  //
														//                        //
														////////////////////////////
														client.setLogLevel("none");
										      	if (thisSession.st_category == 0) bot_categories = "telegram";
														else if (thisSession.st_category == 1) bot_categories = "telegram/followers";
														else bot_categories = "telegram/views";
														tasks = [];
														task_hash = "";
														x_xsrf_token = "";
														bot_workstation_status = "";
														start_balance = 0.00;
														balance = 0.00;
														task_good = 0;
														task_bad = 0;
														if (type == "progrev") bot_progrev();
										      	else bot_workstation();
										      } else {
										      	await client.disconnect();
										        term.red("\nАккаунт Telegram не соответствует тому, что добавлено в VKserfing (Нажмите Enter для повтора)");
														term.inputField(function(error ,input) {bot_main()})
										      }
										    } catch (error) {
										      term.red("\nПроизошла ошибка при входе в Telegram! (Нажмите Enter для повтора)\n - ", error);
													term.inputField(function(error ,input) {bot_main()})
										    }
										  })();
										} else {
											term.red("\nВремя активации прошло! Активируйте этот аккаунт в боте https://t.me/RostikLuckyBot (Нажмите Enter для повтора)");
			  							term.inputField(function(error ,input) {open("https://t.me/RostikLuckyBot"); bot_main()})
										}
									} else {
										term.red("\nПроизошла ошибка активации! (Нажмите Enter для повтора)");
			  						term.inputField(function(error ,input) {bot_main()})
									}
			  				} else {
			  					term.red("\nВам необходимо активировать этот аккаунт в боте https://t.me/RostikLuckyBot (Нажмите Enter для повтора)");
			  					term.inputField(function(error ,input) {open("https://t.me/RostikLuckyBot"); bot_main()})
								}
							} else {
								term.red("\nПроизошла ошибка при подключении! (Нажмите Enter для повтора)");
	  						term.inputField(function(error ,input) {bot_main()})
							}
		  			});
	        } else {
	        	term.red("\nУ вас нет активного Telegram аккаунта (или у вас нет UserName в Telegram)! (Нажмите Enter для повтора)");
						term.inputField(function(error ,input) {bot_main()})
	        }   
	      } else {
	      	term.red("\nОшибка при входе в аккаунт VKserfing, добавьте аккаунт заново (Нажмите Enter для повтора)");
					term.inputField(function(error ,input) {bot_main()})
	      }
      } else {
        term.red("\nОшибка при входе в аккаунт VKserfing (Нажмите Enter для повтора)");
				term.inputField(function(error ,input) {bot_main()})
      }
		/// Вывод ошибки при вводе cookie
		} else if (request.status == "error") {
			term.red("\nОшибка при входе в аккаунт VKserfing (Нажмите Enter для повтора)\n - ", request.data);
			term.inputField(function(error ,input) {bot_main()})
		}
	})
}

//////////////////////////
//                      //
//    ПРОГРЕВ ТГ АКК    //
//                      //
//////////////////////////
function bot_progrev() {
	term.clear();
	term.green("Бот ищет непрочитанные каналы (максимум 50)!");
	function read_channel() {
		term.clear();
		date = new Date();
		term.green(date.toLocaleTimeString()+" - Просматриваю канал @"+channels[channels_id]+` ${channels_id+1}/${channels.length}`);
		client.invoke(
	    new Api.channels.ReadHistory({
	      channel: channels[channels_id],
	      maxId: 99999,
	    })
	  ).then(function() {
	  	channels_id++;
	  	if (channels_id >= channels.length) {
	  		term.green("\nВсе каналы просмотрены, запускаю бота!");
				setTimeout(() => {bot_workstation()}, 1000);
	  	} else setTimeout(() => {read_channel()},  Math.floor(Math.random() * (15 - 5) + 5) * 1000);
	  }).catch(function(error) {
	  	term.red("\nПроизошла ошибка, запускаю бота!");
			setTimeout(() => {bot_workstation()}, 5000);
	  })
	}
	client.invoke(
   	new Api.messages.GetDialogs({
	   	offsetDate: 0,
      offsetId: 0,
      offsetPeer: new Api.InputPeerEmpty(),
      limit: 100,
  	})
  ).then(function(result) {
  	channels = []
		for (var i = 0; i < result.chats.length; i++) {
			if (result.chats[i].participantsCount > 3) {
				if (result.chats[i].username !== undefined && result.chats[i].username != null) {
					if (channels.length < 50) channels.push(result.chats[i].username);
					else break;
				}
			}
		}
		if (channels.length > 0) {
			channels_id = 0;
			read_channel();
		} else {
			term.red("\nНет непрочитанных каналов, запускаю бота!");
			setTimeout(() => {bot_workstation()}, 5000);
		}
	}).catch(function(error) {
		term.red("\nПроизошла ошибка, запускаю бота!");
		setTimeout(() => {bot_workstation()}, 5000);
	})
}

//////////////////////////
//                      //
//      ЦИКЛ БОТА       //
//                      //
//////////////////////////
function bot_workstation(new_val = "") {
	setTimeout(() => {
		if (new_val != "") bot_workstation_status = new_val;
		//////////////////////////
		//                      //
		//  ГЕНЕРАЦИЯ ЗАПРОСА   //
		//                      //
		//////////////////////////
		if (x_xsrf_token == "") {
			bot_workstation_status = "get_token";
			fetch_url = "https://vkserfing.ru/accounts";
			fetch_method = "GET";
			fetch_headers = {cookie: thisSession.vkserfing_cookie};
			fetch_body = "{}";
			fetch_type = "text";
			log_echo("Получаю x_xsrf_token токен!");
		} else {
			if (tasks.length == 0) {
				if (view_earn_categories.length != 0) bot_categories = view_earn_categories[view_earn_categories_val]
				bot_workstation_status = "get_tasks";
				fetch_url = "https://vkserfing.ru/assignments/"+bot_categories;
				fetch_method = "GET";
				fetch_headers = {"x-ajax-partial-html": 1, cookie: thisSession.vkserfing_cookie};
				fetch_body = "{}";
				fetch_type = "json";
				log_echo("Получаю доступные задания!");
			} else if (bot_workstation_status == "go_task") {
				fetch_url = "https://vkserfing.ru/assignments/"+tasks[0].split(" ")[0]+"/begin";
				fetch_method = "POST";
				fetch_headers = {"x-xsrf-token": x_xsrf_token, "content-type": "application/json", cookie: thisSession.vkserfing_cookie};
				fetch_body = "{}";
				fetch_type = "json";
			} else if (bot_workstation_status == "check_task") {
				fetch_url = "https://vkserfing.ru/assignments/"+tasks[0].split(" ")[0]+"/check";
				fetch_method = "POST";
				fetch_headers = {"x-xsrf-token": x_xsrf_token, "content-type": "application/json", cookie: thisSession.vkserfing_cookie};
				fetch_body = '{"hash":"'+task_hash+'","comment_id": null,"vote_id": null}';
				fetch_type = "json";
				log_echo(`Проверяю задание #${task_good+task_bad+1}`);
			} else if (bot_workstation_status == "hidden_task") {
				fetch_url = "https://vkserfing.ru/assignments/"+tasks[0].split(" ")[0]+"/hidden";
				fetch_method = "POST";
				fetch_headers = {"x-xsrf-token": x_xsrf_token, "content-type": "application/json", cookie: thisSession.vkserfing_cookie};
				fetch_body = '{}';
				fetch_type = "json";
				log_echo(`Пропускаю задание #${task_good+task_bad+1}`);
			} else if (bot_workstation_status == "cashout") {
				fetch_url = "https://vkserfing.ru/cashout";
				fetch_method = "POST";
				fetch_headers = {"x-xsrf-token": x_xsrf_token, "content-type": "application/json", cookie: thisSession.vkserfing_cookie};
				fetch_body = '{"bill": "'+thisSession.cashout+'","amount": "100","type": "qiwi"}';
				fetch_type = "json";
				log_echo(`Автовывод средств на QIWI!`);
			}
		}

		//////////////////////////
		//                      //
		//  ВЫПОЛНЕНИЕ ЗАПРОСА	//
		//                      //
		//////////////////////////
		fetch_request(fetch_url, fetch_method, fetch_headers, fetch_body, fetch_type, thisSession.proxy_server, thisSession.userAgent).then(function (request) {
			if (request.status == "success") {
				data = request.data;
				//////////////////////////
				//                      //
				//    ПОЛУЧИТЬ ТОКЕН    //
				//                      //
				//////////////////////////
				if (bot_workstation_status == "get_token") {
					if (data.indexOf(`<a href="#reg" class="form__btn btn btn--light btn--block" v-fancybox><span>Зарегистрироваться</span></a>`) == -1) {
						if (data.indexOf("TOKEN        = '") != -1) {
							x_xsrf_token = data.split("TOKEN        = '")[1].split("',")[0];
							tasks = [];
							task_hash = "";
							bot_workstation("get_tasks");
						} else {
							term.red("\nОшибка при получении x_xsrf_token (Повтор через 1 мин.)");
							setTimeout(() => {bot_workstation()}, 60000);
						}
					} else {
						term.red("\nОшибка при входе в аккаунт VKserfing!");
						term.inputField(function(error ,input) {term.clear(); process.exit()})
					}
				} else if (bot_workstation_status == "get_tasks") {
					//////////////////////////
					//                      //
					//   ПОЛУЧИТЬ ЗАДАНИЯ   //
					//                      //
					//////////////////////////
					try {
						balance = data['data']['balance'];
						if (start_balance == 0) start_balance = balance;
						tasks = [];
						if (data['html'].indexOf("<active-assignment") != -1) {
							task = data['html'].split("<active-assignment")
							for (var i = 1; i < task.length; i++) {
								tasks.push(task[i].split(':id=\"')[1].split('\"')[0]+" "+task[i].split('plain-link=\"')[1].split('\"')[0])
							}
						}
						if (data['html'].indexOf("отсутствует активный аккаунт") != -1) {
							term.red("\nОшибка, у вас отсутствует активный аккаунт Telegram");
							term.inputField(function(error ,input) {term.clear(); process.exit()})
						} else if (data['html'].indexOf("Для продолжения работы необходимо") != -1) {
							term.red("\nДля продолжения работы необходимо верифицировать аккаунт VKserfing!");
							term.inputField(function(error ,input) {term.clear(); process.exit()})
						} else if (data['html'].indexOf("У вашего профиля Telegram почти достигнут") != -1) {
							term.red("\nДля получения всех видов заданий, включая подписки, необходимо отвязать текущий профиль и привязать новый!");
							term.inputField(function(error ,input) {term.clear(); process.exit()})
						} else if (data['html'].indexOf("Раздел недоступен") != -1) {
							term.red("\nДля получения заданий Telegram требуется указать данные вашей страницы на сайте VKserfing!");
							term.inputField(function(error ,input) {term.clear(); process.exit()})
						} else {
							if (tasks.length != 0) {
								if (Number(balance) >= 101) {
									if (thisSession.cashout.toString().indexOf("+") != -1 && cashout) bot_workstation("cashout");
									else bot_workstation("go_task");
								} else bot_workstation("go_task");
							} else {
								/// Заработок на просмотрах
								if (view_earn_categories.length != 0) {
									view_earn_categories_val++;
									if (view_earn_categories_val <= view_earn_categories.length - 1) {
										bot_workstation("get_tasks");
									} else {
										if (debug) {
											view_earn_categories_val = 0;
											timer_i = thisSession.st_sleep_delay;
											log_echo(`Задания закончились, жду ${timer_i} мин.`);
											timer = setInterval(() => {
												timer_i--;
												if (timer_i <= 0) {
													clearInterval(timer);
													bot_workstation("get_tasks");
												} else {
													log_echo(`Задания закончились, жду ${timer_i} мин.`);
												}
											}, 60000);
										} else {
											view_earn_categories = [];
											view_earn_categories_val = 0;
											if (thisSession.st_category == 0) bot_categories = "telegram";
											else if (thisSession.st_category == 1) bot_categories = "telegram/followers";
											else bot_categories = "telegram/views";
											bot_workstation("get_tasks");
										}
									}
								/// Задержка, если нет заданий
								} else {
									timer_i = thisSession.st_sleep_delay;
									log_echo(`Задания закончились, жду ${timer_i} мин.`);
									timer = setInterval(() => {
										timer_i--;
										if (timer_i <= 0) {
											clearInterval(timer);
											bot_workstation("get_tasks");
										} else {
											log_echo(`Задания закончились, жду ${timer_i} мин.`);
										}
									}, 60000);
								}
							}
						}
					} catch (error) {
						term.red(`\nПроизошла ошибка #6: <${bot_workstation_status}> <${fetch_url}> <${fetch_method}> <${bot_categories}>`);
            term.inputField(function(error ,input) {term.clear(); process.exit()})
					}
				} else if (bot_workstation_status == "go_task") {
					//////////////////////////
					//                      //
					//   ВЫПОЛНИТЬ ЗАДАНИЕ  //
					//                      //
					//////////////////////////
					if (data['status'] == "success") {
						balance = data['data']['balance'];
						task_hash = data['hash'];
						task = tasks[0].split(" ")[1];
						if (view_earn_categories.length == 0) {
							if (task.indexOf("t.me/") != -1) {
	              //////////////////////////
								//                      //
								//    ПРОСМОТР ПОСТА    //
								//                      //
								//////////////////////////
	              if (task.split("/").length == 5) {
	              	log_echo(`Выполняю задание #${task_good+task_bad+1} на просмотр`);
	                post_channel = task.split("/")[task.split("/").length-2]
	                post_id =  Number(task.split("/")[task.split("/").length-1])
	                if (!isNaN(post_id)) {
	                	function view_post() {
	                		client.invoke(
	                      new Api.channels.GetMessages({
	                        channel: post_channel,
	                        id: [post_id],
	                      })
	                    ).then(function(result) {
	                    	clearInterval(next_task);
	                    	term.bold.green(" +")
												setTimeout(() => {bot_workstation("check_task")}, thisSession.st_check_delay * 1000);
	                    }).catch(function(error) {
	                    	clearInterval(next_task);
	                    	if (error.toString().indexOf("No user") != -1) {
													bot_workstation("hidden_task");
	                      } else {
	                      	if (error.toString().indexOf("A wait of ") != -1) {
	                      		timer_i = Math.round((Number(error.toString().split("A wait of ")[1].split(" seconds")[0]) + 120)/60);
	                      		log_echo(`Временная блокировка на ${timer_i} мин!`);
														timer = setInterval(() => {
															timer_i--;
															if (timer_i <= 0) {
																clearInterval(timer);
																bot_workstation("go_task");
															} else {
																log_echo(`Временная блокировка на ${timer_i} мин!`);
															}
														}, 60000);
	                      	} else if (error.toString().indexOf("SESSION_REVOKED") != -1) {
	                      		term.red(`\nВаша Telegram сессия остановлена, войдите в свой аккаунт заново! (Бот остановлен)`);
	                        	term.inputField(function(error ,input) {term.clear(); process.exit()})
	                        } else if (error.toString().indexOf("Cannot send requests") != -1) {
	                      		term.red(`\nПроизошла ошибка с подключением к Telegram аккаунту! (Бот остановлен)`);
	                        	term.inputField(function(error ,input) {term.clear(); process.exit()})
	                        } else if (error.toString().indexOf("MESSAGE_IDS_EMPTY") != -1) {
	                      		bot_workstation("hidden_task");
	                      	} else if (error.toString().indexOf("USERNAME_INVALID") != -1) {
	                      		bot_workstation("hidden_task");
	                      	} else if (error.toString().indexOf("Cannot cast InputPeerUser") != -1) {
	                      		bot_workstation("hidden_task");
	                      	} else if (error.toString().indexOf("USER_DEACTIVATED") != -1) {
	                      		term.red(`\nВаш аккаунт в Telegram заблокирован! (Бот остановлен)`);
	                        	term.inputField(function(error ,input) {term.clear(); process.exit()})
	                      	} else {
		                        term.red(`\nПроизошла ошибка #1: ${error.toString()}`);
		                        term.inputField(function(error ,input) {term.clear(); process.exit()})
		                      }
	                      }
	                    });
	                	}
	                	setTimeout(() => {
	                		next_task = setInterval(() => {bot_workstation("hidden_task")}, (thisSession.st_check_delay * 1000) + 15000);
	                  	view_post();
		                }, thisSession.st_follow_delay * 1000);
	                } else {
										bot_workstation("hidden_task");
	                }
	             	//////////////////////////
								//                      //
								//       ПОДПИСКА       //
								//                      //
								//////////////////////////
	              } else if (task.split("/").length == 4) {
	              	log_echo(`Выполняю задание #${task_good+task_bad+1} на подписку`);
	                channel = task.split("/")[task.split("/").length-1]
	                if (channel != "") {
	                	function follow_channel() {
	                		client.invoke(
	                      new Api.channels.JoinChannel({
	                        channel: channel
	                      })
	                    ).then(function(result) {
	                    	clearInterval(next_task);
	                    	term.bold.green(" +")
												setTimeout(() => {bot_workstation("check_task")}, thisSession.st_check_delay * 1000);
												try {
	                      	client.invoke(
	                      		new Api.account.UpdateNotifySettings({
											        peer: channel,
											        settings: new Api.InputPeerNotifySettings({
												        showPreviews: false,
												        muteUntil: 1703030400,
												        sound: new Api.NotificationSoundDefault({})
											      	})
									        	})
									        );
	                      } catch (error) {}
	                    }).catch(function(error) {
	                    	clearInterval(next_task);
												if (error.toString().indexOf("No user") != -1) {
													bot_workstation("hidden_task");
	                      } else if (error.toString().indexOf("INVITE_REQUEST_SENT") != -1) {
													bot_workstation("hidden_task");
	                      } else {
	                        if (error.toString().indexOf("A wait of ") != -1) {
	                        	timer_i = Math.round((Number(error.toString().split("A wait of ")[1].split(" seconds")[0]) + 120)/60);
	                      		log_echo(`Временная блокировка на ${timer_i} мин!`);
														timer = setInterval(() => {
															timer_i--;
															if (timer_i <= 0) {
																clearInterval(timer);
																bot_workstation("go_task");
															} else {
																log_echo(`Временная блокировка на ${timer_i} мин!`);
															}
														}, 60000);
	                      	} else if (error.toString().indexOf("SESSION_REVOKED") != -1) {
	                      		term.red(`\nВаша Telegram сессия остановлена, войдите в свой аккаунт заново! (Бот остановлен)`);
	                      	} else if (error.toString().indexOf("USERNAME_INVALID") != -1) {
	                      		bot_workstation("hidden_task");
	                      	} else if (error.toString().indexOf("InputPeerUser") != -1) {
	                      		bot_workstation("hidden_task");
	                      	} else if (error.toString().indexOf("PRIVATE") != -1) {
	                      		bot_workstation("hidden_task");
	                      	} else if (error.toString().indexOf("CHANNELS_TOO_MUCH") != -1) {
	                      		term.red(`\nАккаунт Telegram достиг лимита по подпискам! (Бот остановлен)`);
	                        	term.inputField(function(error ,input) {term.clear(); process.exit()})
	                      	} else {
		                        term.red(`\nПроизошла ошибка #2: ${error.toString()}`);
		                        term.inputField(function(error ,input) {term.clear(); process.exit()})
		                      }
	                      }
	                    })
	                	}
	                	setTimeout(() => {
	                		next_task = setInterval(() => {bot_workstation("hidden_task")}, (thisSession.st_check_delay * 1000) + 15000);
	                		follow_channel()
	                  }, thisSession.st_follow_delay * 1000);
	                } else {
										bot_workstation("hidden_task");
	                }
	              } else {
									bot_workstation("hidden_task");
	              }
	            } else {
								bot_workstation("hidden_task");
	            }
           	//////////////////////////
						//                      //
						//  ЗАРАБОТОК НА ПРОС.  //
						//                      //
						//////////////////////////
	          } else {
	          	log_echo(`Выполняю задание #${task_good+task_bad+1} на просмотр`);
	          	if (bot_categories.indexOf("video") != -1) {
								setTimeout(() => {bot_workstation("check_task")}, (thisSession.st_check_delay + 20) * 1000);
							} else {
								setTimeout(() => {bot_workstation("check_task")}, thisSession.st_check_delay * 1000);
							}
	          }
					} else {
						//////////////////////////
						//                      //
						//   ОБРАБОТКА ОШИБКИ   //
						//                      //
						//////////////////////////
						tasks = [];
						if (data['message'].indexOf("Произошла ошибка. Повторите действие или обновите страницу") != -1) {
							x_xsrf_token = "";
							bot_workstation("hidden_task");
						} else if (data['message'].indexOf("приостановлено") != -1) {
							bot_workstation("hidden_task");
						} else if (data['message'].indexOf("Задание неактивно") != -1) {
							bot_workstation("hidden_task");
						} else if (data['message'].indexOf("Ошибка выполнения") != -1) {
							bot_workstation("hidden_task");
						} else {
							term.red(`\nПроизошла ошибка #3: ${data['message'].toString()}`);
							term.inputField(function(error ,input) {term.clear(); process.exit()})
						}
					}
				} else if (bot_workstation_status == "check_task") {
					//////////////////////////
					//                      //
					//  ПРОВЕРИТЬ ЗАДАНИЕ   //
					//                      //
					//////////////////////////
					if (data['status'] == "success") {
						balance = data['data']['balance'];
						task_good++;
						tasks.shift();
						log_echo(`Проверяю задание #${task_good+task_bad} - выполнено!`);
						setTimeout(() => {bot_workstation("go_task")}, thisSession.st_task_delay * 1000);
					} else {
						//////////////////////////
						//                      //
						//   ОБРАБОТКА ОШИБКИ   //
						//                      //
						//////////////////////////
						if (data['message'].indexOf("Ошибка выполнения запроса") != -1) {
							x_xsrf_token = "";
							bot_workstation("hidden_task");
						} else if (data['message'].indexOf("Задание не выполнено") != -1) {
							bot_workstation("hidden_task");
						} else if (data['message'].indexOf("Задание временно приостановлено") != -1) {
							bot_workstation("hidden_task");
						} else if (data['message'].indexOf("Задание неактивно") != -1) {
							bot_workstation("hidden_task");
						} else if (data['message'].indexOf("Вы не присоединились") != -1) {
							bot_workstation("hidden_task");
						} else {
							term.red(`\nПроизошла ошибка #4: ${data['message'].toString()}`);
							term.inputField(function(error ,input) {term.clear(); process.exit()})
						}
					}
				} else if (bot_workstation_status == "hidden_task") {
					task_bad++;
					tasks.shift();
					log_echo(`Задание #${task_good+task_bad} пропущено`);
					setTimeout(() => {bot_workstation("go_task")}, thisSession.st_task_delay * 1000);
				} else if (bot_workstation_status == "cashout") {
					//////////////////////////
					//                      //
					//      АВТОВЫВОД       //
					//                      //
					//////////////////////////
					cashout = false;
					bot_workstation("go_task");
				}
			//////////////////////////
			//                      //
			//  ОБРАБОТЧИК ОШИБОК   //
			//                      //
			//////////////////////////
			} else if (request.status == "error") {
				data = request.data;
				if (data.toString().indexOf("failed") != -1 || data.toString().indexOf("Proxy connection timed out") != -1) {
					task_bad++;
					x_xsrf_token = "";
					log_echo("Произошла ошибка при подключении! (Повтор через 1 мин.)");
					setTimeout(() => {bot_workstation()}, 60 * 1000);
				} else if (data.toString().indexOf("invalid_request 502 gateway") != -1 || data.toString().indexOf("failed, reason: read ECONNRESET") != -1 || data.toString().indexOf("network socket disconnected") != -1) {
					task_bad++;
					log_echo("Произошла ошибка при выполнении запроса! (Повтор через 1 мин.)");
					setTimeout(() => {bot_workstation()}, 60 * 1000);
				} else if (data.toString().indexOf("JSON at position") != -1) {
					task_bad++;
					log_echo("Произошла ошибка при выполнении запроса! (Повтор через 1 мин.)");
					setTimeout(() => {bot_workstation()}, 60 * 1000);
				} else {
					term.red(`\nПроизошла ошибка #5: ${data.toString()}`);
					term.inputField(function(error ,input) {term.clear(); process.exit()})
				}
			}
		})
	}, Math.floor(Math.random() * (5 - 1) + 1) * 1000);
}

//////////////////////////
//                      //
//     ЗАПУСК БОТА      //
//                      //
//////////////////////////
term.clear();
fetch("https://tg.goh.su/VKserfing/?action=ver", {
	'accept': 'application/json, text/plain, */*', 
	'accept-language': 'ru-RU,ru;q=0.9,en-US;q=0.8,en;q=0.7,zh-CN;q=0.6,zh;q=0.5,tr;q=0.4', 
	'x-requested-with': 'XMLHttpRequest'}).then(function(data) {
	return data.text();
}).then(function(data) {
	setTerminalTitle("GOH_VKserfing");
	if (data == appVer) {
		mySessions = JSON.parse(localStorage.getItem('mySessions'))
		if (mySessions.length == 0) {
			term.bgGreen.bold("Используя бота GOH_VKserfing вы нарушаете несколько пунктов правил для исполнителей сайта vkserfing.ru!\n");
			term.red(" - 1. Запрещено использование программ для автоматического выполнения заданий.\n");
			term.red(" - 2. Запрещено использование открытых или анонимных прокси-серверов.\n");
			term.red(" - 3. Запрещено использование более чем одного аккаунта для выполнения заданий. (При использовании многопоточной работы)\n");
			term.green("НЕ ИСПОЛЬЗУЙТЕ ЛИЧНЫЕ АККАУНТЫ, разработчик не несёт ответственности за них!");
			items = ["1. Продолжить", "2. Выйти из приложения"];
			term.singleColumnMenu(items, function(error, response) {
				if (Number(response.selectedIndex) == 0) {
					main_window();
				} else {
					term.clear();
					process.exit();
				}
			})
		} else {
			if (debug) main_window();
			else term.slowTyping('GOH_VKserfing',{flashStyle: term.brightWhite}, function() {setTimeout(() => main_window(), 500)});
		}
	} else {
		term.slowTyping('GOH_VKserfing',{flashStyle: term.brightWhite}, function() {setTimeout(function() {
			term.clear();
			setTerminalTitle("Обновите программу!");
			term.bgGreen.bold("Вышло новое обновление GOH_VKserfing - #"+data+"\nСледите за обновлениями в ТГ канале @RostikLucky_news");
			items = ["1. Скачать обновление", "2. Выйти из приложения"];
			term.singleColumnMenu(items, function(error, response) {
				if (Number(response.selectedIndex) == 0) {
					open('https://t.me/RostikLuckyBot');
					term.clear();
					process.exit();
				} else {
					term.clear();
					process.exit();
				}
			})
		}, 500)});
	}
}).catch(function(data){
	if (debug) main_window();
	else term.slowTyping('GOH_VKserfing',{flashStyle: term.brightWhite}, function() {setTimeout(() => main_window(), 500)});
});